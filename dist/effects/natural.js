import { parameter, timing, center } from '../core/types.js';
import { fragment } from '../core/glsl.js';
const parameters = [...timing, ...center,
    parameter("amplitude", "Amplitude", 0, 0.15, 0.005, 0.035, "Refraction displacement."),
    parameter("ringThickness", "Ring thickness", 0.005, 0.4, 0.005, 0.06, "Full width of one ring in image-height units. Wide rings may overlap."),
    parameter("ringSpacing", "Ring spacing", 0.01, 0.5, 0.005, 0.12, "Center-to-center distance between rings."),
    parameter("ringCount", "Ring count", 1, 12, 1, 3, "Number of emitted rings. Inner rings appear as the wave expands."),
    parameter("radiusEnd", "End radius", 0.1, 3, 0.05, 1.2, "Radius in image-height units."),
    parameter("damping", "Distance damping", 0, 8, 0.1, 1.5, "Higher = weaker distant waves."),
    parameter("fadePower", "Fade exponent", 0.2, 4, 0.1, 1.4, "Lower = longer-lived waves."),
    parameter("edgeFade", "Edge protection", 0.001, 0.2, 0.005, 0.04, "Suppress stretching near image edges.")
];
export const natural = {
    id: 'natural', name: 'Natural ripple', className: 'NaturalRippleShaderPass', category: 'UV distortion', surface: 'grid',
    description: "Independent ring thickness, center spacing and count. Overlapping rings can visually merge.", parameters,
    fragment: fragment(parameters, `
float ringProfile(float d) {
 float x=2.*d/max(u_ringThickness,.00001);
 if(abs(x)>=1.) return 0.;
 return 3.493856*x*pow(1.-x*x,3.);
}
float rings(float r,float front) {
 float wave=0.;
 for(int i=0;i<12;i++) {
  if(float(i)>=floor(u_ringCount+.5)) break;
  float radius=front-float(i)*u_ringSpacing;
  if(radius<=0.) continue;
  wave+=ringProfile(r-radius)*smoothstep(0.,u_ringThickness*.5,radius);
 }
 return wave;
}

void main() {
 vec2 p=(v_TexCoord-vec2(u_centerX,u_centerY))*vec2(u_aspect,1.);
 float r=length(p), radius=u_radiusEnd*u_phase;
 float wave=rings(r,radius);
 float fade=smoothstep(0.,.07,u_progress)*pow(1.-u_progress,u_fadePower);
 vec2 edge=min(v_TexCoord,1.-v_TexCoord);
 float amount=wave*u_amplitude*fade*inversesqrt(1.+u_damping*r*8.)*smoothstep(0.,u_ringThickness*.25,r)*smoothstep(0.,u_edgeFade,min(edge.x,edge.y));
 gl_FragColor=sampleAt(v_TexCoord+p/max(r,.00001)/vec2(u_aspect,1.)*amount);
}
`)
};
