import React from "react";

import "./Voting.css";

const Voting = ({ vote, gameState }) => (
  <React.Fragment>
    <button onClick={() => vote("approve")}>Approve</button>
    <button onClick={() => vote("reject")}>Reject</button>
  </React.Fragment>
);

export default Voting;
