# Alien Shockwave: circular expansion with secondary horizontal refraction

The reference was inspected around 0.9, 1.0 and 1.1 seconds, and through recovery. This is an approximation, not the original game's shader. Lightning and yellow flashes are excluded.

## Defaults and controls
Radial expansion = 1.0. A negative radial sampling offset produces an outward visual push. This compact pulse is independent of turbulence direction.
Horizontal turbulence = 1; Vertical turbulence = 0.10. These affect secondary distortion ONLY; radial expansion still moves in all directions. For no Y motion, set BOTH Radial expansion and Vertical turbulence to zero.
Bend spacing = 0.32 image-height units: distance vertically between left/right sways.
Bend width = 0.48: radial support of the outward pulse and secondary bend.
Band width = 0.64: outer traveling mask.
Distortion strength = 0.08; Bend strength = 0.40; Detail strength = 0.075; Front irregularity = 0.015.
Duration = 1100 ms; Travel speed = 1.65 image-height units/second.
Center = (0.70, 0.76), based on the UFO location in the reference.

## Root cause and fix
Shared sampleAt() multiplies displaced out-of-bounds pixels by an inside mask. That creates transparent holes even though the texture sampler uses CLAMP_TO_EDGE. A fixed edge fade does not bound large displacements.
Alien now uses an axis-wise soft displacement limit based on available distance to the boundary, then clamps and samples without clearing alpha.
For a signed displacement delta and distance room to the boundary in that direction:
safeDelta = delta * room / (room + abs(delta) + epsilon)
This cannot overshoot the boundary and approaches it smoothly instead of extending one edge pixel into a long stripe. It compresses deformation near the border as the tradeoff.

This fix is local to Alien. Other effects, particularly dissolve and transparent symbol FX, retain their existing alpha semantics.
Do not force alpha to 1: that would break transparent sprites. An opaque scene stays opaque; originally transparent pixels stay transparent.

## In-game input requirements
Use a composited scene/container INCLUDING its opaque background for screen-wide refraction. Applying this pass only to a transparent foreground cannot reconstruct the background behind it. The black already present in an uploaded image is real source content and is not removed by clamping.
The shader assumes valid input UVs occupy 0..1, as in the playground. If an engine render target uses a sub-rectangle/padding, adapt to its actual valid UV bounds and pixel centers before sampling. Verify this during in-game integration; the browser test is not an in-game test.

## Reference implementation consulted
PixiJS displacement shader clamps the displaced UV to uInputClamp:
https://github.com/pixijs/pixijs/blob/dev/src/filters/defaults/displacement/displacement.frag
PixiJS filter documentation describes transparent/black bleeding from sampling outside the valid input frame:
https://github.com/pixijs/pixijs/wiki/v4-Creating-Filters#bleeding-problem

No third-party effect shader was copied. These sources informed the boundary handling; the horizontal sway and soft limiter are implemented here.
