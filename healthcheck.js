const http = require("http");

const options = {
  hostname: "localhost",
  port: 3000,
  path: "/",
  method: "GET",
};

const request = http.request(options, (response) => {
  console.log(`STATUS: ${response.statusCode}`);
  if (response.statusCode === 200) {
    process.exit(0); // success
  } else {
    process.exit(1); // failure
  }
});

request.on("error", (error) => {
  console.error("Health check failed:", error);
  process.exit(1); // failure
});

request.end();
