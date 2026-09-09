import { Tween } from 'engine-api/animation/tween/Tween';
import { Ease } from 'engine-api/animation/tween/Ease';
import { IControl } from 'engine-api/system/componentModel/IControl';
import { EffectShaderPass } from './EffectShaderPass.js';

/**
 * Append one owned effect without replacing existing passes.
 * Call stop on scene exit, target destruction or when releasing a held dissolve.
 * Reuse pass instances if the effect runs often; ShaderPass exposes no dispose API.
 */
export function playEffect(target: IControl, pass: EffectShaderPass, holdLastFrame: boolean = false): { stop: () => void } {
  const state = { progress: 0 };
  const tween = new Tween(state, pass.settings.duration, { progress: 0 }, { progress: 1 });
  tween.updateEase(Ease.LINEAR); // Per-effect easing is applied by frameUniforms.
  let stopped = false;
  let tweenDisposed = false;
  if (!(target.shaderPasses ?? []).includes(pass)) target.shaderPasses = [...(target.shaderPasses ?? []), pass];
  const update = (): void => {
    pass.progress = state.progress;
    pass.aspect = target.height > 0 ? target.width / target.height : 1;
    pass.update();
  };
  const disposeTween = (): void => {
    if (tweenDisposed) return;
    tweenDisposed = true;
    tween.onUpdateEvent.removeListener(update);
    tween.onCompleteEvent.removeListener(complete);
    tween.dispose();
  };
  const stop = (): void => {
    if (stopped) return;
    stopped = true;
    disposeTween();
    target.shaderPasses = (target.shaderPasses ?? []).filter(entry => entry !== pass);
  };
  const complete = (): void => {
    update();
    if (holdLastFrame) disposeTween(); else stop();
  };
  tween.onUpdateEvent.addListener(update);
  tween.onCompleteEvent.addListener(complete);
  update();
  tween.play();
  return { stop };
}
