/** @format */

import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
app.use(cors());

const OSRS_BASE_URL =
  "https://secure.runescape.com/m=hiscore_oldschool/index_lite.ws";

const OSRS_GE_BASE_URL = "https://prices.runescape.wiki/api/v1/osrs/mapping";
app.get("/api/playerStats/:playerName", async (req, res) => {
  try {
    const { playerName } = req.params;
    const response = await axios.get(
      `${OSRS_BASE_URL}?player=${encodeURIComponent(playerName)}`
    );

    res.send(response.data);
  } catch (error) {
    res.status(500).send(`Error fetching player data: ${error.message}`);
  }
});

app.get("/api/item/:itemId", async (req, res) => {
  try {
    const { itemId } = req.params;
    const response = await axios.get(
      `${OSRS_GE_BASE_URL}?item=${encodeURIComponent(itemId)}`
    );
    res.send(response.data);
  } catch (error) {
    res.status(500).send("Error fetching item data: ${error.message}");
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`OSRS proxy server is running on port ${PORT}`);
});
