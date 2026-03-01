# TalkFlow

**TalkFlow** is a modern, lightweight messaging platform where users can create and join chat rooms using unique codes.

This version includes a working MVP with:

- Room creation with unique 6-character codes
- Room join flow by code
- "My Rooms" page to list rooms a user has joined
- Real-time messaging powered by Socket.IO
- Simple clean UI built with HTML/CSS/JS

## Quick Start

### 1) Install dependencies

```bash
npm install
```

### 2) Run the app

```bash
npm start
```

The app runs at `http://localhost:3000`.

## Current Tech Stack

- **Backend:** Node.js, Express, Socket.IO
- **Frontend:** HTML, CSS, JavaScript
- **Storage:** In-memory room/message store (for MVP)

## Roadmap

- Swap in-memory storage with Firebase
- User accounts and room invites
- Moderation controls
- AI-powered room features (TBD)
