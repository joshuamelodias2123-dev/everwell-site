# Everwell — Therapeutic Massage

A single-page marketing site for Everwell Therapeutic Massage (Regina, SK) — deep-tissue and cupping therapy with Roland C. Suarez, RMT.

Static site: HTML + CSS + a little vanilla JS. No build step, no dependencies.

## Run locally

Open `index.html` in a browser, or serve the folder:

```bash
python -m http.server 5050
# then visit http://localhost:5050
```

## Files

- `index.html` — page markup
- `styles.css` — all styling (responsive)
- `script.js` — booking widget interactivity + nav scroll highlight

## Notes

- Photos are styled placeholders — swap the `.photo` blocks for real `<img>` tags.
- The booking form is front-end only (shows a confirmation message). Wire it to a scheduler (Jane, Acuity, etc.) or a form endpoint to make it live.
