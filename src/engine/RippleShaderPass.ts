import { EffectShaderPass } from './EffectShaderPass.js';
import { ripple } from '../effects/ripple.js';
export interface RippleShaderPassOptions {
  duration?: number;
  easing?: number;
  centerX?: number;
  centerY?: number;
  amplitude?: number;
  ringThickness?: number;
  ringSpacing?: number;
  ringCount?: number;
  radiusEnd?: number;
}
export class RippleShaderPass extends EffectShaderPass {
  public constructor(options: RippleShaderPassOptions = {}) { super(ripple, {...options}); }
}
