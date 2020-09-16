import React from "react";
import Button from '@material-ui/core/Button';
import Circle from "../Circle/Circle";

const GameState = ({ gameStart, gameState }) => (
  <div>
    <div style={{display: "flex"}}>
      {gameState.playersPerMission && gameState.playersPerMission.map((numPlayers, index) => {
        let colour = "blue";

        if (!gameState.pastMissions[index]) colour = "lightgray";
        else if (gameState.pastMissions[index].result === "success") colour = "green";
        else colour = "red";

        return <Circle colour={colour} key={index} text={numPlayers}></Circle>
        })}
    </div>
    <div>
      <Button variant="contained" color="primary" onClick={gameStart}>{(gameState.proposedPlayers) ? "Restart Game" : "Start Game"}</Button>
    </div>
  </div>
);

export default GameState;
