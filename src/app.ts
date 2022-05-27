import {
  createConnection,
  insertNewPuttResult,
  queryAllPuttResults,
  undoLastPutt,
} from "./database";
import express from "express";
import { Connection } from "promise-mysql";
import { newPuttInsert } from "./types";
import dotenv from "dotenv";
dotenv.config();
const app = express();
app.use(express.json()); // For reading request bodies as json

// --- CORS ---
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", process.env.CORS_ALLOWED_ORIGIN);
  res.header(
    "Access-Control-Allow-Methods",
    "GET,PUT,POST,DELETE,PATCH,OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Content-Length, X-Requested-With"
  );
  // allow preflight
  if (req.method === "OPTIONS") {
    res.send(200);
  } else {
    next();
  }
});

const port = 8081;
const hostname = "127.0.0.1";

// --- Endpoints ---
let connection: Connection | undefined = undefined;

// Returns all putt results
app.get("/putt-results", async (request, response) => {
  if (checkHeaders(request)) {
    if (!connection) {
      connection = await createConnection();
    }
    const allPuttResults = await queryAllPuttResults(connection);
    response.end(JSON.stringify(allPuttResults));
  }
  response.status(401);
  response.end();
});

// Creates a new row to the db to puttResult table
app.post("/mark-putt", async (request, response) => {
  if (checkHeaders(request)) {
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
    response.status(401);
    response.end();
  }
});

// Undo the last putt result that is not undone. Returns the undone putt or true, if no there is no putt to to undo.
app.put("/undo-putt", async (request, response) => {
  if (checkHeaders(request)) {
    if (!connection) {
      connection = await createConnection();
    }
    const undoResult = await undoLastPutt(connection);
    response.end(JSON.stringify(undoResult));
  }
  response.status(401);
  response.end();
});

app.listen(port, () => {
  console.log(
    "Putt stats API app listening at http://%s:%s . Allowing API calls from %s (%s)",
    hostname,
    port,
    process.env.CORS_ALLOWED_ORIGIN,
    process.env.NODE_ENV
  );
});

// Need certain headers for all requests. This is done as a very low level security measure to prevent unwanted SQL calls to GCP.
const checkHeaders = (request: any): boolean => {
  const throwDataHeaderValue = request?.headers?.throwdata;
  if (!throwDataHeaderValue) {
    console.log("No required header");
    return false;
  }
  return true;
};
