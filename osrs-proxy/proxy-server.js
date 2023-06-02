/** @format */

import express from "express";
import axios from "axios";
import cors from "cors";
import fs from "fs";

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

axios.get(OSRS_GE_BASE_URL)
  .then((response) => {
    fs.writeFile("items.json", JSON.stringify(response.data), (err) => {
      if (err) {
        console.error("Error writing file:", err);
      } else {
        console.log("File written successfully.");
      }
    });
  })
  .catch((error) => {
    console.error("Error fetching data:", error);
  });

app.get("/api/items", async (req, res) => {
  try {
    const data = await fs.promises.readFile("./items.json", "utf-8");
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).send(`Error reading item data: ${error.message}`);
  }
});

app.get("/api/items/:itemId", async (req, res) => {
  try {
    const { itemId } = req.params;
    const response = await axios.get(`https://prices.runescape.wiki/api/v1/osrs/latest?id=${itemId}`);
    
    if (response.status !== 200) {
      res.status(response.status).send(`Error fetching item data: ${response.statusText}`);
      return;
    }

    res.json(response.data);
  } catch (error) {
    res.status(500).send(`Error fetching item data: ${error.message}`);
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`OSRS proxy server is running on port ${PORT}`);
});
