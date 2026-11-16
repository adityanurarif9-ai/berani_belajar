import {createReadStream} from "node:fs";
import {stat} from "node:fs/promises";
import {createServer} from "node:http";

const assets = new Map([
  ["/", ["index.html", "text/html; charset=utf-8"]],
  ["/index.html", ["index.html", "text/html; charset=utf-8"]],
  ["/Berani-Bicara.html", ["index.html", "text/html; charset=utf-8"]],
  ["/auth.js", ["auth.js", "text/javascript; charset=utf-8"]],
  ["/firebase-config.js", ["firebase-config.js", "text/javascript; charset=utf-8"]],
  ["/video-public-speaking.mp4", ["video-public-speaking.mp4", "video/mp4"]],
  ["/video-public-speaking.jpg", ["video-public-speaking.jpg", "image/jpeg"]]
]);

const server = createServer(async (request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, {Allow: "GET, HEAD"}).end();
    return;
  }
  const asset = assets.get(request.url.split("?")[0]);
  if (!asset) {
    response.writeHead(404).end();
    return;
  }
  const [name, type] = asset;
  let file = new URL(name, import.meta.url);
  let size;
  try {
    try {
      size = (await stat(file)).size;
    } catch (error) {
      if (name !== "index.html" || error.code !== "ENOENT") throw error;
      file = new URL("Berani-Bicara.html", import.meta.url);
      size = (await stat(file)).size;
    }
  } catch {
    response.writeHead(404).end();
    return;
  }
  let start = 0;
  let end = size - 1;
  let status = 200;
  const headers = {"Content-Type": type, "Accept-Ranges": "bytes", "Cache-Control": "no-cache"};
  if (request.headers.range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(request.headers.range);
    if (match && (match[1] || match[2])) {
      start = match[1] ? Number(match[1]) : Math.max(0, size - Number(match[2]));
      end = match[1] && match[2] ? Math.min(end, Number(match[2])) : end;
    } else {
      start = size;
    }
    if (start > end) {
      response.writeHead(416, {"Content-Range": "bytes */" + size}).end();
      return;
    }
    status = 206;
    headers["Content-Range"] = "bytes " + start + "-" + end + "/" + size;
  }
  headers["Content-Length"] = end - start + 1;
  response.writeHead(status, headers);
  if (request.method === "HEAD") {
    response.end();
    return;
  }
  createReadStream(file, {start, end}).on("error", () => response.destroy()).pipe(response);
});

server.on("error", (error) => {
  console.error(error.code === "EADDRINUSE" ? "Port 8080 sedang dipakai. Tutup server sebelumnya." : error.message);
  process.exitCode = 1;
});
server.listen(8080, "localhost", () => console.log("Buka http://localhost:8080"));
