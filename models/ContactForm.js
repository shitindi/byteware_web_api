// models/ContactForm.js
module.exports = (sequelize, DataTypes) => {
  const ContactForm = sequelize.define(
    "ContactForm",
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      contact_name: { type: DataTypes.STRING(150), allowNull: false },
      company: DataTypes.STRING(150),
      email: { type: DataTypes.STRING(150), allowNull: false },
      phone_no: DataTypes.STRING(50),
      message: { type: DataTypes.TEXT, allowNull: false },
      status: { type: DataTypes.STRING(30), defaultValue: "New" },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      tableName: "contact_forms",
      timestamps: false,
    }
  );

  return ContactForm;
};