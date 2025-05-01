/* Citation: 
  "How to create a Sankey diagram using D3.js?"
   
  prompt. ChatGPT, 9 April version, OpenAI, 9 April 2025, chat.openai.com.
*/

import * as d3 from "d3";
import { sankey, sankeyLeft, sankeyLinkHorizontal } from "d3-sankey";
import { state } from "./index.js";
import { PageState } from "./globalState.js";
import queryData from "./makeQuery.js";

/** Maps the sankey graph type to strings */
export const sheets = {
  BALANCE: "balance",
  INCOME: "income",
  CASH: "cash",
};

/** Maps sheet names to endpoints */
const endpoints = {};
endpoints[sheets.BALANCE] = "balance_sheet_senkey";
endpoints[sheets.INCOME] = "income_statement_senkey";
endpoints[sheets.CASH] = "cash_flow_senkey";

/**
 * Creates a Sankey diagram for the specified data.
 *
 * @param {String} containerID - ID of the container div
 */
export async function makeSenkey(containerID, sheet) {
  // Select the container element by its ID and clear any existing content.
  const container = d3.select(`#${containerID}`);
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

    return { width, height, boundingWidth, boundingHeight };
  };

  const { width, height, boundingWidth, boundingHeight } = getDimensions();

  /** Returns the data for the specified sheet */
  const getData = async (sheet) => {
    // Check if the sheet is valid
    if (endpoints[sheet]) {
      // Get the data from the endpoint for the specified data / time / symbol
      // The query should return rows with columns: source, target, value.
      const data = await queryData(endpoints[sheet], { symbol: state.symbol });

      const filteredData = data.filter((d) => d.value !== "None");

      // Verify the retrieved data is correct
      if (!Array.isArray(filteredData) || !filteredData.length) {
        return { error: true, sankeyData: null };
      }

      // Process the data into nodes and links.
      const nodes = Array.from(
        new Set(filteredData.flatMap((d) => [d.source, d.target])),
        (name) => ({
          name,
        })
      );

      const nodeMap = new Map(nodes.map((d, i) => [d.name, i]));

      const links = filteredData.map((d) => ({
        source: nodeMap.get(d.source),
        target: nodeMap.get(d.target),
        value: +d.value, // convert to number
      }));

      // Create the sankey layout generator.
      const sankeyGenerator = sankey()
        .nodeWidth(20)
        .nodePadding(15)
        .nodeAlign(sankeyLeft)
        .extent([
          [0, 0],
          [width, height],
        ]);

      // Prepare the sankey diagram data.
      const sankeyData = sankeyGenerator({
        nodes: nodes.map((d) => ({ ...d })),
        links: links.map((d) => ({ ...d })),
      });

      return { error: false, sankeyData };
    }

    return { error: true, sankeyData: null };
  };

  // Create the SVG container.
  const svg = container
    .append("svg")
    .attr("width", boundingWidth)
    .attr("height", boundingHeight)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const linkG = svg.append("g");
  const nodeG = svg.append("g");

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

  /* Citation: 
    "How to update d3 sankey draw function to use d3 update model with new data"
   
    prompt. ChatGPT, 1 May version, OpenAI, 1 May 2025, chat.openai.com.
  */
  function draw(sankeyData, transition = true) {
    const duration = transition ? state.duration : 0;

    // ----- Links ----- //

    // Bind links to src/tgt key values for new data
    const links = linkG
      .selectAll("path")
      .data(sankeyData.links, (d) => d.source.name + "-" + d.target.name);

    // Remove extra items
    links.exit().transition().duration(duration).attr("stroke-opacity", 0).remove();

    // Modify old items
    links
      .transition()
      .duration(duration)
      .attr("d", sankeyLinkHorizontal())
      .attr("stroke", (d) => getNodeColor(d.source))
      .attr("stroke-width", (d) => Math.max(1, d.width));

    // Generate new items
    links
      .enter()
      .append("path")
      .attr("fill", "none")
      .attr("stroke", (d) => getNodeColor(d.source))
      .attr("stroke-width", (d) => Math.max(1, d.width))
      .attr("stroke-opacity", 0)
      .attr("d", sankeyLinkHorizontal())
      .transition()
      .duration(duration)
      .attr("stroke-opacity", 0.5);

    // ----- Nodes ----- //

    // Bind nodes to key data
    const node = nodeG.selectAll("g").data(sankeyData.nodes, (d) => d.name);

    /* REMOVE OLD UNUSED NODES */

    node.exit().transition().duration(duration).style("opacity", 0).remove();

    /* UPDATE OLD NODES */

    // Modify old node rects
    node
      .select("rect")
      .transition()
      .duration(duration)
      .attr("x", (d) => d.x0)
      .attr("y", (d) => d.y0)
      .attr("height", (d) => d.y1 - d.y0)
      .attr("width", (d) => d.x1 - d.x0)
      .attr("fill", (d) => getNodeColor(d));

    // Modify old node labels
    node
      .select("text")
      .transition()
      .duration(duration)
      .attr("x", (d) => (d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6))
      .attr("y", (d) => (d.y0 + d.y1) / 2)
      .attr("text-anchor", (d) => (d.x0 < width / 2 ? "start" : "end"))
      .text((d) => d.name);

    /* ADD NEW NODES */

    const nodeRect = node.enter().append("g");

    // add new rects for updates
    nodeRect
      .append("rect")
      .attr("x", (d) => d.x0)
      .attr("y", (d) => d.y0)
      .attr("height", (d) => d.y1 - d.y0)
      .attr("width", (d) => d.x1 - d.x0)
      .attr("fill", (d) => getNodeColor(d))
      .attr("stroke", "#000")
      .style("opacity", 0)
      .transition()
      .duration(duration)
      .style("opacity", 1);

    // add new text
    nodeRect
      .append("text")
      .attr("x", (d) => (d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6))
      .attr("y", (d) => (d.y0 + d.y1) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", (d) => (d.x0 < width / 2 ? "start" : "end"))
      .text((d) => d.name)
      .style("font-family", "Arial, sans-serif")
      .style("font-size", "12px")
      .style("opacity", 0)
      .transition()
      .duration(500)
      .style("opacity", 1);
  }

  // Listener for symbol/state changes to update the diagram.
  const update = async () => {
    // state.removeListener(PageState.Events.SYMBOL, update);
    // makeSenkey(containerID, sheet);

    // Retrieve data
    const { error, sankeyData } = await getData(sheet);

    if (error) {
      return;
    }

    draw(sankeyData);
  };

  update();

  state.addListener(PageState.Events.SYMBOL, update);
}
