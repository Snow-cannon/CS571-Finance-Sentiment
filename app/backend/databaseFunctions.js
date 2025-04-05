import sqlite3 from "sqlite3";
import path from "path";

export class DB {
  #_path;
  #_db;

  constructor() {
    this.#_path = "";
    this.#_db = null;
  }

  /**
   * Loads a connection to the finance data database file
   */
  async connect(path) {
    this.#_path = path;
    try {
      // Open the database
      this.#_db = new sqlite3.Database(this.#_path, sqlite3.OPEN_READWRITE);

      console.log("DB Connected");

      // Return the new db instance
      return true;
    } catch (error) {
      console.error("Connection Error:", error.message);
      this.#_db = null;
      return false;
    }
  }

  /**
   * Disconnects the database.
   * @returns {Boolean} - Returns true if successful. False otherwise
   */
  async disconnect() {
    try {
      if (this.#_db !== null) {
        this.#_db.close();
      }
      return true;
    } catch (e) {
      console.error("Disconnect Error: ", error.message);
      return false;
    }
  }

  /**
   * Runs a generic query on the finance db
   * @param {String} query
   * @returns
   */
  async query(query, sanitize = {}) {
    if (this.#_db !== null) {
      // Create empty returnable row object
      const rows = [];

      // Use a promise to guarentee the data is pushed
      await new Promise((resolve, reject) => {
        this.#_db.all(query, sanitize, (err, res) => {
          if (err) {
            reject(err); // Fail on an error
          } else {
            rows.push(...res); // Add all retrieved rows to the array
            resolve(); // Resolve the promise manually
          }
        });
      });

      // Return the result when the promise is resolved
      return rows;
    } else {
      console.log("DB is disconnected");
      return [];
    }
  }
}
