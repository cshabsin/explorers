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
                <td>
                    <input type="number" class="day" value="${path.startDate?.day ?? ''}" placeholder="day">
                    -
                    <input type="number" class="year" value="${path.startDate?.year ?? ''}" placeholder="year">
                </td>
                <td>
                    <input type="number" class="day" value="${path.endDate?.day ?? ''}" placeholder="day">
                    -
                    <input type="number" class="year" value="${path.endDate?.year ?? ''}" placeholder="year">
                </td>
                <td><input type="text" value="${path.description}"></td>
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
