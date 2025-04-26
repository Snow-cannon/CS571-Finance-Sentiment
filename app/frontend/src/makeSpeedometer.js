import { PageState } from "./globalState.js";
import { state } from "./index.js";
import queryData from "./makeQuery.js";
import * as d3 from "d3";

/**
 * Creates a 5-category sentiment speedometer
 * @param {String} containerID
 */
export async function makeSpeedometer(containerID) {
  const container = d3.select(`#${containerID}`);
  container.selectAll("*").remove();

  // Mock data: replace with real queryData later
  const dateRange = state.queryDateRange;
  const queryResult = await queryData("symbol_sentiment_speedometer", {
    symbol: state.symbol,
    start: dateRange.start,
    end: dateRange.end,
  });
  const data = queryResult[0];
  console.log("Speedometer data:", data);

  const width = 300;
  const height = 200;
  const radius = 100;

  const categories = [
    { label: "Bearish", color: "#e74c3c" },
    { label: "Somewhat Bearish", color: "#e67e22" },
    { label: "Neutral", color: "#f1c40f" },
    { label: "Somewhat Bullish", color: "#2ecc71" },
    { label: "Bullish", color: "#27ae60" },
  ];

  const svg = container
    .append("svg")
    .attr("width", width)
    .attr("height", height + 40);

  const g = svg.append("g").attr("transform", `translate(${width / 2}, ${height})`);

  const arc = d3
    .arc()
    .innerRadius(radius - 20)
    .outerRadius(radius);

  const angleScale = d3
    .scaleLinear()
    .domain([-0.5, 0.5]) // -0.5 / 0.5 for max / min sentiment scores
    .range([-Math.PI / 2, Math.PI / 2]);

  // Non-uniform options
  const ranges = [-0.5, -0.35, -0.15, 0.15, 0.35, 0.5];
  const sections = d3.pairs(ranges);

  sections.forEach(([start, end], i) => {
    g.append("path")
      .attr("d", arc.startAngle(angleScale(start)).endAngle(angleScale(end))())
      .attr("fill", categories[i].color);
  });

  // Use -0.5 to center on the speedometer
  const needleAngle = angleScale(data.value - 0.5);
  const needleLength = radius - 10;
  const x = needleLength * Math.cos(needleAngle);
  const y = needleLength * Math.sin(needleAngle);

  g.append("line")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", x)
    .attr("y2", y)
    .attr("stroke", "#111")
    .attr("stroke-width", 3);

  // Re-render on symbol change
  const update = () => {
    state.removeListener(PageState.Events.SYMBOL, update);
    state.removeListener(PageState.Events.TIME, update);
    makeSpeedometer(containerID);
  };

  state.addListener(PageState.Events.SYMBOL, update);
  state.addListener(PageState.Events.TIME, update);
}
