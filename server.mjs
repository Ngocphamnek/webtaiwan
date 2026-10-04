import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const publicDirectory = resolve(
  fileURLToPath(new URL("./public", import.meta.url)),
);
const indexFile = resolve(publicDirectory, "index.html");
const port = Number(process.env.PORT || 10000);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error(`Invalid PORT value: ${process.env.PORT}`);
}

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

const server = createServer(async (request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD" });
    response.end();
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(
      new URL(request.url || "/", "http://localhost").pathname,
    );
  } catch {
    response.writeHead(400);
    response.end("Bad request");
    return;
  }

  const requestedFile = resolve(publicDirectory, `.${pathname}`);
  if (
    requestedFile !== publicDirectory &&
    !requestedFile.startsWith(`${publicDirectory}${sep}`)
  ) {
    response.writeHead(404);
    response.end("Not found");
    return;
  }

  let filePath = requestedFile;
  try {
    if (!(await stat(filePath)).isFile()) {
      filePath = indexFile;
    }
  } catch {
    if (extname(pathname)) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }
    filePath = indexFile;
  }

  try {
    const body = await readFile(filePath);
    const isIndex = filePath === indexFile;
    response.writeHead(200, {
      "Cache-Control": isIndex ? "no-cache" : "public, max-age=3600",
      "Content-Type":
        contentTypes[extname(filePath).toLowerCase()] ??
        "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
    });
    response.end(request.method === "HEAD" ? undefined : body);
  } catch {
    response.writeHead(500);
    response.end("Unable to read requested file");
  }
});

server.listen(port, "0.0.0.0", () => {
  console.info(`Static site listening on 0.0.0.0:${port}`);
});