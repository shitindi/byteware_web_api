// models/SiteVisit.js
module.exports = (sequelize, DataTypes) => {
  const SiteVisit = sequelize.define(
    "SiteVisit",
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      page_url: DataTypes.TEXT,
      ip_address: DataTypes.STRING(45),
      user_agent: DataTypes.TEXT,
      referrer: DataTypes.TEXT,
      visited_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      tableName: "site_visits",
      timestamps: false,
    }
  );

  return SiteVisit;
};