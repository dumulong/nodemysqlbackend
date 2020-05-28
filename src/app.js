const express = require("express");
const logger = require('morgan')
const rfs = require("rotating-file-stream");
const path = require('path')


if (!process.env.DB_HOST) {
  console.log("You are missing the environment variable (DB_HOST)");
  process.exit(1);
}

if (!process.env.DB_USER) {
  console.log("You are missing the environment variable (DB_USER)");
  process.exit(1);
}

if (!process.env.DB_PASSWORD) {
  console.log("You are missing the environment variable (DB_PASSWORD)");
  process.exit(1);
}

if (!process.env.DB_DATABASE) {
  console.log("You are missing the environment variable (DB_DATABASE)");
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.log("You are missing the environment variable for the JWT secret (JWT_SECRET)");
  process.exit(1);
}

// create a write stream (in append mode)
const accessLogStream = rfs.createStream('access.log', {
  interval: '1d', // rotate daily
  path: path.join(__dirname, 'log')
})

const userRouter = require("./routers/user");

const app = express();

// Add the log to a rotating file
app.use(logger('common', { stream: accessLogStream }))

// And, also, Log in the console
if (process.env.ENV === 'dev') {
  app.use(logger('dev'));
}
app.use(express.json());

app.use(userRouter);

module.exports = app;
