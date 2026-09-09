import { normalize } from './core/types.js';
import { thirdPartyNotices } from './core/thirdPartyNotices.js';
import { servicePatch } from './core/serviceIntegration.js';
function objectLiteral(value) {
    return JSON.stringify(value, null, 2).replace(/"([A-Za-z_][A-Za-z0-9_]*)":/g, '$1:');
}
function fragmentLiteral(source) {
    const slash = String.fromCharCode(92), quote = String.fromCharCode(96);
    return quote + source.split(slash).join(slash + slash).split(quote).join(slash + quote).split('${').join(slash + '${') + quote;
}
export function standaloneShader(effect, input) {
    const options = normalize(effect, input), name = effect.className;
    const { centerX, centerY, ...serviceOptions } = options;
    const preset = effect.id === 'alien-b'
        ? "export type ScreenAlienBroadRefractionOptions = Omit<" + name + "Options, 'centerX' | 'centerY'>;\n"
            + "export const ALIEN_BROAD_REFRACTION_PRESET: Readonly<Required<ScreenAlienBroadRefractionOptions>> = Object.freeze("
            + objectLiteral(serviceOptions) + ");\n"
        : '';
    const defaultLiteral = effect.id === 'alien-b'
        ? '{ centerX: ' + centerX + ', centerY: ' + centerY + ', ...ALIEN_BROAD_REFRACTION_PRESET }'
        : objectLiteral(options);
    return `/* eslint-disable camelcase */
// Generated from Shader FX Studio. Uses exactly the preview fragment.
/* ${thirdPartyNotices} */
import { Shader } from 'engine-api/system/render/Shader';
import { Material } from 'engine-api/system/render/Material';
import { ShaderPass } from 'engine-api/system/render/ShaderPass';
import { IUniforms, UniformType } from 'engine-api/system/render/Uniforms';

export interface ${name}Options {
${effect.parameters.map(p => '  ' + p.key + '?: number;').join('\n')}
}
${preset}const DEFAULTS: Required<${name}Options> = ${defaultLiteral};
const LIMITS: Record<string, number[]> = ${objectLiteral(Object.fromEntries(effect.parameters.map(p => [p.key, [p.min, p.max]])))};
const FRAGMENT: string = ${fragmentLiteral(effect.fragment)};

export class ${name} extends ShaderPass {
  public progress: number = 0;
  public aspect: number = 1;
  private _settings: Required<${name}Options> = { ...DEFAULTS };
  public constructor(options: ${name}Options = {}) {
    super();
    const uniforms: IUniforms = { u_Sampler: { uniformType: UniformType.sampler } };
    [...Object.keys(DEFAULTS), 'progress', 'phase', 'aspect'].forEach(key => {
      uniforms['u_' + key] = { uniformType: UniformType.float };
    });
    this._material = new Material(new Shader(null, FRAGMENT, uniforms));
    this._material.setUniform('u_Sampler', null);
    this.configure(options);
    this.init();
  }
  public get settings(): Required<${name}Options> { return { ...this._settings }; }
  public configure(options: ${name}Options): void {
    (Object.keys(DEFAULTS) as (keyof ${name}Options)[]).forEach(key => {
      const value = options[key];
      if (value !== undefined && Number.isFinite(value)) {
        const bounded = Math.max(LIMITS[key][0], Math.min(LIMITS[key][1], value));
        this._settings[key] = String(key) === 'ringCount' ? Math.round(bounded) : bounded;
      }
    });
    this.update();
  }
  public update(): void {
    const progress = Number.isFinite(this.progress) ? Math.max(0, Math.min(1, this.progress)) : 0;
    const phase = this._settings.easing === 1 ? Math.sin(progress * Math.PI / 2)
      : this._settings.easing === 2 ? (1 - Math.cos(Math.PI * progress)) / 2 : progress;
    Object.keys(this._settings).forEach(key => this._material.setUniform('u_' + key, this._settings[key as keyof ${name}Options]));
    this._material.setUniform('u_progress', progress);
    this._material.setUniform('u_phase', phase);
    this._material.setUniform('u_aspect', Number.isFinite(this.aspect) && this.aspect > 0 ? this.aspect : 1);
  }
}
`;
}
export function integrationFiles(effect, input) {
    const options = normalize(effect, input), name = effect.className;
    const isBroad = effect.id === 'alien-b';
    const folder = isBroad ? 'src/utils/services/screenEffectService/effects/alienBroadRefraction/' : 'src/utils/services/screenEffectService/effects/' + effect.id + '/';
    const files = {};
    files['copy-to-game/' + folder + name + '.ts'] = standaloneShader(effect, options);
    files['current-preset.json'] = JSON.stringify({ effect: effect.id, parameters: options }, null, 2);
    files['THIRD_PARTY_NOTICES.txt'] = thirdPartyNotices;
    files['manifest.json'] = JSON.stringify({ formatVersion: 2, effect: effect.id, className: name, serviceApi: isBroad ? 'playAlienBroadRefraction' : null, servicePatchBase: isBroad ? '813501db75c72190b66256c44c47cdad24850b33' : null }, null, 2);
    if (isBroad) {
        files['integration/GameScreenEffectService.patch'] = servicePatch;
        files['examples/service-usage.md'] = `Use the existing injected IGameScreenEffectService:

\`\`\`ts
const globalCenter = this.localToGlobalXY({ x: this.width / 2, y: this.height / 2 });
await this._screenEffectService.playAlienBroadRefraction(globalCenter, ScreenEffectScope.GameplayAndUi);
// Optional overrides:
void this._screenEffectService.playAlienBroadRefraction(globalCenter, ScreenEffectScope.GameplayOnly, { strength: 1.2 });
this._screenEffectService.stopAlienBroadRefraction(ScreenEffectScope.GameplayAndUi);
\`\`\`

Same-kind playback replaces the previous effect on each target. Ripple can coexist.
Completion and explicit stop both resolve the Promise. The service owns cleanup.
Do not keep a disposed target registered. Call deregisterTarget before target destruction.
Screen-wide distortion needs target layers containing the intended background.
`;
        files['README.md'] = `# Alien Broad Refraction — game integration

1. Copy the contents of copy-to-game into your game root.
2. If the service already exposes playAlienBroadRefraction, update service imports to read the preset and options from AlienBroadRefractionShaderPass, then skip the patch. The separate Preset.ts file is no longer needed.
3. Otherwise, from the game root run git apply --check PATH/integration/GameScreenEffectService.patch, then git apply PATH/integration/GameScreenEffectService.patch.
4. The patch targets commit 813501db75c72190b66256c44c47cdad24850b33. If the check fails, merge the service changes manually; never overwrite your whole service.
5. Follow examples/service-usage.md. Existing service registration and injection are reused.

The generated ShaderPass is self-contained apart from engine-api. It does not need playground sources or npm packages.
Current numerical parameters are baked into ALIEN_BROAD_REFRACTION_PRESET inside the class file. Game calls determine center and aspect; preview centers are retained in current-preset.json only for reference.
UFO.png is a preview asset and is not included in this code archive.
Validate target bounds, alpha and orientation in your game.
`;
    }
    else {
        files['README.md'] = `# ${effect.name}

Copy copy-to-game into your game root. The selected ShaderPass is self-contained apart from engine-api.
This effect does not yet have a named GameScreenEffectService API. Attach the pass to target.shaderPasses, drive progress from 0 to 1, set aspect to target.width / target.height and call update each frame. Remove your pass on completion and before target destruction. Preserve unrelated passes.
The exported constructor defaults match the current preview. No other effects are included.
For the integrated playAlienBroadRefraction service API, select B in the playground.
`;
    }
    return files;
}
