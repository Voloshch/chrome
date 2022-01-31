const express = require("express");
const path = require("path");
const app = express();
const port = process.env.PORT || 8081;
 
// serve static files built by React
app.use(express.static(path.join(__dirname, "../dist")));
 
app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname, "../dist", "remoteEntry.js"));
});
 
app.listen(port, () => {
  console.log('Server started on: ' + port);
});
