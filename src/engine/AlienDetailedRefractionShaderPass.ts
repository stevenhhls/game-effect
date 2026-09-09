import { EffectShaderPass } from './EffectShaderPass.js';
import { alienDetailed } from '../effects/alienStudy.js';
export interface AlienDetailedRefractionShaderPassOptions {
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
 detailSize?: number;
 detailStrength?: number;
}
export class AlienDetailedRefractionShaderPass extends EffectShaderPass {
 public constructor(options:AlienDetailedRefractionShaderPassOptions={}) { super(alienDetailed,{...options}); }
}

