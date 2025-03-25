const testBtn = document.getElementById("testBtn");
testBtn.onclick = (e) => {
  fetch("http://localhost:3000/data/test")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      return response.text();
    })
    .then((data) => {
      console.log("Data retrieved:", data);
      // Process the data as needed
    })
    .catch((error) => {
      console.error("Fetch error:", error);
    });
};

console.log("message");
