const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const port = 8080;
const path = require('path')
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const { connection } = require("./connector");
const cors = require('cors')
app.use(cors())
app.post('/api/booking', async (req, res) => {
  try {
    const { movie, slot, seats } = req.body;

    const newBooking = new connection({
      movie,
      slot,
      seats,
    });

    await newBooking.save();
    res.status(200).json({ message: "Booking successful", data: newBooking });
  } catch (err) {
    console.error("Booking Error:", err);
    res.status(500).json({ error: "Booking failed", message: err.message });
  }
});
app.get('/api/booking', async (req, res) => {
    try {
        const myData = await connection.find().sort({ _id: -1 }).limit(1);
        if (myData.length === 0) {
            res.status(200).json({ message: "No previous booking found" });
        } else {
            res.status(200).json(myData[0]);
        }
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch booking", message: err.message });
    }
});


app.listen(port, () => console.log(`App listening on port ${port}!`));

module.exports = app;   