# Shader FX Studio

Independent English-language TypeScript playground for six FX families:
- Ripple / shockwave (Original, Natural, legacy Alien and three Alien A/B/C comparison variants)
- Heat haze / wobble
- Shine sweep
- Dissolve / reveal with glowing edge
- Frame energy pulse
- Vortex

## Run

```powershell
node C:\hsq\company\library\ripple-playground\server.cjs
```

Open http://127.0.0.1:4178/. Restart an older server after updating this tool. If the port is occupied, stop your old server with Ctrl+C, or set `$env:RIPPLE_PORT=4179` before starting.

Built browser files are included, so running requires only Node. To edit TypeScript, run `npm install` then `npm run build`. The optional FX_TYPESCRIPT environment variable may point to an existing typescript/bin/tsc compiler.

## Publish with GitHub Pages

The browser app is fully static. `server.cjs` is only a convenient local preview server and is not used by GitHub Pages.

1. Create a GitHub repository and push this project to its `main`, `master`, or `develop` branch.
2. In the repository, open **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Open the **Actions** tab. The `Deploy Shader FX Studio to GitHub Pages` workflow builds and publishes the site automatically after each push.

The public URL will normally be `https://YOUR-USER.github.io/YOUR-REPOSITORY/`. The site uses relative asset URLs, so both that repository URL and the local `http://127.0.0.1:4178/` URL work.

To reproduce the deploy artifact locally, install dependencies and run `npm run build`. The ready-to-publish files are written to `_site/`.

## Review workflow

The preview always uses the bundled UFO.png reference image and starts with Alien B. Adjust English sliders or numeric inputs, pause/scrub and compare Original/FX. Non-comparison effects keep independent settings in localStorage.

Download TypeScript code now generates the selected standalone ShaderPass directly in the browser, with the current parameter snapshot. No /api/sources request is needed for downloads.

Alien B includes one file under copy-to-game/src/utils/services/screenEffectService/effects/alienBroadRefraction: AlienBroadRefractionShaderPass.ts, containing ALIEN_BROAD_REFRACTION_PRESET and ScreenAlienBroadRefractionOptions. It also includes a GameScreenEffectService patch, usage guide, manifest, JSON preset and MIT notices. Copy the source file into the game. For services based on commit 813501db75c72190b66256c44c47cdad24850b33, check and apply the patch. If playAlienBroadRefraction already exists, update old preset imports to AlienBroadRefractionShaderPass, skip the patch and copy only the generated ShaderPass file to update the tuning.

Call this._screenEffectService.playAlienBroadRefraction(globalCenter, scope, optionalOverrides). The service computes local center and aspect; exported preview centers do not override game coordinates. stopAlienBroadRefraction, target deregistration and service disposal clean up playback. Same-kind playback replaces the previous pass on each target; ripple can coexist.

Other effects export standalone ShaderPass files; named service APIs are currently supplied only for Alien B. UFO.png is excluded from code downloads.

### Alien A/B/C

A isolates the bipolar circular wave. B adds broad gradient refraction. C adds fine creases. Their common parameters are synchronized; switching A/B/C keeps the image, time and paused/playing state. Pause or scrub before switching for a same-frame comparison. Reset A/B/C preset resets all three together. Broad refraction = 0 makes B match A; Detail refraction = 0 makes C match B.

Start with the defaults, then compare A/B/C using the same image. Adjust Wave width for a broader paired wave, Radial strength for the circular push/pull, Broad bend size for bigger folds, and Broad refraction for stronger folds. Duration and Travel speed both affect total travel. Original Alien remains available unchanged.

Direct comparison link: /#alien-b. GPU regression page: /tests/alien-study-gpu.html (restart a server launched before this update to enable the test route). This page checks real WebGL compilation, safe boundary sampling, transparency, radial propagation and disabled-layer equivalence.

The bucket-of-bonus-bass-2 game service has been extended with the Alien B API; its Spin-button test entry calls that API. ENGINE_README.md describes the older shared-source adapters retained in this repository; the README inside each new download describes the standalone integration. Tests: npm test after building.
