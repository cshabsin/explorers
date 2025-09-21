import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';

export async function exportPathsToJSON(db: any) {
    const pathsRef = collection(db, "paths");
    const querySnapshot = await getDocs(pathsRef);
    const paths: any[] = [];
    querySnapshot.forEach(doc => {
        paths.push({ id: doc.id, ...doc.data() });
    });
    const json = JSON.stringify(paths, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "paths.json";
    a.click();
    URL.revokeObjectURL(url);
}

export async function importPathsFromJSON(db: any, file: File) {
    const text = await file.text();
    const paths = JSON.parse(text);
    const batch = writeBatch(db);

    // Delete all existing paths
    const pathsRef = collection(db, "paths");
    const querySnapshot = await getDocs(pathsRef);
    querySnapshot.forEach(doc => {
        batch.delete(doc.ref);
    });

    // Add new paths
    paths.forEach((path: any) => {
        const { id, ...data } = path;
        const docRef = doc(db, "paths", id);
        batch.set(docRef, data);
    });

    await batch.commit();
}