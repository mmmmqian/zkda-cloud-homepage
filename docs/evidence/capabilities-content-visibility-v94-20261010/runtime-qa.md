# CAPABILITIES content visibility V94 runtime QA

Date: 2026-10-10

## Root cause

Desktop/tablet CSS coupled body visibility to the discrete `.is-active` class while card position remained continuously driven by progress-v79. Non-active bodies used `visibility: hidden`, `opacity: 0`, and a delayed 280ms opacity transition. A card could therefore occupy its expanded position while its description and icon were still hidden.

## Change

Removed the active-index visibility gate and delayed opacity transition. Every body now retains its normal `display: grid`, `visibility: visible`, and `opacity: 1`. Existing card/layer overflow continues to provide the natural occlusion when only a collapsed title strip is exposed.

No JavaScript, progress mapping, stage geometry, card height, color, or z-index rule changed.

## Runtime checks

- Before at 1280×800: Card 01 body was visible; Cards 02–06 reported `opacity: 0`, `visibility: hidden`.
- After at 1280×800: all six bodies report `opacity: 1`, `visibility: visible`; active Card 05 visibly shows description and icon.
- 1600×900: all six bodies remain visible; equal card height remains 457px.
- 1024×768: all six bodies remain visible; equal card height remains 325px.
- Reverse Card 05→04: content remains visible while the active index changes.
- Forward Card 04→05→06: each current card retains its body.
- Card 06 release: its body stays visible while the complete card moves upward.
- Resize 1280→1600→1024 preserves the current state and body visibility.

## Preserved motion contract

- `scrollStep = 1.05 × stageHeight`.
- Six equal-height cards.
- Existing 0–50% read / 50–100% takeover mapping.
- Existing Fullscreen Stage and minimum-height protection.
- No CSS transition was added or restored.
- No scroll snap or wheel interception.

