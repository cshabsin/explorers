// Firestore persistence for timelines. Layout:
//   timelines/{timelineId}                        TimelineMeta (owner, sharing)
//   timelines/{timelineId}/points/{pointId}       TimelinePoint (minus id)
//   timelines/{timelineId}/units/{unitId}         Unit (minus id)
//   timelines/{timelineId}/placements/{unit__pt}  Placement
//   profiles/{uid}                                { displayName } — public to signed-in users, for the share picker
// Access is enforced by firestore.rules: owner, per-person viewer/editor roles,
// and an optional "anyone signed in with the link can view".
import {
    collection, doc, onSnapshot, writeBatch, setDoc, deleteDoc, addDoc, updateDoc, getDoc, getDocs,
    query, where, serverTimestamp, Timestamp, DocumentReference, WriteBatch,
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db } from '../firebase.js';
import {
    TimelinePoint, Unit, Placement, placementId, DEFAULT_POINTS, defaultUnits,
} from './timeline-model.js';

export type Role = 'viewer' | 'editor';
export const SUBCOLLECTIONS = ["points", "units", "placements"] as const;

export interface TimelineMeta {
    id: string;
    name: string;
    owner: string;
    ownerName: string;
    roles: { [uid: string]: Role };
    members: string[];             // == keys of roles; lets us query "shared with me"
    linkAccess: 'none' | 'viewer';
    updatedAt?: Timestamp;
}

export interface TimelineData {
    points: TimelinePoint[];
    units: Unit[];
    placements: Map<string, Placement>;
}

export interface Profile {
    uid: string;
    displayName: string;
}

const timelinesCol = () => collection(db, "timelines");

export function roleOf(meta: TimelineMeta, uid: string | undefined): 'owner' | Role | 'link' | null {
    if (!uid) return null;
    if (meta.owner === uid) return 'owner';
    if (meta.roles[uid]) return meta.roles[uid];
    if (meta.linkAccess === 'viewer') return 'link';
    return null;
}

export function canEditTimeline(meta: TimelineMeta, uid: string | undefined): boolean {
    const r = roleOf(meta, uid);
    return r === 'owner' || r === 'editor';
}

// ---- Profiles ----

export async function saveProfile(user: User) {
    await setDoc(doc(db, "profiles", user.uid), { displayName: user.displayName ?? "(no name)" }, { merge: true });
}

export async function listProfiles(): Promise<Profile[]> {
    const snap = await getDocs(collection(db, "profiles"));
    return snap.docs
        .map(d => ({ uid: d.id, displayName: d.data().displayName as string }))
        .sort((a, b) => a.displayName.localeCompare(b.displayName));
}

// ---- Timeline list operations ----

function metaFrom(id: string, data: any): TimelineMeta {
    return { id, roles: {}, members: [], linkAccess: 'none', ...data } as TimelineMeta;
}

export async function listMyTimelines(uid: string): Promise<TimelineMeta[]> {
    const snap = await getDocs(query(timelinesCol(), where("owner", "==", uid)));
    return snap.docs.map(d => metaFrom(d.id, d.data()));
}

export async function listSharedWithMe(uid: string): Promise<TimelineMeta[]> {
    const snap = await getDocs(query(timelinesCol(), where("members", "array-contains", uid)));
    return snap.docs.map(d => metaFrom(d.id, d.data()));
}

// Firestore batches are limited to 500 writes; this commits in chunks.
async function inBatches(ops: Array<(b: WriteBatch) => void>) {
    for (let i = 0; i < ops.length; i += 450) {
        const batch = writeBatch(db);
        ops.slice(i, i + 450).forEach(op => op(batch));
        await batch.commit();
    }
}

async function newTimelineDoc(user: User, name: string): Promise<DocumentReference> {
    return addDoc(timelinesCol(), {
        name,
        owner: user.uid,
        ownerName: user.displayName ?? "",
        roles: {},
        members: [],
        linkAccess: 'none',
        updatedAt: serverTimestamp(),
    });
}

export async function createTimeline(user: User, name: string): Promise<string> {
    const ref = await newTimelineDoc(user, name);
    const ops: Array<(b: WriteBatch) => void> = [];
    DEFAULT_POINTS.forEach(([label, pname], i) => {
        ops.push(b => b.set(doc(collection(ref, "points")), { label, name: pname, order: i + 1 }));
    });
    for (const { id, ...unit } of defaultUnits()) {
        ops.push(b => b.set(doc(collection(ref, "units"), id), unit));
    }
    await inBatches(ops);
    return ref.id;
}

