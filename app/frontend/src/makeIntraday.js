//Took inspiration of code from the hw3 code

import { PageState } from "./globalState.js";
import { state } from "./index.js";
import queryData from "./makeQuery.js";
import * as d3 from "d3";

/**
 * Creates a line chart for intraday data
 *
 * @param {String} containerID - ID of the div container
 */
export async function makeIntraday(containerID) {
  // Get container by specified ID
  const container = d3.select(`#${containerID}`);

  // Clear old elements
  container.selectAll("svg").remove();
  container.selectAll("p").remove();

  // Set dimensions and margins for the chart
  const margin = { top: 20, right: 30, bottom: 30, left: 50 };

  /**
   * Returns the width and height of the container taking margins into account
   */
  const getDimensions = () => {
    // Get width of parent box
    const { width: boundingWidth, height: boundingHeight } = container
      .node()
      .getBoundingClientRect();

    // Apply margins
    const width = boundingWidth - margin.left - margin.right;
    const height = boundingHeight - margin.top - margin.bottom;

    return { width, height };
  };

  // Generate new elements
  const svg = container.append("svg");
  const wrapper = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
  const path = wrapper.append("path");
  path.classed("intraday-path", true);
  const xWrapper = wrapper.append("g");
  const yWrapper = wrapper.append("g");

  // Error message display
  const errorWrapper = wrapper.append("g");
  errorWrapper
    .classed("error-wrapper", true)
    .attr("transform", `transform(${width / 2}, ${-height / 2})`);
  const errorMsg = errorWrapper.append("text");
  errorMsg.classed("error-text", true).attr("x", 0).attr("y", 0);
  const errorRect = errorWrapper.insert("rect", "text");
  errorRect.classed("error-rect", true).attr("x", 0).attr("y", 0);

  // Get initial chart dimensions
  const { width, height } = getDimensions();

  const now = new Date();

  // Set up scales with temp domains
  const xScale = d3
    .scaleTime()
    .domain([now, new Date(now.getDate() + 1)])
    .range([0, width]);

  const yScale = d3.scaleLinear().domain([0, 1]).nice().range([height, 0]);

  /**
   * Updates old intraday elements to new data using transitions
   */
  const changeData = async (symbol, transition = true) => {
    // Set overview data
    const data = await queryData("intraday", { symbol: state.symbol });
    const duration = transition ? state.duration : 0;

    // ------ Error Message ------ //

    // Get initial chart dimensions
    const { width, height } = getDimensions();

    let bbox = errorMsg.node().getBBox();

    const isError = !Array.isArray(data) || !data.length;

    const getNewTransform = () => {
      return `translate(${(isError ? 1 : 4) * (width - bbox.width) / 2}, ${(height) / 2})`;
    };

    // Display error message
    if (isError) {
      errorMsg.text(`No intraday data available for ${state.symbol}`);
      bbox = errorMsg.node().getBBox();
    }

    errorRect
      .attr("x", bbox.x - 5)
      .attr("y", bbox.y - 5)
      .attr("width", bbox.width + 10)
      .attr("height", bbox.height + 10);

    errorWrapper.transition().duration(duration).attr("transform", getNewTransform());

    if (isError) {
      // Update path data
      path
        .transition()
        .duration(duration)
        .attr(
          "d",
          d3
            .line()
            .x((d) => xScale(d.datetime))
            .y((d) => yScale(d3.min(yScale.domain())))
        );
      return;
    }

    // ------ Line Chart ------ //

    // Parse the data
    const parsedData = data.map((d) => ({
      datetime: new Date(d.datetime),
      close: +d.close,
    }));

    console.log(parsedData);

    // Set new domains
    xScale.domain(d3.extent(parsedData, (d) => d.datetime));
    yScale.domain([d3.min(parsedData, (d) => d.close), d3.max(parsedData, (d) => d.close)]);

    // Update path data
    path
      .datum(parsedData)
      .transition()
      .duration(duration)
      .attr(
        "d",
        d3
          .line()
          .x((d) => xScale(d.datetime))
          .y((d) => yScale(d.close))
      );
  };

  const resizeSVG = (transition = true) => {
    // Get bounding box dimensions
    const { width, height } = getDimensions();

    // Set SVG dimensions
    svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    // Update x axis
    xWrapper
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).ticks(10).tickFormat(d3.utcFormat("%y-%b")));

    // Update y axis
    yWrapper.call(d3.axisLeft(yScale));

    // Update the data with transitions
    changeData(state.symbol, transition);
  };

  // Call resize to generate initial SVG
  resizeSVG(false);

  // Add listeners for symbol updates
  const update = () => {
    changeData(state.symbol);
  };

  state.addListener(PageState.Events.SYMBOL, update);
}
