require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");

async function main() {
  if (!process.env.MONGO_URI) {
    console.error("Missing MONGO_URI in .env");
    process.exit(1);
  }

  const client = new MongoClient(process.env.MONGO_URI);
  const filePath = path.join(__dirname, "todo.json");

  const raw = fs.readFileSync(filePath, "utf-8");
  const todos = JSON.parse(raw);

  try {
    await client.connect();

    const db = client.db("todo_app");
    const col = db.collection("todos");

    await col.deleteMany({});

    await col.insertMany(todos);

    console.log(`Seeded ${todos.length} todos into todo_app.todos`);
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main();
