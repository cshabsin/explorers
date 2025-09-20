import { Hexmap } from './hexmap.js';
import { makeSVG } from './util.js';
import {
    arrowDefs, associateElementWithEntity, makeAnchorFromHex,
    makeElementFromPathSegment, scrollToHex, setClickData, setIsEditing
} from './view.js';
import { initializeApp } from 'firebase/app';
import 'firebase/auth';
import { getFirestore, collection, onSnapshot, QuerySnapshot, DocumentChange, doc, updateDoc, getDoc, setDoc, connectFirestoreEmulator, query, where, getDocs } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut, User, connectAuthEmulator } from 'firebase/auth';
import { firebaseConfig } from './firebase-config.js';
import { Hex, PathSegment, Entity } from './model.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

if (import.meta.env.DEV) {
    connectAuthEmulator(auth, "http://localhost:9099");
    connectFirestoreEmulator(db, 'localhost', 8080);
    document.title += " (dev)";
}

let myMap = new Hexmap(10, 11, 70);
let margin = 10;

let map = document.getElementById("map-contents");
let svg = makeSVG("svg", {
    height: String(myMap.getPixHeight() + 2 * margin) + "px",
    width: String(myMap.getPixWidth() + 2 * margin + 300) + "px",
});
map?.append(svg);
svg.append(arrowDefs);

let mapGroup = makeSVG("g", {
    "class": "map-anchor-group",
    transform: "translate(" + margin + "," + margin + ")",
});
svg.append(mapGroup);

// Draw the map mesh.
mapGroup.append(makeSVG("path", {
    "class": "map-mesh",
    d: myMap.gridMesh(),
}));

let data = document.getElementById("data-contents");

const entities: { [id: string]: Entity } = {};
const hexesByName: { [name: string]: Hex } = {};
const hexArray: Array<Array<Hex>> = new Array(10);
for (let i = 0; i < 10; i++) {
    hexArray[i] = new Array<Hex>(11);
    for (let j = 0; j < 11; j++) {
        hexArray[i][j] = new Hex(i, j, 16, 11);
    }
}

// Add the individual map cells.
for (let x = 0; x < 10; x++) {
    for (let y = 0; y < 11; y++) {
        let cell = myMap.getCell(x, y);

        cell.anchor = makeAnchorFromHex(myMap, hexArray[x][y], "map-");
        mapGroup.append(cell.anchor);
        associateElementWithEntity(cell.anchor, data, hexArray[x][y]);
    }
}

onSnapshot(collection(db, "systems"), (snapshot: QuerySnapshot) => {
    snapshot.docChanges().forEach((change: DocumentChange) => {
        const system = change.doc.data();
        const hex = hexArray[system.col][system.row];
        hex.id = change.doc.id;
        entities[hex.id] = hex;
        if (change.type === "added" || change.type === "modified") {
            const oldName = hex.getName();
            if (oldName && oldName !== system.name) {
                delete hexesByName[oldName.replace(/\s+/g, "")];
            }
            hex.update(system);
            hexesByName[system.name.replace(/\s+/g, "")] = hex;
        } else if (change.type === "removed") {
            const oldName = hex.getName();
            if (oldName) {
                delete hexesByName[oldName.replace(/\s+/g, "")];
            }
            hex.update({ name: "", description: "", href: "" });
        }
    });
});

const paths: { [id: string]: { segment: PathSegment, el: SVGElement } } = {};

onSnapshot(collection(db, "paths"), (snapshot: QuerySnapshot) => {
    snapshot.docChanges().forEach((change: DocumentChange) => {
        const path = change.doc.data();
        const id = change.doc.id;
        if (change.type === "added") {
            const hex1 = hexesByName[path.hex1.replace(/\s+/g, "")];
            const hex2 = hexesByName[path.hex2.replace(/\s+/g, "")];
            if (hex1 && hex2) {
                const segment = new PathSegment(hex1, path.offset1, hex2, path.offset2, path.startDate, path.endDate);
                segment.id = id;
                entities[id] = segment;
                let el = makeElementFromPathSegment(myMap, segment);
                mapGroup.append(el);
                paths[id] = { segment, el };
            }
        } else if (change.type === "modified") {
            const hex1 = hexesByName[path.hex1.replace(/\s+/g, "")];
            const hex2 = hexesByName[path.hex2.replace(/\s+/g, "")];
            if (hex1 && hex2) {
                paths[id].segment.update({ sourceHex: hex1, sourceOffset: path.offset1, destinationHex: hex2, destinationOffset: path.offset2, startDate: path.startDate, endDate: path.endDate });
            }
        } else if (change.type === "removed") {
            paths[id].el.remove();
            delete paths[id];
            delete entities[id];
        }
    });
});

