# RANK: ZERO — Game Design Brief

**Status:** Phase 1 draft  
**Product:** Online anime academy-life RPG  
**Target platforms:** Android first-class target and web; final packaging approach remains to be validated.

## 1. Player fantasy

The player enters a prestigious academy at the bottom of its social and academic hierarchy. Through study, relationships, exploration, competitions, clubs, and strategic decisions, they try to rise while navigating rivals, changing alliances, and unexpected academy events.

The experience should reward several play styles rather than one repetitive grind.

## 2. Confirmed creative direction

- Title: RANK: ZERO.
- Genre: online academy-life RPG with social simulation and competitive progression.
- Visual format: hybrid 2D and 2.5D.
- Camera: hybrid — isometric-style free exploration plus cinematic camera framing for story moments and special events.
- Online play is mandatory.
- Real players and active simulated NPCs inhabit the academy.
- The visible interface must look like a video game, not a website.
- The gameplay HUD must remain uncluttered. Secondary features belong in an in-game side menu.
- The academy hierarchy has Classes D, C, B, and A.
- Players begin in Class D. Promotion is challenging; demotion is possible.
- NPC and real-player ranking data must remain distinguishable and fair.

## 3. Core gameplay loop

1. Enter the academy and review the current day, notices, and personal objectives.
2. Explore campus and interact with players, NPCs, and locations.
3. Attend activities such as lessons, clubs, training, and social events.
4. Complete missions, investigations, challenges, and competitions.
5. Receive verified rewards, reputation changes, and progression.
6. Review class standing and personal rankings.
7. Make choices that influence relationships, opportunities, and future events.

The loop must include non-competitive activities so players are not forced to grind rankings constantly.

## 4. Academy structure

Planned locations include:
- Main gate and central courtyard
- Academic buildings and classrooms
- Library and study spaces
- Cafeteria and common areas
- Dormitory areas
- Sports complex and competition venues
- Clubs and activity rooms
- Restricted or discovery-based areas
- A surrounding town for later expansion

Exact map size, travel distances, and unlock schedule are not yet locked.

## 5. School-life systems

Candidate systems for implementation:
- Daily timetable, attendance, lessons, homework, quizzes, and exams
- Clubs, practice, sports, and campus events
- Missions, exploration, secrets, and investigations
- Friendships, rivalries, reputation, and dialogue choices
- Day/night cycle and calendar-based events
- Player customization and progression

These systems must be prioritized by prototype feasibility. The first playable milestone should prove movement, interaction, one social/mission loop, and multiplayer presence before the full academy is built.

## 6. Competition design

Competition families:
- Academic: quizzes, exams, research, team problem-solving
- Athletic: sports and skill-based events
- Strategy: resource, negotiation, deduction, and team objectives
- Exploration: discovery, navigation, and timed objectives

Each competition needs clear rules, eligibility, duration, scoring, anti-cheat validation, and rewards before implementation.

## 7. Class hierarchy

- Class D: starting class.
- Class C: earned through sustained performance.
- Class B: higher expectations and stronger competition.
- Class A: elite class with demanding retention requirements.

Promotion and demotion rules must be published in-game. Avoid arbitrary changes. Use multiple performance dimensions and review windows so one unlucky event does not determine a player's entire standing.

## 8. Online world

The intended experience is online-first:
- Players can encounter one another in shared academy spaces.
- Friends can explore and participate in eligible group activities.
- Scheduled competitions and events can use dedicated match instances.
- NPCs populate the academy and follow server-controlled schedules and goals.
- Persistent player progress is stored on the backend.

The exact population per zone, shard/instance model, and concurrency targets remain open design decisions.

## 9. Interface principles

- Full-screen game presentation.
- No website navbar, dashboard cards, or marketing-page layout inside gameplay.
- Keep only high-value information visible during exploration.
- Put secondary features in a side menu.
- Use readable dialogue, clear interaction prompts, and accessible text sizes.
- Provide touch controls designed for Android; support keyboard/controller input where feasible on web.

## 10. Originality and content boundaries

RANK: ZERO may use broad genre conventions such as academy competition, class hierarchy, and social strategy. It must have original characters, names, storylines, visual assets, dialogue, maps, and game rules. Do not reproduce protected characters, scenes, logos, scripts, or distinctive artwork from existing anime or games.

## 11. Open decisions for Phase 1 review

- Exact camera movement and control scheme
- First playable map and its boundaries
- Player count per shared zone
- Final class promotion/demotion formula
- Competition schedule and scoring
- Story structure and player-character customization
- Launch scope versus post-launch features
- Backend and hosting budget
