import queryData from "./makeQuery.js";
import { makeTable } from "./makeTable.js";

const selectionData = await queryData("symbols");
console.log(selectionData);

makeTable("selection_table", selectionData, "Name");
