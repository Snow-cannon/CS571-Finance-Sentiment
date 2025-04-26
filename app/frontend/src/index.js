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
// import { makeBubbleChart } from "./makeBubbleChart.js";
// import { makeRadarChart } from "./makeRadarChart.js";

// ---------- Init ---------- //

/** Data used to make table */
const queryTableData = await queryData("symbols");

/**
 * Global State Instance
 */
export const state = new PageState({
  // Starting symbol is the first imported symbol, or 'WFC'
  symbol: queryTableData[0].Symbol || "WFC",
  // 0 indexed year is 2016
  startYear: 2022,
  // 0 indexed final year is 2022
  endYear: 2024,
  // Window-resize event is debounced by 50ms
  debounceTime: 200,
  // Global transition duration suggestion for visuals
  duration: 500,
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

// ---------- Make Slider ---------- //

// Make a date selection slider
makeSlider("slider_container", state.startYear, state.endYear);

// ---------- Make Company Overview ---------- //

makeOverview("overview-details");

// ---------- Make Intraday Chart ---------- //

makeIntraday("intraday-line-chart");

// ---------- Make Balance Sheet Senkey ---------- //

makeBalanceSheetSenkey("balance_sheet_senkey");

// ---------- Make Cash Flow Senkey ---------- //

makeCashFlowSenkey("cash_flow_senkey");

// ---------- Make Income Statement Senkey ---------- //

makeIncomeStatementSenkey("income_statement_senkey");

// ---------- Make Word Cloud---------- //

makeWordCloud("wordcloud");

// ---------- Make Speedometer ---------- //

makeSpeedometer("speedometer");

// ---------- Make Bubble Chart ---------- //

// makeBubbleChart("bubble-container");

// ---------- Make Radar Chart ---------- //

// makeRadarChart("radar-container");
