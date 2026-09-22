---
name: work-item
description: Add, replace or re-cut a piece in IMAWA's Selected work grid — a new film, a different thumbnail frame, or a changed title or category. Use when asked to add a project, swap a thumbnail, pick a better frame, or change what a card links to.
---

# Work items

Every piece in the grid is one `<article class="card">` in `index.html`, plus a
1600x900 thumbnail in `media/thumbs/`. Masters live in `../IMAWA-ASSETS/video/`.

## Re-cutting a thumbnail

Never guess a timestamp. Build a contact sheet, look at it, then cut.

    # 16 frames across the film, labelled with their timestamps
    ffmpeg -v error -ss <t> -i "<master>" -frames:v 1 -update 1 \
      -vf "scale=420:-2" -q:v 4 /tmp/sheet_<n>.jpg -y

Assemble them into a grid with timestamps drawn on, view it, choose, then cut
the real frame:

    crop=$(ffmpeg -hide_banner -ss <t> -i "<master>" -t 2 \
           -vf "cropdetect=24:2:0" -f null - 2>&1 \
           | grep -oE 'crop=[0-9]+:[0-9]+:[0-9]+:[0-9]+' | tail -1)
    ffmpeg -v error -ss <t> -i "<master>" -frames:v 1 -update 1 \
      -vf "$crop,scale=1600:900:force_original_aspect_ratio=increase,crop=1600:900" \
      -q:v 4 media/thumbs/<slug>.jpg -y

`cropdetect` must run at info level — `-v error` hides its report and it finds
nothing. Skip it when the subject is lit against a dark set, or it will read the
darkness as letterbox and crop to the subject's face.

Then confirm no black bars survived: scan each edge for rows and columns that
are uniformly under about 22 luminance. Every thumbnail must fill the frame.

Prefer frames without burnt-in subtitles — several trailers carry them.

## Adding a piece

Add the card to the grid in `index.html`, in the order the grid should read:

    <article class="card" data-cat="broadcast">
      <div class="card__media">
        <img src="media/thumbs/<slug>.jpg" alt="<Title>" loading="lazy"
             width="1600" height="900">
        <span class="card__play" aria-hidden="true"></span>
        <div class="card__ov">
          <h3><Title></h3>
          <ul class="tags"><li class="tag"><Tag></li></ul>
        </div>
      </div>
    </article>

Categories in use: `broadcast`, `branding`, `advertising`, `film`,
`documentary`. Adding a new one means adding its chip to the filter row too.

Playback is either `data-yt="<id>"` on the card, or `data-file="media/video/
<name>.mp4"`. Nothing else is needed — the lightbox reads the attribute.

Self-hosted films must be re-encoded for the web and stay well under 100MB,
which is GitHub's per-file limit:

    ffmpeg -i "<master>" -vf "scale='min(1280,iw)':-2" \
      -c:v libx264 -preset slow -crf 25 -pix_fmt yuv420p \
      -c:a aac -b:a 128k -movflags +faststart media/video/<name>.mp4

Record the piece in `MEDIA-LINKS.md`: its link or file, and the frame the
thumbnail came from.

## Before saying it is done

Check the served files, not local ones:

    curl -sL https://imawa-site-n333k0s-projects.vercel.app/ | grep -c '<slug>'

and confirm the thumbnail returns 200.
