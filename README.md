explorers
=========

Supplemental files for Explorers RPG

## Project Overview

This project is an interactive star map for the Explorers RPG. It is built with Vite, TypeScript, and Firebase.

### Technology Stack

*   **Vite:** A fast build tool for modern web projects.
*   **TypeScript:** A typed superset of JavaScript.
*   **Firebase:** Used for hosting and as a real-time database (Firestore).

### Data Model

The data is stored in two Firestore collections:

*   `systems`: Stores information about star systems (hexes), including their name, coordinates, description, and an optional URL.
*   `paths`: Stores information about the paths between systems, including the source and destination hexes, and an optional date range for the jump.

### Key Functionalities

*   **Real-time Updates:** The map automatically updates in real-time when the data in Firestore changes.
*   **Interactive Map:** The map can be panned and zoomed.
*   **Pinning:** Clicking on a hex or path pins it, keeping its details visible in the data panel.
*   **Edit-in-place:** The description of a hex or path can be edited directly in the data panel.

### Code Structure

*   `main.ts`: The entry point of the application. It initializes the map, Firebase, and handles the main application logic.
*   `model.ts`: Contains the data models for the application, including the `Hex` and `PathSegment` classes.
*   `view.ts`: Responsible for rendering the map and its elements, including the hexes and paths.
*   `hexmap.ts`: A helper class for managing the hex grid.
*   `util.ts`: Contains utility functions.
*   `firebase-config.ts`: Contains the Firebase configuration.
*   `map-display.css`: Contains the styles for the map.
*   `index.html`: The main HTML file.

## Local Development

To run the project locally, you need to have Node.js and npm installed.

1. Clone the repository.
2. Run `npm install` to install the dependencies.
3. Run `npm run dev` to start the development server.
4. Open your browser and navigate to `http://localhost:5173` (or the address shown in the console).

### Using the Firebase Emulators

For a better local development experience, it is highly recommended to use the Firebase Emulators. This allows you to run a local version of the Firebase services, including Authentication and Firestore.

**1. Install the Firebase CLI:**

If you haven't already, install the Firebase CLI globally:

```bash
npm install -g firebase-tools
```

**2. Initialize Firebase Emulators:**

In the root of the project, run the following command:

```bash
firebase init emulators
```

This will prompt you to choose which emulators you want to use. Select "Authentication" and "Firestore". You can use the default ports.

**3. Start the Emulators:**

To start the emulators, run the following command:

```bash
firebase emulators:start
```

This will start the emulators and provide you with a UI to view the data in your local Firestore database and the users in your local Authentication service.

**4. Connect the Application to the Emulators:**

The application is already configured to connect to the emulators when running in development mode (`npm run dev`). It will automatically detect that the emulators are running and connect to them.

## Deployment

This project is set up for deployment to Firebase Hosting.

1. Make sure you have the Firebase CLI installed (`npm install -g firebase-tools`).
2. Log in to your Firebase account (`firebase login`).
3. Run `firebase init` to set up a Firebase project.
4. Run `npm run build` to build the project.
5. Run `firebase deploy` to deploy the project.

## Access Control

This project uses a simple access control list (ACL) to determine who can edit the map data. The ACL is stored in a Firestore collection called `acls`.

**Note:** Before setting up the ACL, you must enable the Google sign-in provider in your Firebase project. You can do this in the Firebase console, under Authentication > Sign-in method.

To set up the ACL, you need to create a document in the `acls` collection with the ID `editors`. This document should have a single field called `uids`, which is an array of strings. Each string in the array should be the Firebase User ID (UID) of a user who is allowed to edit the map.

Here is an example of what the `acls/editors` document should look like:

```json
{
  "uids": [
    "some-user-uid-1",
    "some-user-uid-2"
  ]
}
```

You can find the User ID of a user in the Firebase console, under Authentication.