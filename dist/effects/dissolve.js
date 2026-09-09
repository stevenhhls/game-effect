import { parameter, timing } from '../core/types.js';
import { fragment } from '../core/glsl.js';
const parameters = [...timing,
    parameter("scale", "Noise scale", 2, 50, 1, 16, "Higher = smaller dissolving patches."),
    parameter("edgeWidth", "Edge width", 0.005, 0.2, 0.005, 0.065, "Thickness of the glowing boundary."),
    parameter("intensity", "Edge intensity", 0, 3, 0.05, 1.7, "Glow brightness."),
    parameter("reveal", "Direction: 0 Dissolve / 1 Reveal", 0, 1, 1, 0, "Reverse the visibility transition."),
    parameter("seed", "Noise seed", 0, 100, 1, 11, "Stable dissolving pattern."),
    parameter("red", "Edge red", 0, 1, 0.01, 1, "Edge color."),
    parameter("green", "Edge green", 0, 1, 0.01, 0.42, "Edge color."),
    parameter("blue", "Edge blue", 0, 1, 0.01, 0.07, "Edge color.")
];
export const dissolve = {
    id: 'dissolve', name: 'Dissolve + glowing edge', className: 'DissolveShaderPass', category: 'Noise + reveal', surface: 'symbol',
    description: "Seeded noise removes or reveals the symbol with a hot edge. End state is retained while scrubbing.", parameters,
    fragment: fragment(parameters, `
void main() {
 vec4 src=texture2D(u_Sampler,v_TexCoord);
 float t=mix(u_phase,1.-u_phase,u_reveal);
 if(t<=0.) { gl_FragColor=src;return; }
 if(t>=1.) { gl_FragColor=vec4(0.);return; }
 float n=fbm(v_TexCoord*vec2(u_aspect,1.)*u_scale+u_seed);
 float threshold=mix(-u_edgeWidth,1.+u_edgeWidth,t);
 float remaining=smoothstep(threshold,threshold+.02,n);
 float edge=(1.-smoothstep(threshold,threshold+u_edgeWidth,n))*remaining;
 float alpha=src.a*remaining;
 gl_FragColor=vec4(min(vec3(alpha),src.rgb*remaining+vec3(u_red,u_green,u_blue)*edge*u_intensity*src.a),alpha);
}
`)
};
