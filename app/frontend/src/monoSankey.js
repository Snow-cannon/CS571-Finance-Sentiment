/* Citation: 
  "How to create a Sankey diagram using D3.js?"
   
  prompt. ChatGPT, 9 April version, OpenAI, 9 April 2025, chat.openai.com.
*/

import * as d3 from "d3";
import { sankey, sankeyLeft, sankeyLinkHorizontal } from "d3-sankey";
import { state } from "./index.js";
import { PageState } from "./globalState.js";
import queryData from "./makeQuery.js";
import { ErrorMsg } from "./errorMsg.js";
import HoverDiv from "./floatingDiv.js";

/** Maps sheet names to endpoints */
const endpoints = {};
endpoints[PageState.SANKEY_TYPE.BALANCE] = "balance_sheet_senkey";
endpoints[PageState.SANKEY_TYPE.INCOME] = "income_statement_senkey";
endpoints[PageState.SANKEY_TYPE.CASH] = "cash_flow_senkey";

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

  // ----- Obtain Dimensions ----- //

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

  // ----- Get SANKEY Data ----- //

  /** Returns the data for the specified sheet */
  const getData = async () => {
    // Check if the sheet is valid
    if (endpoints[state.sankey]) {
      // Get the data from the endpoint for the specified data / time / symbol
      // The query should return rows with columns: source, target, value.
      const { start, end } = state.queryDateRange(PageState.DATE_TYPE.SANKEY);
      const data = await queryData(endpoints[state.sankey], {
        symbol: state.symbol,
        report_type: state.isQuarter ? "quarterly" : "annual",
        start,
        end,
      });

      // Verify the retrieved data is correct
      if (!Array.isArray(data) || !data.length) {
        return { error: true, sankeyData: { links: [], nodes: [] } };
      }

      // Filter out "None" values and process value and isNegative
      const processedData = data
        .filter((d) => d.value !== "None" && +d.value !== 0)
        .map((d) => ({
          ...d,
          value: Math.abs(+d.value),
          isNegative: +d.value < 0,
        }));

      // Track node names that participate in negative links
      const negativeNodeNames = new Set();
      processedData.forEach((d) => {
        if (d.isNegative) {
          negativeNodeNames.add(d.target);
        }
      });

      // Create unique node list and mark those involved in negative links
      const nodes = Array.from(
        new Set(processedData.flatMap((d) => [d.source, d.target])),
        (name) => ({
          name,
          isNegative: negativeNodeNames.has(name),
        })
      );

      // Map node names to indices
      const nodeMap = new Map(nodes.map((d, i) => [d.name, i]));

      // Build links with index-based source/target and retain isNegative
      const links = processedData.map((d) => ({
        source: nodeMap.get(d.source),
        target: nodeMap.get(d.target),
        value: d.value,
        // isNegative: negativeNodeNames.has(d.target) ? true : false,
      }));

      // Create the sankey layout generator
      const sankeyGenerator = sankey()
        .nodeWidth(20)
        .nodePadding(15)
        .nodeAlign(sankeyLeft)
        .extent([
          [0, 0],
          [width, height],
        ]);

      // Generate the Sankey layout
      const sankeyData = sankeyGenerator({
        nodes: nodes.map((d) => ({ ...d })), // Copy to prevent mutation
        links: links.map((d) => ({ ...d })),
      });

      return { error: false, sankeyData };
    }

    return { error: true, sankeyData: { links: [], nodes: [] } };
  };

  // ----- Add selection dropdown ----- //

  const options = Object.values(PageState.SANKEY_TYPE);

  const selectWrapper = container.insert("div", ":first-child").classed("sankey-selection", true);

  const select = selectWrapper
    .append("select")
    .attr("id", "sankey-selection")
    .on("change", function (evt) {
      const value = d3.select(this).property("value");
      state.sankey = value;
    });

  select
    .selectAll("option")
    .data(options)
    .enter()
    .append("option")
    .classed("sankey-option", true)
    .attr("value", (d) => d)
    .text((d) => d);

  // ----- Create SVG ----- //

  const svg = container
    .append("svg")
    .attr("width", boundingWidth)
    .attr("height", boundingHeight)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const linkG = svg.append("g");
  const nodeG = svg.append("g");

  // ----- Create Color Map ----- //

  const titleMap = {
    light_green: [
      // "revenue",
      "gross profit",
      "operating income",
      "net income",
      "ebit",
      "ebitda",
      "asset",
      "depreciation & amortization",
      "stock-based compensation",
    ],
    dark_green: [
      // "revenue",
      "cash from operations",
      "non-cash charges",
      "working capital",
      "gross profit",
      "operating income",
      "net income",
      "ebit",
      "ebitda",
      "assets",
    ],
    light_red: [
      "cost",
      "expense",
      "tax",
      "interest",
      "liabilit",
      "equity",
      "cash from investing",
      "capital expenditure",
      "purchase of securities",
      "proceeds from securities",
      "other cash from investing",
    ],
    dark_red: [
      "cost of revenue",
      "operating expenses",
      "income tax expense",
      "interest expense",
      "liabilities",
      "equity",
      "shareholder equity",
      "cash from financing",
      "stock buybacks",
      "dividends",
      "tax",
      "repayment of term debt",
      "repayment of commercial paper",
      "other cash from financing",
    ],
  };

  const colorMap = {
    // light_green: "#8BC34A",
    // dark_green: "#4CAF50",
    // dark_red: "#F44336",
    // light_red: "#FFCDD2",
    // gray: "#9E9E9E",
    light_green: "bullish-sankey",
    dark_green: "sw-bullish-sankey",
    dark_red: "bearish-sankey",
    light_red: "sw-bearish-sankey",
    gray: "neutral-sankey",
  };

  const titleColor = (d) => {
    const title = d.name.toLowerCase().trim();
    const negative = d.isNegative;

    if (titleMap.dark_green.includes(title)) {
      return !negative ? colorMap.dark_green : colorMap.dark_red;
    } else if (titleMap.dark_red.includes(title)) {
      return !negative ? colorMap.dark_red : colorMap.dark_green;
      // Prefer red over green
    } else if (titleMap.light_red.filter((str) => title.includes(str)).length) {
      return !negative ? colorMap.light_red : colorMap.light_green;
    } else if (titleMap.light_green.filter((str) => title.includes(str)).length) {
      return !negative ? colorMap.light_green : colorMap.light_red;
    }

    return colorMap.gray;
  };

  const hoverDiv = new HoverDiv(container);

  const formatDollars = (n) => {
    return `\$${d3.format(".2s")(n).replace("G", "B")}`;
  };

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
      .attr("class", (d) => `sankey-link ${titleColor(d.target)}`)
      .attr("stroke-width", (d) => Math.max(1, d.width))
      .attr("stroke-opacity", 0.5);

    // Generate new items
    links
      .enter()
      .append("path")
      .attr("class", (d) => `sankey-link ${titleColor(d.target)}`)
      .attr("stroke-width", (d) => Math.max(1, d.width))
      .attr("d", sankeyLinkHorizontal())
      .attr("stroke-opacity", 0)
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
      .attr("class", (d) => `sankey-rect ${titleColor(d)}`)
      .attr("opacity", 1);

    // Modify old node labels
    node
      .select("text")
      .transition()
      .duration(duration)
      .attr("x", (d) => (d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6))
      .attr("y", (d) => (d.y0 + d.y1) / 2)
      .attr("text-anchor", (d) => (d.x0 < width / 2 ? "start" : "end"))
      .text((d) => d.name)
      .attr("opacity", 1);

    /* ADD NEW NODES */

    const nodeRect = node.enter().append("g");

    // add new rects for updates
    nodeRect
      .append("rect")
      .attr("x", (d) => d.x0)
      .attr("y", (d) => d.y0)
      .attr("height", (d) => d.y1 - d.y0)
      .attr("width", (d) => d.x1 - d.x0)
      .attr("class", (d) => `sankey-rect ${titleColor(d)}`)
      .style("opacity", 0)
      .on("mouseenter", function (evt, d) {
        const rect = this.getBoundingClientRect();
        const containerRect = container.node().getBoundingClientRect();

        const centerX = rect.left + rect.width / 2 - containerRect.left;
        const topY = rect.top - containerRect.top;

        hoverDiv.show(centerX, topY - 5, [formatDollars(d.isNegative ? -d.value : d.value)]);
      })
      .on("mouseleave", () => {
        hoverDiv.hide();
      })
      .transition()
      .duration(duration)
      .style("opacity", 1);

    // add new text
    nodeRect
      .append("text")
      .attr("x", (d) => (d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6))
      .attr("y", (d) => (d.y0 + d.y1) / 2)
      .attr("text-anchor", (d) => (d.x0 < width / 2 ? "start" : "end"))
      .text((d) => d.name)
      .attr("dy", "0.35em")
      .classed("sankey-text", true)
      .style("opacity", 0)
      .transition()
      .duration(duration)
      .style("opacity", 1);
  }

  // Universal error message for missing data
  const errorMsg = new ErrorMsg(svg, state.sankey.toLocaleLowerCase(), ErrorMsg.Directions.BOTTOM);

  // https://www.geeksforgeeks.org/debouncing-in-javascript/#
  // Debounce function. Prevents too many UI updates
  function debounce(func) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        func(...args);
      }, state.debounceTime);
    };
  }

  // Listener for symbol/state changes to update the diagram.
  const update = async (transition = true) => {
    // Retrieve data
    let { error, sankeyData } = await getData(state.sankey);
    const { width, height } = getDimensions();

    if (error) {
      errorMsg.dataName = state.sankey.toLocaleLowerCase();
      errorMsg.enter(width, height, transition);
    } else {
      errorMsg.exit(width, height, transition);
    }

    draw(sankeyData);
  };

  const debouncedUpdate = debounce(update);

  state.addListener(PageState.Events.SYMBOL, debouncedUpdate);
  state.addListener(PageState.Events.TIME, debouncedUpdate);
  state.addListener(PageState.Events.SANKEY_SELECT, debouncedUpdate);

  update(false);
}
