# CS571-Finance-Sentiment

Final project for CS571 focused on financial statements and news sentiment

## Repository Structure

All development happens within the `app` folder.

Project proposal is the the `Proposal` folder.

Process book is in the `processBook` folder.

## Development Instructions

Prerequisites:
- NodeJS Installed

### Setup

Navigate to the `app` folder in your terminal and install all required node modules by running:

```bash
npm i
```

### Building

The compiled frontend is not int he git repo, and must be built to use the frontend. Run the following script to compile the app.

```bash
npm run build
```

### Structure

The server and all related files are in the `backend` folder as described below:
- `server.js`: The root server file. Servers the base HTML page and related static files
- `dataRoute.js`: The router that serves static CSV data from the `data` folder

The frontend is stored in the `frontend` folder. In the frontend we have the following folder structure:
- `public`: Contains all statically served files. `html` and `css` store their respective files, while `dist` is the folder containing the built JS, which also gets statically served.
- `src`: This is the folder where JS gets developed. `index.js` is the root file that webpack builds from, and all other files go through the root.

### Developing

To develop on the app, you can update the server from the `backend` folder and the frontend from any folder other than `dist`, as that will get ignored / overwritten.

To speed up development, there is a script that will auto-build the frontend after you edit it and auto-restart the server when you edit it:

```bash
npm run dev
```

This will allow you to modify your scripts and see the updates live as you work all from one terminal, and you can close it with `Ctrl+c` like normal.

### Styling

To prevent styling mismatches, there is also a `.prettierrc` file that enforces specific formatting choices. It is encouraged to install the [`prettier`](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) extension if you are using VSCode to be able to use the enfoced auto-formatting.