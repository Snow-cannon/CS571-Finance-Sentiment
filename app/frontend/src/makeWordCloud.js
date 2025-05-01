import { PageState } from "./globalState.js";
import { state } from "./index.js";
import queryData from "./makeQuery.js";
import * as d3 from "d3";
import cloud from "d3-cloud";

/**
 * Creates a word cloud from company-related text data.
 *
 * @param {String} containerID - ID of the container div
 */
export async function makeWordCloud(containerID) {
  const container = d3.select(`#${containerID}`);
  container.selectAll("*").remove(); // Clear previous content

  // Fetch data for word cloud
  const getData = async () => {
    const dateRange = state.queryDateRange;
    const queryResult = await queryData("wordcloud", {
      symbol: state.symbol,
      start: dateRange.start,
      end: dateRange.end,
    });
    return queryResult.result;
  };

  const data = await getData();

  if (!data || !Array.isArray(data)) {
    container.append("p").text(`No word cloud data for ${state.symbol}`);
    return;
  }

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

  //Refining color scheme
  const categories = [
    { label: "Bearish", color: "#e74c3c" },
    { label: "Somewhat Bearish", color: "#e67e22" },
    { label: "Neutral", color: "#f1c40f" },
    { label: "Somewhat Bullish", color: "#2ecc71" },
    { label: "Bullish", color: "#27ae60" },
  ];

  // Non-uniform options
  const ranges = [-10, -0.35, -0.15, 0.15, 0.35, 10];
  const sections = d3.pairs(ranges);

  // Set word text size to a scale based on current word counts
  const xScale = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => d.occurrence_count))
    .range([20, 70]);

  const svg = container
    .append("svg")
    .attr("width", boundingWidth)
    .attr("height", boundingHeight)
    .append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);

  // Define layout
  const layout = cloud()
    .size([width, height])
    .words(
      data.map((d) => ({
        text: d.word,
        size: Math.round(xScale(d.occurrence_count)),
        score: sections.findIndex(
          (bin) => d.weighted_sentiment_score >= bin[0] && d.weighted_sentiment_score <= bin[1]
        ),
      }))
    )
    .padding(5)
    .rotate(0)
    .font("Impact")
    .fontSize((d) => d.size)
    .on("end", draw);

  layout.start();

  // Draw function
  function draw(words) {
    svg.selectAll("text").remove();

    svg
      .selectAll("text")
      .data(words)
      .enter()
      .append("text")
      .attr("transform", (d) => `translate(${d.x},${d.y})rotate(${d.rotate})`)
      .style("font-size", 0)
      .transition()
      .duration(state.duration / 2)
      .style("font-size", (d) => `${d.size}px`)
      .style("font-family", "Impact")
      .style("fill", (d, i) => categories[d.score].color)
      .attr("text-anchor", "middle")
      .text((d) => d.text);
  }

  // Update listener
  const update = async () => {
    const data = await getData();

    if (!data || !Array.isArray(data)) {
      container.append("p").text(`No word cloud data for ${state.symbol}`);
      return;
    }

    xScale.domain(d3.extent(data, (d) => d.occurrence_count));

    layout
      .words(
        data.map((d) => ({
          text: d.word,
          size: Math.round(xScale(d.occurrence_count)),
          score: sections.findIndex(
            (bin) => d.weighted_sentiment_score >= bin[0] && d.weighted_sentiment_score <= bin[1]
          ),
        }))
      )
      .on("end", draw)
      .start();
  };

  state.addListener(PageState.Events.SYMBOL, update);
  state.addListener(PageState.Events.TIME, update);
}
