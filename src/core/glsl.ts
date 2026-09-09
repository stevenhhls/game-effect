import { Parameter } from './types.js';
export const noise = `
float hash21(vec2 p) {
  p = fract(p * vec2(123.34,456.21));
  p += dot(p,p+45.32);
  return fract(p.x*p.y);
}
float noise2(vec2 p) {
  vec2 i=floor(p), f=fract(p);
  f=f*f*(3.0-2.0*f);
  return mix(mix(hash21(i),hash21(i+vec2(1.,0.)),f.x),
             mix(hash21(i+vec2(0.,1.)),hash21(i+vec2(1.,1.)),f.x),f.y);
}
float fbm(vec2 p) {
  return 0.57*noise2(p)+0.28*noise2(p*2.03+7.1)+0.15*noise2(p*4.09+19.2);
}
`;
export function fragment(parameters: Parameter[], body: string): string {
  return `#ifdef GL_ES
precision highp float;
#endif
uniform sampler2D u_Sampler;
uniform float u_progress;
uniform float u_phase;
uniform float u_aspect;
`+parameters.map(p=>'uniform float u_'+p.key+';').join('\n')+`
varying vec2 v_TexCoord;
const float PI=3.14159265359;
float life() { return smoothstep(0.0,0.08,u_progress)*(1.0-smoothstep(0.72,1.0,u_progress)); }
vec4 sampleAt(vec2 uv) {
  float inside=step(0.0,uv.x)*step(uv.x,1.0)*step(0.0,uv.y)*step(uv.y,1.0);
  return texture2D(u_Sampler,clamp(uv,0.0,1.0))*inside;
}
`+noise+body;
}
