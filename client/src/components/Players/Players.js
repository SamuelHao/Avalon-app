import React from "react";
import Button from '@material-ui/core/Button';

import crown from "../../icons/crown.png";

import "./Players.css";

const Players = ({ players, gameState, isKing, addPlayerToMission, proposeMission }) => (
  <div className="textContainer">
    {players ? (
      <div>
        <h1>Players:</h1>
        <div className="activeContainer">
          <h2>
            {players.map(({ name, id }) => (
              <div
                key={name}
                className={gameState.proposedPlayers && gameState.proposedPlayers.includes(name) ? "proposedPlayer" : "activeContainer"}
              >
                <div>
                  <Button disabled={!isKing || gameState.proposingMission || gameState.activeMission} variant="contained" color="primary" size="small" onClick={() => addPlayerToMission(name)}>Add</Button>
                </div>
                {name}
                {name === gameState.currentKing && <img alt="Crown Icon" src= {crown} /> }
                <div>
                  {gameState.voted &&
                  gameState.voted.filter(player => player.name === name).length
                    ? "Ready"
                    : ""}
                </div>
              </div>
            ))}
            <Button disabled={!isKing || gameState.proposingMission || gameState.activeMission || gameState.proposedPlayers.length !== gameState.playersPerMission[gameState.currentMission]} variant="contained" color="primary" size="small" onClick={proposeMission}>Propose Mission</Button>
          </h2>
        </div>
      </div>
    ) : null}
  </div>
);

export default Players;
