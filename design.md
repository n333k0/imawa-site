# IMAWA — Design Notes

## Palette
Sampled directly from the official logo lockups in
`1_Work/IMAWA/IMAWA Brand ID+Website/Logos/`:

| Token | Hex | Use |
|---|---|---|
| `--bg` | `#EBEBEB` | Page base (the off-white from *Imawa on Light*) |
| `--bg-2` | `#E3E1DC` | Tinted section bands, placeholder fill |
| `--cream` | `#BAA47B` | Accent — sampled from *Imawa on Gold* |
| `--cream-soft` | `#D6C7A8` | Accent on dark sections |
| `--ink` | `#000000` | Type |
| `--dark` | `#141414` | Inverted process band |

## Type
`Plus Jakarta Sans` (300/400/500/600), carried over from the reference site as instructed
("keep the same fonts for now").

**Available to swap:** IMAWA's own brand fonts sit in
`IMAWA Brand ID+Website/Fonts/` — `LarkenVariable.ttf` and `Zoa-Wassenaar.otf`.
Larken is a much closer match to the wordmark's fine-line, high-contrast character.
Say the word and I'll self-host them and swap the display face.

## Logo
Extracted from `Imawa on Light.png` — cropped to the wordmark bounding box and
alpha-keyed to transparency, so it sits on any background.
- `assets/imawa-logo.png` — black, for light backgrounds
- `assets/imawa-logo-light.png` — `#EBEBEB`, for dark backgrounds

## Structure
Hero → straight into content, per the brief. No full-viewport splash, no scroll-teaser.

**Home:** Hero → Work (6) → Services → Process → About excerpt → Footer
**Work:** Hero → filter row (All / Fiction / Documentary / Commercial) → 10-project grid
**Services:** Hero → 4 services → Process
**About:** Hero → full supplied narrative
**Contact:** Hero → founders → social

## Placeholders
Every image is a striped `.ph` block reading "Image to come" — deliberately obvious,
so nothing ships by accident. Unconfirmed tags use a dashed cream `.tag--todo` chip.
Each affected page carries a visible `.notice` banner listing what is provisional.

## Build
Plain static HTML/CSS/JS. No framework, no build step, no dependencies.
Only external request is the Google Fonts stylesheet.

## Accessibility / responsive
Skip link, `aria-current` on the active nav item, `aria-pressed` on filters,
`aria-expanded` on the mobile menu, focusable skip target, and a
`prefers-reduced-motion` block that disables all transitions and reveals.
Grids use `minmax(min(100%,Npx),1fr)` so nothing overflows horizontally.
