import { parameter, timing, center } from '../core/types.js';
import { fragment } from '../core/glsl.js';
const parameters = [...timing,
    { ...parameter('burnMode', 'Burn direction', 0, 6, 1, 0, 'Point mode starts at the selected center. Click the preview to move it.'), options: ['From point', 'Left → right', 'Right → left', 'Top → bottom', 'Bottom → top', 'All edges → center', 'Random dissolve'] },
    ...center,
    parameter('roughness', 'Burn irregularity', 0, .4, .01, .12, 'Noise variation along the advancing burn front.'),
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
    description: "Burn from a clicked point, one side, or all edges toward the center. A noisy glowing front removes the image.", parameters,
    fragment: fragment(parameters, `
void main() {
 vec4 src=texture2D(u_Sampler,v_TexCoord);
 float t=mix(u_phase,1.-u_phase,u_reveal);
 if(t<=0.) { gl_FragColor=src;return; }
 if(t>=1.) { gl_FragColor=vec4(0.);return; }
 float n=fbm(v_TexCoord*vec2(u_aspect,1.)*u_scale+u_seed);
 vec2 uv=v_TexCoord;
 vec2 origin=vec2(u_centerX,u_centerY);
 vec2 farthest=max(origin,1.-origin)*vec2(u_aspect,1.);
 float distanceField=length((uv-origin)*vec2(u_aspect,1.))/max(length(farthest),.0001);
 if(u_burnMode>.5&&u_burnMode<1.5)distanceField=uv.x;
 else if(u_burnMode<2.5&&u_burnMode>1.5)distanceField=1.-uv.x;
 else if(u_burnMode<3.5&&u_burnMode>2.5)distanceField=uv.y;
 else if(u_burnMode<4.5&&u_burnMode>3.5)distanceField=1.-uv.y;
 else if(u_burnMode<5.5&&u_burnMode>4.5){
  vec2 edgeDistance=min(uv,1.-uv)*vec2(u_aspect,1.);
  distanceField=min(edgeDistance.x,edgeDistance.y)/(.5*min(u_aspect,1.));
 }
 // Multiplicative noise keeps the ignition point/edge at zero and avoids
 // scattered early holes ahead of the burn front. The field stays in [0,1].
 if(u_burnMode<5.5)n=distanceField*(1.+u_roughness*(n-.5))/(1.+.5*u_roughness);
 float threshold=mix(-u_edgeWidth,1.+u_edgeWidth,t);
 float remaining=smoothstep(threshold,threshold+.02,n);
 float edge=(1.-smoothstep(threshold,threshold+u_edgeWidth,n))*remaining;
 float alpha=src.a*remaining;
 gl_FragColor=vec4(min(vec3(alpha),src.rgb*remaining+vec3(u_red,u_green,u_blue)*edge*u_intensity*src.a),alpha);
}
`)
};
