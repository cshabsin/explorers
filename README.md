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

## Deployment

This project is set up for deployment to Firebase Hosting.

1. Make sure you have the Firebase CLI installed (`npm install -g firebase-tools`).
2. Log in to your Firebase account (`firebase login`).
3. Run `firebase init` to set up a Firebase project.
4. Run `npm run build` to build the project.
5. Run `firebase deploy` to deploy the project.