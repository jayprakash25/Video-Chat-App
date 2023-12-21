import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../Providers/Socket";

export default function Home() {
  const socket = useSocket();
  const navigate = useNavigate();

  const [emailId, setEmail] = useState("");
  const [roomId, setRoom] = useState("");

  const handleRoomJoined = useCallback(
    ({ roomId }) => {
      // console.log(roomId);
      navigate(`/room/${roomId}`);
    },
    [navigate]
  );

  useEffect(() => {
    socket.on("join-room", handleRoomJoined);
    return () => {
      socket.off("join-room", handleRoomJoined);
    };
  }, [socket, handleRoomJoined]);

  const handleJoinRoom = useCallback(() => {
    socket.emit("join-room", { emailId: emailId, roomId: roomId });
  }, [emailId, roomId, socket]);

  return (
    <div className="input-container">
      <input
        type="email"
        value={emailId}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email here"
        className="input"
      />
      <input
        type="text"
        value={roomId}
        onChange={(e) => setRoom(e.target.value)}
        placeholder="Enter Room Code"
        className="input"
      />
      <button onClick={handleJoinRoom} className="button">
        Join Room
      </button>
    </div>
  );
}
