import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {effects} from '../dist/effects/catalog.js';
import {alienStudies, isAlienStudy} from '../dist/effects/alienStudy.js';
import {mergeComparison,comparisonVariants} from '../dist/core/comparison.js';
import {defaults,normalize,frameUniforms} from '../dist/core/types.js';
import {zipFiles} from '../dist/zip.js';
test('eleven unique variants with valid settings and finite uniforms',()=>{
 assert.equal(effects.length,11);assert.equal(new Set(effects.map(x=>x.id)).size,11);
 assert.equal(new Set(effects.map(x=>x.className)).size,11);
 for(const effect of effects){
  const settings=defaults(effect);
  for(const p of effect.parameters) assert.ok(settings[p.key]>=p.min && settings[p.key]<=p.max);
  for(const t of [0,.25,.5,.99,1]) for(const value of Object.values(frameUniforms(effect,settings,t,1.6))) assert.ok(Number.isFinite(value));
  assert.equal(normalize(effect,{duration:NaN}).duration,settings.duration);
  assert.equal(normalize(effect,{duration:99999}).duration,6000);
 }
});
test('Alien A/B/C are independent variants with matching shared defaults',()=>{
 assert.deepEqual(alienStudies.map(effect=>effect.id),['alien-a','alien-b','alien-c']);
 assert.deepEqual(alienStudies.map(effect=>effect.className),[
  'AlienRadialShaderPass','AlienBroadRefractionShaderPass','AlienDetailedRefractionShaderPass'
 ]);
 for(const effect of alienStudies){
  assert.equal(isAlienStudy(effect),true);
  assert.ok(effects.includes(effect));
  assert.equal(effect.category,'ALIEN COMPARISON');
  assert.equal(effect.surface,'grid');
 }
 assert.equal(isAlienStudy(effects.find(effect=>effect.id==='alien')),false);
 for(let index=1;index<alienStudies.length;index++){
  const previous=alienStudies[index-1],current=alienStudies[index];
  const currentDefaults=defaults(current);
  for(const p of previous.parameters){
   assert.equal(currentDefaults[p.key],p.value,`${current.id}: shared default ${p.key}`);
   assert.deepEqual(current.parameters.find(q=>q.key===p.key),p,`${current.id}: shared metadata ${p.key}`);
  }
 }
 assert.equal(alienStudies[0].parameters.some(p=>p.key==='broadStrength'),false);
 assert.equal(alienStudies[1].parameters.some(p=>p.key==='detailStrength'),false);
 assert.ok(defaults(alienStudies[1]).broadStrength>0);
 assert.ok(defaults(alienStudies[2]).detailStrength>0);
});
test('only B/C embed analytic gradient noise, with the upstream license',()=>{
 assert.doesNotMatch(alienStudies[0].fragment,/float\s+psrdnoise\s*\(/);
 for(const effect of alienStudies.slice(1)){
  assert.match(effect.fragment,/float\s+psrdnoise\s*\(/);
  assert.match(effect.fragment,/out\s+vec2\s+gradient/);
  assert.match(effect.fragment,/Copyright \(c\) 2021 Stefan Gustavson and Ian McEwan/);
  assert.match(effect.fragment,/Permission is hereby granted, free of charge/);
 }
 assert.doesNotMatch(alienStudies[1].fragment,/fineGradient/);
 assert.match(alienStudies[2].fragment,/fineGradient/);
});
test('editing A preserves hidden broad/detail settings and propagates shared settings',()=>{
 const [a,,c]=alienStudies;
 let shared=mergeComparison(c,{}, {broadStrength:.025,detailStrength:.011,detailSize:.07});
 const aSettings=comparisonVariants(alienStudies,shared)[a.id];
 shared=mergeComparison(c,shared,{...aSettings,waveWidth:.8,centerX:.25});
 assert.equal(shared.broadStrength,.025);
 assert.equal(shared.detailStrength,.011);
 assert.equal(shared.detailSize,.07);
 const variants=comparisonVariants(alienStudies,shared);
 for(const effect of alienStudies){
  assert.equal(variants[effect.id].waveWidth,.8);
  assert.equal(variants[effect.id].centerX,.25);
 }
 assert.equal(variants[c.id].detailStrength,.011);
});
test('comparison projection exports only each variant supported parameters',()=>{
 const [a,b,c]=alienStudies;
 const shared=mergeComparison(c,{}, {strength:99,notAParameter:17});
 const variants=comparisonVariants(alienStudies,shared);
 assert.equal(shared.strength,3);
 assert.equal('notAParameter' in shared,false);
 for(const effect of alienStudies)assert.deepEqual(Object.keys(variants[effect.id]),effect.parameters.map(p=>p.key));
 assert.equal('broadStrength' in variants[a.id],false);
 assert.equal('detailStrength' in variants[b.id],false);
 assert.equal('detailStrength' in variants[c.id],true);
});
test('resetting the shared comparison preset resets all variants including hidden layers',()=>{
 const c=alienStudies[2];
 const edited=mergeComparison(c,{}, {waveWidth:.95,broadStrength:.04,detailStrength:.02,seed:71});
 assert.notDeepEqual(edited,defaults(c));
 const reset=comparisonVariants(alienStudies,defaults(c));
 for(const effect of alienStudies)assert.deepEqual(reset[effect.id],defaults(effect));
});
test('every download className resolves to a typed engine wrapper source',()=>{
 for(const effect of effects){
  const source=readFileSync(new URL(`../src/engine/${effect.className}.ts`,import.meta.url),'utf8');
  assert.match(source,new RegExp(`export class ${effect.className} extends EffectShaderPass`));
  assert.match(source,new RegExp(`export interface ${effect.className}Options`));
  for(const p of effect.parameters)assert.match(source,new RegExp(`\\b${p.key}\\?\\s*:\\s*number`),`${effect.id}: wrapper option ${p.key}`);
 }
 const psrdSource=readFileSync(new URL('../src/core/psrdnoise.ts',import.meta.url),'utf8');
 assert.match(psrdSource,/THE SOFTWARE IS PROVIDED/);
 assert.match(psrdSource,/https:\/\/github.com\/stegu\/psrdnoise/);
});
test('ripple variants preserve separate defaults',()=>{
 assert.notEqual(defaults(effects[0]).amplitude,defaults(effects[1]).amplitude);
});
test('ZIP has local, central and end records',async()=>{
 const bytes=new Uint8Array(await zipFiles({'example.ts':'export const value = 1;'}).arrayBuffer());
 const view=new DataView(bytes.buffer);
 assert.equal(view.getUint32(0,true),0x04034b50);
 assert.equal(view.getUint32(bytes.length-22,true),0x06054b50);
 assert.equal(view.getUint16(bytes.length-12,true),1);
});
