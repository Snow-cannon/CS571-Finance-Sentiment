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
  const dates = 5 * (maxYear - minYear + 1);

  // Container
  const container = d3.select(`#${containerID}`);

  // Clear old data
  container.selectAll("input").remove();
  container.selectAll("svg").remove();

  // Get width of parent box
  const width = container.node().getBoundingClientRect().width;

  // Add slider object
  const slider = container
    .append("input")
    .attr("type", "range")
    .attr("min", 0)
    .attr("max", dates - 1)
    .attr("step", 1);

  // Add svg
  const svg = container.append("svg");

  const xScale = d3
    .scaleLinear()
    .domain([0, dates - 1]) // from 0 to the last index
    .range([5, width - 5]);

  const xAxis = d3
    .axisBottom(xScale)
    .ticks(dates) // show one tick per data point
    .tickFormat((d) => `${d}`); // optional label format

  // Append axis to SVG
  svg
    .attr("width", width) // extra padding for axis labels
    .attr("height", 100);

  svg
    .append("g")
    // .attr("transform", "translate(50,50)") // move it down and right
    .call(xAxis);

  const renderAgain = () => {
    state.removeListener(PageState.Events.RESIZE, renderAgain);
    makeSlider(containerID, minYear, maxYear);
  };

  // Add a listener to visually change the currently selected values
  // state.addListener(PageState.Events.TIME, renderAgain);
  state.addListener(PageState.Events.RESIZE, renderAgain);
}
