import { EffectShaderPass } from './EffectShaderPass.js';
import { natural } from '../effects/natural.js';
export interface NaturalRippleShaderPassOptions {
  duration?: number;
  easing?: number;
  centerX?: number;
  centerY?: number;
  amplitude?: number;
  ringThickness?: number;
  ringSpacing?: number;
  ringCount?: number;
  radiusEnd?: number;
  damping?: number;
  fadePower?: number;
  edgeFade?: number;
}
export class NaturalRippleShaderPass extends EffectShaderPass {
  public constructor(options: NaturalRippleShaderPassOptions = {}) { super(natural, {...options}); }
}
