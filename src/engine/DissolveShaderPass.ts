import { EffectShaderPass } from './EffectShaderPass.js';
import { dissolve } from '../effects/dissolve.js';
export interface DissolveShaderPassOptions {
  duration?: number;
  easing?: number;
  scale?: number;
  edgeWidth?: number;
  intensity?: number;
  reveal?: number;
  seed?: number;
  red?: number;
  green?: number;
  blue?: number;
}
export class DissolveShaderPass extends EffectShaderPass {
  public constructor(options: DissolveShaderPassOptions = {}) { super(dissolve, {...options}); }
}
