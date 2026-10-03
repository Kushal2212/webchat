import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { WebSocketServer, WebSocket } from "ws";

import { pub, sub } from "./connection.js";

const PORT = process.env.PORT || 9000;

const httpServer = http.createServer(async (req, res) => {
  try {
    const file = await fs.readFile(path.resolve("./index.html"), "utf-8");
    res.setHeader("content-type", "text/html");
    res.end(file);
  } catch (err) {
    console.error("Failed to serve index.html:", err);
    res.statusCode = 500;
    res.end("Internal Server Error");
  }
});

const wsServer = new WebSocketServer({ server: httpServer });

await sub.subscribe("ws-message");

sub.on("message", (channel, message) => {
  if (channel !== "ws-message") return;

  wsServer.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
});

wsServer.on("connection", (websocket) => {
  console.log("Websocket connection...");

  websocket.on("message", async (data) => {
    try {
      await pub.publish("ws-message", data.toString());
    } catch (err) {
      console.error("Publish failed:", err);
    }
  });

  websocket.on("error", console.error);
});

httpServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
