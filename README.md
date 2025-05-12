# CS571 Finance Sentiment

Final project for CS571 focused on financial statements and news sentiment of 60 companies from different sectors.

Link to live site, hosted on Render: https://cs571-finance-sentiment.onrender.com/

*Please note*: The site is hosted on the free tier, and must spin up if it has not been used for 15 mins. It also is very slow at serving data, so expect it to run very slow.

## Repository Structure

All development and commands should run from within the `app` folder.

Project proposal is the the `Proposal` folder (see [`ProjectProposalAnd5PDS.pdf`](./Proposal/ProjectProposalAnd5PDS.pdf)).

Process book is in the `ProcessBook` folder (see [`ProcessBook.pdf`](./ProcessBook/ProcessBook.pdf)).

## Development Instructions

Prerequisites:
- [NodeJS](https://nodejs.org/en/download)
- [GitLFS](https://git-lfs.com/) (Included with windows installation of GIT)

If GitLFS is not installed, you will not be able to clone / pull the database file. If you install it after cloning, delete and re-clone the repo to get the database file.

### Starting Services

To run the website after just downloading the repository, run the following scripts and then navigate to `localhost:3000` in your preferred browser.

```bash
cd app # Node env is located in the app folder
npm i
npm run dev
```

In the future, once dependencies are installed, you can run the `run dev` command instead to restart the website.

```bash
npm run dev
```

### Structure

The server and all related files are in the `backend` folder as described below:
- `server.js`: The root server file. Servers the base HTML page and related static files.
- `dataRoute.js`: The router that serves SQL data from the database stored within the `data` folder.

The frontend is stored in the `frontend` folder. In the frontend we have the following folder structure:
- `public`: Contains all statically served files. `html` and `css` store their respective files, while `dist` is the folder containing the built JS, which also gets statically served.
- `src`: This is the folder where JS gets developed. `index.js` is the root file that webpack builds from, and all other files go through the root.

### Styling

To prevent styling mismatches, there is also a `.prettierrc` file that enforces specific formatting choices. It is encouraged to install the [`prettier`](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) extension if you are using VSCode to be able to use the enfoced auto-formatting.

### Process Book

The process book is a `.md` file that gets converted to `html` and then directly to `pdf`. The CSS file provided is a modified version of the default VSCode markdown CSS file, providing a clean design for the final product.

The process book is set up so each visual and each major section (data processing / server APIs) are under a `##` heading. At the top of the file we are using a table of contents, and each heading is linked from there.

There is a screenshot folder `screenshots` where each subfolder contains images of the related visual that can be referenced from the process book file.

To build the process book `.md` file into a `PDF` file, run the following command:

```bash
npm run book
```

The resulting PDF, [`ProcessBook.pdf`](./ProcessBook/ProcessBook.pdf), is what will be submitted for grading.
