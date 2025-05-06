export class PageState {
  /** Currently selected symbol */
  #_symbol;
  /** If the page is using quarterly or annual data */
  #_isQuarter;
  /** Currently selected quarter */
  #_quarter;
  /** 0 indexed start year */
  #_startYear;
  /** 0 indexed final selection year */
  #_endYear;
  /** Global transition suggestion */
  #_transitionDuration;

  /**
   * A list of all callback functions hashed by
   * the event they dispatch from
   *
   * @type {Object<string, function(): void>}
   */
  #_callbacks;

  /**
   * A list of all valid events to listen to
   *
   * - SYMBOL: when the symbol updates
   * - TIME: when the quarterly / annually setting and
   * quarter/year are updated
   */
  static Events = {
    SYMBOL: "symbol",
    TIME: "time",
    RESIZE: "resize",
  };

  static DATE_TYPE = {
    SANKEY: "sankey",
    CLOUD: "word cloud",
    INTRADAY: "intraday",
  };

  constructor(options) {
    this.#_quarter = 0;
    this.#_isQuarter = false;
    this.#_callbacks = {};
    this.#_startYear = options.startYear || 2016;
    this.#_endYear = options.endYear || this.#_startYear + 5;
    this.#_symbol = options.symbol || "";
    this.#_transitionDuration = options.duration || 1000;

    const debounceTime = options.debounceTime;

    // https://www.geeksforgeeks.org/debouncing-in-javascript/#
    // Debounce function. Prevents too many UI updates
    function debounce(func) {
      let timeout;
      return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          func(...args);
        }, debounceTime);
      };
    }

    // Add debounce to the resize dispatch event
    const debounceResize = debounce(this.dispatch.bind(this), debounceTime);

    // Built-in resize events
    window.addEventListener("resize", () => {
      debounceResize(PageState.Events.RESIZE);
    });
  }

  /** returns the currently selected symbol */
  get symbol() {
    return this.#_symbol;
  }

  /**
   * Updates the symbol and dispatches a DOM event for the update
   *
   * @param {String} symbol - New symbol being selected
   */
  set symbol(symbol) {
    // Update symbol
    this.#_symbol = symbol;

    // Dispatch the created event
    this.dispatch(PageState.Events.SYMBOL);
  }

  /** returns the currently selected quarter */
  get quarter() {
    return this.#_quarter;
  }

  /** Sets the current quarter */
  set quarter(quarter) {
    this.#_quarter = quarter;
    this.dispatch(PageState.Events.TIME);
  }

  /** returns the currently selected quarter */
  get isQuarter() {
    return this.#_isQuarter;
  }

  /** Sets the current quarter */
  set isQuarter(isQuarter) {
    this.#_isQuarter = isQuarter;
    this.dispatch(PageState.Events.TIME);
  }

  /** returns the 0 indexed starting year */
  get startYear() {
    return this.#_startYear;
  }

  /** returns the 0 indexed final year */
  get endYear() {
    return this.#_endYear;
  }

  /** returns the duration suggestion for visuals */
  get duration() {
    return this.#_transitionDuration;
  }

  /** Returns the start and end time for date querys */
  queryDateRange(type) {
    // Horrible but easy to write
    // Would write better code for work but
    // Here we are
    let year = this.startYear + (this.quarter - (this.quarter % 5)) / 5;
    let startQ = { month: "", day: "" };
    let endQ = { month: "", day: "" };
    switch (this.quarter % 5) {
      case 1:
        startQ.month = "01";
        startQ.day = "01";
        endQ.month = "03";
        endQ.day = "31";
        break;
      case 2:
        startQ.month = "04";
        startQ.day = "01";
        endQ.month = "06";
        endQ.day = "30";
        break;
      case 3:
        startQ.month = "07";
        startQ.day = "01";
        endQ.month = "09";
        endQ.day = "30";
        break;
      case 4:
        startQ.month = "10";
        startQ.day = "01";
        endQ.month = "12";
        endQ.day = "31";
        break;
      default:
        startQ.month = "01";
        startQ.day = "01";
        endQ.month = "12";
        endQ.day = "31";
        break;
    }

    let start;
    let end;

    switch (type) {
      case PageState.DATE_TYPE.SANKEY:
        start = `${year}-${startQ.month}-${startQ.day}`;
        end = `${year}-${endQ.month}-${endQ.day}`;
        break;
      case PageState.DATE_TYPE.CLOUD:
        start = `${year}${startQ.month}${endQ.day}T000000`;
        end = `${year}${endQ.month}${endQ.day}T235959`;
        break;
      case PageState.DATE_TYPE.INTRADAY:
        start = `${year}-${startQ.month}-star${startQ.day} 00:00:00`;
        end = `${year}-${endQ.month}-${endQ.day} 23:59:59`;
        break;
      default:
        return;
    }
    return { start, end };
  }

  /**
   * Adds a listener to be called when the target event is
   * dispatched.
   *
   * Assumed that all functions will have access
   * to the state instance, so no data is passed in.
   *
   * @param {String} evtName
   * @param {function(): void} callback
   */
  addListener(evtName, callback) {
    if (this.#_callbacks[evtName]) {
      // Add callback to the array
      this.#_callbacks[evtName].push(callback);
    } else {
      // Create new array if one does not already exist
      this.#_callbacks[evtName] = [callback];
    }
  }

  /**
   * Removes a listener from the list.
   * Useful when destroying and rebuilding visuals
   *
   * @param {String} evtName
   * @param {function(): void} callback
   */
  removeListener(evtName, callback) {
    /**
     * Contains all callbacks for the specified event
     * @type {(function(): void)[]}
     */
    const callbacks = this.#_callbacks[evtName];

    // Fail if there are no callbacks
    if (!callbacks || callbacks.length === 0) {
      return;
    }

    // Find callback
    const idx = callbacks.findIndex((cb) => {
      return cb === callback;
    });

    // Skip if not found
    if (idx === -1) {
      return;
    }

    // Remove callback
    callbacks.splice(idx, 1);
  }

  /**
   * Calls all listener functions attached to the
   * specified event.
   * @param {String} evtName
   */
  dispatch(evtName) {
    /**
     * Contains all callbacks for the specified event
     * @type {(function(): void)[]}
     */
    const callbacks = this.#_callbacks[evtName];

    // Fail if there are no callbacks
    if (!callbacks || callbacks.length === 0) {
      return;
    }

    const derefCallbacks = [...callbacks];

    // Call all cakkbacks
    derefCallbacks.forEach((callback) => callback());
  }
}