let currentUser: User | null = null;
let roles: { [role: string]: string[] } = {};
let isEditing = false;

async function getRoles(): Promise<{ [role: string]: string[] }> {
    if (Object.keys(roles).length > 0) return roles;
    const docRef = doc(db, "acls", "roles");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        roles = docSnap.data();
    }
    return roles;
}

async function isEditor(user: User | null, realm: string): Promise<boolean> {
    if (!user) return false;
    const roles = await getRoles();
    return roles.admins?.includes(user.uid) || roles.realms?.[realm]?.editors?.includes(user.uid);
}

async function isAdmin(user: User | null): Promise<boolean> {
    if (!user) return false;
    const roles = await getRoles();
    return roles.admins?.includes(user.uid);
}

document.getElementById("data-contents")?.addEventListener("click", async (e: Event) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains("edit-icon")) {
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

// Add the settings checkbox
let settings = document.querySelector("#settings");
let checkbox = document.createElement("input");
checkbox.className = 'map-setting';
checkbox.id = 'showpath';
checkbox.type = 'checkbox';
checkbox.checked = true;
settings?.append(checkbox);

let label = document.createElement("label");
label.setAttribute("for", "showpath");
label.innerText = "Spiny Rat";
settings?.append(label);

checkbox.onchange = (ev: Event) => {
    let display = "none";
    if (checkbox.checked) {
        display = "block";
    }
    document.querySelectorAll(".spiny-rat,.spiny-rat-wide").forEach(
        (e: Element) => {
            (<SVGElement>e).style.display = display;
        }
    );
};

scrollToHex(myMap, hexArray[1][4]);

const loginPanel = document.getElementById("login-panel");
const mapPanel = document.getElementById("map");
const rightPanel = document.getElementById("right-panel");
const loginButton = document.getElementById("login-button");
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
const userSelect = document.getElementById("user-select") as HTMLSelectElement;
const userRoleSelect = document.getElementById("user-role") as HTMLSelectElement;
const userRealmSelect = document.getElementById("user-realm") as HTMLSelectElement;
const addRoleButton = document.getElementById("add-role");
const aclsList = document.getElementById("acls-list");

onAuthStateChanged(auth, async user => {
    currentUser = user;
    if (user) {
        loginPanel!.style.display = "none";
        mapPanel!.style.display = "block";
        rightPanel!.style.display = "block";

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
        mapPanel!.style.display = "none";
        rightPanel!.style.display = "none";
        userName!.textContent = "";
        characterNameInput.value = "";
        aclsButton!.style.display = "none";
        createAclsButton!.style.display = "none";
    }
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
    for (const role in roles) {
        if (role === 'admins') {
            for (const uid of roles[role]) {
                const userDocRef = doc(db, "users", uid);
                const userDocSnap = await getDoc(userDocRef);
                const userDisplayName = userDocSnap.exists() ? userDocSnap.data().displayName : uid;
                const item = document.createElement("div");
                item.innerHTML = `${userDisplayName} - admin <button data-uid="${uid}" data-role="admin" class="remove-role">Remove</button>`;
                aclsList!.appendChild(item);
            }
        } else if (role === 'realms') {
            for (const realm in roles[role]) {
                for (const realmRole in roles[role][realm]) {
                    for (const uid of roles[role][realm][realmRole]) {
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
                roles.admins = roles.admins.filter(id => id !== uid);
            } else if (realm) {
                roles.realms[realm][role] = roles.realms[realm][role].filter(id => id !== uid);
            }
            const docRef = doc(db, "acls", "roles");
            await setDoc(docRef, roles);
            await populateAclsList();
        }
    }
});