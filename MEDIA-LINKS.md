# IMAWA — Media inventory

Every piece in *Selected work*, where its thumbnail comes from, and how it plays.
Thumbnails were extracted with `ffmpeg` from the source files in `PARA WEB` / `PARA WEB 2`.

## Plays from YouTube (12)

| # | Work | Category | YouTube |
|---|------|----------|---------|
| 1 | **DSports Messi** (featured block, above the grid) | TV Broadcast | https://www.youtube.com/watch?v=ZChYJSojy2I |
| 2 | DSports — FIFA Club World Cup | TV Opening | https://www.youtube.com/watch?v=Z5FRjGryrbg |
| 3 | DSports ID | Audio Branding | https://www.youtube.com/watch?v=RE9K9yMM0rM |
| 4 | Torneos — Copa Argentina | Audio Branding | https://www.youtube.com/watch?v=ahk0vo3jMoA |
| 5 | DirecTV Despampanante | Advertising | https://www.youtube.com/watch?v=cel3TVgmxgU |
| 6 | DGO / DirecTV / DSports — Locos | Advertising | https://www.youtube.com/watch?v=OkRHaE498dk |
| 7 | Pensamiento Lateral | Feature Film | https://www.youtube.com/watch?v=pWx0JCC5JpU |
| 8 | The Picture of Christmas | Film Scoring | https://www.youtube.com/watch?v=lc0XmNuHwxA |
| 9 | Made for You, With Love | Film Scoring | https://www.youtube.com/watch?v=mQRmROvIq9k |
| 10 | Sumergidos | TV Series | https://www.youtube.com/watch?v=Y4rCLxl-Mi4 |
| 11 | Cierren Los Ojos | Documentary | https://www.youtube.com/watch?v=jg7Qz6Mv8ro |
| 12 | La Fábrica del Deseo | Feature Film | https://www.youtube.com/watch?v=Rf1CD9z_hj4 |

Embedded via `youtube-nocookie.com`, autoplay on open. Clearing the lightbox stops playback.

## Plays from a self-hosted file (3)

Re-encoded for web (h264, max 1280px wide, CRF 25, faststart).

| Work | Category | File | Source size → web |
|------|----------|------|-------------------|
| Argentina vs. Suiza | TV Broadcast | `media/video/argentina-suiza.mp4` | 63 MB → 17 MB |
| DSports News | TV Opening | `media/video/dsports-news.mp4` | 14 MB → 1 MB |
| DSports FIFA World Cup | Audio Branding | `media/video/fifa-world-cup.mp4` | 1 MB → <1 MB |

## Not on the site — needs a decision

**`Torneos - Cierren Los Ojos # Documentary.mov`** — 1467 MB, 31 min, 1080p.

This is the full documentary, not a trailer. It cannot be web-hosted: GitHub rejects files
over 100 MB, and a 31-minute master is not a portfolio asset. The same title is already on
the site through its official YouTube trailer (row 11 above), so nothing is missing from the
grid — but if this specific Torneos cut should appear, the options are:

1. Upload it to YouTube and send the link (best — matches the other 11).
2. Supply a trailer-length cut and it gets self-hosted like the other three.

## Festival material

Nine festival and award marks open together, scrolling, from the strip under
the work grid: Mar del Plata, Promax Awards (two marks), Poke, Bafici, Martín
Fierro Latino, Moscow, Cuba and México.

Web copies are in `media/festivals/`, capped at 720px. Masters and the full
mapping are in `../IMAWA-ASSETS/festivals/`.

The earlier Mar del Plata banner is no longer placed on the site.

Note: the banner file was referred to as "the DirecTV banner", but it is the
**40º Festival Internacional de Cine de Mar del Plata** banner.

## Client logos

`directv` · `dgo` · `dsports` · `torneos` · `waiken` — rebuilt in `#EBEBEB` for the dark
theme. They were previously pure black on a black ground, which is why they looked absent.
