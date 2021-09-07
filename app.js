const express = require("express");
require("dotenv").config({
  path: ".env",
});
const cookieParser = require("cookie-parser");
const router = require("./api/routes/index.routes");
const errorHandler = require("./api/middlewares/error/errorHandler");
const routeNotFound = require("./api/middlewares/error/404");
const helmet = require("helmet");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

app.use(express.static("public"));
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(helmet());

app.use("/api/v1", router);

app.use(errorHandler);
app.use(routeNotFound);

app.get("/", (req, res) => res.send("Hello World!"));
app.listen(port, () => console.log(`Printer Tracker Running on Port ${port}`));
