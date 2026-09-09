import { EffectShaderPass } from './EffectShaderPass.js';
import { heat } from '../effects/heat.js';
export interface HeatHazeShaderPassOptions {
  duration?: number;
  easing?: number;
  amplitude?: number;
  scale?: number;
  speed?: number;
  wobble?: number;
  seed?: number;
}
export class HeatHazeShaderPass extends EffectShaderPass {
  public constructor(options: HeatHazeShaderPassOptions = {}) { super(heat, {...options}); }
}
