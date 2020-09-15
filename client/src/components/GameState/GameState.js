import React from "react";
import Button from '@material-ui/core/Button';
import Circle from "../Circle/Circle";

const GameState = ({ gameStart, gameState }) => (
  <div>
    <div style={{display: "flex"}}>
      {gameState.playersPerMission && gameState.playersPerMission.map((numPlayers, index) => {
        return <Circle text={numPlayers}></Circle>
        })}
    </div>
    <div>
      <Button variant="contained" color="primary" onClick={gameStart}>{(gameState.proposedPlayers) ? "Restart Game" : "Start Game"}</Button>
    </div>
  </div>
);

export default GameState;
