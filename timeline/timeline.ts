// Timeline page entry point. /timeline/ lists your timelines and the ones
// shared with you; /timeline/?t=<id> opens one in the editor (editor.ts).
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut, User } from 'firebase/auth';
import { auth } from '../firebase.js';
import {
    TimelineStore, TimelineMeta, Role, Profile, roleOf, canEditTimeline, saveProfile, listProfiles,
    listMyTimelines, listSharedWithMe, createTimeline, copyTimeline, deleteTimeline, getTimelineMeta,
} from './store.js';
import { startEditor, setEditable } from './editor.js';

const el = (id: string) => document.getElementById(id)!;
const timelineId = new URLSearchParams(location.search).get("t");

let user: User | null = null;
let meta: TimelineMeta | null = null;
let store: TimelineStore | null = null;

type View = 'login' | 'list' | 'editor' | 'error';
function show(view: View) {
    el("login-view").style.display = view === 'login' ? "block" : "none";
    el("list-view").style.display = view === 'list' ? "block" : "none";
    el("editor-view").style.display = view === 'editor' ? "flex" : "none";
    el("error-view").style.display = view === 'error' ? "block" : "none";
    el("all-timelines-link").style.display = timelineId && user ? "inline" : "none";
}

function showError(text: string) {
    el("error-text").textContent = text;
    show('error');
}

async function withErrors(action: () => Promise<void>) {
    try {
        await action();
    } catch (e) {
        alert(`Something went wrong: ${(e as Error).message}`);
    }
}

function openUrl(id: string): string {
    return `${location.pathname}?t=${encodeURIComponent(id)}`;
}

// ---- Auth ----

el("login-button").addEventListener("click", () => signInWithPopup(auth, new GoogleAuthProvider()));
el("logout-button").addEventListener("click", () => signOut(auth));

onAuthStateChanged(auth, async u => {
    user = u;
    el("login-button").style.display = u ? "none" : "inline-block";
    el("logout-button").style.display = u ? "inline-block" : "none";
    el("user-name").textContent = u?.displayName ?? "";
    store?.unsubscribe();
    store = null;
    meta = null;
    renderTimelineControls();
    if (!u) {
        show('login');
        return;
    }
    saveProfile(u).catch(e => console.warn("Couldn't save profile", e));
    if (timelineId) {
        await openTimeline(timelineId);
    } else {
        show('list');
        await renderLists();
    }
});

// ---- List view ----

function timelineRow(t: TimelineMeta, extra: string, actions: Array<[string, () => void]>): HTMLElement {
    const row = document.createElement("div");
    row.className = "timeline-row";
    const link = document.createElement("a");
    link.href = openUrl(t.id);
    link.textContent = t.name || "(untitled)";
    const info = document.createElement("span");
    info.className = "meta";
    const updated = t.updatedAt ? t.updatedAt.toDate().toLocaleString() : "";
    info.textContent = [extra, updated && `updated ${updated}`].filter(Boolean).join(" · ");
    row.append(link, info);
    for (const [label, action] of actions) {
        const b = document.createElement("button");
        b.textContent = label;
        b.addEventListener("click", action);
        row.append(b);
    }
    return row;
}

function fillList(box: HTMLElement, rows: HTMLElement[], emptyText: string) {
    box.replaceChildren(...rows);
    if (!rows.length) {
        const p = document.createElement("p");
        p.className = "empty-list";
        p.textContent = emptyText;
        box.append(p);
    }
}

const byUpdated = (a: TimelineMeta, b: TimelineMeta) =>
    (b.updatedAt?.toMillis() ?? 0) - (a.updatedAt?.toMillis() ?? 0);

async function renderLists() {
    if (!user) return;
    const u = user;
    const [mine, shared] = await Promise.all([listMyTimelines(u.uid), listSharedWithMe(u.uid)]);
    fillList(el("my-timelines"), mine.sort(byUpdated).map(t => {
        const sharedCount = t.members.length;
        const extra = [sharedCount ? `shared with ${sharedCount}` : "", t.linkAccess === 'viewer' ? "link sharing on" : ""]
            .filter(Boolean).join(", ");
        return timelineRow(t, extra, [
            ["Copy", () => copyAndOpen(t)],
            ["Delete", () => confirmDelete(t, renderLists)],
        ]);
    }), "No timelines yet. Click \"New timeline\" to start one.");
    fillList(el("shared-timelines"), shared.sort(byUpdated).map(t =>
        timelineRow(t, `from ${t.ownerName || "someone"} · ${t.roles[u.uid]}`, [["Copy", () => copyAndOpen(t)]]),
    ), "Nothing has been shared with you yet.");
}

el("new-timeline-button").addEventListener("click", () => {
    if (!user) return;
    const name = prompt("Name for the new timeline:", "Untitled timeline")?.trim();
    if (!name) return;
    const u = user;
    withErrors(async () => {
        const id = await createTimeline(u, name);
        location.href = openUrl(id);
    });
});

function copyAndOpen(t: TimelineMeta) {
    if (!user) return;
    const name = prompt("Name for your copy:", `Copy of ${t.name}`)?.trim();
    if (!name) return;
    const u = user;
    withErrors(async () => {
        const id = await copyTimeline(u, t.id, name);
        location.href = openUrl(id);
    });
}

