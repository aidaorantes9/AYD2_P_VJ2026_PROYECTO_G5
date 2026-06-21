const express = require("express");
const app = express();

app.use(express.json());

const metricasRoutes = require("./routes/metricas.routes");

app.use("/api", metricasRoutes);

app.listen(3000, () => {
  console.log("API corriendo en http://localhost:3000");
});