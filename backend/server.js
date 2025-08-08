require("dotenv").config({path: "../../priv/.env"});
const express = require('express');
const cors = require('cors');
const session = require("express-session");

const corsOptions = {
    origin: ["http://127.0.0.1:5173"],
    credentials: true
  };

const app = express();
app.use(cors(corsOptions));
app.use(express.json());

//session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // set to true only if using HTTPS
    sameSite: 'lax' // or 'none' if using cross-site on HTTPS
  }
}));

const youtubeRoute = require("./routes/Youtube");
app.use("/youtube", youtubeRoute);

const spotifyRoute = require("./routes/Spotify");
app.use("/spotify", spotifyRoute);

//get name of current service signed into
app.get("/current-service", (req,res) => {
  if (!req.session.currentService) {
    return res.json({service: "none"})
  }
  return res.json({service: req.session.currentService})
})

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));