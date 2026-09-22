# IMAWA site — handoff

## Where things are

| | |
|---|---|
| Live | https://imawa-site-n333k0s-projects.vercel.app |
| Repo | `github.com/n333k0/imawa-site` (private) |
| Code | `~/Documents/1_Coding/imawa-site` |
| Masters | `~/Documents/1_Coding/IMAWA-ASSETS` — 3 GB, outside the repo |
| Backups | tags `v1-backup`, `v2-backup`, plus sibling `-BACKUP-v1/v2` folders |

Deploying is `git push origin master`. Vercel does the rest. Nothing to build.

## Working on it with Claude Code

Open the project folder and `CLAUDE.md` is read automatically — architecture,
conventions, and the traps that have already cost time. There is a skill at
`.claude/skills/work-item/` for the most common job: adding a piece to the
grid, swapping a thumbnail, or re-cutting a frame.

Ask in plain language. "Swap the Sumergidos thumbnail for a shot of the
actor's face" is enough; the skill covers finding the frame and cutting it so
it fills without black bars.

## What the site is

One scrolling page, plus `/about`.

The intro opens on the mark, which rises into the nav bar as you scroll while
the headline takes its place and the featured film appears underneath. Then
Selected work — 13 pieces, filterable, two or three across. Then services,
then contact.

The featured film plays inline, muted, and hands its audio to the lightbox
when a piece is opened. Eleven pieces play from YouTube, three from files in
`media/video/`.

## Open

**Torneos - Cierren Los Ojos.** In `_no-web/`. Needs a YouTube upload or a
short cut before it can appear.

**Sound on desktop.** Chrome will not start audio for a visitor who has not
interacted with the page — measured, not assumed: `userActivation.hasBeenActive`
reads false in that case. The small control under the film is the only way
round it. On phones sound usually starts on its own, and the control hides
when it does.

**Mobile was never seen rendered.** Chrome would not drop the viewport below
about 1790px for the whole build, so every mobile decision was reasoned from
measurements rather than observation. Worth a pass on a real phone.
