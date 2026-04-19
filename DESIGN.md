# Design Brief

## Direction

Ghar Runner — A warm, playful home-themed runner game with a cozy interior hallway aesthetic and vibrant cartoon visual style.

## Tone

Joyful, toy-like, and welcoming — prioritizing warmth and accessibility over minimalism, with rounded forms and a golden-coral accent palette that feels like home.

## Differentiation

The game's color palette and UI overlays reflect Indian home aesthetics — warm cream backgrounds, golden accents, and mint-green interactive elements create a unique, non-generic game experience.

## Color Palette

| Token      | OKLCH        | Role                             |
| ---------- | ------------ | -------------------------------- |
| background | 0.97 0.02 75 | Warm cream primary surface       |
| foreground | 0.2 0.04 25  | Dark brown text                  |
| primary    | 0.65 0.18 45 | Golden-orange main UI accents    |
| secondary  | 0.55 0.21 25 | Warm red for energy/alerts       |
| accent     | 0.62 0.24 142| Mint green for interactive focus |
| muted      | 0.93 0.02 75 | Light cream backgrounds          |

## Typography

- Display: Space Grotesk — Game titles, score, main UI labels. Geometric and playful personality.
- Body: Nunito — Score display, instructions, button labels. Friendly and approachable.
- Scale: Hero 4xl, h2 2xl, label lg, body base

## Elevation & Depth

Card-based UI layers with soft shadows (8–24px blur) for game HUD and overlays. Dark mode uses deeper card backgrounds (0.2 OKLCH L) to maintain contrast while preserving warmth.

## Structural Zones

| Zone      | Background      | Border                | Notes                                  |
| --------- | --------------- | --------------------- | -------------------------------------- |
| Game View | 0.97 0.02 75    | None (full viewport)  | 3D hallway rendering via Three.js     |
| Score HUD | oklch(var(--card)) | rounded-2xl           | Top-right badge with primary accent   |
| UI Overlay| oklch(var(--card)) | rounded-2xl + shadow  | Start/end screens with gradient base  |
| Buttons   | oklch(var(--primary)) | rounded-full         | Golden/coral primary, mint secondary  |

## Spacing & Rhythm

12px–32px gaps between UI sections; 16px padding for card content. Micro-spacing (4–8px) within labels and buttons. Game HUD elements float 16px from edges.

## Component Patterns

- Buttons: rounded-full, primary golden-orange with white text. Secondary mint green. Hover scales ×1.05.
- Badges: rounded-2xl, small padding (8–12px), single-line text. Score badge shows primary color.
- Cards: rounded-2xl, soft shadow-game-ui, warm backgrounds, no borders.
- Coin Counter: floating animation, pulse-soft effect, primary icon color.

## Motion

- Entrance: Badges fade-in + slide-up over 0.3s ease-out.
- Hover: Button scales ×1.05 with transition-smooth.
- Decorative: Coins pulse-soft (2s); score counter floats (3s).
- Game: Character runs, obstacles move, coins collect with visual feedback.

## Constraints

- All UI colors use token system (no arbitrary hex/rgb).
- Game HUD must maintain 4:1 contrast minimum for accessibility.
- Rounded corners: 24px for cards, 32px for buttons, 16px for secondary elements.
- No dark backgrounds in light mode; no harsh white in dark mode.

## Signature Detail

Golden-coral accent paired with mint-green interactive focus creates a warm, distinctive, non-generic game UI palette that feels uniquely rooted in home aesthetics — the warm/cool balance replaces conventional tech blue with home-inspired warmth.
