import {
  createConnection,
  insertNewPuttResult,
  queryAllPuttResults,
} from "./database";
import cors from "cors";
import express from "express";
import { Connection } from "promise-mysql";
import { newPuttInsert } from "./types";
const app = express();
app.use(express.json()); // For reading request bodies as json

// --- CORS ---
app.use(cors());

const port = 8081;
const hostname = "127.0.0.1";

// --- Endpoints ---
let connection: Connection | undefined = undefined;

// Returns all putt results
app.get("/putt-results", async (request, response) => {
  if (!connection) {
    connection = await createConnection();
  }
  const allPuttResults = await queryAllPuttResults(connection);
  response.end(JSON.stringify(allPuttResults));
});

// Creates a new row to the db to puttResult table
app.post("/mark-putt", async (request, response) => {
  if (!connection) {
    connection = await createConnection();
  }
  const puttData: newPuttInsert | undefined = request.body;
  if (puttData) {
    console.log(
      "Inserting a new row into puttResult table: " + JSON.stringify(puttData)
    );
    const insertResult = await insertNewPuttResult(connection, puttData);
    response.end(JSON.stringify(insertResult));
  } else {
    response.end("Error marking a putt: No putt data in the request body");
  }
});

app.listen(port, () => {
  console.log("Putt stats API app listening at http://%s:%s", hostname, port);
});
