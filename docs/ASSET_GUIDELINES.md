# RANK: ZERO — Art and Asset Guidelines

**Status:** Visual direction draft

## 1. Art direction

- Original anime-inspired academy aesthetic.
- Hybrid 2D character presentation and 2.5D/isometric environments.
- Cinematic lighting for story scenes and major events.
- Elegant, prestigious academy architecture with a mix of modern and classical design.
- Consistent character proportions, line weight, palettes, and material treatment.

## 2. Interface direction

- Must read as a video game interface, not a website.
- Minimal gameplay HUD with strong information hierarchy.
- Keep secondary systems inside a compact side menu.
- Use clear, legible typography and restrained decorative effects.
- Dialogue boxes must have enough space; never crowd character dialogue.
- Touch targets must be comfortable on mobile.

## 3. Asset categories

```text
assets/
├── characters/
│   ├── player/
│   ├── students/
│   ├── staff/
│   └── portraits/
├── environments/
│   ├── academy/
│   ├── classrooms/
│   ├── dormitory/
│   ├── sports/
│   └── town/
├── backgrounds/
│   ├── dialogue/
│   └── cinematic/
├── animations/
│   ├── character/
│   ├── environment/
│   └── ui/
├── audio/
│   ├── music/
│   ├── ambience/
│   └── sfx/
└── ui/
    ├── icons/
    ├── hud/
    ├── menus/
    └── dialogue/
```

## 4. Character asset requirements

Each major character should have:
- Approved character sheet
- Front/side/back views where needed
- Consistent outfit and accessory references
- Expression set for dialogue
- Required movement/action animation list
- Portrait and in-world sprite variants
- Stable naming and versioning

NPCs should have visual variety without breaking the shared art style.

## 5. Environment asset requirements

Each environment should specify:
- Camera angle and perspective
- Walkable area and collision boundaries
- Entrances/exits
- Interactive objects
- Lighting/time-of-day variants
- Mobile performance budget
- Layering and occlusion rules

## 6. AI-generated asset pipeline

AI-generated images may be used as concept art and production assets only after review:
1. Write a specific asset brief.
2. Generate a consistent reference set.
3. Check anatomy, perspective, text artifacts, and continuity.
4. Approve a canonical reference.
5. Create required variations and animation frames.
6. Optimize/export to game-ready formats.
7. Record source, license/usage terms, dimensions, and version.

Do not assume a single static generated image provides a working animation, sprite sheet, collision map, or interactive game object. Those require additional production work.

## 7. Technical metadata

Every production asset should record:
- Asset ID and filename
- Category and intended scene
- Pixel dimensions and format
- Transparency requirement
- Animation frame count and frame rate, if applicable
- Pivot/anchor and collision metadata, if applicable
- Source and usage rights
- Version and approval status

## 8. Originality

Create original academy emblems, uniforms, characters, dialogue portraits, locations, and UI. Do not copy existing anime/game characters, logos, costumes, scenes, or distinctive artwork.
