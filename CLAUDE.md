# IMAWA — site

Static marketing site for IMAWA, a music and sound production company.
Plain HTML, CSS and JS. No framework, no build step, no dependencies.

## Layout

    index.html      the whole landing: intro, featured film, work, services, contact
    about.html      the only separate page
    css/style.css   every style, one file, append-only (see below)
    js/main.js      one IIFE, sectioned by comment banners
    media/thumbs/   14 work thumbnails, 1600x900
    media/video/    3 self-hosted films; the rest play from YouTube
    assets/logos/   client marks, light on transparent
    MEDIA-LINKS.md  every film, its YouTube link and where its thumbnail came from

Source masters are **not** in this repo. They live in `../IMAWA-ASSETS/`,
organised by category, with a manifest in its README.

## Deploying

Push to `master`. Vercel builds from the repo and there is nothing else to run.

    git add -A && git commit -m "..." && git push origin master

Live at https://imawa-site-n333k0s-projects.vercel.app

Verify against production, not localhost — `curl` the served CSS or JS and grep
for what you changed. A local server proves nothing about the deploy.

## The stylesheet is append-only

`css/style.css` has grown by appending dated blocks rather than editing earlier
rules. Later rules win by source order. **Do not assume a rule you find is the
one in effect** — grep for every occurrence of a selector before changing it.

Two bugs came from ignoring this:
- A media query lost to a later top-level rule, because media queries add no
  specificity. Overrides must come last in the file.
- `.reel__sound` lost to `.reel__frame .reel__sound`, one class against two, so
  an element stretched across half the frame.

When in doubt, check what actually applies in the browser via the CSSOM rather
than reading the file.

## Things that will bite you

**Autoplay.** Browsers only start video muted. Unmuting without the browser's
consent does not fail quietly — it *pauses* the video. The player starts muted,
and sound is applied only after the player reports it is playing, and only if
`navigator.userActivation.hasBeenActive`. A refusal is remembered so the two
state handlers cannot chase each other.

**The YouTube player.** Commands go through the IFrame API, never a raw
`postMessage` at the iframe. The iframe's `load` event fires long before the
player listens, so commands sent then are silently lost.

**Reduce Motion.** The intro keeps its structure and sequence in that mode and
only drops the travel and scaling. Check both states after touching the intro.

**Thumbnails must fill.** Several masters have black bars baked in. Extraction
runs `cropdetect` then scales to cover 1600x900. `cropdetect` needs `-v info`;
at `-v error` its report is suppressed and it silently finds nothing. It also
misreads an intentionally dark set as letterbox — skip it for those.

**The intro's peek.** How much of the film shows under the intro is set by the
film's negative `margin-top`, not by the panel height. Shortening the panel
moves the centred content up instead.

## Conventions

- Comments explain *why*, especially where a fix is not obvious.
- Every work item is a `.card` with `data-cat`, and either `data-yt` or
  `data-file`. The lightbox reads those attributes; nothing else wires it up.
- Grid views use explicit column counts. `auto-fill` once made "Two up" render
  three columns.
