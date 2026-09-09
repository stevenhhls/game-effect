export interface Parameter {
  key: string; label: string; min: number; max: number; step: number; value: number; help: string;
}
export interface EffectDefinition {
  id: string; name: string; className: string; category: string; description: string;
  parameters: Parameter[]; fragment: string; surface: 'grid' | 'symbol' | 'frame';
}
export type Settings = Record<string, number>;
export function parameter(key: string, label: string, min: number, max: number, step: number, value: number, help: string): Parameter {
  return {key,label,min,max,step,value,help};
}
export const timing: Parameter[] = [
  parameter('duration','Duration (ms)',100,6000,50,1500,'Total playback duration.'),
  parameter('easing','Easing: 0 Linear / 1 Sine out / 2 Sine in-out',0,2,1,0,'Controls propagation, not the playback clock.')
];
export const center: Parameter[] = [
  parameter('centerX','Center X',0,1,0.01,0.5,'Click the preview to set the center.'),
  parameter('centerY','Center Y',0,1,0.01,0.5,'0 = top, 1 = bottom.')
];
export function defaults(effect: EffectDefinition): Settings {
  return Object.fromEntries(effect.parameters.map(p=>[p.key,p.value]));
}
export function normalize(effect: EffectDefinition, input: Settings): Settings {
  return Object.fromEntries(effect.parameters.map(p=>{
    const value = Number.isFinite(input[p.key]) ? Math.max(p.min,Math.min(p.max,input[p.key])) : p.value;
    return [p.key, p.key === 'ringCount' ? Math.round(value) : value];
  }));
}
export function frameUniforms(effect: EffectDefinition, settings: Settings, progress: number, aspect: number): Settings {
  const s=normalize(effect,settings);
  const t=Number.isFinite(progress)?Math.max(0,Math.min(1,progress)):0;
  const phase=s.easing===1?Math.sin(t*Math.PI/2):s.easing===2?(1-Math.cos(Math.PI*t))/2:t;
  return {...s,progress:t,phase,aspect:Number.isFinite(aspect)&&aspect>0?aspect:1};
}
