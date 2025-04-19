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

  // ------ Slider ------ //

  const slider = container.append("input");

  slider
    .attr("type", "range")
    .attr("min", 0)
    .attr("max", dates - 1)
    .attr("step", 1)
    .attr("value", 0)
    .classed("date-selection-slider", true)
    .on("input", function (evt) {
      const value = d3.select(this).property("value");
      state.isQuarter = value % 5 > 0;
      state.quarter = value;
      selectionChange(value);
    });

  // ------ SVG ------ //

  // Get width of parent box
  const width = container.node().getBoundingClientRect().width;

  // Define axis scale
  const xScale = d3.scaleLinear().domain([0, dates - 1]);

  // Use years / quarters for ticker text values
  const tickText = (d) => {
    const year = state.startYear + (d - (d % 5)) / 5;
    const quarter = d % 5;
    if (quarter === 0) {
      return `${year}`;
    } else {
      return `Q${quarter}`;
    }
  };

  // Define axis format
  const xAxis = d3.axisBottom(xScale).ticks(dates).tickFormat(tickText);

  // Define parent SVG
  const svg = container.append("svg");
  svg.attr("height", 25);

  // Add wrapper for the axis
  const axisWrapper = svg.append("g");

  // Update function for slider value changes
  function resizeChange() {
    const updatedContainer = d3.select(`#${containerID}`);
    const updatedWidth = updatedContainer.node().getBoundingClientRect().width;
    xScale.range([15, updatedWidth - 13]);
    svg.attr("width", updatedWidth);
    axisWrapper.call(xAxis);
  }

  resizeChange();

  // Add classes to year / quarter tick marks
  svg
    .selectAll(".tick")
    .classed("year-tick", (d) => d % 5 === 0)
    .classed("quarter-tick", (d) => d % 5 > 0);

  // Allow users to click the ticks to update the slider
  svg.selectAll(".tick").on("click", (evt, d) => {
    slider.property("value", d);
    selectionChange(d);
  });

  // Add highlight rect
  const rect = svg.append("rect");
  rect.classed("tick-rect-highlight", true);

  // Update function for slider value changes
  function selectionChange(value, shouldTransition = true) {
    const matches = (d) => {
      return +d === +value;
    };

    // Update tick classes
    svg.selectAll(".tick").classed("tick-highlight", matches);

    // Select the matching tick
    const selectedTick = svg.selectAll(".tick").filter(matches);

    // Get transform / position of selected tick
    const transform = selectedTick.attr("transform");
    const text = selectedTick.select("text").node();
    const bbox = text.getBBox();

    // Add transition option if required
    let transition = shouldTransition ? rect.transition().duration(200) : rect;

    // Move rect behind new tick
    transition
      .attr("x", bbox.x - 4)
      .attr("y", bbox.y - 2)
      .attr("width", bbox.width + 8)
      .attr("height", bbox.height + 4)
      .attr("transform", transform);
  }

  selectionChange(slider.node().value, false);

  // ------ Resize Listener ------ //

  const listenForResize = () => {
    resizeChange();
    selectionChange(slider.node().value, false);
  };

  state.addListener(PageState.Events.RESIZE, listenForResize);
}
