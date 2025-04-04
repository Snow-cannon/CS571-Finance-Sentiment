/**
 * Takes in a string for the URL path and the set of params
 * and returns the fetched JSON.
 *
 * Returns null on error.
 * @param {String[]} path
 * @param {Object} params
 * @returns {Promise<JSON|null>} Returns query result on success and null on error
 */
async function queryData(path, params) {
  // Create URL for data fetching
  const url = new URL(`http://localhost:3000/data/${path}`);
  // Make request
  return await fetch(url, {
    // Use POST if a body is included
    method: params ? "POST" : "GET",

    // stringify the JSON input
    body: JSON.stringify(params),

    // Specify JSON body with content header
    headers: {
      "Content-Type": "application/json",
    },
  })
    // Validate JSON response
    .then((response) => {
      if (!response.ok) {
        throw new Error(`${response.status}`);
      }
      return response.json();
    })
    // Return null on error
    .catch((error) => {
      // Handle any errors
      console.error("There was an error:", error);
      return null;
    });
}

export default queryData;
