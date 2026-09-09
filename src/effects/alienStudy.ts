import { EffectDefinition, parameter, timing, center } from '../core/types.js';
import { fragment } from '../core/glsl.js';
import { psrdnoiseGLSL } from '../core/psrdnoise.js';

// Bipolar wave profile adapted from PixiJS Filters ShockwaveFilter.
// https://github.com/pixijs/filters/blob/main/src/shockwave/shockwave.frag
/*
The MIT License

Copyright (c) 2013-2025 Mathew Groves, Chad Engler

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/
const base = [
 ...timing.map(p=>({...p,value:p.key==='duration'?1100:0})),
 ...center.map(p=>({...p,value:p.key==='centerX'?.70:.76})),
 parameter('strength','Master strength',0,3,.05,1,'Multiplies every active layer. Zero restores the original.'),
 parameter('waveWidth','Wave width',.04,1.5,.01,.60,'Full width of one paired compression/stretch wave; not a ring count.'),
 parameter('radialStrength','Radial strength',0,.15,.005,.035,'Paired radial push/pull in image-height units.'),
 parameter('travelSpeed','Travel speed',.2,4,.05,1.65,'Image-height units per second before easing.'),
 parameter('edgeSoftening','Edge softening',.05,.5,.05,.20,'Boundary-only limiting. Interior displacements are unchanged.')
];
const broad = [
 parameter('broadSize','Broad bend size',.04,.6,.01,.16,'Spatial size of the main refractive features. Larger = broader bends.'),
 parameter('broadStrength','Broad refraction',0,.08,.001,.014,'Strength of the large noise-gradient refraction.'),
 parameter('horizontalGain','Horizontal bias',0,2,.05,1,'X gain for refraction only; radial propagation stays circular.'),
 parameter('verticalGain','Vertical bias',0,2,.05,.45,'Y gain for refraction only.'),
 parameter('flowSpeed','Flow speed',0,3,.05,.35,'Slow evolution of the noise, independent of wave travel.'),
 parameter('seed','Noise seed',0,100,1,23,'Shared deterministic pattern for B/C.')
];
const fine = [
 parameter('detailSize','Detail size',.015,.2,.005,.045,'Spatial size of the finer creases.'),
 parameter('detailStrength','Detail refraction',0,.04,.0005,.004,'Small-scale gradient contribution. Zero makes C match B.')
];
const ids=['alien-a','alien-b','alien-c'];
const names=['A · Radial only','B · Radial + broad refraction','C · Radial + broad + detail'];
const classes=['AlienRadialShaderPass','AlienBroadRefractionShaderPass','AlienDetailedRefractionShaderPass'];

function makeStudy(level:0|1|2):EffectDefinition {
 const parameters=[...base.map(p=>({...p})),...(level>0?broad.map(p=>({...p})):[]),...(level>1?fine.map(p=>({...p})):[])];
 return {
  id:ids[level], name:names[level], className:classes[level], category:'ALIEN COMPARISON',surface:'grid',parameters,
  description:[
   'A: one bipolar circular wave — compression and stretch, without noise. A/B/C share settings, image and playhead.',
   'B: the same wave plus large-scale PSRDnoise gradient refraction. Broad refraction = 0 matches A.',
   'C: the same wave and broad refraction plus smaller creases. Detail refraction = 0 matches B.'
  ][level],
  fragment:fragment(parameters,`
${level>0?psrdnoiseGLSL:''}
// Identity through most of the image; smooth compression only near the boundary.
float boundaryOffset(float uv,float delta,float softness) {
 float room=delta>=0.?1.-uv:uv;
 float threshold=(1.-softness)*room;
 float amount=abs(delta);
 if(amount<=threshold) return delta;
 float remaining=room-threshold, excess=amount-threshold;
 return sign(delta)*(threshold+remaining*excess/(remaining+excess+.000001));
}
void main() {
 if(u_progress<=0. || u_progress>=1. || u_strength<=0.) {
  gl_FragColor=texture2D(u_Sampler,v_TexCoord);return;
 }
 vec2 aspect=vec2(u_aspect,1.);
 vec2 p=(v_TexCoord-vec2(u_centerX,u_centerY))*aspect;
 float r=length(p);
 float front=u_phase*u_duration*.001*u_travelSpeed;
 float x=2.*(r-front)/u_waveWidth;
 if(abs(x)>=1.) { gl_FragColor=texture2D(u_Sampler,v_TexCoord);return; }
 float envelope=1.-x*x;
 // Signed paired wave; do not multiply a second narrow envelope over this.
 float wave=1.25*sin(PI*x)*envelope;
 vec2 offset=-p/max(r,.00001)*wave*u_radialStrength;
 ${level>0?`
 float time=u_progress*u_duration*.001*u_flowSpeed;
 vec2 gradient;
 psrdnoise(p/u_broadSize+vec2(u_seed,17.3),vec2(0.),time,gradient);
 // Equivalent to gradient of size*noise(p/size): size and displacement remain independent.
 vec2 refraction=gradient*u_broadStrength;
 ${level>1?`
 vec2 fineGradient;
 psrdnoise(p/u_detailSize+vec2(31.7,u_seed),vec2(0.),-time*.8,fineGradient);
 refraction+=fineGradient*u_detailStrength;
 `:''}
 offset+=refraction*vec2(u_horizontalGain,u_verticalGain)*envelope*envelope;
 `:''}
 float lifeFade=smoothstep(0.,.07,u_progress)*(1.-smoothstep(.78,1.,u_progress));
 offset=offset/aspect*u_strength*lifeFade*smoothstep(0.,.015,r);
 vec2 limited=vec2(boundaryOffset(v_TexCoord.x,offset.x,u_edgeSoftening),
                   boundaryOffset(v_TexCoord.y,offset.y,u_edgeSoftening));
 gl_FragColor=texture2D(u_Sampler,clamp(v_TexCoord+limited,vec2(0.),vec2(1.)));
}
`)
 };
}
export const alienRadial=makeStudy(0);
export const alienBroad=makeStudy(1);
export const alienDetailed=makeStudy(2);
export const alienStudies=[alienRadial,alienBroad,alienDetailed];
export function isAlienStudy(effect:EffectDefinition):boolean { return ids.includes(effect.id); }

