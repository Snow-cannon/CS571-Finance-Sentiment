//Took inspiration of code from the hw3 code

import { ErrorMsg } from "./errorMsg.js";
import { PageState } from "./globalState.js";
import { state } from "./index.js";
import queryData from "./makeQuery.js";
import { timeFormat } from "d3-time-format";
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
  const margin = { top: 20, right: 30, bottom: 50, left: 60 };

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

    return { width, height, boundingHeight, boundingWidth };
  };

  // Generate new elements
  const svg = container.append("svg");
  const wrapper = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
  const overlayG = wrapper.append("g");
  const overlayLine = overlayG.append("line");
  const yOverlayLineG = wrapper.append("g");
  const yOverlayLine = yOverlayLineG.append("line");
  const path = wrapper.append("path");
  path.classed("intraday-path", true);
  const xWrapper = wrapper.append("g");
  const yWrapper = wrapper.append("g");
  const xTitle = wrapper.append("g");
  const yTitle = wrapper.append("g");
  const error = new ErrorMsg(wrapper, "intraday", ErrorMsg.Directions.LEFT);

  // Get initial chart dimensions
  const { width, height, boundingHeight, boundingWidth } = getDimensions();

  yOverlayLine
    .classed("intraday-y-line", true)
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", width)
    .attr("y2", 0)
  yOverlayLineG.style("display", "none");
  overlayG.style("display", "none");
  overlayLine
    .attr("x1", 0)
    .attr("y1", boundingHeight - margin.bottom - margin.top)
    .attr("x2", 0)
    .attr("y2", 0)
    .attr("stroke", "gray");

  svg
    .on("mousemove", (evt) => {
      const point = d3.pointer(evt, svg.node());
      const x = point[0] - margin.left;
      if (x > 0 && x < width) {
        makeOverlayText(x);
        overlayG.style("display", "block");
        overlayG.attr("transform", `translate(${x}, ${0})`);
        yOverlayLineG.style("display", "block");
      } else {
        overlayG.style("display", "none");
        yOverlayLineG.style("display", "none");
      }
    })
    .on("mouseleave", () => {
      overlayG.style("display", "none");
      yOverlayLineG.style("display", "none");
    });

  const now = new Date();

  // Set up scales with temp domains
  const xScale = d3
    .scaleTime()
    .domain([now, new Date(now.getDate() + 1)])
    .range([0, width]);

  const yScale = d3.scaleLinear().domain([0, 1]).nice().range([height, 0]);

  xTitle
    .attr("transform", `translate(${width / 2}, ${boundingHeight - 25})`)
    .append("text")
    .attr("text-anchor", "middle")
    .attr("x", 0)
    .attr("y", 0)
    .text("Stock Date")
    .classed("axis-text", true);

  yTitle
    .attr("transform", `translate(${-margin.left + 10}, ${height / 2})rotate(-90)`)
    .append("text")
    .attr("text-anchor", "middle")
    .attr("x", 0)
    .attr("y", 0)
    .text("Stock Price")
    .classed("axis-text", true);

  const formatDate = timeFormat("%-d %B %Y, %-I%p");

  /**
   * Generates the overlay text based on the hovered location
   * Used from @Snow-cannon HW4
   */
  const makeOverlayText = (x) => {
    // Remove old text elements
    overlayG.selectAll("text").remove();

    // Get valid data points at the hovered date from the selected list
    const selectedDate = new Date(xScale.invert(x));

    // Since not all data points exist, find the closest one available
    // Data is time sorted already, so this approach is valid
    const point = oldData.find((d) => d.datetime.getTime() >= selectedDate.getTime());

    overlayG
      .selectAll("text")
      .data([formatDate(point.datetime), point.close])
      .enter()
      .append("text")

      // Format like the map
      .text((d, i) => (i === 1 ? d3.format("$~s")(d) : d))

      // Display left / right based on position
      .attr("text-anchor", x < 300 ? "start" : "end")

      // Base color off of name map index
      .classed("intraday-overlay-text", true)

      // Translate left / right 5 pixels based on position
      .attr("transform", (d, i) => `translate(${x < 300 ? 5 : -5}, ${margin.top + 20 * i})`);

    const selectedY = yScale(point.close);
    yOverlayLine.attr("y1", selectedY).attr("y2", selectedY);
  };

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
          // .ticks(10)
          .tickFormat(state.isQuarter ? d3.utcFormat("%y-%b-%d") : d3.utcFormat("%y-%b"))
      );
    yScale.domain([d3.min(parsedData, (d) => d.close), d3.max(parsedData, (d) => d.close)]);
    yWrapper
      .transition()
      .duration(duration)
      .call(d3.axisLeft(yScale).tickFormat(d3.format("$~s")));

    // Step 1: Transition line down to y = 0
    path
      .datum(oldData)
      .transition()
      .duration(duration / 2)
      .attr(
        "d",
        d3
          .line()
          .x((d) => xScale(d.datetime))
          .y((d) => yScale(d3.min(yScale.domain())))
      )
      // Step 2 & 3: When transition ends, bind new data and animate back up
      .on("end", function () {
        path
          .datum(parsedData)
          .attr(
            "d",
            d3
              .line()
              .x((d) => xScale(d.datetime))
              .y((d) => yScale(d3.min(yScale.domain())))
          )
          .transition()
          .duration(duration / 2)
          .attr(
            "d",
            d3
              .line()
              .x((d) => xScale(d.datetime))
              .y((d) => yScale(d.close))
          );

        // Update oldData reference
        oldData = parsedData;
      });
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
