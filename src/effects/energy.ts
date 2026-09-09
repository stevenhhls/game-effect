import { EffectDefinition, parameter, timing } from '../core/types.js';
import { fragment } from '../core/glsl.js';
const parameters = [...timing,
  parameter("intensity", "Intensity", 0, 3, 0.05, 1.5, "Energy brightness."),
  parameter("thickness", "Path thickness", 0.003, 0.08, 0.002, 0.018, "Width around the frame path."),
  parameter("inset", "Frame inset", 0.03, 0.3, 0.01, 0.12, "Distance from the image edges."),
  parameter("trail", "Trail length", 0.01, 0.5, 0.01, 0.16, "Fraction of the perimeter illuminated."),
  parameter("laps", "Laps", 1, 5, 1, 1, "Revolutions per playback."),
  parameter("jitter", "Electric flicker", 0, 1, 0.05, 0.4, "Turbulence in the energy trail."),
  parameter("red", "Energy red", 0, 1, 0.01, 0.2, "Energy color."),
  parameter("green", "Energy green", 0, 1, 0.01, 0.85, "Energy color."),
  parameter("blue", "Energy blue", 0, 1, 0.01, 1, "Energy color.")
];
export const energy: EffectDefinition = {
 id: 'energy', name: 'Frame energy pulse', className: 'FrameEnergyShaderPass', category: 'Mask / path + glow', surface: 'frame',
 description: "An energy packet follows a rectangular path clockwise. Adjust inset and trail length to match a reel frame; no path texture required.", parameters,
 fragment: fragment(parameters,`
void main() {
 vec4 src=texture2D(u_Sampler,v_TexCoord);
 vec2 p=v_TexCoord*vec2(u_aspect,1.);
 vec2 lo=vec2(u_inset*u_aspect,u_inset), hi=vec2((1.-u_inset)*u_aspect,1.-u_inset);
 float w=hi.x-lo.x,h=hi.y-lo.y,perimeter=2.*(w+h);
 vec2 q=vec2(clamp(p.x,lo.x,hi.x),lo.y);
 float distance=length(p-q),s=q.x-lo.x;
 q=vec2(hi.x,clamp(p.y,lo.y,hi.y));float dd=length(p-q);
 if(dd<distance){distance=dd;s=w+q.y-lo.y;}
 q=vec2(clamp(p.x,lo.x,hi.x),hi.y);dd=length(p-q);
 if(dd<distance){distance=dd;s=w+h+hi.x-q.x;}
 q=vec2(lo.x,clamp(p.y,lo.y,hi.y));dd=length(p-q);
 if(dd<distance){distance=dd;s=2.*w+h+hi.y-q.y;}
 float behind=fract(u_phase*u_laps-s/perimeter);
 float tail=1.-smoothstep(0.,u_trail,behind);
 float band=exp(-distance*distance/(u_thickness*u_thickness));
 float flicker=mix(1.,.5+fbm(vec2(s*40.,u_progress*20.)),u_jitter);
 float glow=band*tail*flicker*u_intensity*life();
 float alpha=max(src.a,clamp(glow,0.,1.));
 gl_FragColor=vec4(min(vec3(alpha),src.rgb+vec3(u_red,u_green,u_blue)*glow),alpha);
}
`)
};
