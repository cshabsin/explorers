import { collection, query, getDocs, doc, updateDoc } from 'firebase/firestore';

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
                <td><input type="text" value="${path.startDate}"></td>
                <td><input type="text" value="${path.endDate}"></td>
                <td><input type="text" value="${path.description}"></td>
            `;
        } else {
            row.innerHTML = `
                <td>${path.hex1}</td>
                <td>${path.hex2}</td>
                <td>${path.startDate}</td>
                <td>${path.endDate}</td>
                <td>${path.description}</td>
            `;
        }
        tbody.appendChild(row);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    pathTableContainer!.innerHTML = "";
    pathTableContainer!.appendChild(table);
}

export function initPathView(db: any) {
    const editPathsButton = document.getElementById("edit-paths-button");
    const savePathsButton = document.getElementById("save-paths-button");
    const cancelPathsButton = document.getElementById("cancel-paths-button");

    editPathsButton?.addEventListener("click", () => {
        isEditingPaths = true;
        editPathsButton!.style.display = "none";
        savePathsButton!.style.display = "block";
        cancelPathsButton!.style.display = "block";
        populatePathTable(db);
    });

    savePathsButton?.addEventListener("click", async () => {
        isEditingPaths = false;
        const rows = Array.from(document.querySelectorAll("#path-table-container tr[data-id]"));
        for (const row of rows) {
            const id = (row as HTMLElement).dataset.id;
            const inputs = row.querySelectorAll("input");
            const data = {
                hex1: inputs[0].value,
                hex2: inputs[1].value,
                startDate: inputs[2].value,
                endDate: inputs[3].value,
                description: inputs[4].value,
            };
            const docRef = doc(db, "paths", id!);
            await updateDoc(docRef, data);
        }
        editPathsButton!.style.display = "block";
        savePathsButton!.style.display = "none";
        cancelPathsButton!.style.display = "none";
        populatePathTable(db);
    });

    cancelPathsButton?.addEventListener("click", () => {
        isEditingPaths = false;
        editPathsButton!.style.display = "block";
        savePathsButton!.style.display = "none";
        cancelPathsButton!.style.display = "none";
        populatePathTable(db);
    });
}
