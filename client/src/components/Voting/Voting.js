import React from "react";
import Button from '@material-ui/core/Button';

import "./Voting.css";

const Voting = ({ vote, gameState, name }) => (
  (gameState.proposingMission || (gameState.activeMission && gameState.proposedPlayers.includes(name))) ?
  <React.Fragment>
    <div>
      <Button variant="contained" color="primary" size="small" onClick={() => vote("approve")}>{gameState.activeMission ? "Pass" : "Approve"}</Button>
      <Button variant="contained" color="primary" size="small" onClick={() => vote("reject")}>{gameState.activeMission ? "Fail" : "Reject"}</Button>
    </div>
  </React.Fragment> : null
);

export default Voting;