function confirmDelete(t: TimelineMeta, after: () => void, before?: () => void) {
    if (!confirm(`Delete "${t.name}" for everyone it's shared with? This can't be undone.`)) return;
    before?.();
    withErrors(async () => {
        await deleteTimeline(t.id);
        after();
    });
}

// ---- Editor view ----

async function openTimeline(id: string) {
    let initial: TimelineMeta | null;
    try {
        initial = await getTimelineMeta(id);
    } catch {
        showError("It may have been deleted, or it hasn't been shared with you.");
        return;
    }
    if (!initial) {
        showError("This timeline doesn't exist (it may have been deleted).");
        return;
    }
    show('editor');
    store = new TimelineStore(id);
    const onError = (e: Error) => {
        console.warn(e);
        showError("You no longer have access to this timeline.");
    };
    store.subscribeMeta(m => {
        if (!m) {
            showError("This timeline was deleted.");
            return;
        }
        meta = m;
        renderTimelineControls();
        setEditable(canEditTimeline(m, user?.uid));
        if (el("share-dialog").style.display !== "none") renderShareDialog();
    }, onError);
    startEditor(store, onError);
}

const ROLE_LABELS = { owner: "Owner", editor: "Editor", viewer: "Viewer", link: "Viewer (link)" };

function renderTimelineControls() {
    const role = meta ? roleOf(meta, user?.uid) : null;
    el("timeline-title").textContent = meta?.name ?? "";
    document.title = meta ? `${meta.name} — Explorers Timeline` : "Explorers Timeline";
    el("role-badge").textContent = role ? ROLE_LABELS[role] : "";
    el("share-button").style.display = role === 'owner' ? "inline-block" : "none";
    el("delete-timeline-button").style.display = role === 'owner' ? "inline-block" : "none";
    el("rename-button").style.display = role === 'owner' || role === 'editor' ? "inline-block" : "none";
    el("copy-button").style.display = role ? "inline-block" : "none";
}

el("copy-button").addEventListener("click", () => { if (meta) copyAndOpen(meta); });
el("rename-button").addEventListener("click", () => {
    if (!meta || !store) return;
    const name = prompt("Rename timeline:", meta.name)?.trim();
    const s = store;
    if (name) withErrors(() => s.rename(name));
});
el("delete-timeline-button").addEventListener("click", () => {
    if (!meta) return;
    confirmDelete(meta, () => { location.href = location.pathname; }, () => store?.unsubscribe());
});

// ---- Share dialog ----

let profiles: Profile[] = [];

el("share-button").addEventListener("click", async () => {
    el("share-dialog").style.display = "block";
    renderShareDialog();
    try {
        profiles = await listProfiles();
    } catch (e) {
        console.warn("Couldn't list people", e);
    }
    renderShareDialog();
});
el("share-close").addEventListener("click", () => { el("share-dialog").style.display = "none"; });

function profileName(uid: string): string {
    return profiles.find(p => p.uid === uid)?.displayName ?? uid;
}

function saveSharing(roles: { [uid: string]: Role }, linkAccess: 'none' | 'viewer') {
    if (store) {
        const s = store;
        withErrors(() => s.setSharing(roles, linkAccess));
    }
}

function renderShareDialog() {
    if (!meta) return;
    const m = meta;
    const list = el("share-list");
    list.replaceChildren();
    for (const [uid, role] of Object.entries(m.roles)) {
        const row = document.createElement("div");
        row.className = "share-row";
        const name = document.createElement("span");
        name.textContent = profileName(uid);
        const select = document.createElement("select");
        for (const r of ["viewer", "editor"] as const) {
            const o = new Option(r === 'viewer' ? "Viewer" : "Editor", r, false, r === role);
            select.append(o);
        }
        select.addEventListener("change", () =>
            saveSharing({ ...m.roles, [uid]: select.value as Role }, m.linkAccess));
        const remove = document.createElement("button");
        remove.textContent = "Remove";
        remove.addEventListener("click", () => {
            const roles = { ...m.roles };
            delete roles[uid];
            saveSharing(roles, m.linkAccess);
        });
        row.append(name, select, remove);
        list.append(row);
    }
    if (!Object.keys(m.roles).length) {
        const p = document.createElement("p");
        p.className = "empty-list";
        p.textContent = "Not shared with anyone yet.";
        list.append(p);
    }

    const person = el("share-person") as HTMLSelectElement;
    const candidates = profiles.filter(p => p.uid !== m.owner && !(p.uid in m.roles));
    person.replaceChildren(...candidates.map(p => new Option(p.displayName, p.uid)));
    person.disabled = !candidates.length;
    (el("share-add-button") as HTMLButtonElement).disabled = !candidates.length;

    (el("share-link") as HTMLInputElement).checked = m.linkAccess === 'viewer';
    (el("share-url") as HTMLInputElement).value = location.origin + openUrl(m.id);
}

el("share-add-button").addEventListener("click", () => {
    if (!meta) return;
    const uid = (el("share-person") as HTMLSelectElement).value;
    const role = (el("share-role") as HTMLSelectElement).value as Role;
    if (uid) saveSharing({ ...meta.roles, [uid]: role }, meta.linkAccess);
});

el("share-link").addEventListener("change", () => {
    if (!meta) return;
    saveSharing(meta.roles, (el("share-link") as HTMLInputElement).checked ? 'viewer' : 'none');
});

el("share-copy-url").addEventListener("click", () => {
    const input = el("share-url") as HTMLInputElement;
    navigator.clipboard.writeText(input.value).catch(() => input.select());
});
