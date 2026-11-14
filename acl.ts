// Role checks against the acls/roles document (see firestore.rules).
// Roles are fetched once and cached; callers that edit roles mutate the
// returned object and write it back.
import { doc, getDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db } from './firebase.js';

export interface Roles {
    admins?: string[];
    realms?: {
        [realm: string]: {
            [role: string]: string[];
        }
    }
}

let roles: Roles = {};

export async function getRoles(): Promise<Roles> {
    if (Object.keys(roles).length > 0) return roles;
    const docSnap = await getDoc(doc(db, "acls", "roles"));
    if (docSnap.exists()) {
        roles = docSnap.data() as Roles;
    }
    return roles;
}

export async function isEditor(user: User | null, realm: string): Promise<boolean> {
    if (!user) return false;
    const r = await getRoles();
    return (r.admins?.includes(user.uid) ?? false) || (r.realms?.[realm]?.editors?.includes(user.uid) ?? false);
}

export async function isAdmin(user: User | null): Promise<boolean> {
    if (!user) return false;
    const r = await getRoles();
    return r.admins?.includes(user.uid) ?? false;
}
