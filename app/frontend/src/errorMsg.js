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

  set dataName(name) {
    this.#_dataName = name;
  }

  #transform(width, height, bbox, direction) {
    switch (direction) {
      case ErrorMsg.Directions.TOP:
        return `translate(${(width - bbox.width) / 2}, ${-bbox.height})`;
      case ErrorMsg.Directions.BOTTOM:
        console.log("bottom:", width, height, bbox);
        return `translate(${(width - bbox.width) / 2}, ${height * 1.5 + bbox.height})`;
      case ErrorMsg.Directions.LEFT:
        return `translate(${width + bbox.width + 10}, ${(height + bbox.height) / 2})`;
        case ErrorMsg.Directions.RIGHT:
        return `translate(${-bbox.width - 10}, ${(height + bbox.height) / 2})`;
      default:
        return `translate(${(width - bbox.width) / 2}, ${(height + bbox.height) / 2})`;
    }
  }

  enter(width, height, transition = true) {
    this.#_text.text(`No ${this.#_dataName} data available for ${state.symbol}`);
    const bbox = this.#_text.node().getBBox();
    const transform = this.#transform(width, height, bbox, "None");
    console.log(transform);

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
    this.#_text.text(`No ${this.#_dataName} data available for ${state.symbol}`);
    const bbox = this.#_text.node().getBBox();
    const transform = this.#transform(width, height, bbox, this.#_direction);
    console.log(transform);

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
