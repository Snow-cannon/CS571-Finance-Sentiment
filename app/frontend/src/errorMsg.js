import { state } from "./index.js";

export class ErrorMsg {
  #_dataName;
  #_direction;

  #_wrapper;
  #_text;
  #_rect;

  static Directions = {
    TOP: "top",
    BOTTOM: "bottom",
    LEFT: "left",
    RIGHT: "right",
  };

  constructor(svg, dataName, direction) {
    this.#_dataName = dataName;
    this.#_direction = direction;

    // Error message display
    this.#_wrapper = svg.append("g");
    this.#_wrapper.classed("error-wrapper", true);
    //   .attr("transform", `transform(${width / 2}, ${-height / 2})`);

    this.#_text = this.#_wrapper.append("text");
    this.#_text.classed("error-text", true).attr("x", 0).attr("y", 0);

    this.#_rect = this.#_wrapper.insert("rect", "text");
    this.#_rect.classed("error-rect", true).attr("x", 0).attr("y", 0);
  }

  #transformMultiplier() {
    switch (this.#_direction) {
      case ErrorMsg.Directions.TOP:
        return { x: 1, y: -3 };
      case ErrorMsg.Directions.BOTTOM:
        return { x: 1, y: 3 };
      case ErrorMsg.Directions.LEFT:
        return { x: 4, y: 1 };
      case ErrorMsg.Directions.RIGHT:
        return { x: -3, y: 1 };
      default:
        return { x: 1, y: 1 };
    }
  }

  enter(width, height, transition = true) {
    this.#_text.text(`No ${this.#_dataName} data available for ${state.symbol}`);
    const bbox = this.#_text.node().getBBox();
    const transform = `translate(${(width - bbox.width) / 2}, ${height / 2})`;

    this.#_rect
      .attr("x", bbox.x - 5)
      .attr("y", bbox.y - 5)
      .attr("width", bbox.width + 10)
      .attr("height", bbox.height + 10);

    this.#_wrapper
      .transition()
      .duration(transition ? state.duration : 0)
      .attr("transform", transform);
  }

  exit(width, height, transition = true) {
    const bbox = this.#_text.node().getBBox();
    const mult = this.#transformMultiplier();
    console.log();
    const transform = `translate(${(mult.x * (width - bbox.width)) / 2}, ${(mult.y * height) / 2})`;

    this.#_rect
      .attr("x", bbox.x - 5)
      .attr("y", bbox.y - 5)
      .attr("width", bbox.width + 10)
      .attr("height", bbox.height + 10);

    this.#_wrapper
      .transition()
      .duration(transition ? state.duration : 0)
      .attr("transform", transform);
  }
}
