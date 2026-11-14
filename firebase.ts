// Shared Firebase initialization for every page. In dev mode (npm run dev)
// this connects to the local Auth/Firestore emulators.
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { firebaseConfig } from './firebase-config.js';

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Emulator ports default to firebase.json's; override with VITE_FIRESTORE_EMULATOR_PORT /
// VITE_AUTH_EMULATOR_PORT if something else on the machine already owns them.
if (import.meta.env.DEV) {
    const authPort = import.meta.env.VITE_AUTH_EMULATOR_PORT ?? "9099";
    const firestorePort = Number(import.meta.env.VITE_FIRESTORE_EMULATOR_PORT ?? 8080);
    connectAuthEmulator(auth, `http://localhost:${authPort}`);
    connectFirestoreEmulator(db, 'localhost', firestorePort);
    document.title += " (dev)";
}
