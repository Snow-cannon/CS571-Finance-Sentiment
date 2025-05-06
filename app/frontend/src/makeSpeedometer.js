import { PageState } from "./globalState.js";
import { state } from "./index.js";
import { ErrorMsg } from "./errorMsg.js";
import queryData from "./makeQuery.js";
import * as d3 from "d3";

/**
 * Creates a 5-category sentiment speedometer
 * @param {String} containerID
 */
export async function makeSpeedometer(containerID) {
  const container = d3.select(`#${containerID}`);
  container.selectAll("*").remove();

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

    return { width, height, boundingWidth, boundingHeight };
  };

  const { width, height, boundingWidth, boundingHeight } = getDimensions();
  const radius = height;

  const categories = [
    { label: "Bearish", color: "#e74c3c" },
    { label: "Somewhat Bearish", color: "#e67e22" },
    { label: "Neutral", color: "#f1c40f" },
    { label: "Somewhat Bullish", color: "#2ecc71" },
    { label: "Bullish", color: "#27ae60" },
  ];

  const svg = container.append("svg").attr("width", boundingWidth).attr("height", boundingHeight);

  const g = svg.append("g").attr("transform", `translate(${boundingWidth / 2}, ${boundingHeight})`);

  const arc = d3
    .arc()
    .innerRadius(radius - 30)
    .outerRadius(radius);

  // Non-uniform options
  const ranges = [-0.6, -0.35, -0.15, 0.15, 0.35, 0.6];
  const sections = d3.pairs(ranges);

  const angleScale = d3
    .scaleLinear()
    .domain([ranges[0], ranges[ranges.length - 1]]) // -0.5 / 0.5 for max / min sentiment scores
    .range([-Math.PI / 2, Math.PI / 2]);

  sections.forEach(([start, end], i) => {
    g.append("path")
      .attr("d", arc.startAngle(angleScale(start)).endAngle(angleScale(end))())
      .attr("fill", categories[i].color);
  });

  const line = g.append("line").attr("x1", 0).attr("y1", 0).attr("x2", 0).attr("y2", 0);

  // Gets the data for the new needle value
  const getData = async () => {
    const dateRange = state.queryDateRange(PageState.DATE_TYPE.CLOUD);
    const queryResult = await queryData("symbol_sentiment_speedometer", {
      symbol: state.symbol,
      start: dateRange.start,
      end: dateRange.end,
    });
    return queryResult[0].value;
  };

  // Universal error message for missing data
  const error = new ErrorMsg(svg, "sentiment", ErrorMsg.Directions.RIGHT);

  const updateLine = async (transition = true) => {
    // Get data based on current state
    let value = await getData();
    const duration = transition ? state.duration : 0;

    let needleLength = radius - 10;

    // ------ Error Message ------ //

    const { boundingWidth, boundingHeight } = getDimensions();

    const isError = value === null;

    // Display error message
    if (isError) {
      error.enter(boundingWidth, boundingHeight, transition);
      value = 0;
      line.attr("class", "needle_null");
    } else {
      line.attr("class", "needle");
      error.exit(boundingWidth, boundingHeight, transition);
    }

    // Get current position (0 if no position)
    const x = parseFloat(line.attr("x2") || 0);
    const y = parseFloat(line.attr("y2") || 0);

    // Get start / end angle
    const startAngle = Math.atan2(y, x);
    const endAngle = angleScale(value + ranges[0]);

    // Update line position to reflect new sentiment value
    line
      .transition()
      .duration(duration)
      .attr("x1", 0)
      .attr("y1", 0)

      // Transition along the angle instead of the
      .attrTween("x2", () => (t) => {
        const angle = startAngle + (endAngle - startAngle) * t;
        return needleLength * Math.cos(angle);
      })
      .attrTween("y2", () => (t) => {
        const angle = startAngle + (endAngle - startAngle) * t;
        return needleLength * Math.sin(angle);
      });
  };

  updateLine(false);

  state.addListener(PageState.Events.SYMBOL, updateLine);
  state.addListener(PageState.Events.TIME, updateLine);
}
