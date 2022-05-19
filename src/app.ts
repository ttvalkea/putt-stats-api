import { createConnection, queryAllPuttResults } from "./database";
import cors from "cors";
import express from "express";
import { Connection } from "promise-mysql";
const app = express();

// --- CORS ---
app.use(cors());
const port = 8081;
const hostname = "127.0.0.1";

// --- Endpoints ---
let connection: Connection | undefined = undefined;

// Returns all putt results
app.get("/putt-results", async (req, res) => {
  if (!connection) {
    connection = await createConnection();
  }
  const allPuttResults = await queryAllPuttResults(connection);
  res.end(JSON.stringify(allPuttResults));
});

app.listen(port, () => {
  console.log("Putt stats API app listening at http://%s:%s", hostname, port);
});
