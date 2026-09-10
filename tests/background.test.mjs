import test from 'node:test';
import assert from 'node:assert/strict';
import {backgroundSize,validateBackgroundFile} from '../dist/core/background.js';
test('accept supported local images and reject invalid input',()=>{
 for(const type of ['image/png','image/jpeg','image/webp'])assert.doesNotThrow(()=>validateBackgroundFile({name:'image',type,size:1024}));
 assert.doesNotThrow(()=>validateBackgroundFile({name:'photo.JPG',type:'',size:1024}));
 for(const file of [{name:'x.svg',type:'image/svg+xml',size:10},{name:'x.png',type:'image/png',size:0},{name:'x.png',type:'image/png',size:21*1024*1024}])assert.throws(()=>validateBackgroundFile(file));
});
test('resize actual texture with aspect preserved and GPU limits respected',()=>{
 assert.deepEqual(backgroundSize(4000,2000,4096),{width:1600,height:800});
 assert.deepEqual(backgroundSize(1000,4000,4096),{width:250,height:1000});
 assert.deepEqual(backgroundSize(2000,1000,512),{width:512,height:256});
 assert.deepEqual(backgroundSize(200,100,4096),{width:200,height:100});
 assert.throws(()=>backgroundSize(0,100,4096));
});
