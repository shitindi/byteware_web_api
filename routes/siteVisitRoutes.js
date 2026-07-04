// routes/siteVisitRoutes.js
const express = require("express");
const router = express.Router();
const siteVisitController = require("../controllers/siteVisitController");

router.post("/", siteVisitController.createVisit);
router.get("/", siteVisitController.getVisits);
router.get("/count", siteVisitController.getVisitCount);
router.get("/:id", siteVisitController.getVisitById);
router.delete("/:id", siteVisitController.deleteVisit);

module.exports = router;