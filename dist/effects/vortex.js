import { parameter, timing, center } from '../core/types.js';
import { fragment } from '../core/glsl.js';
const parameters = [...timing, ...center,
    parameter("strength", "Twist strength", 0, 12, 0.1, 5, "Maximum rotation in radians."),
    parameter("radius", "Influence radius", 0.1, 2, 0.05, 0.8, "Radius in image-height units."),
    parameter("pull", "Inward pull", 0, 1, 0.02, 0.4, "Pull the image toward the center."),
    parameter("direction", "Direction: -1 / +1", -1, 1, 2, 1, "Rotation direction.")
];
export const vortex = {
    id: 'vortex', name: 'Vortex / Suction', className: 'VortexShaderPass', category: 'UV distortion', surface: 'symbol',
    description: "A bounded twist and inward pull. The pulse returns to the original image at the end.", parameters,
    fragment: fragment(parameters, `
void main() {
 vec2 center=vec2(u_centerX,u_centerY);
 vec2 p=(v_TexCoord-center)*vec2(u_aspect,1.);
 float r=length(p),falloff=1.-smoothstep(0.,u_radius,r);
 float pulse=sin(PI*u_phase);
 float a=u_strength*u_direction*falloff*falloff*pulse;
 mat2 rotation=mat2(cos(a),-sin(a),sin(a),cos(a));
 p=rotation*p*(1.+u_pull*falloff*pulse*3.);
 gl_FragColor=sampleAt(center+p/vec2(u_aspect,1.));
}
`)
};
