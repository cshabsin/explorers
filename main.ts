import { Hexmap } from './hexmap.js';
import { makeSVG } from './util.js';
import {
    arrowDefs, associateElementWithEntity, makeAnchorFromHex,
    makeElementFromPathSegment, scrollToHex, setClickData
} from './view.js';
import { initializeApp } from 'firebase/app';
import 'firebase/auth';
import { getFirestore, collection, onSnapshot, QuerySnapshot, DocumentChange, doc, updateDoc, getDoc, connectFirestoreEmulator } from 'firebase/firestore';
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
let editors: string[] = [];

async function isEditor(user: User | null): Promise<boolean> {
    if (!user) return false;
    if (editors.length > 0) {
        return editors.includes(user.uid);
    }
    const docRef = doc(db, "acls", "editors");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        editors = docSnap.data().uids;
        return editors.includes(user.uid);
    }
    return false;
}

document.getElementById("data-contents")?.addEventListener("click", async (e: Event) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains("edit-icon")) {
        if (!await isEditor(currentUser)) {
            alert("You don't have permission to edit.");
            return;
        }
        const id = target.dataset.id;
        if (id) {
            const entity = entities[id];
            if (entity) {
                editDescription(entity);
            }
        }
    }
});

function editDescription(entity: Entity) {
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
    });

    document.getElementById("cancel-description")?.addEventListener("click", () => {
        dataContents.innerHTML = entity.makeDescription();
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

onAuthStateChanged(auth, user => {
    currentUser = user;
    if (user) {
        loginPanel!.style.display = "none";
        mapPanel!.style.display = "block";
        rightPanel!.style.display = "block";
        userName!.textContent = user.displayName;
    } else {
        loginPanel!.style.display = "block";
        mapPanel!.style.display = "none";
        rightPanel!.style.display = "none";
        userName!.textContent = "";
    }
});

loginButton?.addEventListener("click", () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
});

logoutButton?.addEventListener("click", () => {
    signOut(auth);
});