# RANK: ZERO — Multiplayer Design

**Status:** Design draft  
**Principle:** The academy is an online world. The server owns shared state and validates meaningful actions.

## 1. Online experience

Target features:
- Players see other connected players in shared academy zones.
- Friends can meet, explore, and participate in eligible group activities.
- NPCs populate the same spaces and run server-controlled routines.
- Scheduled competitions can move participants into dedicated match rooms.
- Player progress persists across sessions and reconnects.

## 2. World topology proposal

Use multiple zone instances rather than assuming one unlimited world server:
- Academy zones: courtyard, academic block, library, cafeteria, dorm area, sports complex.
- Each zone instance has a defined capacity.
- Players can transition between zones through controlled exits.
- Competition rooms are separate instances with explicit participant lists.
- Friends/party members should be preferentially routed to the same instance when capacity allows.

Exact capacities must be established by load testing, not guessed.

## 3. Authoritative state

The server is authoritative for:
- Player position and movement constraints
- Zone membership
- Interactions and interaction distance
- NPC position and schedules
- Competition start/end and result validation
- Mission completion
- Rewards, inventory, currency, and progression
- Class placement and ranking updates

Clients send input or action requests; they do not submit trusted final scores or arbitrary rewards.

## 4. Connection lifecycle

1. Authenticate account over secure HTTPS.
2. Request permission to join a zone.
3. Server checks account state, zone capacity, and access rules.
4. Client joins the real-time room.
5. Server sends an initial state snapshot.
6. Client sends movement/action inputs.
7. Server validates and broadcasts accepted state.
8. On disconnect, server marks the player temporarily disconnected and applies a defined grace period.
9. On reconnect, server restores the player to a valid current state.

The grace period and reconnect behavior need testing on unstable mobile networks.

## 5. NPC simulation

NPCs should have:
- Stable identity and role
- Schedule and current activity
- Location and movement state
- Personality/interaction profile
- Goals and progression state
- Limited memory of relevant player interactions

Simulation should be bounded. Distant NPCs can use lower-frequency or abstract simulation; nearby NPCs receive more detailed updates. NPCs must not require a separate expensive real-time process each.

## 6. Parties and group activities

Potential features:
- Friend list and party invites
- Party leader and shared destination
- Group missions with individual contribution tracking
- Competition team registration
- Party disband and reconnect handling

Permission, invite expiry, blocking, reporting, and anti-harassment controls must be designed before public launch.

## 7. Chat and player safety

For a teen-oriented academy game, public communication needs strong safeguards:
- Default to limited, moderated communication.
- Provide mute, block, and report controls.
- Rate-limit messages and invites.
- Filter spam and abusive content.
- Do not expose personal contact details.
- Avoid unrestricted voice chat in the initial release.
- Establish moderation procedures and retention policies before launch.

## 8. Network message categories

Conceptual message families:
- Authentication/session: join, leave, reconnect
- Movement: input direction, accepted position/state
- Interaction: interact request, accepted/rejected response
- NPC: spawn, despawn, state update
- Social: party, friend, safe chat events
- Competition: register, ready, start, progress, result
- World: zone transition, event notice, weather/time state

Exact schemas and versioning belong in the implementation phase.

## 9. Failure cases to test

- Network drops during movement
- Reconnect while the player is in a competition
- Full zone instance
- Duplicate action requests
- Stale client state
- Server restart and recovery
- Player leaves during a group mission
- Malicious or impossible movement input
- NPC state after zone unload/reload

## 10. Open decisions

- Maximum players per zone instance
- Zone transfer loading experience
- Party size
- Chat scope and moderation vendor/process
- NPC simulation tick strategy
- Server region selection and latency targets
- Whether cross-region play is supported at launch
