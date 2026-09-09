import { EffectShaderPass } from './EffectShaderPass.js';
import { energy } from '../effects/energy.js';
export interface FrameEnergyShaderPassOptions {
  duration?: number;
  easing?: number;
  intensity?: number;
  thickness?: number;
  inset?: number;
  trail?: number;
  laps?: number;
  jitter?: number;
  red?: number;
  green?: number;
  blue?: number;
}
export class FrameEnergyShaderPass extends EffectShaderPass {
  public constructor(options: FrameEnergyShaderPassOptions = {}) { super(energy, {...options}); }
}
