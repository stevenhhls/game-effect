# Shader FX TypeScript integration

Alien Shockwave combines Radial expansion (1.0) with secondary Bend strength (0.40) and Detail strength (0.075). Horizontal / Vertical turbulence (1 / 0.10) affect ONLY the secondary distortion, never the circular pulse. Setting Vertical turbulence to zero does not disable radial Y motion; also set Radial expansion to zero for purely horizontal motion. Band width is 0.64, Bend width 0.48 and master Distortion strength 0.08. Safe boundary sampling and source alpha are preserved. For screen-wide distortion, apply to the composited scene INCLUDING its opaque background; a transparent foreground alone cannot supply the missing background. Valid input UV bounds must match the engine render target (the playground uses 0..1). This does not remove black pixels already contained in the source image.

Copy src/core, src/effects and src/engine into your game, preserving their relative paths. These are actual TypeScript sources, not a browser-only shader export. They require your existing engine-api package. No runtime npm dependency is added.

The supplied example.ts contains the selected effect and the exact parameter snapshot at download time. Call startPreviewEffect(target), retain its returned handle and call handle.stop() BEFORE destroying the target or exiting the scene. A dissolve holds its final frame until stopped. Stop removes only this pass, preserving unrelated passes.

Use pass.configure({...}) for live settings; pass.progress is normalized 0..1. Call pass.update() after modifying progress/aspect manually. playEffect handles duration (milliseconds), aspect and progress. Easing: 0 linear, 1 sine-out, 2 sine-in-out. Do not apply a second easing to the timeline.

Reuse pass instances for frequent landing effects, never play concurrent controllers on the same instance, and stop the previous controller before replay. ShaderPass's public API does not expose a disposal method; use your engine's resource lifecycle policy.

Preview and engine share GLSL strings, settings normalization and per-frame uniform calculations. The standalone browser uses WebGL only as a preview host. GLSL is embedded inside TypeScript, just like an engine ShaderPass.

Verify in-game render-target UV orientation, padding, aspect, premultiplied-alpha convention and clipping. The browser preview is not a guarantee of identical engine compositing. Glow is a single-pass emissive edge, not a multi-pass bloom. Frame energy follows a procedural inset rectangle, not an artist-authored mask/path. Uploaded images remain local and are not included in the code archive.

Ripple variants use ringThickness (full radial support width), ringSpacing (center-to-center distance), and integer ringCount (1..12). Each ring uses a compact smooth slope profile; thickness does not change its center or emit extra rings. Rings emerge from the center as the front expands. Large thickness can cause overlap; a short end radius or clipping can hide inner/outer rings. Duration controls playback time; radiusEnd controls travel range; amplitude controls displacement. Legacy waveWidth, frequency and natural wake settings are replaced by these new controls.

## Alien A/B/C comparison

The previous AlienShockwaveShaderPass is unchanged. Three additional classes isolate the layers:

- AlienRadialShaderPass (A): one signed radial wave with paired compression and stretch.
- AlienBroadRefractionShaderPass (B): A plus a large-scale analytic noise-gradient refraction.
- AlienDetailedRefractionShaderPass (C): B plus a finer gradient layer.

All three use the same radial defaults. Broad refraction = 0 makes B match A; Detail refraction = 0 makes C match B. The playground synchronizes common parameters and retains hidden B/C layer settings when switching. Switching A/B/C preserves the image, pause state and playhead. Reset A/B/C preset resets the entire comparison group. Other effects retain their independent settings.

Wave width is the full support of one paired wave, in image-height units. It does not increase the ring count. Master strength scales all active layers. Radial strength controls the circular push/pull; Broad bend size controls feature scale, independently from Broad refraction strength. Horizontal/Vertical bias affect refraction only. Duration and Travel speed jointly determine travel distance; lower speed for slower expansion. A uses no noise evaluations, B one, C two, with one scene sample per affected pixel.

Boundary limiting is inactive in the interior and smoothly limits only samples approaching an image edge. It cannot reconstruct backgrounds absent from a transparent input or remove black pixels already present in it. These are comparison candidates, not a verified replica of the reference game.

## Third-party code

PSRDnoise by Stefan Gustavson and Ian McEwan (MIT) is retained in src/core/psrdnoise.ts. The bipolar radial wave profile is adapted from PixiJS Filters ShockwaveFilter (MIT). Full attribution and license text are retained in those source files and THIRD_PARTY_NOTICES.txt. No third-party runtime package is required.
