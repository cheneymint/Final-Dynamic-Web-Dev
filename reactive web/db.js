const express = require("express");
const logger = require("morgan");
const path = require("path");
const fetch = require("node-fetch");

const basicAuth = require("express-basic-auth");
const mongoose = require("mongoose");
const app = express();

const config = require("./config");

mongoose.connect(config.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger("dev"));
app.use(express.static(path.resolve(__dirname, "public")));

const challengeAuth = basicAuth({
  authorizer: myAuthorizer,
  challenge: true,
  unauthorizedResponse: getUnauthorizedResponse,
});

function myAuthorizer(username, password) {
  return username == config.USERNAME && password == config.PASSWORD;
}

function getUnauthorizedResponse(req) {
  return "not authorized";
}

app.get("/", challengeAuth, (req, res) => {
  res.sendFile("index.html");
});

app.get("/api/search", challengeAuth, async (req, res) => {
  const query = req.query.q;
  const accessKey = config.UNSPLASH_ACCESS_KEY;
  const apiUrl = `https://api.unsplash.com/search/photos?client_id=${rzfxeaiR7cbvj3rtrmDDI38Vp6c_KFiebl_T0T6PGQo}&query=${query}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Error fetching images" });
  }
});

app.use((req, res) => {
  res.status(404).send("404 - either not authorized or no route");
});

app.listen(config.PORT, () => {
  console.log(`see the magic at http://localhost:${config.PORT}`);
});
