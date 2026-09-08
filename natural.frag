// Original implementation inspired by height-field normal techniques.
#ifdef GL_ES
precision highp float;
#endif
uniform sampler2D u_Sampler;
uniform vec2 u_Center;
uniform float u_Radius;
uniform float u_Amplitude;
uniform float u_WaveWidth;
uniform float u_Frequency;
uniform float u_Aspect;
uniform float u_Progress;
uniform float u_Damping;
uniform float u_FadePower;
uniform float u_Wake;
uniform float u_EdgeFade;
varying vec2 v_TexCoord;

// Analytical derivative of h(d) = gaussian(d) * sin(k*d) / k.
float slope(float distance, float radius, float width, float k) {
  float d = distance - radius;
  float band = exp(-d*d/(width*width));
  return band * (cos(k*d) - 2.0*d*sin(k*d)/(width*width*k));
}
void main() {
  vec2 delta = (v_TexCoord-u_Center)*vec2(u_Aspect,1.0);
  float r = length(delta);
  vec2 direction = delta/max(r,0.00001);
  float width = max(u_WaveWidth,0.0001);
  float k = max(u_Frequency,0.001);
  float wave = slope(r,u_Radius,width,k);
  wave += u_Wake*slope(r,u_Radius*0.74,width*1.25,k*1.18);
  wave /= 1.0+u_Wake;
  float t = clamp(u_Progress,0.0,1.0);
  float life = smoothstep(0.0,0.07,t)*pow(1.0-t,u_FadePower);
  float attenuation = inversesqrt(1.0+u_Damping*r*8.0);
  float centerFade = smoothstep(0.0,width*0.3,r);
  vec2 edge = min(v_TexCoord,1.0-v_TexCoord);
  float edgeMask = smoothstep(0.0,max(u_EdgeFade,0.00001),min(edge.x,edge.y));
  vec2 displacement = direction/vec2(u_Aspect,1.0)*wave*u_Amplitude*life*attenuation*centerFade*edgeMask;
  gl_FragColor = texture2D(u_Sampler,clamp(v_TexCoord+displacement,0.0,1.0));
}
