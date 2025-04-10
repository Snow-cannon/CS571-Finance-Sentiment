import { PageState } from "./globalState.js";
import { makeIntraday } from "./makeIntraday.js";
import { makeOverview } from "./makeOverview.js";
import queryData from "./makeQuery.js";
import { makeSlider } from "./makeSlider.js";
import { makeSelectionTable } from "./makeTable.js";
import {makeBalanceSheetSenkey} from "./makeBalanceSheetSenkey.js"
import { makeCashFlowSenkey } from "./makeCashFlowSenkey.js";
import { makeIncomeStatementSenkey } from "./makeIncomeStatementSenkey.js";
import { makeWordCloud } from "./makeWordCloud.js";
import { makeSpeedometer } from "./makeSpeedometer.js";
import { makeBubbleChart } from "./makeBubbleChart.js";
import { makeRadarChart } from "./makeRadarChart.js";

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
// ---------- Make Word Cloud---------- //

makeWordCloud("wordcloud");

// ---------- Make Speedometer ---------- //

makeSpeedometer("speedometer");

// ---------- Make Bubble Chart ---------- //

makeBubbleChart("bubble-container");

// ---------- Make Radar Chart ---------- //

makeRadarChart("radar-container");