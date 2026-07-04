// controllers/contactFormController.js
const { ContactForm } = require("../models");

exports.createContact = async (req, res) => {
  try {

    const contact = await ContactForm.create({
      contact_name: req.body.contact_name,
      company: req.body.company,
      email: req.body.email,
      phone_no: req.body.phone_no,
      message: req.body.message,
    });

    res.status(201).json(contact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getContacts = async (req, res) => {
  try {
    const contacts = await ContactForm.findAll({
      order: [["created_at", "DESC"]],
    });

    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getContactById = async (req, res) => {
  try {
    const contact = await ContactForm.findByPk(req.params.id);

    if (!contact) {
      return res.status(404).json({ message: "Contact form not found" });
    }

    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateContact = async (req, res) => {
  try {
    const contact = await ContactForm.findByPk(req.params.id);

    if (!contact) {
      return res.status(404).json({ message: "Contact form not found" });
    }

    await contact.update({
      contact_name: req.body.contact_name,
      company: req.body.company,
      email: req.body.email,
      phone_no: req.body.phone_no,
      message: req.body.message,
      status: req.body.status,
    });

    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteContact = async (req, res) => {
  try {
    const deleted = await ContactForm.destroy({
      where: { id: req.params.id },
    });

    if (!deleted) {
      return res.status(404).json({ message: "Contact form not found" });
    }

    res.json({ message: "Contact form deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};