import { PageState } from "./globalState.js";
import queryData from "./makeQuery.js";
import { makeSlider } from "./makeSlider.js";
import { makeSelectionTable } from "./makeTable.js";

const selectionData = await queryData("symbols");
export const state = new PageState(selectionData[0].Symbol || "WFC");

// Function for what to do on
const selectRow = (obj) => {
  state.symbol = obj.Symbol;
};

makeSelectionTable("selection_table", selectionData, {
  sortby: "Symbol",
  asc: false,
  selectRow: selectRow,
});

const newListen = () => {
  console.log(state.symbol);
  state.removeListener(PageState.Events.SYMBOL, newListen);
};

state.addListener(PageState.Events.SYMBOL, newListen);

// Initialize markers and display the default value
makeSlider("slider_container", 2016, 2028);
