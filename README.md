# API for disc golf putt data stored in GCP Cloud SQL MySQL database

First install dependencies with `npm i`

Create a .env file to the root using "example of .env file" as an example. Make sure it has correct values. At least the database password needs to be set.

Build and run the API with `npm run serve`

If a database connection can't be formed, check that the server's network is in authorized networks in GCP.
