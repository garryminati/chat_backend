const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

const messages = {};
const users = {}; // Track users per room

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("joinRoom", (room) => {
    socket.join(room);
    users[socket.id] = room;

    if (!messages[room]) messages[room] = [];
    io.to(room).emit("userList", Object.values(users).filter((r) => r === room));

    socket.emit("adminMessages", messages[room]);
  });

  socket.on("sendMessage", (data) => {
    const { user, room, text } = data;
    const msg = { user, text };
    messages[room].push(msg);
    io.to(room).emit("message", msg);
  });

  socket.on("disconnect", () => {
    const room = users[socket.id];
    delete users[socket.id];

    io.to(room).emit("userList", Object.values(users).filter((r) => r === room));
    console.log("A user disconnected");
  });
});

server.listen(5000, () => console.log("Server running on port 5000"));
