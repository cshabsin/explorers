import { initMap } from './mapview.js';
import { initPathView, populatePathTable } from './pathview.js';
import { initializeApp } from 'firebase/app';
import 'firebase/auth';
import { getFirestore, collection, doc, updateDoc, getDoc, setDoc, connectFirestoreEmulator, getDocs } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut, User, connectAuthEmulator } from 'firebase/auth';
import { firebaseConfig } from './firebase-config.js';
import { Hex, Entity } from './model.js';
import { setClickData, setIsEditing } from './view.js';

interface Roles {
    admins?: string[];
    realms?: {
        [realm: string]: {
            [role: string]: string[];
        }
    }
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

if (import.meta.env.DEV) {
    connectAuthEmulator(auth, "http://localhost:9099");
    connectFirestoreEmulator(db, 'localhost', 8080);
    document.title += " (dev)";
}

initMap(db);
initPathView(db, (realm: string) => isEditor(currentUser, realm));

let currentUser: User | null = null;
let roles: Roles = {};

async function getRoles(): Promise<Roles> {
    if (Object.keys(roles).length > 0) return roles;
    const docRef = doc(db, "acls", "roles");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        roles = docSnap.data() as Roles;
    }
    return roles;
}

async function isEditor(user: User | null, realm: string): Promise<boolean> {
    if (!user) return false;
    const roles = await getRoles();
    return (roles.admins?.includes(user.uid) ?? false) || (roles.realms?.[realm]?.editors?.includes(user.uid) ?? false);
}

async function isAdmin(user: User | null): Promise<boolean> {
    if (!user) return false;
    const roles = await getRoles();
    return roles.admins?.includes(user.uid) ?? false;
}

document.getElementById("data-contents")?.addEventListener("click", async (e: Event) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains("edit-icon")) {
        const entities = (window as any).getEntities();
        const entity = entities[target.dataset.id!];
        const realm = entity instanceof Hex ? "systems" : "paths";
        if (!await isEditor(currentUser, realm)) {
            alert("You don't have permission to edit.");
            return;
        }
        const id = target.dataset.id;
        if (id) {
            if (entity) {
                editDescription(entity);
            }
        }
    }
});

function editDescription(entity: Entity) {
    setIsEditing(true);
    const dataContents = document.getElementById("data-contents");
    if (!dataContents) return;

    setClickData(dataContents, entity);

    const description = entity.getDescription();
    const descriptionPara = dataContents.querySelector("p");

    const editContainer = document.createElement("div");
    editContainer.innerHTML = `
        <textarea id="description-editor" rows="10" style="width: 95%">${description}</textarea>
        <button id="save-description">Save</button>
        <button id="cancel-description">Cancel</button>
    `;

    if (descriptionPara) {
        descriptionPara.replaceWith(editContainer);
    } else {
        dataContents.append(editContainer);
    }

    document.getElementById("save-description")?.addEventListener("click", () => {
        const newDescription = (document.getElementById("description-editor") as HTMLTextAreaElement).value;
        saveDescription(entity, newDescription);
        setIsEditing(false);
    });

    document.getElementById("cancel-description")?.addEventListener("click", () => {
        dataContents.innerHTML = entity.makeDescription();
        setIsEditing(false);
    });
}

async function saveDescription(entity: Entity, newDescription: string) {
    const collectionName = entity instanceof Hex ? "systems" : "paths";
    const docRef = doc(db, collectionName, entity.getId());
    await updateDoc(docRef, { description: newDescription });
    const dataContents = document.getElementById("data-contents");
    if (dataContents) {
        dataContents.innerHTML = entity.makeDescription();
    }
}

const loginPanel = document.getElementById("login-panel");
const mapPanel = document.getElementById("map");
const rightPanel = document.getElementById("right-panel");
const loginButton = document.getElementById("login-button");
const userControls = document.getElementById("user-controls");
const logoutButton = document.getElementById("logout-button");
const userName = document.getElementById("user-name");
const characterNameInput = document.getElementById("character-name") as HTMLInputElement;
const saveCharacterNameButton = document.getElementById("save-character-name");
const settingsIcon = document.getElementById("settings-icon");
const settingsDialog = document.getElementById("settings-dialog");
const closeSettingsDialogButton = document.getElementById("close-settings-dialog");
const aclsButton = document.getElementById("acls-button");
const aclsDialog = document.getElementById("acls-dialog");
const closeAclsDialogButton = document.getElementById("close-acls-dialog");
const createAclsButton = document.getElementById("create-acls-button");
const addRoleButton = document.getElementById("add-role");
const aclsList = document.getElementById("acls-list");
const userSelect = document.getElementById("user-select") as HTMLSelectElement;
const userRoleSelect = document.getElementById("user-role") as HTMLSelectElement;
const userRealmSelect = document.getElementById("user-realm") as HTMLSelectElement;
const pathView = document.getElementById("path-view");
const navTabs = document.getElementById("nav-tabs");
const tabMap = document.getElementById("tab-map");
const tabPaths = document.getElementById("tab-paths");


onAuthStateChanged(auth, async user => {
    currentUser = user;
    if (user) {
        loginPanel!.style.display = "none";
        navTabs!.style.display = "flex";
        userControls!.style.display = "flex";
        
        // Default to Map view
        showMap();

        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
            const characterName = userDocSnap.data().characterName;
            userName!.textContent = characterName || user.displayName;
            characterNameInput.value = characterName;
        } else {
            userName!.textContent = user.displayName;
            await setDoc(userDocRef, { email: user.email, displayName: user.displayName });
        }

        const roles = await getRoles();
        if (Object.keys(roles).length === 0) {
            createAclsButton!.style.display = "block";
        } else {
            createAclsButton!.style.display = "none";
        }

        if (await isAdmin(user)) {
            aclsButton!.style.display = "block";
        } else {
            aclsButton!.style.display = "none";
        }

    } else {
        loginPanel!.style.display = "block";
        navTabs!.style.display = "none";
        userControls!.style.display = "none";
        mapPanel!.style.display = "none";
        rightPanel!.style.display = "none";
        pathView!.style.display = "none";
        
        userName!.textContent = "";
        characterNameInput.value = "";
        aclsButton!.style.display = "none";
        createAclsButton!.style.display = "none";
    }
});

