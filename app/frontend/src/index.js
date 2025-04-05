import { PageState } from "./globalState.js";
import { makeOverview } from "./makeOverview.js";
import queryData from "./makeQuery.js";
import { makeSlider } from "./makeSlider.js";
import { makeSelectionTable } from "./makeTable.js";

// ---------- Init ---------- //

/** Data used to make table */
const queryTableData = await queryData("symbols");

/**
 * Global State Instance
 */
export const state = new PageState(queryTableData[0].Symbol || "WFC");

// ---------- Make Table ---------- //

/**
 * Sets the global symbol state to the
 * selected state of the row
 * @param {Object} obj
 */
const selectRow = (obj) => {
  state.symbol = obj.Symbol;
};

// Make an instance of the selection table
makeSelectionTable("selection_table", queryTableData, {
  sortby: "Symbol",
  asc: false,
  selectRow: selectRow,
});

// ---------- Make Slider ---------- //

// Make a date selection slider
makeSlider("slider_container", 2016, 2028);

// ---------- Make Company Overview ---------- //

makeOverview("company_overview");
