const express = require("express");
const router = express.Router();

const controller = require("../controllers/metricas.controller");

router.get("/metricas", controller.getMetricas);

module.exports = router;