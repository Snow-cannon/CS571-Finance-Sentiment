import whoa from "./testModule.js";
const testBtn = document.getElementById("testBtn");

testBtn.onclick = (e) => {
  fetch("http://localhost:3000/data/test")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      console.log(response);
      return response.json();
    })
    .then((jsonData) => {
      // Print the JSON data to the console
      console.log(jsonData); // This will print the JSON data in the console
    })
    .catch((error) => {
      // Handle any errors
      console.error("There was an error:", error);
    });
};

console.log(whoa());
