# Cinematic 3D-Scroll Portfolio

Ink-black, emerald accent, cream type. Lenis smooth scroll + GSAP ScrollTrigger +
Three.js. The hero is a scroll-scrubbed 360° orbit around a rim-lit 3D figure.

## Run it

```
node server.js        # → http://localhost:4517
```

## Swapping in your real Seedance clips

The hero currently renders a 3D stand-in figure (black-void studio, emerald rim
light, arms crossed) because no Higgsfield MCP was connected and no reference
photo was provided. The scrubber is already built for real footage:

1. Generate the three clips on Higgsfield (Seedance 2.0, std, 1080p, 16:9, ~8s),
   passing your uploaded photo as identity reference on every generation:
   - HERO ORBIT — slow 360° camera orbit, arms crossed, emerald rim light
   - THE BUILDER — desk + floating holographic screens, slow push-in
   - THE CLOSER — walk toward camera down a glowing gallery
2. Convert the HERO ORBIT clip to frames:
   ```
   ffmpeg -i hero-orbit.mp4 -vf "fps=30,scale=1600:-1" assets/frames/hero/%04d.webp
   ```
3. Create `assets/frames/hero/manifest.json`:
   ```json
   { "count": 240, "ext": "webp" }
   ```
   (`count` = number of frames ffmpeg produced.)
4. Reload — the frame scrubber takes over automatically; the 3D stand-in is the
   fallback whenever no manifest exists.

Clips 2 and 3 can be added as background `<video>` layers in the PILLARS and
WORK sections (`.pillars-stage` / `.work`) — currently styled with holographic
CSS panels and a gallery treatment so the sections work without footage.

## Editing your numbers & copy

- Stats strip: `CONFIG.stats` at the top of `js/main.js`
- Name / subtitle / pillars / work cards / CTA: `index.html`
- Social links: footer of `index.html` (currently `#` placeholders)
- Colors & fonts: CSS variables at the top of `css/style.css`
