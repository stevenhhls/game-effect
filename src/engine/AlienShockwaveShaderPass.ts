import { EffectShaderPass } from './EffectShaderPass.js';
import { alien } from '../effects/alien.js';
export interface AlienShockwaveShaderPassOptions {
 duration?: number;
 easing?: number;
 centerX?: number;
 centerY?: number;
 amplitude?: number;
 bandWidth?: number;
 bendWidth?: number;
 radialStrength?: number;
 bendStrength?: number;
 horizontalStrength?: number;
 verticalStrength?: number;
 bendSpacing?: number;
 detailStrength?: number;
 noiseScale?: number;
 noiseSpeed?: number;
 travelSpeed?: number;
 irregularity?: number;
 edgeFade?: number;
 seed?: number;
}
export class AlienShockwaveShaderPass extends EffectShaderPass {
 public constructor(options: AlienShockwaveShaderPassOptions = {}) { super(alien,{...options}); }
}
