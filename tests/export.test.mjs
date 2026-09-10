import test from 'node:test';
import assert from 'node:assert/strict';
import {effects} from '../dist/effects/catalog.js';
import {integrationFiles} from '../dist/exportIntegration.js';
import {normalize} from '../dist/core/types.js';

test('Every export embeds exactly the preview shader and selected defaults without local imports',()=>{
 for(const effect of effects){
  const files=integrationFiles(effect,{duration:1350,strength:1.4,centerX:.23});
  const key=Object.keys(files).find(name=>name.endsWith(effect.className+'.ts'));
  const source=files[key];
  assert.equal(Function('return '+source.split('const FRAGMENT: string = ')[1].split(';\n\nexport class')[0])(),effect.fragment);
  assert.doesNotMatch(source,/from ['"]\./);
  assert.deepEqual(JSON.parse(files['current-preset.json']).parameters,normalize(effect,{duration:1350,strength:1.4,centerX:.23}));
  assert.ok(files['THIRD_PARTY_NOTICES.txt'].includes('Permission is hereby granted'));
 }
});

test('Alien B package includes service patch and typed preset with caller-controlled center',()=>{
 const effect=effects.find(e=>e.id==='alien-b');
 const files=integrationFiles(effect,{strength:1.7,centerX:.21,centerY:.41});
 const preset=files[Object.keys(files).find(name=>name.endsWith('ShaderPass.ts'))];
 assert.match(preset,/strength: 1.7/);
 assert.match(preset,/export const ALIEN_BROAD_REFRACTION_PRESET/);
 assert.ok(preset.split('\n').every(line=>line.length<=200));
 assert.doesNotMatch(preset,/Array<keyof/);
 assert.match(files['integration/GameScreenEffectService.patch'],/playAlienBroadRefraction/);
 assert.match(files['integration/GameScreenEffectService.patch'],/stopAlienBroadRefraction/);
 assert.match(files['README.md'],/playAlienBroadRefractionScreen/);
 assert.equal(Object.keys(files).filter(name=>name.startsWith('copy-to-game/')).length,4);
 assert.equal(JSON.parse(files['manifest.json']).coordinateContract,'whole-game-input-height-v1');
 assert.match(files['integration/SlotGame.patch'],/Application.engine.platform.dimensions/);
 assert.match(files['examples/service-usage.md'],/size.width \* 0.21/);
 assert.match(files['examples/service-usage.md'],/size.height \* 0.41/);
 assert.match(preset,/setScreenInput/);
 assert.match(files['copy-to-game/src/utils/services/screenEffectService/ScreenEffectCompositor.ts'],/screenCaptureInset/);
});
