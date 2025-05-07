//Took inspiration of code from the hw3 code

import { ErrorMsg } from "./errorMsg.js";
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
  const error = new ErrorMsg(wrapper, "intraday", ErrorMsg.Directions.LEFT);

  // Get initial chart dimensions
  const { width, height } = getDimensions();

  const now = new Date();

  // Set up scales with temp domains
  const xScale = d3
    .scaleTime()
    .domain([now, new Date(now.getDate() + 1)])
    .range([0, width]);

  const yScale = d3.scaleLinear().domain([0, 1]).nice().range([height, 0]);

  let oldData = [];

  /**
   * Updates old intraday elements to new data using transitions
   */
  const changeData = async (transition = true) => {
    // Set overview data
    const { start, end } = state.queryDateRange(PageState.DATE_TYPE.INTRADAY);
    const data = await queryData("intraday", { symbol: state.symbol, start, end });
    const duration = transition ? state.duration : 0;

    // ------ Error Message ------ //

    // Get initial chart dimensions
    const { width, height } = getDimensions();

    const isError = !Array.isArray(data) || !data.length;

    // Display error message
    if (isError) {
      error.enter(width, height, transition);
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
    } else {
      error.exit(width, height, transition);
    }

    // ------ Line Chart ------ //

    // Parse the data
    const parsedData = data.map((d) => ({
      datetime: new Date(d.datetime),
      close: +d.close,
    }));

    // Set new domains
    console.log(start, end);
    xScale.domain(/* [new Date(start), new Date(end)] */ d3.extent(parsedData, (d) => d.datetime));
    xWrapper
      .transition()
      .duration(duration)
      .call(
        d3
          .axisBottom(xScale)
          .ticks(10)
          .tickFormat(state.isQuarter ? d3.utcFormat("%y-%b-%d") : d3.utcFormat("%y-%b"))
      );
    yScale.domain([d3.min(parsedData, (d) => d.close), d3.max(parsedData, (d) => d.close)]);
    yWrapper.transition().duration(duration).call(d3.axisLeft(yScale));

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
    xWrapper.attr("transform", `translate(0,${height})`);

    // Update y axis

    // Update the data with transitions
    changeData(transition);
  };

  // Call resize to generate initial SVG
  resizeSVG(false);

  state.addListener(PageState.Events.SYMBOL, resizeSVG);
  state.addListener(PageState.Events.TIME, resizeSVG);
  // state.addListener(PageState.Events.RESIZE, () => {
  //   resizeSVG(false);
  // });
}
