import React from "react";

import "./Voting.css";

const Voting = ({ vote, gameState }) => (
  <React.Fragment>
    <div>
      <button onClick={() => vote("approve")}>Approve</button>
      <button onClick={() => vote("reject")}>Reject</button>
    </div>
  </React.Fragment>
);

export default Voting;
