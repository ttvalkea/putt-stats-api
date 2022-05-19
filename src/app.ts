import { createConnection, queryAllPuttResults } from "./database";
import cors from "cors";
import express from "express";
import { Connection } from "promise-mysql";
import bodyParser from "body-parser";
const router = express.Router();
const app = express();

// --- CORS ---
app.use(cors());
const port = 8081;
const hostname = "127.0.0.1";

//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

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

// TODO: Creates a new row to the db to puttResult table
router.post("/mark-putt", (request, response) => {
  var requestBody = request.body;
  console.log(requestBody);
  response.end("yes");
});

app.listen(port, () => {
  console.log("Putt stats API app listening at http://%s:%s", hostname, port);
});
