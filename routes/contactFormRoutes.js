// routes/contactFormRoutes.js
const express = require("express");
const router = express.Router();
const contactFormController = require("../controllers/contactFormController");

router.post("/", contactFormController.createContact);
router.get("/", contactFormController.getContacts);
router.get("/:id", contactFormController.getContactById);
router.put("/:id", contactFormController.updateContact);
router.delete("/:id", contactFormController.deleteContact);

module.exports = router;