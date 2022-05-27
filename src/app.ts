import {
  createConnection,
  insertNewPuttResult,
  queryAllPuttResults,
  undoLastPutt,
} from "./database";
import cors from "cors";
import express from "express";
import { Connection } from "promise-mysql";
import { newPuttInsert } from "./types";
const app = express();
app.use(express.json()); // For reading request bodies as json

// --- CORS ---
var allowedOrigins = [
  "http://localhost:3000",
  "https://putt-stats-react.ey.r.appspot.com",
];
app.use(
  cors({
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    origin: function (origin, callback) {
      if (allowedOrigins.indexOf(origin) === -1) {
        const errorMessage =
          "The CORS policy for this site does not " +
          "allow access from the specified Origin.";
        return callback(new Error(errorMessage), false);
      }
      return callback(null, true);
    },
  })
);

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
  console.log("Putt stats API app listening at http://%s:%s", hostname, port);
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
