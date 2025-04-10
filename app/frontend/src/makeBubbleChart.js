import { PageState } from "./globalState.js";
import { state } from "./index.js";
// import queryData from "./makeQuery.js"; // Commented for now
import * as d3 from "d3";

/**
 * Creates a bubble chart for the given symbol
 *
 * @param {String} containerID - ID of the div container
 */
export async function makeBubbleChart(containerID) {
  const container = d3.select(`#${containerID}`);
  container.selectAll("*").remove();

  // Mock data (replace with API later)
  const data = [
    { name: "Retail", value: 100 },
    { name: "Finance", value: 60 },
    { name: "IT", value: 90 },
    { name: "Technology", value: 75 },
    { name: "Real Estate", value: 40 },
    { name: "Energy", value: 20 },
  ];

  if (!Array.isArray(data) || !data.length) {
    container.append("p").text(`No bubble chart data for ${state.symbol}`);
    return;
  }

  const width = 600;
  const height = 400;

  const svg = container
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const pack = d3.pack().size([width, height]).padding(5);
  const root = d3.hierarchy({ children: data }).sum((d) => d.value);
  const nodes = pack(root).leaves();

  // Custom color function based on value thresholds
  const getColor = (value) => {
    if (value >= 80) return "#2ca02c"; // Green
    if (value >= 60) return "#98df8a"; // Light Green
    if (value >= 40) return "#ff9896"; // Light Red
    return "#d62728"; // Red
  };

  const node = svg
    .selectAll("g")
    .data(nodes)
    .enter()
    .append("g")
    .attr("transform", (d) => `translate(${d.x},${d.y})`);

  node
    .append("circle")
    .attr("r", (d) => d.r)
    .attr("fill", (d) => getColor(d.data.value));

  node
    .append("text")
    .attr("dy", "0.3em")
    .attr("text-anchor", "middle")
    .style("font-size", "10px")
    .text((d) => d.data.name);

  // Symbol update listener
  const update = () => {
    state.removeListener(PageState.Events.SYMBOL, update);
    makeBubbleChart(containerID);
  };

  state.addListener(PageState.Events.SYMBOL, update);
}
