import { createServer } from "node:http";
import { pathToFileURL } from "node:url";

import { healthResponse, handleSimulationRequest } from "./serverless/api-core.mjs";

const DEFAULT_HOST = "127.0.0.1";
const DEFAULT_PORT = 8001;
const MAX_BODY_BYTES = 64 * 1024;

function readBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    let tooLarge = false;
    request.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        tooLarge = true;
        return;
      }
      chunks.push(chunk);
    });
    request.on("end", () => {
      if (tooLarge) {
        const error = new Error("Request body is too large.");
        error.status = 413;
        reject(error);
      } else {
        resolve(Buffer.concat(chunks));
      }
    });
    request.on("error", reject);
  });
}

async function sendWebResponse(nodeResponse, webResponse) {
  nodeResponse.statusCode = webResponse.status;
  for (const [name, value] of webResponse.headers) nodeResponse.setHeader(name, value);
  nodeResponse.end(Buffer.from(await webResponse.arrayBuffer()));
}

function jsonError(status, code, message) {
  return Response.json(
    { error: { code, message } },
    {
      status,
      headers: {
        "access-control-allow-origin": "*",
        "cache-control": "no-store",
      },
    },
  );
}

function createApiServer() {
  return createServer(async (request, response) => {
    try {
      const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
      if (url.pathname === "/api/v1/health" && request.method === "GET") {
        await sendWebResponse(response, await healthResponse());
        return;
      }
      const kind = url.pathname === "/api/v1/simulate"
        ? "simulate"
        : url.pathname === "/api/v1/compare"
          ? "compare"
          : null;
      if (!kind) {
        await sendWebResponse(response, jsonError(404, "not_found", "Unknown API endpoint."));
        return;
      }
      const body = request.method === "POST" ? await readBody(request) : undefined;
      const webRequest = new Request(url, {
        method: request.method,
        headers: request.headers,
        ...(body ? { body } : {}),
      });
      await sendWebResponse(response, await handleSimulationRequest(webRequest, kind));
    } catch (error) {
      if (!response.headersSent) {
        await sendWebResponse(
          response,
          jsonError(error.status ?? 500, error.status === 413 ? "request_too_large" : "internal_error", error.message),
        );
      } else {
        response.end();
      }
    }
  });
}

function startApiServer({ host = DEFAULT_HOST, port = DEFAULT_PORT } = {}) {
  const server = createApiServer();
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, host, () => resolve(server));
  });
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const host = process.env.API_HOST || DEFAULT_HOST;
  const port = Number(process.env.API_PORT) || DEFAULT_PORT;
  const server = await startApiServer({ host, port });
  const address = server.address();
  console.log(`AVD simulation API listening on http://${host}:${address.port}`);
}

export { createApiServer, startApiServer };
