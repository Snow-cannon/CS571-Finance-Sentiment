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
  const data = await queryData("wordcloud", { symbol: state.symbol });

  console.log("Word cloud data:", data);
// Mock data for demonstration
  // const data = {
  //   words: [
  //     { word: "Innovation", size: 50 },
  //     { word: "iPhone", size: 40 },
  //     { word: "Ecosystem", size: 30 },
  //     { word: "Services", size: 25 },
  //     { word: "MacBook", size: 20 },
  //     { word: "Revenue", size: 35 },
  //     { word: "Growth", size: 28 },
  //     { word: "Apple Watch", size: 22 },
  //     { word: "Privacy", size: 26 },
  //     { word: "AI", size: 32 },
  //   ]
  // };
  if (!data || !Array.isArray(data.words)) {
    container.append("p").text(`No word cloud data for ${state.symbol}`);
    return;
  }

  const width = 500;
  const height = 300;

  // Define layout
  const layout = cloud()
    .size([width, height])
    .words(data.words.map(d => ({ text: d.word, size: d.size })))
    .padding(5)
    .rotate(() => ~~(Math.random() * 2) * 90)
    .font("Impact")
    .fontSize(d => d.size)
    .on("end", draw);

  //Refining color scheme
  const sentimentColors = ["#ff0808", "#fc8406", "#f9ff03", "#0b6908"];


  layout.start();

  // Draw function
  function draw(words) {
    container.append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`)
      .selectAll("text")
      .data(words)
      .enter().append("text")
      .style("font-size", d => `${d.size}px`)
      .style("font-family", "Impact")
      .style("fill", (_, i) => sentimentColors[i % sentimentColors.length])
      .attr("text-anchor", "middle")
      .attr("transform", d => `translate(${d.x},${d.y})rotate(${d.rotate})`)
      .text(d => d.text);
  }

  // Update listener
  const update = () => {
    state.removeListener(PageState.Events.SYMBOL, update);
    makeWordCloud(containerID);
  };

  state.addListener(PageState.Events.SYMBOL, update);
}
