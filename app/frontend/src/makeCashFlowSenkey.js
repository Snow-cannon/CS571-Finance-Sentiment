import * as d3 from "d3";
import { sankey, sankeyLinkHorizontal } from "d3-sankey";
import { state } from "./index.js";
import { PageState } from "./globalState.js";
import queryData from "./makeQuery.js";

/**
 * Creates a Sankey diagram for the cash flow data.
 *
 * @param {String} containerID - ID of the container div
 */
export async function makeCashFlowSenkey(containerID) {
  // Select the container element by its ID and clear any existing content.
  const container = d3.select(`#${containerID}`);
  container.selectAll("svg").remove();
  container.selectAll("p").remove();

  // Fetch the cash flow data for the selected symbol.
  // This query should return rows with columns: source, target, value.
  const data = await queryData("cash_flow_senkey", { symbol: state.symbol });
  if (!Array.isArray(data) || !data.length) {
    container
      .append("p")
      .text(`No cash flow data available for ${state.symbol}`);
  } else {
    // Process the data into nodes and links.
    const nodes = Array.from(
      new Set(data.flatMap((d) => [d.source, d.target])),
      (name) => ({ name })
    );
    const nodeMap = new Map(nodes.map((d, i) => [d.name, i]));

    // Determine your data range
    const valueExtent = d3.extent(data, d => +d.value);
    const valueScale = d3.scaleLinear()
    .domain(valueExtent)
    .range([0, 100]); 

    const links = data.map((d) => ({
        source: nodeMap.get(d.source),
        target: nodeMap.get(d.target),
        value: valueScale(+d.value),
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
    // This mapping is tailored for cash flow nodes per your provided template.
    // function getNodeColor(d) {
    //   const name = d.name.toLowerCase();
    //   if (name.includes("net income")) {
    //     return "#4CAF50"; // Green for Net income.
    //   } else if (name.includes("depreciation & amortization")) {
    //     return "#8BC34A"; // Light green for Depreciation.
    //   } else if (name.includes("stock-based compensation")) {
    //     return "#FF9800"; // Orange for Stock-based compensation.
    //   } else if (name.includes("non-cash charges")) {
    //     return "#9E9E9E"; // Grey for Non-cash charges.
    //   } else if (name.includes("other non-cash charges")) {
    //     return "#BDBDBD"; // Lighter grey for Other non-cash charges.
    //   } else if (name.includes("cash from operations")) {
    //     return "#4CAF50"; // Green for Cash from operations.
    //   } else if (name.includes("working capital")) {
    //     return "#607D8B"; // Blue Grey for Working capital.
    //   } else if (name.includes("cash from investing")) {
    //     return "#3F51B5"; // Indigo for Cash from investing.
    //   } else if (name.includes("capital expenditure")) {
    //     return "#FF9800"; // Orange for Capital expenditure.
    //   } else if (name.includes("purchase of securities")) {
    //     return "#FF9800"; // Orange for Purchase of securities.
    //   } else if (name.includes("proceeds from securities")) {
    //     return "#FF9800"; // Orange for Proceeds from securities.
    //   } else if (name.includes("other cash from investing")) {
    //     return "#FFB74D"; // Lighter orange for Other cash from investing.
    //   } else if (name.includes("cash from financing")) {
    //     return "#F44336"; // Red for Cash from financing.
    //   } else if (name.includes("stock buybacks")) {
    //     return "#E91E63"; // Pinkish red for Stock buybacks.
    //   } else if (name.includes("dividends")) {
    //     return "#F06292"; // Light pink for Dividends.
    //   } else if (name.includes("tax")) {
    //     return "#D32F2F"; // Dark red for Tax.
    //   } else if (name.includes("repayment of term debt")) {
    //     return "#C62828"; // Darker red for Repayment of term debt.
    //   } else if (name.includes("repayment of commercial paper")) {
    //     return "#C62828"; // Darker red for Repayment of commercial paper.
    //   } else if (name.includes("other cash from financing")) {
    //     return "#EF5350"; // Soft red for Other cash from financing.
    //   }
    //   return "#9E9E9E"; // Default grey.
    // }
    function getNodeColor(d) {
        const name = d.name.toLowerCase();
      
        // Operating / cash from operations nodes: green hues.
        if (name.includes("net income")) {
          return "#4CAF50"; // Dark Green for Net Income.
        } else if (name.includes("cash from operations") || name.includes("non-cash charges") || name.includes("working capital")) {
          return "#4CAF50"; // Green.
        } else if (name.includes("depreciation & amortization") || name.includes("stock-based compensation")) {
          return "#8BC34A"; // Light Green.
        }
        
        // Investing activities: light red.
        else if (
          name.includes("cash from investing") ||
          name.includes("capital expenditure") ||
          name.includes("purchase of securities") ||
          name.includes("proceeds from securities") ||
          name.includes("other cash from investing")
        ) {
          return "#FFCDD2"; // Light Red.
        }
        
        // Financing activities: red.
        else if (
          name.includes("cash from financing") ||
          name.includes("stock buybacks") ||
          name.includes("dividends") ||
          name.includes("tax") ||
          name.includes("repayment of term debt") ||
          name.includes("repayment of commercial paper") ||
          name.includes("other cash from financing")
        ) {
          return "#F44336"; // Red.
        }
        
        // Fallback color.
        return "#8BC34A"; // Default to Light Green.
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

    // Node labels – positioned to the right for nodes on the left half, and vice versa.
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
    makeCashFlowSenkey(containerID);
  };
  state.addListener(PageState.Events.SYMBOL, update);
}
