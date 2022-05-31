import {
  createConnection,
  insertNewPuttResult,
  queryAllPuttResults,
  undoLastPutt,
} from "./database";
import express, { NextFunction, Request, Response } from "express";
import { Connection } from "promise-mysql";
import { newPuttInsert } from "./types";
import dotenv from "dotenv";
import { checkHeaders, getUserIdFromPath } from "./utilities";

dotenv.config();
const app = express();
app.use(express.json()); // For reading request bodies as json

// --- CORS ---
app.use(function (request: Request, response: Response, next: NextFunction) {
  response.setHeader(
    "Access-Control-Allow-Origin",
    process.env.CORS_ALLOWED_ORIGIN
  );
  response.setHeader(
    "Access-Control-Allow-Methods",
    "GET, PUT, POST, DELETE, PATCH, OPTIONS"
  );
  response.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Content-Length, X-Requested-With, throwdata"
  );
  // allow preflight
  if (request.method === "OPTIONS") {
    response.sendStatus(200);
  } else {
    next();
  }
});

const port = 8081;
const hostname = "127.0.0.1";

// --- Endpoints ---
let connection: Connection | undefined = undefined;

// Returns all putt results for a user
app.get(
  "/putt-results/:userId",
  async (request: Request, response: Response) => {
    if (checkHeaders(request)) {
      if (!connection) {
        connection = await createConnection();
      }
      const userId = getUserIdFromPath(request);
      const allPuttResults = await queryAllPuttResults(connection, userId);
      response.end(JSON.stringify(allPuttResults));
    }
    response.status(401);
    response.end();
  }
);

// Creates a new row to the db to puttResult table
app.post("/mark-putt", async (request: Request, response: Response) => {
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
  }
  response.status(401);
  response.end();
});

// Undo the last putt result that is not undone for a user. Returns the undone putt or true, if no there is no putt to to undo.
app.patch(
  "/undo-putt/:userId",
  async (request: Request, response: Response) => {
    if (checkHeaders(request)) {
      if (!connection) {
        connection = await createConnection();
      }
      const userId = getUserIdFromPath(request);
      const undoResult = await undoLastPutt(connection, userId);
      response.end(JSON.stringify(undoResult));
    }
    response.status(401);
    response.end();
  }
);

app.listen(port, () => {
  console.log(
    "Putt stats API app listening at http://%s:%s . Allowing API calls from %s (%s)",
    hostname,
    port,
    process.env.CORS_ALLOWED_ORIGIN,
    process.env.NODE_ENV
  );
});
