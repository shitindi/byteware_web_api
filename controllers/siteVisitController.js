// controllers/siteVisitController.js
const { logData } = require('../helpers/logger');

const { SiteVisit } = require("../models");

exports.createVisit = async (req, res) => {
  try { 
    const visit = await SiteVisit.create({
      page_url: req.body.page_url,
      ip_address: req.ip,
      user_agent: req.headers["user-agent"],
      referrer: req.headers.referer || req.headers.referrer,
    });

    res.status(201).json(visit);
  } catch (error) {
    logData('createVisit: ' + error)
    res.status(500).json({ message: error.message });
  }
};

exports.getVisits = async (req, res) => {
  try {
    const visits = await SiteVisit.findAll({
      order: [["visited_at", "DESC"]],
    });

    res.json(visits);
  } catch (error) {
     logData('getVisits: ' + error)
    res.status(500).json({ message: error.message });
  }
};

exports.getVisitById = async (req, res) => {
  try {
    const visit = await SiteVisit.findByPk(req.params.id);

    if (!visit) {
      return res.status(404).json({ message: "Visit not found" });
    }

    res.json(visit);
  } catch (error) {
     logData('getVisitById: ' + error)
    res.status(500).json({ message: error.message });
  }
};

exports.deleteVisit = async (req, res) => {
  try {
    const deleted = await SiteVisit.destroy({
      where: { id: req.params.id },
    });

    if (!deleted) {
      return res.status(404).json({ message: "Visit not found" });
    }

    res.json({ message: "Visit deleted successfully" });
  } catch (error) {
    logData('deleteVisit: ' + error)
    res.status(500).json({ message: error.message });
  }
};

exports.getVisitCount = async (req, res) => {
  try {
    const total = await SiteVisit.count();

    res.json({ total_visits: total });
  } catch (error) {
        logData('getVisitCount: ' + error)
    res.status(500).json({ message: error.message });
  }
};