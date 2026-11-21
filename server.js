const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");

const port = Number(process.env.PORT || 8787);

const publicFiles = new Map([
  ["/", ["index.html", "text/html; charset=utf-8"]],
  ["/index.html", ["index.html", "text/html; charset=utf-8"]],
  ["/app.js", ["app.js", "text/javascript; charset=utf-8"]],
  ["/styles.css", ["styles.css", "text/css; charset=utf-8"]],
  ["/assets/zoom-topbar-reference.png", ["assets/zoom-topbar-reference.png", "image/png"]],
  ["/assets/zoom-toolbar-reference.png", ["assets/zoom-toolbar-reference.png", "image/png"]],
]);

const server = http.createServer((req, res) => {
  const host = req.headers.host?.toLowerCase();
  const localPort = req.socket.localPort;
  const allowedHosts = ["localhost", "127.0.0.1", "localhost:" + localPort, "127.0.0.1:" + localPort];
  if (!allowedHosts.includes(host)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { Allow: "GET, HEAD" });
    res.end("Method not allowed");
    return;
  }

  const requestPath = req.url.split("?", 1)[0];
  const entry = publicFiles.get(requestPath);
  if (!entry) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  const [filename, contentType] = entry;
  fs.readFile(path.join(__dirname, filename), (error, data) => {
    if (error) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    res.writeHead(200, {
      "Content-Type": contentType,
      "Content-Length": data.length,
      "X-Content-Type-Options": "nosniff",
      "Cross-Origin-Resource-Policy": "same-origin",
      "Cache-Control": "no-store",
    });
    res.end(req.method === "HEAD" ? undefined : data);
  });
});

server.listen(port, "127.0.0.1", () => {
  console.log("Zoom image generator: http://127.0.0.1:" + server.address().port);
});
