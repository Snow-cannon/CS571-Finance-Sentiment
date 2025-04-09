import * as d3 from "d3";
import { sankey, sankeyLinkHorizontal } from "d3-sankey";
import { state } from "./index.js";
import queryData from "./makeQuery.js";

/**
 * Creates a Sankey diagram for the balance sheet data.
 *
 * @param {String} containerID - ID of the container div
 */
export async function makeBalanceSheetSenkey(containerID) {
  // Get the container
  const container = d3.select(`#${containerID}`);

  // Fetch the balance sheet data for the selected symbol
  const data = await queryData("balance_sheet_senkey",  [state.symbol]);

  // Clear the container
  container.selectAll("*").remove();

  if (!Array.isArray(data) || !data.length) {
    container.append("p").text(`No balance sheet data available for ${state.symbol}`);
    return;
  }

  // Process data into nodes and links
  const nodes = Array.from(
    new Set(data.flatMap((d) => [d.source, d.target])),
    (name) => ({ name })
  );

  const nodeMap = new Map(nodes.map((d, i) => [d.name, i]));

  const links = data.map((d) => ({
    source: nodeMap.get(d.source),
    target: nodeMap.get(d.target),
    value: d.value,
  }));

  // Set dimensions
  const width = 800;
  const height = 600;

  // Create SVG element
  const svg = container
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // Create Sankey layout
  const sankeyGenerator = sankey()
    .nodeWidth(20)
    .nodePadding(10)
    .extent([
      [0, 0],
      [width, height],
    ]);

  const sankeyData = sankeyGenerator({
    nodes: nodes.map((d) => ({ ...d })),
    links: links.map((d) => ({ ...d })),
  });

  // Draw links
  svg
    .append("g")
    .selectAll("path")
    .data(sankeyData.links)
    .enter()
    .append("path")
    .attr("d", sankeyLinkHorizontal())
    .attr("fill", "none")
    .attr("stroke", "#007bff")
    .attr("stroke-width", (d) => Math.max(1, d.width))
    .attr("opacity", 0.7);

  // Draw nodes
  const node = svg
    .append("g")
    .selectAll("g")
    .data(sankeyData.nodes)
    .enter()
    .append("g");

  node
    .append("rect")
    .attr("x", (d) => d.x0)
    .attr("y", (d) => d.y0)
    .attr("width", (d) => d.x1 - d.x0)
    .attr("height", (d) => d.y1 - d.y0)
    .attr("fill", "#007bff")
    .attr("stroke", "#000");

  node
    .append("text")
    .attr("x", (d) => d.x0 - 6)
    .attr("y", (d) => (d.y1 + d.y0) / 2)
    .attr("dy", "0.35em")
    .attr("text-anchor", "end")
    .text((d) => d.name)
    .filter((d) => d.x0 < width / 2)
    .attr("x", (d) => d.x1 + 6)
    .attr("text-anchor", "start");



  // Set listeners
  const update = () => {
    // Remove old listener
    state.removeListener(PageState.Events.SYMBOL, update);

    // Reset overview
    makeBalanceSheetSenkey(containerID)
  };

  // Add update symbol listener
  state.addListener(PageState.Events.SYMBOL, update);
}