// Copies a readable timeline (all points, units and placements) into a new one owned by `user`.
export async function copyTimeline(user: User, sourceId: string, name: string): Promise<string> {
    const ref = await newTimelineDoc(user, name);
    const ops: Array<(b: WriteBatch) => void> = [];
    for (const sub of SUBCOLLECTIONS) {
        const snap = await getDocs(collection(db, "timelines", sourceId, sub));
        snap.forEach(d => ops.push(b => b.set(doc(collection(ref, sub), d.id), d.data())));
    }
    await inBatches(ops);
    return ref.id;
}

export async function deleteTimeline(id: string) {
    // Children first: their rules look up the parent document.
    const ops: Array<(b: WriteBatch) => void> = [];
    for (const sub of SUBCOLLECTIONS) {
        const snap = await getDocs(collection(db, "timelines", id, sub));
        snap.forEach(d => ops.push(b => b.delete(d.ref)));
    }
    await inBatches(ops);
    await deleteDoc(doc(timelinesCol(), id));
}

export async function getTimelineMeta(id: string): Promise<TimelineMeta | null> {
    const snap = await getDoc(doc(timelinesCol(), id));
    return snap.exists() ? metaFrom(snap.id, snap.data()) : null;
}

// ---- One open timeline ----

export class TimelineStore {
    private data: TimelineData = { points: [], units: [], placements: new Map() };
    private unsubscribers: Array<() => void> = [];

    constructor(private timelineId: string) { }

    private col(name: string) {
        return collection(db, "timelines", this.timelineId, name);
    }

    private touch() {
        return updateDoc(doc(timelinesCol(), this.timelineId), { updatedAt: serverTimestamp() }).catch(() => { });
    }

    subscribeMeta(onChange: (meta: TimelineMeta | null) => void, onError: (e: Error) => void) {
        this.unsubscribers.push(onSnapshot(doc(timelinesCol(), this.timelineId),
            snap => onChange(snap.exists() ? metaFrom(snap.id, snap.data()) : null), onError));
    }

    // Calls onChange with the full current data whenever anything changes.
    subscribe(onChange: (data: TimelineData) => void, onError: (e: Error) => void) {
        const emit = () => onChange(this.data);
        this.unsubscribers.push(onSnapshot(this.col("points"), snap => {
            this.data.points = snap.docs.map(d => ({ id: d.id, ...d.data() } as TimelinePoint));
            emit();
        }, onError));
        this.unsubscribers.push(onSnapshot(this.col("units"), snap => {
            this.data.units = snap.docs
                .map(d => ({ id: d.id, ...d.data() } as Unit))
                .sort((a, b) => a.order - b.order);
            emit();
        }, onError));
        this.unsubscribers.push(onSnapshot(this.col("placements"), snap => {
            this.data.placements = new Map(snap.docs.map(d => [d.id, d.data() as Placement]));
            emit();
        }, onError));
    }

    unsubscribe() {
        this.unsubscribers.forEach(u => u());
        this.unsubscribers = [];
    }

    async rename(name: string) {
        await updateDoc(doc(timelinesCol(), this.timelineId), { name, updatedAt: serverTimestamp() });
    }

    // Owner only. `roles` replaces the whole sharing list.
    async setSharing(roles: { [uid: string]: Role }, linkAccess: 'none' | 'viewer') {
        await updateDoc(doc(timelinesCol(), this.timelineId), {
            roles, members: Object.keys(roles), linkAccess, updatedAt: serverTimestamp(),
        });
    }

    async addPoint(label: string, name: string, order: number) {
        await addDoc(this.col("points"), { label, name, order });
        this.touch();
    }

    async updatePoint(pointId: string, fields: Partial<Pick<TimelinePoint, 'label' | 'name'>>) {
        await updateDoc(doc(this.col("points"), pointId), fields);
        this.touch();
    }

    // Deletes the point and every placement made at it.
    async deletePoint(pointId: string) {
        const batch = writeBatch(db);
        const placements = await getDocs(query(this.col("placements"), where("point", "==", pointId)));
        placements.forEach(d => batch.delete(d.ref));
        batch.delete(doc(this.col("points"), pointId));
        await batch.commit();
        this.touch();
    }

    // zone === null places the unit off map.
    async place(unitId: string, pointId: string, zone: string | null) {
        const p: Placement = { unit: unitId, point: pointId, zone };
        await setDoc(doc(this.col("placements"), placementId(unitId, pointId)), p);
        this.touch();
    }

    // Removes the explicit placement so the unit carries forward from the previous point.
    async clearPlacement(unitId: string, pointId: string) {
        await deleteDoc(doc(this.col("placements"), placementId(unitId, pointId)));
        this.touch();
    }
}
