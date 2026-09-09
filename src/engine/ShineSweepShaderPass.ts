import { EffectShaderPass } from './EffectShaderPass.js';
import { shine } from '../effects/shine.js';
export interface ShineSweepShaderPassOptions {
  duration?: number;
  easing?: number;
  intensity?: number;
  width?: number;
  angle?: number;
  red?: number;
  green?: number;
  blue?: number;
}
export class ShineSweepShaderPass extends EffectShaderPass {
  public constructor(options: ShineSweepShaderPassOptions = {}) { super(shine, {...options}); }
}
