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

Two targets, and they are not the same thing.

**Production is Hostinger, and it is a manual upload.** `imawamusic.com` is
served as plain files out of `public_html` on the client's Hostinger plan. A
`git push` does **not** reach it.

    ./build-hostinger.sh          # writes ../imawa-hostinger.zip

Then, in hPanel under Sitios web -> imawamusic.com:

1. Backups -> take a manual backup first.
2. Gestor de archivos -> `public_html` -> turn on **show hidden files**, or
   `.htaccess` will be invisible and you will not notice it is missing.
3. Delete what is there, upload the zip, extract it.
   The extract dialog **forces a folder name** - it will not unpack loose into
   `public_html`. Extract into `tmp/`, then select all (hidden files included)
   and move it up to `/public_html`, then delete `tmp/` and the zip.
4. Panel -> Esenciales -> Caché -> **Limpiar caché**. LiteSpeed will keep
   serving the old pages otherwise, and it looks exactly like a failed upload.

**Vercel is the preview** the client is shown, and it still deploys itself from
`master`:

    git add -A && git commit -m "..." && git push origin master

So the habit is: push, check it on Vercel, and only then build the zip and
upload. The repo stays the source of truth for both.

Verify against the real host, not localhost — `curl` the served CSS or JS and
grep for what you changed. A local server proves nothing about a deploy.

## .htaccess carries the routing

`vercel.json` (`cleanUrls`, `trailingSlash:false`) only works on Vercel.
On Hostinger the same job is done by `.htaccess`, and **the site is broken
without it**: the nav links to `/about` with no extension.

Two things in there are load-bearing and easy to break:

- `AddOutputFilterByType` comes from **mod_filter**, not mod_deflate. Guarding
  it with `<IfModule mod_deflate.c>` 500s the entire site on any host where
  mod_filter is absent.
- `brand.html` and the `brand/` assets folder share a name. Apache would
  redirect `/brand` to `/brand/` and serve the folder, so `DirectorySlash Off`
  is set and the rewrite deliberately has no `!-d` test — the page has to win
  over the directory, which is what Vercel did.

Both were found by running a local Apache against the built zip, which is the
only way to test this. Hostinger runs LiteSpeed rather than Apache; it reads
`.htaccess` with high compatibility but it is not identical, so after any
change to it, open `/about` and `/brand` on the live domain.

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
