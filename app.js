require("dotenv").config();

const siteVisitRoutes = require("./routes/siteVisitRoutes");
const contactFormRoutes = require("./routes/contactFormRoutes");

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());

// app.use(cors({
//   origin: [
//     "http://localhost:8087",
//     "http://localhost",
//     "https://byteware.co.tz"
//   ]
// }));

app.use(express.json());

const db = require("./models");

db.sequelize
    .authenticate()
    .then(() => {
        console.log("PostgreSQL Connected");
    })
    .catch(err => {
        console.log(err);
    });

db.sequelize.sync();

const { SiteVisit } = require("./models");

app.use(async (req, res, next) => {

    try {
        console.error('THE MIMI INC')
        await SiteVisit.create({

            page_url: req.originalUrl,
            ip_address: req.ip,
            user_agent: req.headers["user-agent"],
            referrer: req.headers.referer || null

        });

    } catch (err) {

        console.error(err);

    }

    next();

});

app.use("/api/site-visits", siteVisitRoutes);
app.use("/api/contact-forms", contactFormRoutes);

const PORT = process.env.PORT || 8087;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});