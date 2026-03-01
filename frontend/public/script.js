const createRoomForm = document.getElementById("createRoomForm");
const joinRoomForm = document.getElementById("joinRoomForm");
const viewRoomsBtn = document.getElementById("viewRoomsBtn");
const statusText = document.getElementById("status");

function setStatus(text, isError = false) {
  statusText.textContent = text;
  statusText.classList.toggle("error", isError);
}

function saveIdentity(displayName) {
  localStorage.setItem("talkflow:displayName", displayName);
}

function openChat(code, displayName, roomName = "") {
  const params = new URLSearchParams({ code, displayName, roomName });
  window.location.href = `/chat.html?${params.toString()}`;
}

async function createRoom(event) {
  event.preventDefault();
  setStatus("Creating room...");

  const displayName = createRoomForm.displayName.value.trim();
  const roomName = createRoomForm.roomName.value.trim();

  try {
    const response = await fetch("/api/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomName, displayName }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Unable to create room.");
    }

    saveIdentity(displayName);
    openChat(data.code, displayName, data.name);
  } catch (error) {
    setStatus(error.message, true);
  }
}

async function joinRoom(event) {
  event.preventDefault();
  setStatus("Joining room...");

  const displayName = joinRoomForm.displayName.value.trim();
  const code = joinRoomForm.roomCode.value.trim().toUpperCase();

  try {
    const response = await fetch("/api/rooms/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, displayName }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Unable to join room.");
    }

    saveIdentity(displayName);
    openChat(data.code, displayName, data.name);
  } catch (error) {
    setStatus(error.message, true);
  }
}

function viewRooms() {
  const displayName = (localStorage.getItem("talkflow:displayName") || "").trim();

  if (!displayName) {
    setStatus("Create or join a room first to save your display name.", true);
    return;
  }

  const params = new URLSearchParams({ displayName });
  window.location.href = `/rooms.html?${params.toString()}`;
}

createRoomForm.addEventListener("submit", createRoom);
joinRoomForm.addEventListener("submit", joinRoom);
viewRoomsBtn.addEventListener("click", viewRooms);
