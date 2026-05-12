# Poker Empire Frontend

This is the Next.js frontend for **Poker Empire**, a real-time poker arena built as part of the **Empire of Bits** arcade ecosystem.

The UI presents Poker Empire as an Airdrop Arcade game: a modern arcade-style Texas Hold'em experience with private rooms, bot players, settlement views, winner announcements, and future hooks for the Viewer-Influence Loop.

## Product Role

The frontend handles:

- Landing page and Poker Empire branding.
- Create room and join room flow.
- Socket.IO connection to the backend game server.
- Real-time poker table rendering.
- Player seats, avatars, hole cards, community cards, pot display, and turn controls.
- Bot/start-game controls.
- Settlement history and payment instructions.
- Poker hand ranking guide.
- Supabase client setup for ecosystem/profile-facing features.
- Airdrop Arcade service utilities in `src/lib/arenaGameService.ts`.

## Empire of Bits Context

Empire of Bits is an interoperable arcade gaming ecosystem built around the Airdrop Arcade platform. Poker Empire is designed to become one game inside that network, sharing economy, rewards, player identity, and future viewer-triggered gameplay events.

The planned Viewer-Influence Loop allows live stream viewers to spend platform-provided Airdrop Arcade Credits to trigger events that affect active game sessions.

## Tech Stack

- Next.js 14 App Router
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion
- Socket.IO Client
- Supabase JS

## Important Files

```text
src/app/page.tsx                 # Poker Empire landing/lobby page
src/app/room/[roomId]/page.tsx   # Room route and socket join flow
src/components/PokerTable.tsx    # Main game table
src/components/PlayerSeat.tsx    # Avatar, cards, chips, player state
src/components/PlayingCard.tsx   # Card UI
src/components/ActionPanel.tsx   # Fold/check/call/raise controls
src/components/SettlementModal.tsx
src/components/HandRankingsPanel.tsx
src/context/SocketContext.tsx    # Socket.IO provider
src/lib/supabase.ts              # Supabase browser client
src/lib/arenaGameService.ts      # Airdrop Arcade integration utilities
```

## Environment

Create or update `frontend/.env.local`:

```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:8080
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

For production, set `NEXT_PUBLIC_SOCKET_URL` to the deployed backend origin.

## Local Development

Install dependencies:

```bash
npm install
```

Start the frontend:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

The backend should also be running on:

```text
http://localhost:8080
```

## Scripts

```bash
npm run dev     # Start Next.js dev server
npm run lint    # Run Next lint
npm run build   # Build production frontend
npm run start   # Start production build
```

## Development Notes

- Rooms are created and joined through Socket.IO events.
- The frontend should not contain Supabase service role keys.
- If Next.js dev server shows missing `.next/vendor-chunks` errors, stop the dev server, delete `.next`, and restart `npm run dev`.
- The poker game state is owned by the backend; frontend changes should avoid modifying socket event names or game action payloads unless the backend is updated too.

## Deployment

This frontend can be deployed on Vercel as a Next.js app. Make sure production environment variables point to the live backend and Supabase project.
