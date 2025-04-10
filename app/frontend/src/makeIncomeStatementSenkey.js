import * as d3 from "d3";
import { sankey, sankeyLinkHorizontal } from "d3-sankey";
import { state } from "./index.js";
import { PageState } from "./globalState.js";
import queryData from "./makeQuery.js";

/**
 * Creates a Sankey diagram for the income statement data.
 *
 * @param {String} containerID - ID of the container div
 */
export async function makeIncomeStatementSenkey(containerID) {
  // Select the container element by its ID and clear any existing content.
  const container = d3.select(`#${containerID}`);
  container.selectAll("svg").remove();
  container.selectAll("p").remove();
  console.log(state.symbol);

  // Fetch the income statement data for the selected symbol.
  // The query should return rows with columns: source, target, value.
  const data = await queryData("income_statement_senkey", { symbol: state.symbol });
  if (!Array.isArray(data) || !data.length) {
    container
      .append("p")
      .text(`No income statement data available for ${state.symbol}`);
  } else {
    // Process the data into nodes and links.
    const nodes = Array.from(
      new Set(data.flatMap((d) => [d.source, d.target])),
      (name) => ({ name })
    );
    const nodeMap = new Map(nodes.map((d, i) => [d.name, i]));
    const links = data.map((d) => ({
      source: nodeMap.get(d.source),
      target: nodeMap.get(d.target),
      value: +d.value, // convert to number
    }));

    // Set overall diagram dimensions and margins.
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const width = 800 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    // Create the SVG container.
    const svg = container
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create the sankey layout generator.
    const sankeyGenerator = sankey()
      .nodeWidth(20)
      .nodePadding(15)
      .extent([
        [0, 0],
        [width, height],
      ]);

    // Prepare the sankey diagram data.
    const sankeyData = sankeyGenerator({
      nodes: nodes.map((d) => ({ ...d })),
      links: links.map((d) => ({ ...d })),
    });

    // Function to assign a color based on the node name.
    // For the income statement:
    // - Positive targets (e.g., Revenue, Gross Profit, Operating Income, Net Income, EBIT, EBITDA) are green.
    // - Cost/expense items (e.g., anything with "cost", "expense", "tax", "interest") are red.
    function getNodeColor(d) {
      const name = d.name.toLowerCase();
      // Positive items – green hues.
      if (
        name.includes("revenue") ||
        name.includes("gross profit") ||
        name.includes("operating income") ||
        name.includes("net income") ||
        name.includes("ebit") ||
        name.includes("ebitda")
      ) {
        // Use dark green if it is an aggregate node.
        if (
          name.trim() === "revenue" ||
          name.trim() === "gross profit" ||
          name.trim() === "operating income" ||
          name.trim() === "net income" ||
          name.trim() === "ebit" ||
          name.trim() === "ebitda"
        ) {
          return "#4CAF50"; // Dark green.
        } else {
          return "#8BC34A"; // Light green.
        }
      }
      // Cost and expense items – red hues.
      if (
        name.includes("cost") ||
        name.includes("expense") ||
        name.includes("tax") ||
        name.includes("interest")
      ) {
        if (
          name.trim() === "cost of revenue" ||
          name.trim() === "operating expenses" ||
          name.trim() === "income tax expense" ||
          name.trim() === "interest expense"
        ) {
          return "#F44336"; // Dark red.
        } else {
          return "#FFCDD2"; // Light red.
        }
      }
      // Default color.
      return "#9E9E9E"; // Grey.
    }

    // Draw links.
    svg
      .append("g")
      .selectAll("path")
      .data(sankeyData.links)
      .enter()
      .append("path")
      .attr("d", sankeyLinkHorizontal())
      .attr("fill", "none")
      .attr("stroke", (d) => getNodeColor(d.source))
      .attr("stroke-width", (d) => Math.max(1, d.width))
      .attr("stroke-opacity", 0.5);

    // Draw nodes.
    const node = svg
      .append("g")
      .selectAll("g")
      .data(sankeyData.nodes)
      .enter()
      .append("g");

    // Node rectangles.
    node
      .append("rect")
      .attr("x", (d) => d.x0)
      .attr("y", (d) => d.y0)
      .attr("height", (d) => d.y1 - d.y0)
      .attr("width", (d) => d.x1 - d.x0)
      .attr("fill", (d) => getNodeColor(d))
      .attr("stroke", "#000");

    // Node labels – position text to the right of nodes on the left half, and vice versa.
    node
      .append("text")
      .attr("x", (d) => (d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6))
      .attr("y", (d) => (d.y0 + d.y1) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", (d) => (d.x0 < width / 2 ? "start" : "end"))
      .text((d) => d.name)
      .style("font-family", "Arial, sans-serif")
      .style("font-size", "12px");
  }
  // Listener for symbol/state changes to update the diagram.
  const update = () => {
    state.removeListener(PageState.Events.SYMBOL, update);
    makeIncomeStatementSenkey(containerID);
  };
  state.addListener(PageState.Events.SYMBOL, update);
}
