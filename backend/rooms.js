const generateCode = require("./utils/generateCode");

const rooms = new Map();

function roomSummary(room) {
  return {
    code: room.code,
    name: room.name,
    memberCount: room.members.size,
    createdAt: room.createdAt,
  };
}

function createRoom(name, creator) {
  const trimmedName = name?.trim();
  const trimmedCreator = creator?.trim();

  if (!trimmedName) {
    throw new Error("Room name is required.");
  }

  if (!trimmedCreator) {
    throw new Error("Display name is required.");
  }

  let code = generateCode();
  while (rooms.has(code)) {
    code = generateCode();
  }

  const room = {
    code,
    name: trimmedName,
    createdAt: Date.now(),
    members: new Map(),
    messages: [],
  };

  room.members.set(trimmedCreator, {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    name: trimmedCreator,
    joinedAt: Date.now(),
  });

  rooms.set(code, room);

  return roomSummary(room);
}

function joinRoom(code, memberName) {
  const normalizedCode = code?.trim().toUpperCase();
  const trimmedMemberName = memberName?.trim();

  if (!normalizedCode) {
    throw new Error("Room code is required.");
  }

  if (!trimmedMemberName) {
    throw new Error("Display name is required.");
  }

  const room = rooms.get(normalizedCode);

  if (!room) {
    throw new Error("Room not found.");
  }

  if (!room.members.has(trimmedMemberName)) {
    room.members.set(trimmedMemberName, {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name: trimmedMemberName,
      joinedAt: Date.now(),
    });
  }

  return roomSummary(room);
}

function getRoom(code) {
  if (!code) {
    return null;
  }

  return rooms.get(code.trim().toUpperCase()) || null;
}

function addMessage(code, message) {
  const room = getRoom(code);
  if (!room) {
    throw new Error("Room not found.");
  }

  room.messages.push(message);

  if (room.messages.length > 200) {
    room.messages.shift();
  }

  return message;
}

function getMessages(code) {
  const room = getRoom(code);
  if (!room) {
    return [];
  }

  return [...room.messages];
}

function getRoomsForMember(memberName) {
  const trimmedMemberName = memberName?.trim();

  if (!trimmedMemberName) {
    return [];
  }

  return [...rooms.values()]
    .filter((room) => room.members.has(trimmedMemberName))
    .map(roomSummary)
    .sort((a, b) => b.createdAt - a.createdAt);
}

function removeMemberFromRoom(code, memberName) {
  const room = getRoom(code);
  if (!room || !memberName) {
    return;
  }

  room.members.delete(memberName);

  if (room.members.size === 0) {
    rooms.delete(room.code);
  }
}

module.exports = {
  createRoom,
  joinRoom,
  getRoom,
  addMessage,
  getMessages,
  getRoomsForMember,
  removeMemberFromRoom,
};
