import React from "react";
import Button from '@material-ui/core/Button';

import "./Voting.css";

const Voting = ({ vote, gameState }) => (
  <React.Fragment>
    <div>
      <Button variant="contained" color="primary" size="small" onClick={() => vote("approve")}>Approve</Button>
      <Button variant="contained" color="primary" size="small" onClick={() => vote("reject")}>Reject</Button>
    </div>
  </React.Fragment>
);

export default Voting;
