import { PageState } from "./globalState.js";
import { state } from "./index.js";
// import queryData from "./makeQuery.js"; // Uncomment when ready
import * as d3 from "d3";

/**
 * Creates a radar chart for sector-wise cash flow
 *
 * @param {String} containerID - ID of the div container
 */
export async function makeRadarChart(containerID) {
  // Get container by specified ID
  const container = d3.select(`#${containerID}`);
  container.selectAll("*").remove();

  // Set radar data
  // const data = await queryData("radar", { symbol: state.symbol }); // For real API
  const data = [
    { axis: "Loan", value: 0.8 },
    { axis: "Operations", value: 0.6 },
    { axis: "Discretion", value: 0.7 },
    { axis: "Investing", value: 0.5 },
    { axis: "Free", value: 0.9 },
  ]; // Mock data

  if (!Array.isArray(data) || !data.length) {
    container.append("p").text(`Cannot find sector cash flow data for ${state.symbol}`);
    return;
  }

  // Chart setup
  const width = 500;
  const height = 500;
  const radius = Math.min(width / 2, height / 2) - 50;
  const levels = 5;
  const angleSlice = (2 * Math.PI) / data.length;

  const svg = container
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);

  // Draw concentric levels
  for (let level = 0; level < levels; level++) {
    const r = radius * ((level + 1) / levels);
    svg
      .append("circle")
      .attr("r", r)
      .style("fill", "none")
      .style("stroke", "#CDCDCD")
      .style("stroke-dasharray", "2,2");
  }

  // Axis lines and labels
  data.forEach((d, i) => {
    const angle = angleSlice * i - Math.PI / 2;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);

    svg
      .append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", x)
      .attr("y2", y)
      .attr("stroke", "#999");

    svg
      .append("text")
      .attr("x", x * 1.1)
      .attr("y", y * 1.1)
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .style("font-size", "11px")
      .text(d.axis);
  });

  // Radar line and fill
  const radarLine = d3
    .lineRadial()
    .radius((d) => d.value * radius)
    .angle((d, i) => i * angleSlice)
    .curve(d3.curveLinearClosed);

  svg
    .append("path")
    .datum(data)
    .attr("d", radarLine)
    .style("fill", "#1f77b4")
    .style("fill-opacity", 0.5)
    .style("stroke", "#1f77b4")
    .style("stroke-width", 2);

  // Data points
  svg
    .selectAll(".radarCircle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", (d, i) => radius * d.value * Math.cos(angleSlice * i - Math.PI / 2))
    .attr("cy", (d, i) => radius * d.value * Math.sin(angleSlice * i - Math.PI / 2))
    .attr("r", 4)
    .style("fill", "#1f77b4");

  // Set listeners
  const update = () => {
    state.removeListener(PageState.Events.SYMBOL, update);
    makeRadarChart(containerID);
  };

  state.addListener(PageState.Events.SYMBOL, update);
}
