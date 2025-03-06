const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
const server = http.createServer(app);

const io = new Server(server, { cors: { origin: "*" } });

let rooms = {}; // Stores messages for each room

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("joinRoom", (room) => {
    socket.join(room);
    socket.emit("loadMessages", rooms[room] || []);
  });

  socket.on("sendMessage", ({ room, user, text }) => {
    const message = { user, text };
    if (!rooms[room]) rooms[room] = [];
    rooms[room].push(message);

    io.to(room).emit("receiveMessage", message);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
