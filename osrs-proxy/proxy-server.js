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

app.get("/api/item/:itemName", async (req, res) => {
  console.log(req)
  try {
    const { itemName } = req.params;
    console.log(itemName)
    const data = await fs.promises.readFile("./items.json", "utf-8");
    console.log("1");
    const parsedData=JSON.parse(data);
    const item = parsedData.find((item) => item.name === itemName);
    console.log(item);
    if (item) {

      const highLow = await axios.get(`https://prices.runescape.wiki/api/v1/osrs/latest?id=${item.id}`);
      const timeSeries = await axios.get(`https://prices.runescape.wiki/api/v1/osrs/timeseries?timestep=24h&id=${item.id}`);

      if (highLow.status !== 200 || timeSeries.status !== 200) {
        res.status(500).send(`Error 1: ${highLow.statusText || timeSeries.statusText}`);
        return;
      } console.log(" \n\n", {timeSeries});
      const response={highLow:highLow.data.data[item.id], timeSeries:timeSeries.data.data};

      res.json(response);
    } else {
      res.status(204).send(`Item not found: ${error.message}`);
    }
    
  } catch (error)  {
    console.log(error);
    res.status(500).send(`Error 2: ${error.message}`);
  }
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`OSRS proxy server is running on port ${PORT}`);
});


const triumphs = {
  "triumph1":{name: "Renegade Raider", description:"Achieve 50 KC in all 3 raids (CoX, ToB, ToA)", icon:"olm.png"},
  "triumph2":{name:"Midgame Milestone" , decscription:"Achieve a total level of 1750" , icon:"olm.png"},
  "triumph3":{name:"Big Damage", description:"Achieve level 99 in both the Attack and Strength skills", icon:"/images/BigDamage.png"},
}

const users={
  "user1":{username:"Wuglington", triumphs: ["triumph3"]},
  "user2":{username:"CalvTheGreat", triumphs:[]}
};


app.get('/users/:username/triumphs', (req, res)=>{
  const {username} = req.params;
  const user=users[username];
  if (user){
      const userTriumphs=user.triumphs.map(triumphId=>triumphs[triumphId]);
      res.json(userTriumphs);
      console.log(userTriumphs)
  } else {
      res.status(404).send('User not found.');
  }
});


app.post('/users/:username/triumphs', (req, res)=>{
  const username=req.params.username;
  const triumphId=req.body.triumphId;
  const user=users[username];
  if (user && triumphs[triumphId]){
      user.triumphs.push(triumphId);
      res.send('Triumph added.');

  } else {
      res.status(404).send("Invalid username or Triumph Id")
  }
});

// app.listen(3001, () => console.log('Server listeninig on port 3001'));



