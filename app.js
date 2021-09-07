const express = require("express");
require("dotenv").config({
    path: ".env",
});
const cookieParser = require("cookie-parser");
const router = require("./api/routes/index.routes");
const app = express();
const port = process.env.PORT || 8080;

app.use(express.static("public"));
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1", router);

app.get("/", (req, res) => res.send("Hello World!"));
app.listen(port, () => console.log(`Printer Tracker Running on Port ${port}`));