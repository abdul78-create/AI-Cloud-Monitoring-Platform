const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const { errorHandler } = require("./middleware/errorHandler");
const { port } = require("./config/env");

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "5mb" }));

app.get("/", (req, res) => {
  res.json({ message: "AI Cloud Monitoring Backend API is running." });
});

app.use("/api", routes);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});
