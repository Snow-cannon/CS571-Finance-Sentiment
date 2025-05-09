import { ErrorMsg } from "./errorMsg.js";
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
    const dateRange = state.queryDateRange(PageState.DATE_TYPE.CLOUD);
    const queryResult = await queryData("wordcloud", {
      symbol: state.symbol,
      start: dateRange.start,
      end: dateRange.end,
      limit_words: 15
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
    { label: "Bearish", color: "bearish-word" },
    { label: "Somewhat Bearish", color: "sw-bearish-word" },
    { label: "Neutral", color: "neutral-word" },
    { label: "Somewhat Bullish", color: "sw-bullish-word" },
    { label: "Bullish", color: "bullish-word" },
  ];

  // Non-uniform options
  const ranges = [-10, -0.35, -0.15, 0.15, 0.35, 10];
  const sections = d3.pairs(ranges);

  // Set word text size to a scale based on current word counts
  const xScale = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => d.occurrence_count))
    .range([20, 70]);

  const svg = container.append("svg").attr("width", boundingWidth).attr("height", boundingHeight);
  const g = svg.append("g").attr("transform", `translate(${width / 2},${height / 2})`);
  const layout = cloud()
    .size([width, height])
    .padding(5)
    .rotate(0)
    .font("Impact")
    .fontWeight("bold")
    .on("end", draw);

  // Draw function
  function draw(words, transition = true) {
    const duration = transition ? state.duration : 0;

    g.selectAll("text").remove();

    g.selectAll("text")
      .data(words)
      .enter()
      .append("text")
      .attr("transform", (d) => `translate(${d.x},${d.y})rotate(${d.rotate})`)
      .style("font-size", 0)
      .transition()
      .duration(duration)
      .attr("class", (d) => `wc-word ${categories[d.score].color}`)
      .style("font-size", (d) => `${d.size}px`)
      .style("font-family", "Impact")
      .attr("text-anchor", "middle")
      .text((d) => d.text);
  }

  // Universal error message for missing data
  const error = new ErrorMsg(svg, "word", ErrorMsg.Directions.LEFT);

  // Update listener
  const update = async (transition = true) => {
    let data = await getData();
    const duration = transition ? state.duration : 0;

    const { boundingWidth, boundingHeight } = getDimensions();

    if (!data || !Array.isArray(data) || data.length === 0) {
      // container.append("p").text(`No word cloud data for ${state.symbol}`);
      error.enter(boundingWidth, boundingHeight, duration);
      data = [];
      // return;
    } else {
      error.exit(boundingWidth, boundingHeight, duration);
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
      .on("end", (words) => draw(words, transition))
      .fontSize((d) => d.size)
      .start();
  };

  update(false);

  state.addListener(PageState.Events.SYMBOL, update);
  state.addListener(PageState.Events.TIME, update);
}
