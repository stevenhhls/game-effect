import { parameter, timing, center } from '../core/types.js';
import { fragment } from '../core/glsl.js';
const parameters = [...timing, ...center,
    parameter("amplitude", "Amplitude", 0, 0.3, 0.005, 0.12, "Radial texture displacement."),
    parameter("ringThickness", "Ring thickness", 0.005, 0.4, 0.005, 0.06, "Full width of one ring in image-height units. Wide rings may overlap."),
    parameter("ringSpacing", "Ring spacing", 0.01, 0.5, 0.005, 0.12, "Center-to-center distance between rings."),
    parameter("ringCount", "Ring count", 1, 12, 1, 3, "Number of emitted rings. Inner rings appear as the wave expands."),
    parameter("radiusEnd", "End radius", 0.1, 3, 0.05, 1.2, "Radius in image-height units.")
];
parameters[0] = { ...parameters[0], value: 650 };
parameters[1] = { ...parameters[1], value: 1 };
export const ripple = {
    id: 'ripple', name: 'Ripple / Shockwave', className: 'RippleShaderPass', category: 'UV distortion', surface: 'grid',
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
 float r=length(p), d=r-u_radiusEnd*u_phase;
 float wave=rings(r,u_radiusEnd*u_phase)*smoothstep(0.,u_ringThickness*.25,r);
 vec2 dir=p/max(r,0.00001)/vec2(u_aspect,1.);
 gl_FragColor=sampleAt(v_TexCoord+dir*wave*u_amplitude*(1.-u_phase));
}
`)
};
