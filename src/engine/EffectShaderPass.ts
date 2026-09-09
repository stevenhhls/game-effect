import { Shader } from 'engine-api/system/render/Shader';
import { Material } from 'engine-api/system/render/Material';
import { ShaderPass } from 'engine-api/system/render/ShaderPass';
import { IUniforms, UniformType } from 'engine-api/system/render/Uniforms';
import { EffectDefinition, Settings, defaults, normalize, frameUniforms } from '../core/types.js';

/** Engine adapter. The browser preview uses the identical definition and frameUniforms. */
export class EffectShaderPass extends ShaderPass {
  private readonly _definition: EffectDefinition;
  private _settings: Settings;
  private _progress: number = 0;
  private _aspect: number = 1;

  public constructor(definition: EffectDefinition, options: Settings = {}) {
    super();
    this._definition = definition;
    this._settings = normalize(definition, {...defaults(definition), ...options});
    const uniforms: IUniforms = { u_Sampler: { uniformType: UniformType.sampler } };
    Object.keys(frameUniforms(definition, this._settings, 0, 1)).forEach(key => {
      uniforms['u_' + key] = { uniformType: UniformType.float };
    });
    this._material = new Material(new Shader(null, definition.fragment, uniforms));
    this._material.setUniform('u_Sampler', null);
    this.update();
    this.init();
  }
  public get settings(): Settings { return {...this._settings}; }
  public configure(options: Settings): void {
    this._settings = normalize(this._definition, {...this._settings, ...options});
    this.update();
  }
  public get progress(): number { return this._progress; }
  public set progress(value: number) { this._progress = value; }
  public get aspect(): number { return this._aspect; }
  public set aspect(value: number) { this._aspect = value; }
  /** Call after progress/aspect changes, normally once per tween update. */
  public update(): void {
    const values = frameUniforms(this._definition, this._settings, this._progress, this._aspect);
    Object.keys(values).forEach(key => this._material.setUniform('u_' + key, values[key]));
  }
}
