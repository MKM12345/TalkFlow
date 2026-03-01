const path = require("path");
const http = require("http");
const express = require("express");
const { Server } = require("socket.io");
const {
  createRoom,
  joinRoom,
  getRoomsForMember,
} = require("./rooms");
const registerSocketHandlers = require("./sockets");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend/public")));

app.post("/api/rooms", (req, res) => {
  try {
    const { roomName, displayName } = req.body;
    const room = createRoom(roomName, displayName);
    return res.status(201).json(room);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.post("/api/rooms/join", (req, res) => {
  try {
    const { code, displayName } = req.body;
    const room = joinRoom(code, displayName);
    return res.status(200).json(room);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.get("/api/users/:displayName/rooms", (req, res) => {
  const rooms = getRoomsForMember(req.params.displayName);
  return res.json(rooms);
});

registerSocketHandlers(io);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`TalkFlow server running on http://localhost:${PORT}`);
});
