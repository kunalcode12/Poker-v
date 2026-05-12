# Poker Empire

Poker Empire is a real-time multiplayer Texas Hold'em arena built for the **Empire of Bits** arcade ecosystem. It combines private poker rooms, bot opponents, settlement tracking, arena monitoring, and Empire of Bits reward redirects inside a retro arcade UI.

## Live Links

- **Live Poker Game:** [poker-v.vercel.app](https://poker-v.vercel.app/)
- **Empire of Bits:** [empireofbits.xyz](https://www.empireofbits.xyz/)

## Overview

Empire of Bits is an interoperable arcade gaming ecosystem for fast matches, shared player progression, and reward-based gameplay. Poker Empire brings Texas Hold'em into that world with real-time rooms and a Viewer-Influence Loop powered by arena events such as boosts, package drops, countdowns, and session monitoring.

Players can enter from Empire of Bits with their wallet/session data, play a poker match, and return to the game center with the result and earned points.

## Features

- Real-time Texas Hold'em rooms powered by Socket.IO.
- Private room creation and room-code joining.
- Up to 6 seats per room.
- Bot players for quick testing and lobby fill.
- Practice mode and real mode entry amounts.
- Chip-to-INR settlement tracking for real mode.
- Settlement ledger and "who pays whom" payment view.
- Showdown winner announcements and hand ranking guide.
- Arena monitoring panel for stream/session events.
- Boost, package unlock, and immediate drop popups.
- Empire of Bits result redirect with winner point updates.
- Supabase schema for profiles and room metadata.
- Arcade-inspired UI aligned with Empire of Bits branding.

## Tech Stack

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS, Framer Motion.
- **Backend:** Node.js, Express, Socket.IO, TypeScript.
- **Database:** Supabase Postgres.
- **Realtime:** Socket.IO WebSockets.
- **Deployment:** Vercel frontend, Render backend.

## Project Structure

```text
poker-game/
├── backend/
│   ├── src/
│   │   ├── game/              # Poker engine, players, deck, evaluator, bot logic
│   │   ├── utils/             # Settlement calculation
│   │   ├── server.ts          # Express + Socket.IO server
│   │   └── socket.ts          # Room, player, bot, and game event handlers
│   └── supabase/
│       └── schema.sql         # Profiles, rooms, RLS policies
├── frontend/
│   ├── src/app/               # Next.js app routes
│   ├── src/components/        # Table, cards, seats, controls, modals
│   ├── src/context/           # Socket provider
│   └── src/lib/               # Supabase, arena, and Empire of Bits helpers
└── README.md
```

## Environment Variables

Backend `.env`:

```env
PORT=8080
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
# SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Frontend `.env`:

```env
NEXT_PUBLIC_SOCKET_URL=https://your-backend.onrender.com
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

For local frontend development, `NEXT_PUBLIC_SOCKET_URL` can be `http://localhost:8080`.

## Supabase Setup

Run `backend/supabase/schema.sql` in the Supabase SQL Editor for a fresh project. It creates:

- `profiles`
- `rooms`
- RLS policies
- signup profile trigger

Room gameplay currently lives in backend memory, while Supabase is used for profile/room metadata and settlement persistence. If the backend restarts, active in-memory rooms are reset.

## Local Development

Start the backend:

```bash
cd backend
npm install
npm run dev
```

The backend runs on `http://localhost:8080`.

Start the frontend:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:3000`.

Health check:

```text
http://localhost:8080/health
```

Expected response:

```json
{ "status": "ok", "supabase": true }
```

## Deployment

### Backend on Render

- Root directory: `backend`
- Build command: `npm ci --include=dev && npm run build`
- Start command: `node dist/server.js`
- Health check path: `/health`

Set the backend environment variables in Render. Do not manually set `PORT`; Render provides it automatically.

### Frontend on Vercel

- Root directory: `frontend`
- Framework: Next.js
- Build command: `npm run build`
- Output directory: `.next`

Set `NEXT_PUBLIC_SOCKET_URL` to the deployed Render backend URL. If using the production domain, configure `poker.empireofbits.xyz` in Vercel and add the DNS record Vercel provides.

## Useful Commands

Backend:

```bash
cd backend
npm run dev
npm run build
```

Frontend:

```bash
cd frontend
npm run dev
npm run lint
npm run build
```

## Product Direction

Poker Empire is designed to be one arcade module inside Empire of Bits. Future work can deepen shared rewards, platform identity, player inventory, and viewer-triggered Airdrop Arcade events such as boosts, disruption cards, item drops, and special table modifiers.

## License

MIT
