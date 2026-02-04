const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;

function sendFile(res, filePath, contentType) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Server error reading file.");
      return;
    }
    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const url = req.url;

  switch (url) {
    case "/":
    case "/index":
    case "/index.html": {
      const filePath = path.join(__dirname, "public", "index.html");
      return sendFile(res, filePath, "text/html");
    }

    case "/todo":
    case "/todo.json": {
      const filePath = path.join(__dirname, "todo.json");
      return sendFile(res, filePath, "application/json");
    }

    case "/read-todo":
    case "/read-todo.html": {
      const filePath = path.join(__dirname, "public", "read-todo.html");
      return sendFile(res, filePath, "text/html");
    }

    default: {
      res.writeHead(301, {
        Location: "http://" + req.headers["host"] + "/index.html",
      });
      return res.end();
    }
  }
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
