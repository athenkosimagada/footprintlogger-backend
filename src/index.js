import express from "express";
import cors from "cors";
import { connectDB } from "./models/db.js";
import { port } from "./config/index.js";

import authRoutes from "./routes/authRoutes.js";
import logRoutes from "./routes/logRoutes.js";

const app = express();

connectDB()
  .then(() => {
    console.log("Connected to the database");
  })
  .catch((err) => {
    console.error("Failed to connect to the database", err);
  });

app.use(cors());
app.use(express.json());

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    console.error("Malformed JSON:", err.body);
    return res.status(400).json({ message: "Malformed JSON in request body" });
  }
  next(err);
});

app.use("/api/auth", authRoutes);
app.use("/api/logs", logRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Internal Server Error");
});

app.get("/", (req, res) => {
  res.send("Inside the server");
});

app.listen(port, () =>
  console.log(`Server running on http://localhost:${port}`)
);
