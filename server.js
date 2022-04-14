var express = require("express");
var app = express();
var path = require("path");
var public = path.join(__dirname, ".");
const port = process.env.PORT || 3000; // <== You can change the port

// viewed at http://localhost:8080
app.get("/", function (req, res) {
  res.sendFile(path.join(public, "index.html"));
});

app.use("/", express.static(public));

app.listen(port);
