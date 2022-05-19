import mysql, { Connection } from "promise-mysql";
import dotenv from "dotenv";
import { apiPuttResult, dbPuttResult, newPuttInsert } from "./types";
dotenv.config();

let retriedToConnectAmount = 0;
export const createConnection = async (): Promise<Connection> => {
  const maximumRetryConnectionCreationAttempts = 10;

  console.log("Creating database connection.");

  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    });
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
    const query =
      "select p.*, u.name from puttResult p left join user u on p.userId = u.userId;";

    const puttResults: dbPuttResult[] = await connection.query(query);
    console.log(
      "All putt results queried successfully. Rows returned: " +
        puttResults.length
    );
    return puttResults.map(
      (pr: dbPuttResult) =>
        ({
          distance: pr.distance,
          isMade: !!pr.isMade,
          isUndone: !!pr.isUndone,
          name: pr.name,
          puttResultId: pr.puttResultId,
          puttTimestamp: pr.puttTimestamp,
          userId: pr.userId,
        } as apiPuttResult)
    );
  } else {
    console.log("Cannot query database. No database connection.");
    return [];
  }
};

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
