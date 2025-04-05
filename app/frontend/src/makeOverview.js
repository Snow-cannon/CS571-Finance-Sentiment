import { PageState } from "./globalState.js";
import { state } from "./index.js";
import queryData from "./makeQuery.js";
import * as d3 from "d3";

/**
 * Creates a box with the details of the overview company
 *
 * @param {String} containerID - ID of the div containerF
 */
export async function makeOverview(containerID) {
  // Get container by specified ID
  const container = d3.select(`#${containerID}`);

  // Set overview data
  const data = await queryData("overview", { symbol: state.symbol });

  container.selectAll("p").remove();

  if (!Array.isArray(data) || !data.length) {
    // Display no info exists
    container.append("p").text(`Cannot find data for ${state.symbol}`);
  } else {
    // Set new values
    container
      .selectAll("p")
      .remove()
      .select("all")
      .data(Object.entries(data[0]))
      .enter()
      .append("p")
      .text((d) => `${d[0]}: ${d[1]}`)
      .exit();
  }

  // Set listeners
  const update = () => {
    // Remove old listener
    state.removeListener(PageState.Events.SYMBOL, update);

    // Reset overview
    makeOverview(containerID);
  };

  // Add update symbol listener
  state.addListener(PageState.Events.SYMBOL, update);
}
