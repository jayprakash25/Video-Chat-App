import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "../Providers/Socket";
import ReactPlayer from "react-player";
import peer from "../Service/peer";
export default function Room() {
  const socket = useSocket();
  const [remoteSocket, setRemoteSocket] = useState(null);
  const [myStream, setMyStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const handleNewUserJoined = useCallback(async (data) => {
    const { emailId, id } = data;
    setRemoteSocket(id);
    console.log("New user joined", emailId);
  }, []);

  const handleIncomeCall = useCallback(
    async (data) => {
      const { from, offer } = data;
      setRemoteSocket(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);

      const ans = await peer.getAnswer(offer);
      socket.emit("call-accepted", { to: from, ans });
    },
    [socket]
  );

  const sendStream = useCallback(() => {
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(
    async ({ from, ans }) => {
      peer.setLocalDescription(ans);
      sendStream();
    },
    [sendStream]
  );

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await peer.getOffer();
    socket.emit("call-user", { to: remoteSocket }, offer);
    setMyStream(stream);
  }, [remoteSocket, socket]);

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer-nego-needed", { offer, to: remoteSocket });
  }, [remoteSocket, socket]);

  const handleNegoNeedIncoming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer-nego-done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    await peer.setLocalDescription(ans);
  }, []);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);

    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      setRemoteStream(remoteStream[0]);
    });
  });

  useEffect(() => {
    socket.on("user-joined", handleNewUserJoined);
    socket.on("incoming-call", handleIncomeCall);
    socket.on("call-accepted", handleCallAccepted);
    socket.on("peer-nego-needed", handleNegoNeedIncoming);
    socket.on("peer-nego-final", handleNegoNeedFinal);

    return () => {
      socket.off("user-joined", handleNewUserJoined);
      socket.off("incoming-call", handleIncomeCall);
      socket.off("call-accepted", handleCallAccepted);
      socket.off("peer-nego-needed", handleNegoNeedIncoming);
      socket.off("peer-nego-final", handleNegoNeedFinal);
    };
  }, [
    handleNewUserJoined,
    handleIncomeCall,
    handleCallAccepted,
    handleNegoNeedIncoming,
    handleNegoNeedFinal,
    socket,
  ]);
  return (
    <div>
      <h1>Room</h1>
      <h4>{remoteSocket ? "Connected" : "No One in Room"}</h4>
      {myStream && <button onClick={sendStream}>Send Stream</button>}
      {remoteSocket && <button onClick={handleCallUser}>Call</button>}
      {myStream && (
        <>
          <h1>My stream</h1>
          <ReactPlayer
            playing
            muted
            height="10rem"
            width="15rem"
            url={myStream}
          />
        </>
      )}
      {remoteStream && (
        <>
          <h1>Remote Stream</h1>
          <ReactPlayer
            playing
            muted
            height="10rem"
            width="15rem"
            url={remoteStream}
          />
        </>
      )}
    </div>
  );
}
