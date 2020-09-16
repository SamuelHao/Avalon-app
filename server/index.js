const express = require("express");
const socketio = require("socket.io");
const http = require("http");

const { addUser, removeUser, getUser, getUsersInRoom } = require("./users");

const PORT = process.env.PORT || 5000;

const router = require("./router");
const e = require("express");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Most of this code is completely resuable for any room based web applications
// The avalon specific sections are labelled as such

io.on("connection", socket => {
  // On join, sends a message, adds user to the users array,
  // emits current users in room (roomData)
  socket.on("join", ({ name, room }, callback) => {
    console.log(`User ${name} has joined room ${room}`);

    const { error, user } = addUser({ id: socket.id, name, room });

    if (error) return callback(error);

    socket.join(user.room);

    socket.emit("message", {
      user: "admin",
      text: `${user.name}, welcome to room: ${user.room}`
    });

    socket.broadcast
      .to(user.room)
      .emit("message", { user: "admin", text: `${user.name} has joined` });

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room)
    });
    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit("message", { user: user.name, text: message });
    callback();
  });

  //BEGIN AVALON
  socket.on("gameStart", () => {
    // On gameStart, initializes and emits gameState
    console.log("gameStart received");
    const user = getUser(socket.id);
    const room = user.room;

    const users = getUsersInRoom(room);
    const randomKing = users[Math.floor(Math.random() * users.length)];

    const gameState = {
      room, //Room code
      players: users, // Number of players
      currentMission: 0, // Mission 0 to 4
      proposingMission: false, // Whether or not a mission has been proposed by the king and sent to voting
      activeMission: false, // Whether or not a mission is currently happening and players are sending approvals and rejects
      currentVoteRound: 0, // Voting round 0 to 4
      voted: [], // Array of vote objects (name and vote status (pass/fail, approve/reject))
      pastMissions: [], // Array of past mission objects;, success:, fail:
      proposedPlayers: [], // Currently Proposed Mission Players
      playersPerMission: [2, 3, 2, 3, 3], // Number of Players per Mission
      currentKing: randomKing.name // Current Player King
    };
    io.to(room).emit("gameStateUpdate", gameState);
  });

  socket.on("voted", (name, result, gameState) => {
    const user = getUser(socket.id);
    const room = user.room;
    const alreadyVoted = gameState.voted.filter(player => {
      return player.name === name;
    });
    if (alreadyVoted.length) {
      // This player has already voted
      alreadyVoted[0].result = result;
    } else {
      gameState.voted.push({ name, result });
    }

    // If everyone has voted, the mission goes through or the next person becomes the King
    const numVoted = gameState.voted.length;
    const numPlayers = gameState.players.length;
    const numOnMission = gameState.playersPerMission[gameState.currentMission];

    // If voting on a mission proposal
    if (numVoted === numPlayers && gameState.proposingMission) {
      const numPassed = gameState.voted.filter(vote => vote.result === "approve").length;
        // If the missions passes, proceed to voting stage
        if (numPassed > numPlayers/2) {
          gameState.activeMission = true;

        // Otherwise make the next person the king and propose a new mission
        } else {
          const isKing = (element) => element.name === gameState.currentKing
          const nextKing = gameState.players[(gameState.players.findIndex(isKing) + 1)%numPlayers].name;
  
          gameState.currentKing = nextKing;
          gameState.proposedPlayers = [];
        }
        gameState.proposingMission = false;
        gameState.voted = [];
      
    
    // If voting on an active mission (success or fail)
    } else if (numVoted === numOnMission) {
        const numFails = gameState.voted.filter(vote => vote.result === "reject").length;
        
        const result = numFails > 0 ? "fail" : "success";
        gameState.pastMissions.push({result, numFails});
        
        gameState.currentMission++;
        gameState.activeMission = false;
        gameState.proposedPlayers = [];
        gameState.voted = [];

        const isKing = (element) => element.name === gameState.currentKing
        const nextKing = gameState.players[(gameState.players.findIndex(isKing) + 1)%numPlayers].name;
  
        gameState.currentKing = nextKing;
    }
    io.to(room).emit("gameStateUpdate", gameState);
  });

  socket.on("addPlayerToMission", (name, gameState) => {
    const user = getUser(socket.id);
    const room = user.room;

    // If the proposed player is already proposed, then remove them
    // Then add them to the array
    if (gameState.proposedPlayers.includes(name)) {
      const index = gameState.proposedPlayers.indexOf(name);
      gameState.proposedPlayers.splice(index, 1);
    
      // Otherwise, if the max num of proposed players has not been reached, add them
    } else if (gameState.proposedPlayers.length != gameState.playersPerMission[gameState.currentMission]) {
      gameState.proposedPlayers.push(name);
    }
    
    console.log(gameState);
    io.to(room).emit("gameStateUpdate", gameState);
  })

  socket.on("proposeMission", (gameState) => {
    const user = getUser(socket.id);
    const room = user.room;

    if (gameState.proposedPlayers.length === gameState.playersPerMission[gameState.currentMission]) gameState.proposingMission = true;
    io.to(room).emit("gameStateUpdate", gameState);
  })


  // END AVALON
  // On disconnect, removes user from current users array,
  // sends a message notifying other users of the disconnect
  // emits current users in the room (roomData)
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit("message", {
        user: "admin",
        text: `${user.name} has left`
      });

      console.log(`User ${user.name} has left room ${user.room}`);
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room)
      });
    }
  });
});

app.use(router);

server.listen(PORT, () => console.log(`Server has started on port ${PORT}`));
