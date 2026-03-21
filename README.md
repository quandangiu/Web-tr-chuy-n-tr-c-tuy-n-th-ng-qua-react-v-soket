# Chat Realtime - Client

React + TypeScript client for a real-time workspace chat platform with channels, tasks, voice, video, and file sharing.

## Overview

This client application provides:

- Real-time messaging with Socket.IO
- Workspace and channel management
- Private/public/voice channels
- Real-time task panel (create, update, delete, assign)
- Voice and video calling with WebRTC
- Authentication (login/register)
- File upload support

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Zustand
- Axios
- Socket.IO client

## Requirements

- Node.js 18+
- npm 9+
- Running backend API/socket server

## Setup

1. Clone repository.
2. Install dependencies:

```bash
npm install
```

3. Create local environment file:

```bash
cp .env.example .env
```

4. Update `.env` values for your backend host/port.
5. Start development server:

```bash
npm run dev
```

## Environment Variables

Example values:

```env
VITE_SERVER_IP=localhost
VITE_SERVER_PORT=3000
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## Main Source Structure

```text
src/
  components/
  context/
  hooks/
  pages/
  services/
  socket/
  store/
  types/
  utils/
```

## Notes

- This repository contains the client application only.
- Backend repository is maintained separately.
- If README rendering is broken on GitHub, ensure file encoding is UTF-8.

## Status

Active development.
