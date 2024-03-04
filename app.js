const express = require("express");
const morgan = require("morgan");
const createError = require("http-errors");
const mainRoute = require("./Routes/Main-route");
const authRoute = require("./Routes/Auth-route");
const cors = require("cors");
const fs = require("fs");
const { google } = require("googleapis");   
require("dotenv").config();   
const { verifyAccessToken } = require("./Helpers/jwt_helper");

const port = process.env.PORT || 3050;

const app = express();

const corsOptions = {
  origin: "http://localhost:3000",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(morgan("dev"));
app.use(express.json());
app.use(cors(corsOptions));

app.use("/auth", authRoute);
// app.use('/', verifyAccessToken, mainRoute)
app.use('/', mainRoute)
app.use('/api', (req, res) => {
  res.send('Hello World')
})

app.get("/google/redirect", async (req, res) => {
  const { code } = req.query;
  res.send(code)
})

app.use(async (req, res, next) => {
  next(createError.NotFound(`This route does not exist`));
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    error: {
      status: err.status || 500,
      message: err.message,
    },
  });
});

app.listen(port, async () => {
  console.log(`Server listening on ${port}`);
});
