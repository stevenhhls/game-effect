import { EffectDefinition, parameter, timing } from '../core/types.js';
import { fragment } from '../core/glsl.js';
const parameters = [...timing,
  parameter("intensity", "Intensity", 0, 3, 0.05, 1.2, "Brightness of the moving band."),
  parameter("width", "Band width", 0.01, 0.5, 0.01, 0.14, "Thickness of the sweep."),
  parameter("angle", "Angle (degrees)", -180, 180, 5, -25, "Direction of travel."),
  parameter("red", "Light red", 0, 1, 0.01, 1, "Light color."),
  parameter("green", "Light green", 0, 1, 0.01, 0.86, "Light color."),
  parameter("blue", "Light blue", 0, 1, 0.01, 0.5, "Light color.")
];
export const shine: EffectDefinition = {
 id: 'shine', name: 'Shine sweep', className: 'ShineSweepShaderPass', category: 'Glow / emission', surface: 'symbol',
 description: "A directional light band clipped to the source alpha. Designed for coins, symbols and logos.", parameters,
 fragment: fragment(parameters,`
void main() {
 vec4 src=texture2D(u_Sampler,v_TexCoord);
 float a=u_angle*PI/180.;vec2 dir=vec2(cos(a),sin(a));
 float extent=.5*(abs(dir.x)*u_aspect+abs(dir.y))+u_width*3.;
 float d=dot((v_TexCoord-.5)*vec2(u_aspect,1.),dir)-mix(-extent,extent,u_phase);
 float band=exp(-d*d/(u_width*u_width))*u_intensity*life();
 vec3 rgb=min(vec3(src.a),src.rgb+vec3(u_red,u_green,u_blue)*band*src.a);
 gl_FragColor=vec4(rgb,src.a);
}
`)
};
