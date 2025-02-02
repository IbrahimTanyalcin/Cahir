const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;
//const BASE_DIR = path.join(__dirname); // Serve files only from this directory
//console.log(BASE_DIR, "and this:", path.resolve(path.join(BASE_DIR, "..","..")));
const BASE_DIR = path.resolve(path.join(__dirname, "..",".."));

http.createServer((req, res) => {
    try {
      // Normalize the requested file path
      let sanitizedPath = path.normalize(req.url);
      let sanitizeFilename = (() => {
				const illegalChars = /[\x00-\x1f\\/<>:"`|?*%]/gi;
				return fileName => fileName.replace(illegalChars,"");
			})();
  
      // Remove all path traversal attempts (../ or ..\)
      sanitizedPath = sanitizedPath.replace(/(\.\.[\/\\])+/g, "");
      const 
        unsafeName = path.basename(sanitizedPath),
        unsafeRest = sanitizedPath.slice(0, sanitizedPath.length - unsafeName.length);
      sanitizedPath = path.join(unsafeRest, sanitizeFilename(unsafeName));
  
      let filePath = path.join(BASE_DIR, sanitizedPath);
  
      // Ensure the file path is within the BASE_DIR
      if (!filePath.startsWith(BASE_DIR)) {
        res.writeHead(403, { "Content-Type": "text/plain" });
        res.end("Access denied");
        return;
      }
  
      // Serve index.html if root is requested
      if (filePath === BASE_DIR || filePath.endsWith("/")) {
        //filePath = path.join(BASE_DIR, "index.html");
        filePath = path.join(BASE_DIR, "components", "examples", "index.html");
      }
  
      // Determine content type and serve the file
      const extname = path.extname(filePath);
      const mimeTypes = {
        ".html": "text/html",
        ".js": "application/javascript",
        ".css": "text/css",
        ".json": "application/json",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".gif": "image/gif",
        ".svg": "image/svg+xml",
      };
      const contentType = mimeTypes[extname] || "application/octet-stream";
  
      fs.readFile(filePath, (err, content) => {
        if (err) {
          if (err.code === "ENOENT") {
            res.writeHead(404, { "Content-Type": "text/plain" });
            res.end("404 Not Found");
          } else {
            res.writeHead(500);
            res.end(`Server Error: ${err.code}`);
          }
        } else {
          res.writeHead(200, { "Content-Type": contentType });
          res.end(content, "utf-8");
        }
      });
    } catch (error) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal Server Error");
    }
  }).listen(PORT, () => {
    console.log(`Secure server running at http://localhost:${PORT}`);
  });
  