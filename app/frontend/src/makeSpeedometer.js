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
  const data = await queryData("symbol_sentiment_speedometer", { symbol: state.symbol });
  console.log("Speedometer data:", data);
  // const data = { value: 3 }; // 0 = Bearish, 4 = Bullish

  const width = 300;
  const height = 200;
  const radius = 100;

  const categories = [
    { label: "Bearish", color: "#e74c3c" },
    { label: "Somewhat Bearish", color: "#e67e22" },
    { label: "Neutral", color: "#f1c40f" },
    { label: "Somewhat Bullish", color: "#2ecc71" },
    { label: "Bullish", color: "#27ae60" }
  ];

  const svg = container.append("svg")
    .attr("width", width)
    .attr("height", height + 40); // Added extra height for clarity

  const g = svg.append("g")
    .attr("transform", `translate(${width / 2}, ${height})`);

  const arc = d3.arc()
    .innerRadius(radius - 20)
    .outerRadius(radius);

  const angleScale = d3.scaleLinear()
    .domain([0, 5])
    .range([-Math.PI / 2, Math.PI / 2]);

  // Draw arcs per category
  categories.forEach((cat, i) => {
    g.append("path")
      .attr("d", arc.startAngle(angleScale(i)).endAngle(angleScale(i + 1))())
      .attr("fill", cat.color);
  });

  // Draw needle at the center of selected category
  const needleAngle = angleScale(data.value + 8); // center of the segment
  const needleLength = radius - 10; // Adjusted to not overshoot
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
    makeSpeedometer(containerID);
  };

  state.addListener(PageState.Events.SYMBOL, update);
}
