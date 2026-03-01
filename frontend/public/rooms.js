const params = new URLSearchParams(window.location.search);
const code = params.get("code");
const displayName = params.get("displayName");
const roomName = params.get("roomName");

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

if (window.location.pathname.endsWith("chat.html")) {
  const roomHeader = document.getElementById("roomHeader");
  const roomMeta = document.getElementById("roomMeta");
  const messages = document.getElementById("messages");
  const messageForm = document.getElementById("messageForm");
  const messageInput = document.getElementById("messageInput");
  const chatStatus = document.getElementById("chatStatus");

  if (!code || !displayName) {
    chatStatus.textContent = "Missing room details. Please return home and join again.";
    chatStatus.classList.add("error");
  } else {
    roomHeader.textContent = roomName ? roomName : `Room ${code}`;
    roomMeta.textContent = `Code: ${code} • You: ${displayName}`;

    const socket = io();

    function addMessage(text, sender, timestamp, variant = "") {
      const item = document.createElement("article");
      item.className = `message ${variant}`.trim();
      item.innerHTML = `
        <header>
          <strong>${sender}</strong>
          <span>${formatTime(timestamp)}</span>
        </header>
        <p></p>
      `;
      item.querySelector("p").textContent = text;
      messages.appendChild(item);
      messages.scrollTop = messages.scrollHeight;
    }

    socket.emit("room:join", { code, displayName });

    socket.on("room:error", (error) => {
      chatStatus.textContent = error;
      chatStatus.classList.add("error");
    });

    socket.on("room:history", (history) => {
      messages.innerHTML = "";
      history.forEach((message) => {
        const variant = message.sender === displayName ? "own" : "";
        addMessage(message.text, message.sender, message.timestamp, variant);
      });
    });

    socket.on("message:new", (message) => {
      const variant = message.sender === displayName ? "own" : "";
      addMessage(message.text, message.sender, message.timestamp, variant);
    });

    socket.on("room:notice", (notice) => {
      addMessage(notice.text, "system", notice.timestamp, "notice");
    });

    messageForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const text = messageInput.value.trim();

      if (!text) {
        return;
      }

      socket.emit("message:send", {
        code,
        text,
        displayName,
      });

      messageInput.value = "";
      messageInput.focus();
    });
  }
}

if (window.location.pathname.endsWith("rooms.html")) {
  const roomsList = document.getElementById("roomsList");
  const roomsMeta = document.getElementById("roomsMeta");
  const roomsStatus = document.getElementById("roomsStatus");

  const user = params.get("displayName") || localStorage.getItem("talkflow:displayName");

  if (!user) {
    roomsStatus.textContent = "No display name found. Join or create a room first.";
    roomsStatus.classList.add("error");
  } else {
    roomsMeta.textContent = `Signed in as ${user}`;

    fetch(`/api/users/${encodeURIComponent(user)}/rooms`)
      .then((response) => response.json())
      .then((rooms) => {
        if (!rooms.length) {
          roomsStatus.textContent = "You have not joined any rooms yet.";
          return;
        }

        rooms.forEach((room) => {
          const item = document.createElement("li");
          item.className = "room-item";
          item.innerHTML = `
            <div>
              <strong>${room.name}</strong>
              <p>Code: ${room.code} • Members: ${room.memberCount}</p>
            </div>
            <button>Open chat</button>
          `;

          item.querySelector("button").addEventListener("click", () => {
            const query = new URLSearchParams({
              code: room.code,
              displayName: user,
              roomName: room.name,
            });
            window.location.href = `/chat.html?${query.toString()}`;
          });

          roomsList.appendChild(item);
        });
      })
      .catch(() => {
        roomsStatus.textContent = "Unable to load rooms.";
        roomsStatus.classList.add("error");
      });
  }
}
