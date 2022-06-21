# API for disc golf putt data stored in GCP Cloud SQL MySQL database

### Running the app using Docker

Run `docker-compose up --build`

The API will be exposed in http://localhost:8081

### Running the app without using Docker

First install dependencies with `npm i`

Create a .env file to the root using "example of .env file" as an example. Make sure it has correct values. At least the database password needs to be set.

Build and run the API with `npm run serve`

If a database connection can't be formed, check that the server's network is in authorized networks in GCP.

# Deployment to GCP

First you need to have GCP SDK installed.
Run `npm run deploy`. That will copy the files from /dist to the root folder and rename app.js to server.js and then run gcloud app deploy.
Before deploying, make sure .env file has the correct CORS allowed origin (CORS_ALLOWED_ORIGIN = https://url-for-deployed-frontend.com).
The command `deploy` should work on Windows and probably won't work on other operating systems.
