# IMAWA — website

Static marketing site for IMAWA, a music and sound production company.
Plain HTML, CSS and JavaScript. **No framework, no build step, no dependencies.**

| | |
|---|---|
| **Live** | **https://imawamusic.com** — Hostinger |
| Preview | https://imawa-site-n333k0s-projects.vercel.app — updates itself on every push |

If you have this repo, you have everything needed to change the site and put it
back online. Nothing is generated, compiled or fetched at build time.

---

## What is in here

    index.html          the whole landing page: intro, featured film,
                        Selected work, services, contact
    about.html          /about
    brand.html          /brand — the brand toolkit, with downloads
    .htaccess           URL routing on Hostinger. The site breaks without it.
    build-hostinger.sh  builds the zip you upload to Hostinger

    css/style.css       every style, one file, append-only (read CLAUDE.md first)
    js/main.js          one file: lightbox, filters, intro, marquee, slideshow

    media/thumbs/       15 work thumbnails, 1600x900
    media/festivals/    10 festival and award marks
    media/video/        the 3 films hosted here; the other 12 play from YouTube
    assets/logos/       client marks
    assets/favicon/     favicon set
    brand/              logo, social and email-signature exports

    CLAUDE.md           architecture, conventions, and the traps that cost time
    HANDOFF.md          project status and what is still open
    MEDIA-LINKS.md      every piece, its YouTube link, and where its thumb came from

The site is currently **14 pieces** in Selected work plus the featured film, and
**10 festival selections**.

## What is *not* in here

**The source masters.** The original video files are about 3 GB and live outside
the repo, in a folder called `IMAWA-ASSETS`. You only need them to **cut a new
thumbnail out of a film**. Everything else — editing text, reordering work,
adding a YouTube piece, publishing — works from this repo alone.

Ask for a copy of `IMAWA-ASSETS` if you plan to add films whose thumbnails do
not exist yet. Drop it next to this folder, so the two sit side by side:

    1_Coding/
      imawa-site/        <- this repo
      IMAWA-ASSETS/      <- the masters

You will also need **Hostinger hPanel access**, since that is where the live
site is served from.

---

## Run it locally

```bash
python3 -m http.server 8090     # then open http://localhost:8090
```

Any static server works. Do not just double-click `index.html` — opening it as
a `file://` path breaks the absolute paths like `/assets/favicon/...`.

Clean URLs do not work on a plain Python server. `/about` returns 404, and
`/brand` redirects into the `brand/` assets folder and lists it instead of
opening the toolkit page. That is expected: those URLs come from `.htaccess`,
which only Apache and LiteSpeed read. Locally, use `/about.html` and
`/brand.html`, and check the real URLs on the live site after publishing.

---

## Publishing

Two places, and only one of them is automatic.

**1. Push — this updates the preview**

```bash
git add -A
git commit -m "what changed"
git push origin master
```

Vercel rebuilds itself from `master` within a minute. Use it to check your work
or to show someone before it goes live.

**2. Build and upload — this updates the real site**

A push does **not** reach `imawamusic.com`. That upload is manual.

```bash
./build-hostinger.sh            # writes ../imawa-hostinger.zip
```

Then in hPanel, under **Sitios web → imawamusic.com**:

1. **Backups** → take a manual backup before touching anything.
2. **Gestor de archivos** → open `public_html`, and turn on **show hidden
   files** first. `.htaccess` starts with a dot, so otherwise it is invisible
   and you will not notice if it goes missing.
3. Delete what is in there, upload the zip, extract it.
   ⚠️ The extract dialog **makes you name a folder** — it will not unpack loose
   into `public_html`. Extract into `tmp`, then select everything inside
   (hidden files included), move it up to `/public_html`, and delete `tmp` and
   the zip.
4. **Panel → Esenciales → Caché → Limpiar caché.** Skip this and LiteSpeed
   keeps serving the previous version, which looks exactly like a failed upload.

Then open **`imawamusic.com/about`** and **`imawamusic.com/brand`**. Those two
are what break if `.htaccess` did not survive the move — the home page would
still look perfectly fine, so they are the real test.

DNS, SSL and email are not touched by any of this.

---

## Doing it with Claude Code

This repo is set up to be worked on in plain language. Open the folder in
Claude Code and `CLAUDE.md` loads by itself, so it already knows the
architecture and the mistakes to avoid. There is also a skill at
`.claude/skills/work-item/` for the most common job — adding or changing a
piece in the grid.

Write in Spanish or English, whichever you prefer. The prompts below can be
copied as they are.

### Add a video to Selected work

```
Agregá un trabajo nuevo a Selected work:
  título: Nombre del proyecto
  cliente: Nombre del cliente
  categoría: film        (film · documentary · advertising · branding · broadcast)
  YouTube: https://www.youtube.com/watch?v=XXXXXXX
Elegí un buen frame para el thumbnail y mostrámelo antes de dejarlo.
```

If the film is not on YouTube and you have the master in `IMAWA-ASSETS`, say
so and the thumbnail gets cut from the file instead.

### Change a thumbnail

```
El thumbnail de Sumergidos no me gusta. Cambialo por un frame donde se
vea la cara del actor. Mostrame opciones antes de elegir.
```

This builds a contact sheet from the master, looks at it, and cuts the chosen
frame so it fills 1600×900 with no black bars.

### Add a festival selection

```
Agregá un festival más a Festival selections. El archivo es
~/Downloads/nombre.jpg y se llama "Nombre completo del festival".
```

The gallery is a grid of tiles that open a slideshow. A new mark goes into
`media/festivals/` and into the gallery in `index.html`, and the counter next
to "Festival selections & awards" has to match.

### Change text

```
En la sección About, cambiá el segundo párrafo por este texto: "..."
```

```
Cambiá el mail de contacto de hello@imawamusic.com a otro@imawamusic.com
en todo el sitio.
```

### Reorder or remove

```
Mové La Fábrica del Deseo al principio de la grilla.
```

```
Sacá "The Picture of Christmas" de Selected work.
```

### Publish

```
Subí los cambios: push a master, y después armá el zip para Hostinger.
```

The upload itself cannot be done for you — that step needs your hPanel login,
and credentials should never be pasted into a chat. The zip gets built and you
are told exactly what to do with it.

---

## Things that will bite you

Full detail is in `CLAUDE.md`. The short version:

- **`css/style.css` is append-only.** It grew by adding dated blocks at the end
  rather than editing earlier rules, and later rules win. Never assume the rule
  you found is the one in effect — search for every occurrence of a selector
  before changing it.
- **`.htaccess` is load-bearing.** It is what makes `/about` and `/brand` work,
  and it has to be both in the zip and in `public_html`. `build-hostinger.sh`
  refuses to build without it.
- **Video autoplay only works muted.** Unmuting without the browser's consent
  does not fail quietly — it pauses the video.
- **Thumbnails must fill 1600×900.** Several masters have black bars baked in,
  so frames are cropped to cover rather than scaled to fit.
- **Clear the LiteSpeed cache after every upload**, or you will be looking at
  the old site while debugging a deploy that actually worked.

## Still open

Tracked in `HANDOFF.md`:

- The email signatures all point at `hello@imawamusic.com`; the individual
  addresses were never confirmed.
- *Torneos — Cierren Los Ojos* is 1.4 GB and cannot be hosted as-is. It needs a
  YouTube upload or a short cut.
- Mobile was never seen rendered during the build — the browser would not drop
  its viewport far enough. Now that the site is live, it is worth opening on a
  real phone.
