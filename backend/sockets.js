const {
  getRoom,
  addMessage,
  getMessages,
  removeMemberFromRoom,
} = require("./rooms");

function registerSocketHandlers(io) {
  io.on("connection", (socket) => {
    socket.on("room:join", ({ code, displayName }) => {
      const normalizedCode = code?.trim().toUpperCase();
      const room = getRoom(normalizedCode);

      if (!room) {
        socket.emit("room:error", "Room not found.");
        return;
      }

      socket.data.roomCode = normalizedCode;
      socket.data.displayName = displayName;
      socket.join(normalizedCode);

      socket.emit("room:history", getMessages(normalizedCode));
      socket.to(normalizedCode).emit("room:notice", {
        text: `${displayName} joined the room.`,
        timestamp: Date.now(),
      });
    });

    socket.on("message:send", ({ code, text, displayName }) => {
      const normalizedCode = code?.trim().toUpperCase();
      const room = getRoom(normalizedCode);
      const trimmedText = text?.trim();

      if (!room || !trimmedText) {
        return;
      }

      const payload = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        text: trimmedText,
        sender: displayName,
        timestamp: Date.now(),
      };

      addMessage(normalizedCode, payload);
      io.to(normalizedCode).emit("message:new", payload);
    });

    socket.on("disconnect", () => {
      const { roomCode, displayName } = socket.data;

      if (roomCode && displayName) {
        removeMemberFromRoom(roomCode, displayName);
        socket.to(roomCode).emit("room:notice", {
          text: `${displayName} left the room.`,
          timestamp: Date.now(),
        });
      }
    });
  });
}

module.exports = registerSocketHandlers;
