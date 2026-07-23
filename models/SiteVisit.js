const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const SiteVisit = sequelize.define(
  "SiteVisit",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },

    page_url: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },

    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    referrer: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    country: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    country_code: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },

    region: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },

    city: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },

    latitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
    },

    longitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
    },

    timezone: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    isp: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    organization: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    asn: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },

    browser: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    browser_version: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },

    operating_system: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    os_version: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },

    device_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },

    device_vendor: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    device_model: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    is_mobile: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    is_tablet: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    is_desktop: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    visited_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "site_visits",
    timestamps: false,
  }
);

module.exports = SiteVisit;