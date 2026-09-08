# Water ripple playground

From this standalone directory, run:

```sh
node server.cjs
```

Open http://127.0.0.1:4178. Stop with Ctrl+C. Set `RIPPLE_PORT` to use a different port.

No dependencies or game checkout are required. Original and Natural shaders are bundled as standalone GLSL files. Refresh the page after editing a shader.

- Sliders update immediately; number inputs apply on Enter or blur.
- Switching Model loads that model's preset values. Original restores amplitude 0.12, waveWidth 0.08 and frequency 90; Natural restores its own values and controls.
- Click the image to place the ripple centre; pause or scrub to inspect a frame.
- Upload a game screenshot for a more representative background. The browser reads it locally.
- Copy or download the settings as JSON. Natural mode requires integrating natural.frag and the extra uniforms before applying settings in a host game.
- The baseline matches the UI test settings at creation: duration 650, amplitude 0.12, radiusEnd 1.2, waveWidth 0.08, frequency 90, SINUSOIDAL_OUT.
- Natural defaults: duration 1500, amplitude 0.035, waveWidth 0.15, frequency 65, LINEAR, damping 1.5, fadePower 1.4, wake 0.35, edgeFade 0.04.
- Slow & bold uses duration 1800, amplitude 0.055 (Natural) or 0.16 (Original), width 0.16.

The preview applies one shader pass to one image. Host applications may apply passes to separate layers. Original mode couples radius and amplitude easing. Natural mode uses radiusEnd * ease(progress) for radius, constant input amplitude, and an independent fade envelope in the shader. Supply progress in [0,1], aspect = width / height, and normalized center coordinates. Positive width and fadePower are required. Additional uniforms: u_Progress, u_Damping, u_FadePower, u_Wake, u_EdgeFade. See frame() in index.html for exact uniform mapping.

Natural mode is an artistic approximation, not a physical fluid solver. It uses an analytical height derivative, two wave packets, distance attenuation and edge protection. Research reference: https://developer.nvidia.com/gpugems/gpugems/part-i-natural-effects/chapter-1-effective-water-simulation-physical-models . The GLSL implementation is original; no third-party code was copied.
