require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");

const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@as-integrations/express5");
const bodyParser = require("body-parser");

const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/resolvers");

async function start() {
  const app = express();

  app.use(cors());
  app.use(express.static(path.join(__dirname, "public")));

  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected");

  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();

  app.use("/graphql", bodyParser.json(), expressMiddleware(server));

  // serve UI
  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
  });

  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`http://localhost:${port}`));
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});