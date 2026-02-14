import { collection, query, getDocs, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { exportPathsToJSON, importPathsFromJSON } from './json.js';

let isEditingPaths = false;

export async function populatePathTable(db: any) {
    const pathTableContainer = document.getElementById("path-table-container");
    const pathsRef = collection(db, "paths");
    // TODO: The startDate field is a string, so it cannot be ordered. This should be fixed in the database.
    const q = query(pathsRef);
    const querySnapshot = await getDocs(q);
    const table = document.createElement("table");
    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");

    const headers = ["Source", "Destination", "Start Date", "End Date", "Description"];
    if (isEditingPaths) {
        headers.push("Actions");
    }
    const headerRow = document.createElement("tr");
    headers.forEach(headerText => {
        const th = document.createElement("th");
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    querySnapshot.forEach(doc => {
        const path = doc.data();
        const row = document.createElement("tr");
        row.dataset.id = doc.id;
        if (isEditingPaths) {
            row.innerHTML = `
                <td><input type="text" value="${path.hex1}"></td>
                <td><input type="text" value="${path.hex2}"></td>
                <td>
                    <input type="number" class="day" value="${path.startDate?.day ?? ''}" placeholder="day" style="width: 50px;">
                    -
                    <input type="number" class="year" value="${path.startDate?.year ?? ''}" placeholder="year" style="width: 60px;">
                </td>
                <td>
                    <input type="number" class="day" value="${path.endDate?.day ?? ''}" placeholder="day" style="width: 50px;">
                    -
                    <input type="number" class="year" value="${path.endDate?.year ?? ''}" placeholder="year" style="width: 60px;">
                </td>
                <td><input type="text" value="${path.description}"></td>
                <td><button class="delete-path-button">Delete</button></td>
            `;
        } else {
            const startDateStr = path.startDate ? `${path.startDate.day}-${path.startDate.year}` : '';
            const endDateStr = path.endDate ? `${path.endDate.day}-${path.endDate.year}` : '';
            row.innerHTML = `
                <td>${path.hex1}</td>
                <td>${path.hex2}</td>
                <td>${startDateStr}</td>
                <td>${endDateStr}</td>
                <td>${path.description}</td>
            `;
        }
        tbody.appendChild(row);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    pathTableContainer!.innerHTML = "";
    pathTableContainer!.appendChild(table);

    if (isEditingPaths) {
        table.addEventListener("click", (e) => {
            const target = e.target as HTMLElement;
            if (target.classList.contains("delete-path-button")) {
                const row = target.closest("tr");
                if (row) {
                    if (row.dataset.id === "new") {
                        row.remove();
                    } else {
                        row.classList.add("deleted");
                        row.style.display = "none";
                    }
                }
            }
        });
    }
}

export function initPathView(db: any, isEditor: (realm: string) => Promise<boolean>) {
    const editPathsButton = document.getElementById("edit-paths-button");
    const savePathsButton = document.getElementById("save-paths-button");
    const addPathButton = document.getElementById("add-path-button");
    const cancelPathsButton = document.getElementById("cancel-paths-button");
    const exportPathsButton = document.getElementById("export-paths-button");
    const importPathsButton = document.getElementById("import-paths-button");
    const importPathsInput = document.getElementById("import-paths-input") as HTMLInputElement;

    editPathsButton?.addEventListener("click", async () => {
        if (!await isEditor("paths")) {
            alert("You don't have permission to edit paths.");
            return;
        }
        isEditingPaths = true;
        editPathsButton!.style.display = "none";
        savePathsButton!.style.display = "block";
        addPathButton!.style.display = "block";
        cancelPathsButton!.style.display = "block";
        populatePathTable(db);
    });

    addPathButton?.addEventListener("click", () => {
        const tbody = document.querySelector("#path-table-container tbody");
        const row = document.createElement("tr");
        row.dataset.id = "new";
        row.innerHTML = `
            <td><input type="text"></td>
            <td><input type="text"></td>
            <td>
                <input type="number" class="day" placeholder="day" style="width: 50px;">
                -
                <input type="number" class="year" placeholder="year" style="width: 60px;">
            </td>
            <td>
                <input type="number" class="day" placeholder="day" style="width: 50px;">
                -
                <input type="number" class="year" placeholder="year" style="width: 60px;">
            </td>
            <td><input type="text"></td>
            <td><button class="delete-path-button">Delete</button></td>
        `;
        tbody?.appendChild(row);
    });

    savePathsButton?.addEventListener("click", async () => {
        isEditingPaths = false;
        const rows = Array.from(document.querySelectorAll("#path-table-container tr[data-id]"));
        for (const row of rows) {
            const id = (row as HTMLElement).dataset.id;
            
            if (row.classList.contains("deleted")) {
                if (id && id !== "new") {
                   await deleteDoc(doc(db, "paths", id));
                }
                continue;
            }

            const startDateDay = (row.querySelector('td:nth-child(3) .day') as HTMLInputElement).value;
            const startDateYear = (row.querySelector('td:nth-child(3) .year') as HTMLInputElement).value;
            const endDateDay = (row.querySelector('td:nth-child(4) .day') as HTMLInputElement).value;
            const endDateYear = (row.querySelector('td:nth-child(4) .year') as HTMLInputElement).value;

            const data: any = {
                hex1: (row.querySelector('td:nth-child(1) input') as HTMLInputElement).value,
                hex2: (row.querySelector('td:nth-child(2) input') as HTMLInputElement).value,
                description: (row.querySelector('td:nth-child(5) input') as HTMLInputElement).value,
            };

            if (startDateDay && startDateYear) {
                data.startDate = {
                    day: parseInt(startDateDay),
                    year: parseInt(startDateYear),
                };
            } else {
                data.startDate = null;
            }

            if (endDateDay && endDateYear) {
                data.endDate = {
                    day: parseInt(endDateDay),
                    year: parseInt(endDateYear),
                };
            } else {
                data.endDate = null;
            }
            
            if (id === "new") {
                await addDoc(collection(db, "paths"), data);
            } else {
                await updateDoc(doc(db, "paths", id!), data);
            }
        }
        editPathsButton!.style.display = "block";
        savePathsButton!.style.display = "none";
        addPathButton!.style.display = "none";
        cancelPathsButton!.style.display = "none";
        populatePathTable(db);
    });

    cancelPathsButton?.addEventListener("click", () => {
        isEditingPaths = false;
        editPathsButton!.style.display = "block";
        savePathsButton!.style.display = "none";
        addPathButton!.style.display = "none";
        cancelPathsButton!.style.display = "none";
        populatePathTable(db);
    });

    exportPathsButton?.addEventListener("click", () => {
        exportPathsToJSON(db);
    });

    importPathsButton?.addEventListener("click", async () => {
        if (!await isEditor("paths")) {
            alert("You don't have permission to import paths.");
            return;
        }
        importPathsInput.click();
    });

    importPathsInput?.addEventListener("change", async () => {
        const file = importPathsInput.files?.[0];
        if (file) {
            await importPathsFromJSON(db, file);
            populatePathTable(db);
        }
    });
}
