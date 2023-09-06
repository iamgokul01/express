const path = require("path");
const express = require("express");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
let dbPath = path.join(__dirname, "./cricketTeam.db");

let db = null;

const initDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("The server has started successfully");
    });
  } catch (error) {
    console.log(error.message());
  }
};

initDBAndServer();

app.get("/players/", async (request, response) => {
  let fetchPlayers = `select * from cricket_team`;
  let dbResponse = await db.all(fetchPlayers);
  let resultObj = [];
  for (let obj of dbResponse) {
    let camelObj = {
      playerId: obj.player_id,
      playerName: obj.player_name,
      jerseyNumber: obj.jersey_number,
      role: obj.role,
    };
    resultObj.push(camelObj);
  }
  console.log(resultObj);
  response.send(resultObj);
});

app.post("/players/", async (request, response) => {
  const playerData = request.body;

  let { playerName, jerseyNumber, role } = playerData;
  console.log(playerData);
  const addPlayerQuery = `
  insert into cricket_team (player_name,jersey_number,role)
  values(
      '${playerName}',${jerseyNumber},'${role}'
  );`;
  const dbResponse = await db.run(addPlayerQuery);
  const bookId = dbResponse.lastId;

  response.send("Player Added to Team");
});

app.get("/players/:playerId", async (request, response) => {
  let { playerId } = request.params;
  const fetchPlayer = `
  select * from cricket_team where player_id = ${playerId};`;
  let dbResponse = await db.get(fetchPlayer);
  let result = {
    playerId: dbResponse.player_id,
    playerName: dbResponse.player_name,
    jerseyNumber: dbResponse.jersey_number,
    role: dbResponse.role,
  };
  response.send(result);
  console.log(result);
});

app.put("/players/:playerId", async (request, response) => {
  let { playerId } = request.params;
  let playerDetails = request.body;
  let { playerName, jerseyNumber, role } = playerDetails;

  const updatePlayer = `
  update cricket_team
  set player_name = '${playerName}',
  jersey_number = ${jerseyNumber},
  role = '${role}'
  where player_id = ${playerId};`;
  let dbResponse = await db.run(updatePlayer);
  response.send("Player Details Updated");
  console.log(dbResponse);
});

app.delete("/players/:playerId", async (request, response) => {
  let { playerId } = request.params;
  let deletePlayerQuery = `
    delete from cricket_team where player_id = ${playerId};
    `;

  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = express;
