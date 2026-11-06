# RANK: ZERO — Technical Architecture

**Status:** Proposed architecture; not approved for implementation  
**Architecture goal:** Deliver an online-first 2D/2.5D game that can run on Android and web while keeping authoritative game state on trusted servers.

## 1. Constraints

- Android is a primary target; web is also required.
- Online multiplayer is mandatory.
- Movement, competition outcomes, ranking changes, and rewards must not be trusted to the client.
- Persistent identity and progression must survive reconnects.
- The game must render as a game, not as a website.
- Development must begin with a small playable vertical slice, not the entire academy.

## 2. Proposed high-level architecture

```text
Android / Web Game Client
  ├─ Game renderer, camera, input, UI, audio
  ├─ Local prediction and interpolation
  └─ HTTPS + secure real-time connection
                 |
                 v
Authoritative Multiplayer Game Server
  ├─ Zone / room state
  ├─ Player movement validation
  ├─ NPC simulation
  ├─ Interaction and competition validation
  └─ Server events and state synchronization
                 |
       ┌─────────┴─────────┐
       v                   v
Application API       Persistent Data
  ├─ Profiles           ├─ PostgreSQL
  ├─ Inventory          ├─ Progress
  ├─ Missions            ├─ Rankings snapshots
  ├─ Rewards             └─ Audit records
  └─ Leaderboards
       |
       v
Authentication / Operations / Monitoring
```

## 3. Candidate technology stack

These are recommendations to evaluate, not locked choices.

| Layer | Candidate | Reason / validation needed |
|---|---|---|
| Game client | Phaser 3 + TypeScript | 2D rendering, input, camera, scenes; validate 2.5D/isometric requirements |
| UI shell | React + TypeScript | Menus and overlays; must not impose a website-like visual structure |
| Build tooling | Vite | Fast local development and web builds |
| Multiplayer server | Colyseus | Room-based real-time synchronization; benchmark latency and hosting |
| Authentication and persistence | Supabase Auth + PostgreSQL | Accounts and durable player data; configure strict row-level security |
| API / game services | Server-side TypeScript services | Missions, rewards, rankings, progression, moderation |
| Web hosting | Vercel or another static/client host | Client delivery only; not the authoritative real-time game server |
| Android packaging | Capacitor, subject to prototype validation | Package the web client; test performance and native input/audio needs |

A dedicated authoritative game server is required for real-time multiplayer. A database or general-purpose realtime database alone should not be treated as the movement/competition authority.

## 4. Trust boundaries

**Client may:** render the world, collect input, show UI, play local effects, interpolate remote entities, and request actions.

**Server must validate:** movement limits, interaction range, competition rules, scores, rewards, inventory changes, class promotion/demotion, and ranking updates.

Never place service-role secrets, database admin credentials, or private signing keys in the game client.

## 5. Suggested repository structure

```text
rank-zero/
├── README.md
├── docs/
│   ├── GAME_DESIGN.md
│   ├── GAME_ARCHITECTURE.md
│   ├── MULTIPLAYER_DESIGN.md
│   ├── RANKING_SYSTEM.md
│   └── ASSET_GUIDELINES.md
├── apps/
│   ├── game-client/
│   └── game-server/
├── packages/
│   ├── shared-types/
│   ├── game-rules/
│   └── network-protocol/
├── supabase/
│   └── migrations/
└── assets/
    ├── characters/
    ├── environments/
    ├── backgrounds/
    ├── animations/
    ├── audio/
    └── ui/
```

## 6. First technical milestone

Build a vertical slice containing:
1. A small test courtyard.
2. One controllable player with touch movement.
3. Two or more clients visible in the same online room.
4. One NPC with a simple server-driven schedule.
5. One interaction prompt and dialogue.
6. Reconnect handling and basic persistence.
7. Server-side validation of movement and interaction range.

This milestone tests the riskiest architecture assumptions before investing in a large asset library.

## 7. Performance and reliability targets to define

Before production, measure:
- Client frame rate on the minimum supported Android device.
- Input-to-visible-response latency.
- Server update rate and room capacity.
- Reconnect success and state recovery.
- Bandwidth per connected player.
- Database query latency and connection limits.
- Crash rate and failed session rate.

Do not claim specific capacity or latency until load tests establish it.

## 8. Deployment separation

- Client: static/web asset hosting and Android package distribution.
- Game server: persistent process/container host suitable for WebSocket connections.
- Database/auth: managed backend with backups and access policies.
- Monitoring: server logs, client error reporting, uptime, and abuse signals.

Vercel may host the web client and serverless APIs, but the persistent multiplayer room server should be hosted separately unless a tested deployment model proves otherwise.

## 9. Key risks

- Real-time server hosting can create recurring costs.
- A large shared world requires zones/shards and concurrency planning.
- 2.5D art, mobile performance, and collision/navigation need early tests.
- NPC simulation must be bounded to avoid excessive server load.
- Anti-cheat and moderation are necessary for public online play.
- A fully featured MMORPG is too large for a first release; scope must be staged.

## 10. Architecture approval checklist

- [ ] Client engine and rendering test approved
- [ ] Authoritative multiplayer server choice approved
- [ ] Authentication and database approach approved
- [ ] Android packaging approach tested
- [ ] Zone/room model defined
- [ ] Hosting budget and expected operating costs reviewed
- [ ] Vertical-slice scope approved

No production implementation should begin until these decisions are reviewed.
