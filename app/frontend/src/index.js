import { PageState } from "./globalState.js";
import { makeIntraday } from "./makeIntraday.js";
import { makeOverview } from "./makeOverview.js";
import queryData from "./makeQuery.js";
import { makeSlider } from "./makeSlider.js";
import { makeSelectionTable } from "./makeTable.js";
import { makeBalanceSheetSenkey } from "./makeBalanceSheetSenkey.js";
import { makeCashFlowSenkey } from "./makeCashFlowSenkey.js";
import { makeIncomeStatementSenkey } from "./makeIncomeStatementSenkey.js";
import { makeWordCloud } from "./makeWordCloud.js";
import { makeSpeedometer } from "./makeSpeedometer.js";
import { makeSenkey } from "./monoSankey.js";
import { makeWebsiteOverview } from "./websiteOverview.js";

// ---------- Init ---------- //

/** Data used to make table */
const queryTableData = await queryData("symbols");

/**
 * Global State Instance
 */
export const state = new PageState({
  symbol: queryTableData[0].Symbol || "AAPL",
  startYear: 2022,
  endYear: 2024,
  debounceTime: 200,
  duration: 500,
  sankey: PageState.SANKEY_TYPE.BALANCE,
});

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
makeSelectionTable("table-wrapper", queryTableData, {
  sortby: "Symbol",
  asc: false,
  selectRow: selectRow,
});

// ---------- Make Website Header Cards ---------- //

makeWebsiteOverview("description-container");

// ---------- Make Slider ---------- //

// Make a date selection slider
makeSlider("slider_container", state.startYear, state.endYear);

// ---------- Make Company Overview ---------- //

makeOverview("overview-details");

// ---------- Make Intraday Chart ---------- //

makeIntraday("intraday-line-chart");

// ---------- Make Word Cloud---------- //

makeWordCloud("wordcloud");

// ---------- Make Speedometer ---------- //

makeSpeedometer("speedometer");

// ---------- Make Combined Sankey ---------- //

makeSenkey("sankey");
