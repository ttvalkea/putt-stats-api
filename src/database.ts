import mysql, { Connection } from "promise-mysql";
import dotenv from "dotenv";
import { apiPuttResult, dbPuttResult, newPuttInsert } from "./types";
dotenv.config();
import http from "http";
let retriedToConnectAmount = 0;
export const createConnection = async (): Promise<Connection> => {
  const maximumRetryConnectionCreationAttempts = 3;

  console.log("Creating database connection.");
  try {
    const connectionParameters = {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    };

    http.get({ host: "api.ipify.org", port: 80, path: "/" }, function (resp) {
      resp.on("data", function (ip) {
        // This is here because the network where the API is running needs to be authorized from Cloud SQL
        console.log("My public IP address is: " + ip);
      });
    });
    const connection = await mysql.createConnection(connectionParameters);

    console.log("Database connection created successfully.");
    retriedToConnectAmount = 0; // This is useless/doesn't do anything?
    return connection;
  } catch (exception) {
    retriedToConnectAmount++;
    if (retriedToConnectAmount <= maximumRetryConnectionCreationAttempts) {
      console.log(
        `Trying again to form a database connection. Attempt number ${
          retriedToConnectAmount + 1
        }.`
      );
      return await createConnection();
    } else {
      console.log(
        `Couldn't connect to database after ${retriedToConnectAmount} retries.`
      );
      console.log(exception);

      return null;
    }
  }
};

export const queryAllPuttResults = async (
  connection: Connection
): Promise<apiPuttResult[]> => {
  console.log("Querying for all putt results.");

  if (connection) {
    try {
      const query =
        "select p.*, u.name from puttResult p left join user u on p.userId = u.userId;";

      const puttResults: dbPuttResult[] = await connection.query(query);
      console.log(
        "All putt results queried successfully. Rows returned: " +
          puttResults.length
      );
      return puttResults.map((dbPuttResult: dbPuttResult) =>
        mapDbPuttResultToApiPuttResult(dbPuttResult)
      );
    } catch (error) {
      console.log("Error querying the database for all putt results:");
      console.log(error);
      return [];
    }
  } else {
    console.log("Cannot query database. No database connection.");
    return [];
  }
};

const mapDbPuttResultToApiPuttResult = (
  dbPuttResult: dbPuttResult
): apiPuttResult =>
  ({
    distance: dbPuttResult.distance,
    isMade: !!dbPuttResult.isMade,
    isUndone: !!dbPuttResult.isUndone,
    name: dbPuttResult.name,
    puttResultId: dbPuttResult.puttResultId,
    puttTimestamp: dbPuttResult.puttTimestamp,
    userId: dbPuttResult.userId,
  } as apiPuttResult);

export const insertNewPuttResult = async (
  connection: Connection,
  puttData: newPuttInsert
): Promise<boolean> => {
  console.log("Inserting a new putt result");

  if (connection) {
    try {
      const query = `INSERT INTO puttResult (userId, distance, isMade, isUndone, puttTimestamp) values (${puttData.userId}, ${puttData.distance}, ${puttData.isMade}, 0, CURRENT_TIMESTAMP());`;
      await connection.query(query);
      console.log("Putt result inserted: " + JSON.stringify(puttData));
      return true;
    } catch (error) {
      console.log("Error inserting a putt result:");
      console.log(error);
      return false;
    }
  } else {
    console.log("Cannot insert to database. No database connection.");
    return false;
  }
};

// Marks the last putt with isUndone = 0 to have isUndone = 1
export const undoLastPutt = async (
  connection: Connection
): Promise<apiPuttResult | boolean> => {
  console.log("Undoing last putt.");

  if (connection) {
    try {
      // Select the row first for returning
      const selectQuery =
        "select p.*, u.name from puttResult p left join user u on p.userId = u.userId WHERE p.isUndone=0 ORDER BY puttResultId DESC LIMIT 1;";
      const rowToUndo: dbPuttResult[] = await connection.query(selectQuery);

      // Undoing operation
      const undoQuery =
        "UPDATE puttResult SET isUndone=1 WHERE isUndone=0 ORDER BY puttResultId DESC LIMIT 1;";
      const undoResult: any = await connection.query(undoQuery);
      if (undoResult?.changedRows === 1) {
        // Return the undone row's data if undo is successful
        return rowToUndo.map((dbPuttResult: dbPuttResult) =>
          mapDbPuttResultToApiPuttResult(dbPuttResult)
        )[0];
      } else if (undoResult?.changedRows === 0) {
        return true; // No errors, but also no rows to undo.
      }
    } catch (error) {
      console.log("Error undoing the last putt result:");
      console.log(error);
      return false;
    }
  } else {
    console.log("Cannot undo last putt result. No database connection.");
    return false;
  }
};
