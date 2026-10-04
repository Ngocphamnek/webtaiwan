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
  ".mp3": "audio/mpeg",
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
    const headers = {
      "Accept-Ranges": "bytes",
      "Cache-Control": isIndex ? "no-cache" : "public, max-age=3600",
      "Content-Type":
        contentTypes[extname(filePath).toLowerCase()] ??
        "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
    };
    const rangeHeader = request.headers.range;

    if (rangeHeader) {
      const range = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader.trim());
      let start;
      let end;

      if (range && range[1] === "" && range[2] !== "") {
        const suffixLength = Number(range[2]);
        start = Math.max(body.length - suffixLength, 0);
        end = body.length - 1;
      } else if (range && range[1] !== "") {
        start = Number(range[1]);
        end = range[2] === "" ? body.length - 1 : Number(range[2]);
      }

      if (
        start === undefined ||
        end === undefined ||
        !Number.isSafeInteger(start) ||
        !Number.isSafeInteger(end) ||
        start < 0 ||
        start >= body.length ||
        end < start
      ) {
        response.writeHead(416, {
          "Accept-Ranges": "bytes",
          "Content-Range": `bytes */${body.length}`,
        });
        response.end();
        return;
      }

      end = Math.min(end, body.length - 1);
      const partialBody = body.subarray(start, end + 1);
      response.writeHead(206, {
        ...headers,
        "Content-Length": String(partialBody.length),
        "Content-Range": `bytes ${start}-${end}/${body.length}`,
      });
      response.end(request.method === "HEAD" ? undefined : partialBody);
      return;
    }

    response.writeHead(200, { ...headers, "Content-Length": String(body.length) });
    response.end(request.method === "HEAD" ? undefined : body);
  } catch {
    response.writeHead(500);
    response.end("Unable to read requested file");
  }
});

server.listen(port, "0.0.0.0", () => {
  console.info(`Static site listening on 0.0.0.0:${port}`);
});