import { EffectDefinition, parameter, timing, center } from '../core/types.js';
import { fragment } from '../core/glsl.js';

// Approximation of the reference's distortion only: no flash, lightning or glow.
const parameters = [...timing.map(p=>({...p,value:p.key==='duration'?1100:0})),
 ...center.map(p=>({...p,value:p.key==='centerX'?.70:.76})),
 parameter('amplitude','Distortion strength',0,.2,.002,.08,'Master displacement in image-height units.'),
 parameter('bandWidth','Band width',.05,2,.01,.64,'Full affected width. Keep it at least as large as Bend width.'),
 parameter('bendWidth','Bend width',.05,1.5,.01,.48,'Full span of the expanding radial pulse and its secondary bends.'),
 parameter('radialStrength','Radial expansion',0,3,.05,1,'Circular outward push. Independent of the horizontal/vertical turbulence controls.'),
 parameter('bendStrength','Bend strength',0,3,.05,.40,'Secondary sideways bending; zero leaves the radial pulse and fine detail.'),
 parameter('horizontalStrength','Horizontal turbulence',0,2,.05,1,'Left/right bending and detail only; does not flatten the circular expansion.'),
 parameter('verticalStrength','Vertical turbulence',0,2,.025,.10,'Up/down bending and detail only. Radial expansion still moves in all directions.'),
 parameter('bendSpacing','Bend spacing',.08,1,.01,.32,'Vertical spacing between broad left/right sways, in image-height units.'),
 parameter('detailStrength','Detail strength',0,2,.025,.075,'Independent fine wrinkles. Set to zero for smooth bending only.'),
 parameter('noiseScale','Detail scale',1,40,.5,10,'Fine-detail density only; does not control Bend width.'),
 parameter('noiseSpeed','Noise speed',0,5,.05,.65,'Turbulence evolution per second.'),
 parameter('travelSpeed','Travel speed',.2,4,.05,1.65,'Outward propagation in image-height units per second.'),
 parameter('irregularity','Front irregularity',0,.3,.005,.015,'Adds slight unevenness; lower values preserve a clearer circular front.'),
 parameter('edgeFade','Edge protection',.001,.15,.005,.025,'Protects the source image boundary from out-of-bounds sampling.'),
 parameter('seed','Noise seed',0,100,1,23,'Repeatable turbulence pattern.')
];
export const alien: EffectDefinition = {
 id:'alien',name:'Alien Shockwave',className:'AlienShockwaveShaderPass',
 category:'Shockwave + turbulent UV',surface:'grid',parameters,
 description:'A circular outward push leads the shockwave, with restrained horizontal bending and fine wrinkles behind it. Radial expansion is independent of turbulence direction. Boundary-safe sampling; no lightning or flash.',
 fragment:fragment(parameters,`
void main() {
 vec2 aspect=vec2(u_aspect,1.);
 vec2 p=(v_TexCoord-vec2(u_centerX,u_centerY))*aspect;
 float r=length(p);
 float seconds=u_progress*u_duration*.001;
 float time=seconds*u_noiseSpeed;
 // No polar angle seam: perturb the front with Cartesian low-frequency noise.
 float front=seconds*u_travelSpeed;
 float uneven=(noise2(p*4.+u_seed)-.5)*2.*u_irregularity;
 float d=r-front+uneven;
 float x=2.*d/max(u_bandWidth,.001);
 float band=pow(max(0.,1.-x*x),2.);
 // Wide, compact bipolar profile: expanding its support never adds oscillations.
 float bendX=clamp(2.*d/max(u_bendWidth,.001),-1.,1.);
 float bend=3.493856*bendX*pow(max(0.,1.-bendX*bendX),3.);
 // Low-frequency Cartesian direction modulation has no polar seam or fine octaves.
 vec2 broad=2.*vec2(noise2(p*3.+vec2(u_seed,time*.2)),noise2(p*3.+vec2(31.+u_seed,-time*.2)))-1.;
 vec2 q=p*u_noiseScale+vec2(u_seed,13.);
 // No fixed domain warp and no FBM: detail can now be completely removed.
 vec2 detail=2.*vec2(noise2(q+vec2(time,-time*.7)),noise2(q+vec2(37.,11.)+vec2(-time*.6,time)))-1.;
 // A single compact radial pulse makes the circular expansion visible.
 // Backward texture sampling: a NEGATIVE radial UV offset moves content OUTWARD.
 vec2 radialDirection=p/max(r,.00001);
 float radialPulse=pow(max(0.,1.-bendX*bendX),2.);
 float centerGate=smoothstep(0.,u_bendWidth*.12,r);
 vec2 radial=-radialDirection*radialPulse*u_radialStrength*centerGate;
 // Horizontal swaying is secondary; never apply its axis weights to the radial pulse.
 float sway=sin(2.*PI*p.y/u_bendSpacing+time*.7+broad.x*.6);
 vec2 broadDisplacement=vec2(sway*.85+broad.x*.3,broad.y*.6);
 vec2 turbulence=(broadDisplacement*bend*u_bendStrength+detail*u_detailStrength)
                 *vec2(u_horizontalStrength,u_verticalStrength);
 vec2 displacement=radial+turbulence;
 float fade=smoothstep(0.,.07,u_progress)*(1.-smoothstep(.78,1.,u_progress));
 vec2 edge=min(v_TexCoord,1.-v_TexCoord);
 float protection=smoothstep(0.,u_edgeFade,min(edge.x,edge.y));
 vec2 delta=displacement/aspect*u_amplitude*band*fade*protection;
 // Compress only displacement near the boundary; no holes or long clamped streaks.
 // |safeDelta| is strictly below the distance to the edge in its travel direction.
 vec2 room=mix(v_TexCoord,1.-v_TexCoord,step(vec2(0.),delta));
 vec2 safeDelta=delta*room/(room+abs(delta)+vec2(.000001));
 vec2 uv=clamp(v_TexCoord+safeDelta,vec2(0.),vec2(1.));
 // Unlike sampleAt(), do NOT multiply out-of-range samples into transparent black.
 // Preserve real source alpha (transparent sprites remain transparent).
 gl_FragColor=texture2D(u_Sampler,uv);
}
`)
};
