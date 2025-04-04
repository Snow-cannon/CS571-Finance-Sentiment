import { PageState } from "./globalState.js";
import { state } from "./index.js";
import * as d3 from "d3";
// import { sliderBottom } from "d3-simple-slider";

/**
 * Creates a slider and tick marks
 * @param {Date} minDate
 * @param {Date} maxDate
 */
export function makeSlider(containerID, minYear, maxYear) {
  // Make 1 quarter per year, inclusive of final year
  const dates = 4 * (maxYear - minYear + 1);

  // Container
  const container = d3.select(`#${containerID}`);
  const sliderTable = container.append("table").classed("slider_table_wrapper", true);
  const ticksTable = container.append("table").classed("slider_table_wrapper", true);

  // TODO: Make non-linear / decide count and make look good
  const interpolate = (x) => {
    // Visual testing provided initial values to interpolate between
    const x1 = 28;
    const y1 = 0.2;
    const x2 = 4;
    const y2 = 0.375;

    // Interpolate between initial values based on input value
    return y1 + ((x - x1) * (y2 - y1)) / (x2 - x1);
  };

  const getCellWidthPercent = () => {
    // Get width percentage based on interpolated values from new date count
    return (100 / dates) * interpolate(dates);
  };

  // Add slider wrapped table row
  const topRow = sliderTable.append("tr");

  // Add centering cell
  topRow.append("td").attr("width", `${getCellWidthPercent()}%`);

  // Add slider in merged cell
  topRow
    .append("td")
    .attr("colspan", dates)
    .append("input")
    .attr("type", "range")
    .attr("min", 0)
    .attr("max", dates)
    .attr("step", 1)

    // TODO: Correct for true date values
    .attr("value", 0)
    .on("input", (evt) => {
      state.quarter = Number(evt.target.value);
    });

  // Add centering cell
  topRow.append("td").attr("width", `${getCellWidthPercent()}%`);

  // Add grid under slider
  const row = ticksTable.append("tr");

  /** Creates a set of equally sized ticker values */
  const createRowSelection = () => {
    row.selectAll("td").remove();
    row
      .selectAll("td")
      .data(d3.range(dates + 1))
      .enter()
      .append("td")
      .text((d) => d)
      .classed("time-selection-ticker", true)
      .classed("selected-slider-value", (d) => {
        return state.quarter === d;
      })
      .attr("width", `${100 / (dates + 1)}%`);
  };

  // Add set of date grid cells
  createRowSelection();

  // Add a listener to visually change the currently selected values
  state.addListener(PageState.Events.TIME, createRowSelection);
}
