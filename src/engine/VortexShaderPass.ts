import { EffectShaderPass } from './EffectShaderPass.js';
import { vortex } from '../effects/vortex.js';
export interface VortexShaderPassOptions {
  duration?: number;
  easing?: number;
  centerX?: number;
  centerY?: number;
  strength?: number;
  radius?: number;
  pull?: number;
  direction?: number;
}
export class VortexShaderPass extends EffectShaderPass {
  public constructor(options: VortexShaderPassOptions = {}) { super(vortex, {...options}); }
}
