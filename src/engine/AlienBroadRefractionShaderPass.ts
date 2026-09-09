import { EffectShaderPass } from './EffectShaderPass.js';
import { alienBroad } from '../effects/alienStudy.js';
export interface AlienBroadRefractionShaderPassOptions {
 duration?: number;
 easing?: number;
 centerX?: number;
 centerY?: number;
 strength?: number;
 waveWidth?: number;
 radialStrength?: number;
 travelSpeed?: number;
 edgeSoftening?: number;
 broadSize?: number;
 broadStrength?: number;
 horizontalGain?: number;
 verticalGain?: number;
 flowSpeed?: number;
 seed?: number;
}
export class AlienBroadRefractionShaderPass extends EffectShaderPass {
 public constructor(options:AlienBroadRefractionShaderPassOptions={}) { super(alienBroad,{...options}); }
}

