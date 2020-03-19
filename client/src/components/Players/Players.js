import React from "react";

import onlineIcon from "../../icons/onlineIcon.png";

import "./Players.css";

const Players = ({ players, gameState }) => (
  <div className="textContainer">
    {players ? (
      <div>
        <h1>Players:</h1>
        <div className="activeContainer">
          <h2>
            {players.map(({ name, id }) => (
              <div
                key={name}
                className={
                  id === gameState.currentKingID ? "curKing" : "activeContainer"
                }
              >
                {name}
                <img alt="Online Icon" src={onlineIcon} />
                <div>
                  {gameState.voted &&
                  gameState.voted.filter(player => player.name === name).length
                    ? "Ready"
                    : ""}
                </div>
              </div>
            ))}
          </h2>
        </div>
      </div>
    ) : null}
  </div>
);

export default Players;
