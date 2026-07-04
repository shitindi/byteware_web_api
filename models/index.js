const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const db = {};

db.Sequelize = require("sequelize");
db.sequelize = sequelize;

db.SiteVisit = require("./SiteVisit")(sequelize, DataTypes);
db.ContactForm = require("./ContactForm")(sequelize, DataTypes);

module.exports = db;