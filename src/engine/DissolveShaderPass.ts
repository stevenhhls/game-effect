import { EffectShaderPass } from './EffectShaderPass.js';
import { dissolve } from '../effects/dissolve.js';
export interface DissolveShaderPassOptions {
  /** 0 point, 1 left, 2 right, 3 top, 4 bottom, 5 all edges, 6 random. */
  burnMode?: number;
  centerX?: number;
  centerY?: number;
  roughness?: number;
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
