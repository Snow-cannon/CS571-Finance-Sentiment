import { state } from "./index.js";
import * as d3 from "d3";

class HoverDiv {
  /** The div being displayed */
  #_div;

  constructor(container) {
    // const div = document.createElement("div");
    // const container =
    // Create a random uuid for the dom element
    // div.id = crypto.randomUUID();
    this.#_div = container.append("div");

    // Select it with d3 and set the class to hover
    // this.#_div = d3.select(`#${CSS.escape(div.id)}`);
    this.#_div.style("display", "none").classed("hover-div", true);
  }

  show(x, y, text) {
    this.#_div.selectAll("p").remove();
    this.#_div
      .selectAll("p")
      .data(text)
      .enter()
      .append("p")
      .text((d) => d);

    this.#_div
      .style("transform", "translate(-50%, -100%)")
      .style("display", "block")
      .style("left", `${x}px`)
      .style("top", `${y}px`);
  }

  hide() {
    this.#_div.style("display", "none");
  }
}

export default HoverDiv;
