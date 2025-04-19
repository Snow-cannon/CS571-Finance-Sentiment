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

  constructor(options) {
    this.#_quarter = 0;
    this.#_isQuarter = false;
    this.#_callbacks = {};
    this.#_startYear = options.startYear || 2016;
    this.#_endYear = options.endYear || this.#_startYear + 5;
    this.#_symbol = options.symbol || "";

    const debounceTime = options.debounce;

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
