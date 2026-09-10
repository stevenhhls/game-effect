import { Settings } from './types.js';

// Explicit comparison snapshot, verified against the game preset on 2026-09-10.
// It does not depend on the game repository at runtime or overwrite saved edits on load.
export const gameReference: Settings = {
 duration:1100, easing:0, centerX:.7, centerY:.76,
 strength:1, waveWidth:.6, radialStrength:.035, travelSpeed:1.65,
 edgeSoftening:.2, broadSize:.16, broadStrength:.014,
 horizontalGain:1, verticalGain:.45, flowSpeed:.35, seed:23
};
export function matchesGameReference(effectId:string, settings:Settings):boolean {
 return effectId==='alien-b' && Object.entries(gameReference).every(([key,value])=>Math.abs(settings[key]-value)<1e-9);
}
