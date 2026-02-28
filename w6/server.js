require("dotenv").config();

const express = require("express");
const http = require("http");
const { WebSocketServer } = require("ws");
const OpenAI = require("openai");

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const BOT_NAME = "ChatGPT Bot";
const BOT_TRIGGER = process.env.BOT_TRIGGER || "@bot";

app.use(express.static("public"));

function broadcast(payload) {
  const data = JSON.stringify(payload);
  for (const ws of wss.clients) {
    if (ws.readyState === ws.OPEN) ws.send(data);
  }
}

async function getBotReply(userText) {
  try {
    const r = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: userText }],
    });
    return r.choices?.[0]?.message?.content?.trim() || "…";
  } catch (e) {
    console.log("OPENAI ERROR:", e?.status, e?.message);
    throw e;
  }
}

wss.on("connection", (ws) => {
  ws.username = `User${Math.floor(Math.random() * 9000) + 1000}`;

  ws.send(JSON.stringify({ type: "system", text: `Connected as ${ws.username}` }));
  broadcast({ type: "system", text: `${ws.username} joined the chat` });

  ws.on("message", async (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return;
    }

    if (msg.type === "setName") {
      const clean = String(msg.username || "").trim().slice(0, 20);
      if (clean) {
        const old = ws.username;
        ws.username = clean;
        broadcast({ type: "system", text: `${old} is now ${ws.username}` });
      }
      return;
    }

    if (msg.type !== "chat") return;

    const text = String(msg.text || "").trim();
    if (!text) return;

    broadcast({ type: "chat", from: ws.username, text });

    const shouldBotReply = text.toLowerCase().includes(BOT_TRIGGER.toLowerCase());
    if (!shouldBotReply) return;

    broadcast({ type: "botStatus", text: `${BOT_NAME} is typing...` });

    try {
      const prompt = text.replace(new RegExp(BOT_TRIGGER, "ig"), "").trim();
      const botText = await getBotReply(prompt || text);
      broadcast({ type: "bot", from: BOT_NAME, text: botText });
    } catch (e) {
      broadcast({ type: "bot", from: BOT_NAME, text: "Bot error. Check server logs." });
    } finally {
      broadcast({ type: "botStatus", text: "" });
    }
  });

  ws.on("close", () => broadcast({ type: "system", text: `${ws.username} left the chat` }));
});

const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`http://localhost:${port}`));