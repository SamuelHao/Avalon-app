import React from "react";
import Button from '@material-ui/core/Button';
import Circle from "../Circle/Circle";

const GameState = ({ gameStart, gameState }) => (
  <React.Fragment>
    <div style={{display: "flex", flexDirection: "row"}}>
      {gameState.playersPerMission && gameState.playersPerMission.map((numPlayers, index) => {
        return <Circle text={numPlayers}></Circle>
        })}
    </div>
    <div>
      <Button variant="contained" color="primary" onClick={gameStart}>{(gameState.proposedPlayers) ? "Restart Game" : "Start Game"}</Button>
    </div>
  </React.Fragment>
);

export default GameState;
