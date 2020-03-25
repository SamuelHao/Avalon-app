import React, { useState, useEffect } from "react";
import queryString from "query-string";
import io from "socket.io-client";
import "./Avalon.css";

import InfoBar from "../InfoBar/InfoBar";
import Input from "../Input/Input";
import Messages from "../Messages/Messages";
import Players from "../Players/Players";
import GameState from "../GameState/GameState";
import Voting from "../Voting/Voting";

let socket;

const Avalon = ({ location }) => {
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [players, setPlayers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [gameState, setGameState] = useState({});
  const ENDPOINT = "localhost:5000";
  //location comes from react router, it's simply the url string
  useEffect(() => {
    const { name, room } = queryString.parse(location.search); //parses the data out of the url e.g. name and room

    socket = io(ENDPOINT);

    setName(name);
    setRoom(room);

    socket.emit("join", { name, room }, () => {}); //third parameter is a callback function which can be called by the socket listener in the backend
    return () => {
      socket.emit("disconnect");
      socket.disconnect();
      socket.off();
    };
  }, [ENDPOINT, location.search]);

  useEffect(() => {
    socket.on("message", message => {
      setMessages([...messages, message]);
    });

    socket.on("roomData", ({ users }) => {
      setPlayers(users);
    });

    return () => {
      socket.off("message");
      socket.off("roomData");
    };
  }, [messages]);

  useEffect(() => {
    socket.on("gameStateUpdate", gameState => {
      console.log("client received gameStateUpdate");
      setGameState(gameState);
      console.log(gameState);
    });
  }, []);

  const sendMessage = event => {
    event.preventDefault();
    if (message) {
      socket.emit("sendMessage", message, () => setMessage(""));
    }
  };

  const gameStart = () => {
    socket.emit("gameStart");
  };

  const vote = result => {
    socket.emit("voted", name, result, gameState);
  };

  return (
    <div className="outerContainer">
      <div className="container">
        <InfoBar room={room} />
        <Messages messages={messages} name={name} />
        <Input
          message={message}
          setMessage={setMessage}
          sendMessage={sendMessage}
        />
      </div>
      {gameState.voted && <Voting gameState={gameState} vote={vote} />}
      <Players players={players} gameState={gameState} />
      <GameState gameStart={gameStart} />
    </div>
  );
};

export default Avalon;
