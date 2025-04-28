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
  // console.log(data);

  if (!data || !Array.isArray(data)) {
    container.append("p").text(`No word cloud data for ${state.symbol}`);
    return;
  }

  const width = 500;
  const height = 300;

  // Set word text size to a scale based on current word counts
  const xScale = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => d.count))
    .range([20, 70]);

  // Define layout
  const layout = cloud()
    .size([width, height])
    .words(data.map((d) => ({ text: d.word, size: Math.round(xScale(d.count)) })))
    .padding(5)
    .rotate(() => ~~(Math.random() * 2) * 90)
    .font("Impact")
    .fontSize((d) => d.size)
    .on("end", draw);

  //Refining color scheme
  const sentimentColors = ["#ff0808", "#fc8406", "#f9ff03", "#0b6908"];

  layout.start();

  // Draw function
  function draw(words) {
    container
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`)
      .selectAll("text")
      .data(words)
      .enter()
      .append("text")
      .style("font-size", (d) => `${d.size}px`)
      .style("font-family", "Impact")
      .style("fill", (_, i) => sentimentColors[i % sentimentColors.length])
      .attr("text-anchor", "middle")
      .attr("transform", (d) => `translate(${d.x},${d.y})rotate(${d.rotate})`)
      .text((d) => d.text);
  }

  // Update listener
  const update = () => {
    state.removeListener(PageState.Events.SYMBOL, update);
    state.removeListener(PageState.Events.TIME, update);
    makeWordCloud(containerID);
  };

  state.addListener(PageState.Events.SYMBOL, update);
  state.addListener(PageState.Events.TIME, update);
}
