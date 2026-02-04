require("dotenv").config();
console.log("MONGO_URI exists?", !!process.env.MONGO_URI);
console.log("MONGO_URI preview:", process.env.MONGO_URI?.slice(0, 25) + "...");
const express = require("express");
const path = require("path");
const { MongoClient } = require("mongodb");

const app = express();
const PORT = 3000;

if (!process.env.MONGO_URI) {
  console.error("Missing MONGO_URI in .env");
  process.exit(1);
}

const client = new MongoClient(process.env.MONGO_URI);

async function start() {
  try {
    await client.connect();
    console.log("Connected to MongoDB Atlas");

    const db = client.db("todo_app");
    const todosCol = db.collection("todos");

    app.get("/todo", async (req, res) => {
      const todos = await todosCol
        .find({}, { projection: { _id: 0 } })
        .toArray();

      res.setHeader("Content-Type", "application/json");
      res.status(200).send(todos);
    });

    app.get("/todo/:id", async (req, res) => {
      const idNum = Number(req.params.id);
      if (Number.isNaN(idNum)) {
        return res.status(400).json({ error: "id must be a number" });
      }

      const todo = await todosCol.findOne(
        { id: idNum },
        { projection: { _id: 0 } }
      );

      if (!todo) return res.status(404).json({ error: "Not found" });

      res.setHeader("Content-Type", "application/json");
      return res.status(200).send(todo);
    });

    app.get(["/", "/index"], (req, res) => {
      res.sendFile(path.join(__dirname, "public", "index.html"));
    });

    app.get("/read-todo", (req, res) => {
      res.sendFile(path.join(__dirname, "public", "read-todo.html"));
    });

    app.use((req, res) => {
      res.redirect(301, "/index");
    });

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Server failed to start:", err);
    process.exit(1);
  }
}

start();