function showMap() {
    mapPanel!.style.display = "block";
    rightPanel!.style.display = "block";
    pathView!.style.display = "none";
    tabMap?.classList.add("active");
    tabPaths?.classList.remove("active");
}

async function showPaths() {
    mapPanel!.style.display = "none";
    rightPanel!.style.display = "none";
    pathView!.style.display = "flex";
    tabMap?.classList.remove("active");
    tabPaths?.classList.add("active");
    await populatePathTable(db);
}

tabMap?.addEventListener("click", () => {
    showMap();
});

tabPaths?.addEventListener("click", async () => {
    await showPaths();
});

loginButton?.addEventListener("click", () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
});

logoutButton?.addEventListener("click", () => {
    signOut(auth);
});

createAclsButton?.addEventListener("click", async () => {
    if (currentUser) {
        const docRef = doc(db, "acls", "roles");
        await setDoc(docRef, { admins: [currentUser.uid], realms: {} });
        alert("ACLs created! You are now an admin.");
        createAclsButton!.style.display = "none";
        aclsButton!.style.display = "block";
    }
});

saveCharacterNameButton?.addEventListener("click", async () => {
    if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        await setDoc(userDocRef, { characterName: characterNameInput.value }, { merge: true });
        userName!.textContent = characterNameInput.value || currentUser.displayName;
        alert("Character name saved!");
    }
});

settingsIcon?.addEventListener("click", () => {
    settingsDialog!.style.display = "block";
});

closeSettingsDialogButton?.addEventListener("click", () => {
    settingsDialog!.style.display = "none";
});

aclsButton?.addEventListener("click", async () => {
    settingsDialog!.style.display = "none";
    aclsDialog!.style.display = "block";
    mapPanel!.style.display = "none";
    rightPanel!.style.display = "none";
    await populateAclsList();
    await populateUserSelect();
});

closeAclsDialogButton?.addEventListener("click", () => {
    aclsDialog!.style.display = "none";
    mapPanel!.style.display = "block";
    rightPanel!.style.display = "block";
});

async function populateUserSelect() {
    userSelect.innerHTML = "";
    const usersRef = collection(db, "users");
    const querySnapshot = await getDocs(usersRef);
    querySnapshot.forEach((doc) => {
        const option = document.createElement("option");
        option.value = doc.id;
        option.textContent = doc.data().displayName;
        userSelect.appendChild(option);
    });
}

async function populateAclsList() {
    const roles = await getRoles();
    aclsList!.innerHTML = "";
    if (roles.admins) {
        for (const uid of roles.admins) {
            const userDocRef = doc(db, "users", uid);
            const userDocSnap = await getDoc(userDocRef);
            const userDisplayName = userDocSnap.exists() ? userDocSnap.data().displayName : uid;
            const item = document.createElement("div");
            item.innerHTML = `${userDisplayName} - admin <button data-uid="${uid}" data-role="admin" class="remove-role">Remove</button>`;
            aclsList!.appendChild(item);
        }
    }
    if (roles.realms) {
        for (const realm in roles.realms) {
            for (const realmRole in roles.realms[realm]) {
                for (const uid of roles.realms[realm][realmRole]) {
                    const userDocRef = doc(db, "users", uid);
                    const userDocSnap = await getDoc(userDocRef);
                    const userDisplayName = userDocSnap.exists() ? userDocSnap.data().displayName : uid;
                    const item = document.createElement("div");
                    item.innerHTML = `${userDisplayName} - ${realmRole} in ${realm} <button data-uid="${uid}" data-role="${realmRole}" data-realm="${realm}" class="remove-role">Remove</button>`;
                    aclsList!.appendChild(item);
                }
            }
        }
    }
}







addRoleButton?.addEventListener("click", async () => {
    const uid = userSelect.value;
    const role = userRoleSelect.value;
    const realm = userRealmSelect.value;
    if (uid && role) {
        const roles = await getRoles();
        if (role === 'admin') {
            if (!roles.admins) {
                roles.admins = [];
            }
            roles.admins.push(uid);
        } else {
            if (!roles.realms) {
                roles.realms = {};
            }
            if (!roles.realms[realm]) {
                roles.realms[realm] = {};
            }
            if (!roles.realms[realm][role]) {
                roles.realms[realm][role] = [];
            }
            roles.realms[realm][role].push(uid);
        }
        const docRef = doc(db, "acls", "roles");
        await setDoc(docRef, roles);
        await populateAclsList();
    }
});

aclsList?.addEventListener("click", async (e: Event) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains("remove-role")) {
        const uid = target.dataset.uid;
        const role = target.dataset.role;
        const realm = target.dataset.realm;
        if (uid && role) {
            const roles = await getRoles();
            if (role === 'admin') {
                if (roles.admins) {
                roles.admins = roles.admins.filter(id => id !== uid);
            }
            } else if (realm) {
                if (roles.realms && roles.realms[realm] && roles.realms[realm][role]) {
                    roles.realms[realm][role] = roles.realms[realm][role].filter(id => id !== uid);
                }
            }
            const docRef = doc(db, "acls", "roles");
            await setDoc(docRef, roles);
            await populateAclsList();
        }
    }
});