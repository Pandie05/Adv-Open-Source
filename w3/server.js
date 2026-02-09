import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import methodOverride from "method-override";
import { engine } from "express-handlebars";

import connectDB from "./config/db.js";
import employeeRoutes from "./routes/employeeRoutes.js";

dotenv.config();
await connectDB();


const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(methodOverride("_method"));

app.use(express.static("."));

app.engine(
  "handlebars",
  engine({
    defaultLayout: "main",
    layoutsDir: path.join(__dirname, "views", "layouts"),
    partialsDir: path.join(__dirname, "views", "partials"),
    helpers: {
      ifEquals(a, b, options) {
        return String(a) === String(b) ? options.fn(this) : options.inverse(this);
      }
    }
  })
);

app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

app.use("/", employeeRoutes);

app.use((req, res) => res.status(404).send("404 - not found"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`server running on http://localhost:${PORT}`));
