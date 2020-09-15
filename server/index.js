const express = require("express");
const socketio = require("socket.io");
const http = require("http");

const { addUser, removeUser, getUser, getUsersInRoom } = require("./users");

const PORT = process.env.PORT || 5000;

const router = require("./router");

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
      players: users.length, // Number of players
      currentMission: 0, // Mission 0 to 4
      proposingMission: false, // Whether or not a mission has been proposed by the king and sent to votin
      activeMission: false, // Whether or not a mission is currently happening and players are sending approvals and rejects
      currentVoteRound: 0, // Voting round 0 to 4
      voted: [], // Array of vote objects (name and vote status (pass/fail, approve/reject))
      pastMissions: [], // Array of past mission objects;, success:, fail:
      proposedPlayers: [], // Currently Proposed Mission Players
      playersPerMission: [2, 3, 2, 3, 3],
      currentKing: randomKing.name
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
    console.log(gameState);
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
