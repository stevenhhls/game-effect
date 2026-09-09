import { EffectShaderPass } from './EffectShaderPass.js';
import { alienRadial } from '../effects/alienStudy.js';
export interface AlienRadialShaderPassOptions {
 duration?: number;
 easing?: number;
 centerX?: number;
 centerY?: number;
 strength?: number;
 waveWidth?: number;
 radialStrength?: number;
 travelSpeed?: number;
 edgeSoftening?: number;
}
export class AlienRadialShaderPass extends EffectShaderPass {
 public constructor(options:AlienRadialShaderPassOptions={}) { super(alienRadial,{...options}); }
}

