import express from "express";
import cors from "cors";
import { S3Route } from "./get-signed-url.js";
import dotenv from "dotenv";

const app = express();
app.use(express.json());

dotenv.config();

app.use(
  cors({
    origin: "*",
  }),
);

app.get("/api", (req, res) => {
  res.json({ message: "Success!" });
});

app.use("/", S3Route);

app.listen(5000, () => {
  console.log(`Example app listening on port 5000`);
});
