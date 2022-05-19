import mysql, { Connection } from "promise-mysql";
import dotenv from "dotenv";
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

export const queryAllPuttResults = async (connection: Connection) => {
  console.log("Querying for all putt results.");

  if (connection) {
    const query =
      "select p.*, u.name from puttResult p left join user u on p.userId = u.userId;";

    const puttResults: Array<any> = await connection.query(query);
    console.log(
      "All putt results queried successfully. Rows returned: " +
        puttResults.length
    );
    return puttResults;
  } else {
    console.log("Cannot query database. No database connection.");
    return [];
  }
};
