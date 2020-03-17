import React from "react";

import onlineIcon from "../../icons/onlineIcon.png";

import "./Players.css";

const Players = ({ players }) => (
  <div className="textContainer">
    {players ? (
      <div>
        <h1>Players:</h1>
        <div className="activeContainer">
          <h2>
            {players.map(({ name }) => (
              <div key={name} className="activeItem">
                {name}
                <img alt="Online Icon" src={onlineIcon} />
              </div>
            ))}
          </h2>
        </div>
      </div>
    ) : null}
  </div>
);

export default Players;
