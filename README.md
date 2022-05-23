# API for disc golf putt data stored in GCP Cloud SQL MySQL database

First install dependencies with `npm i`

Create a .env file to the root using "example of .env file" as an example. Make sure it has correct values. At least the database password needs to be set.

Build and run the API with `npm run serve`

If a database connection can't be formed, check that the server's network is in authorized networks in GCP.

# Deployment to GCP

First you need to have GCP SDK installed.
Run `npm run deploy`. That will copy the files from /dist to the root folder and rename app.js to server.js and then run gcloud app deploy.
The command `deploy` should work on Windows and probably won't work on other operating systems.
