import { parameter, timing } from '../core/types.js';
import { fragment } from '../core/glsl.js';
const parameters = [...timing,
    parameter("amplitude", "Amplitude", 0, 0.12, 0.002, 0.025, "Distortion strength."),
    parameter("scale", "Noise scale", 1, 30, 0.5, 9, "Higher = smaller turbulent patches."),
    parameter("speed", "Flow speed", 0, 5, 0.1, 1.2, "Noise movement per second."),
    parameter("wobble", "Broad wobble", 0, 1, 0.05, 0.3, "Smooth low-frequency motion."),
    parameter("seed", "Noise seed", 0, 100, 1, 7, "Stable seed for repeatable previews.")
];
export const heat = {
    id: 'heat', name: 'Heat haze / Wobble', className: 'HeatHazeShaderPass', category: 'Noise + UV', surface: 'grid',
    description: "Moving procedural turbulence with a broad wobble. Useful for heat, magic and liquid surfaces.", parameters,
    fragment: fragment(parameters, `
void main() {
 float time=u_progress*u_duration*.001*u_speed;
 vec2 p=v_TexCoord*vec2(u_aspect,1.)*u_scale;
 vec2 flow=vec2(fbm(p+vec2(u_seed,-time))-0.5,fbm(p+vec2(31.+u_seed,-time*.8))-0.5);
 flow+=u_wobble*vec2(sin(v_TexCoord.y*12.+time*3.),cos(v_TexCoord.x*9.+time*2.))*.5;
 vec2 uv=v_TexCoord+flow*vec2(1./u_aspect,1.)*u_amplitude*life();
 gl_FragColor=sampleAt(uv);
}
`)
};
