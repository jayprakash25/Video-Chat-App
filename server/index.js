const express = require("express");
const { Server } = require("socket.io");
const bodyParser = require("body-parser");

const io = new Server(8000, {
  cors: true,
});
const app = express();

//middlewares
app.use(bodyParser.json());

const emailToSocketMap = new Map();
const socketToEmailMap = new Map();

io.on("connection", (socket) => {
  console.log("New Connection");
  socket.on("join-room", (data) => {
    const { roomId, emailId } = data;
    console.log(emailId, "joined", roomId);
    emailToSocketMap.set(emailId, socket.id);
    socketToEmailMap.set(socket.id, emailId);
    io.to(roomId).emit("user-joined", { emailId, id: socket.id });
    socket.join(roomId);
    io.to(socket.id).emit("join-room", data);

    // socket.emit("joined-room", { roomId });
    // socket.broadcast.to(roomId).emit("user-joined", emailId);
  });

  socket.on("call-user", (data) => {
    const { to, offer } = data;
    socket.to(to).emit("incoming-call", { from: socket.id, offer });
  });

  socket.on("call-accepted", ({ to, ans }) => {
    socket.to(to).emit("call-accepted", { from: socket.id, ans });
  });

  socket.on("peer-nego-needed", ({ to, offer }) => {
    socket.to(to).emit("peer-nego-needed", { from: socket.id, offer });
  });

  socket.on("peer-nego-done", ({ to, ans }) => {
    socket.to(to).emit("peer-nego-final", { from: socket.id, ans });
  });
});

app.listen("3000", () => console.log("Running at PORT-3000"));
