import { effects } from './effects/catalog.js';
import { alienStudies, alienDetailed, isAlienStudy } from './effects/alienStudy.js';
import { mergeComparison, comparisonVariants } from './core/comparison.js';
import { integrationFiles } from './exportIntegration.js';
import { EffectDefinition, Settings, defaults, normalize, frameUniforms } from './core/types.js';
import { zipFiles } from './zip.js';
import { backgroundSize, validateBackgroundFile } from './core/background.js';
import { gameReference, matchesGameReference } from './core/gameReference.js';
const el=<T extends HTMLElement>(id:string):T=>document.getElementById(id) as T;
const input=(id:string):HTMLInputElement=>el<HTMLInputElement>(id);
const canvas=el<HTMLCanvasElement>('preview');
const context=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:true,preserveDrawingBuffer:true});
if(!context) throw new Error('WebGL unavailable. Enable hardware acceleration.');
const gl=context;
const memory:Record<string,Settings>={};
const comparisonKey='fx-studio-alien-study-v1';
let comparisonSettings=defaults(alienDetailed);
try{comparisonSettings=mergeComparison(alienDetailed,{},JSON.parse(localStorage.getItem(comparisonKey)||'{}'));}catch{}
for(const effect of effects){
 let saved:Settings={};
 try{saved=JSON.parse(localStorage.getItem((effect.id==='alien'?'fx-studio-v4-':'fx-studio-v1-')+effect.id)||'{}');}catch{}
 memory[effect.id]=normalize(effect,{...defaults(effect),...saved});
}
Object.assign(memory,comparisonVariants(alienStudies,comparisonSettings));
let active=effects.find(effect=>effect.id===location.hash.slice(1))||effects.find(effect=>effect.id==='alien-b')!,settings=memory[active.id],elapsed=0,start=performance.now(),running=true;
let ready=false,hasSelection=false;
const programs=new Map<string,WebGLProgram>();
let current:WebGLProgram,plain:WebGLProgram;
let locations:Record<string,WebGLUniformLocation|null>={};
let texture:WebGLTexture;
function report(error:unknown):void{el('error').textContent=String(error);}
function compile(type:number,source:string):WebGLShader{
 const shader=gl.createShader(type)!;gl.shaderSource(shader,source);gl.compileShader(shader);
 if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)) {const msg=gl.getShaderInfoLog(shader);gl.deleteShader(shader);throw Error(msg||'Shader compile failed');}
 return shader;
}
function program(fragment:string):WebGLProgram{
 const vertex=compile(gl.VERTEX_SHADER,'attribute vec2 position;varying vec2 v_TexCoord;void main(){gl_Position=vec4(position,0.,1.);v_TexCoord=vec2((position.x+1.)*.5,(1.-position.y)*.5);}');
 const frag=compile(gl.FRAGMENT_SHADER,fragment),p=gl.createProgram()!;
 gl.attachShader(p,vertex);gl.attachShader(p,frag);gl.bindAttribLocation(p,0,'position');gl.linkProgram(p);
 gl.deleteShader(vertex);gl.deleteShader(frag);
 if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p)||'Link failed');
 return p;
}
function configuration():object{return {version:1,effect:active.id,className:active.className,parameters:settings};}
function sync():void{
 el('referenceStatus').textContent=matchesGameReference(active.id,settings)
  ? 'Matches game reference parameters · Center: 896, 547.2 in 1280 × 720 (0.70, 0.76).'
  : 'Custom parameters — click Match game reference for an exact parameter comparison.';
 el<HTMLTextAreaElement>('output').value=JSON.stringify(configuration(),null,2);
 memory[active.id]={...settings};
 if(isAlienStudy(active)){
  comparisonSettings=mergeComparison(alienDetailed,comparisonSettings,settings);
  Object.assign(memory,comparisonVariants(alienStudies,comparisonSettings));
  try{localStorage.setItem(comparisonKey,JSON.stringify(comparisonSettings));}catch{}
 }else{
  try{localStorage.setItem((active.id==='alien'?'fx-studio-v4-':'fx-studio-v1-')+active.id,JSON.stringify(settings));}catch{}
 }
}
function replay():void{elapsed=0;start=performance.now();running=true;el('pause').textContent='Pause';}
function controls():void{
 const root=el('controls');root.replaceChildren();
 for(const p of active.parameters){
  const row=document.createElement('div');row.className='control';
  const label=document.createElement('label');label.htmlFor='param-'+p.key;
  const title=document.createElement('span');title.textContent=p.label;label.append(title);
  const number=document.createElement('input');number.type='number';number.id='param-'+p.key;
  const range=document.createElement('input');range.type='range';range.setAttribute('aria-label',p.label+' slider');
  for(const field of [number,range]){field.min=String(p.min);field.max=String(p.max);field.step=String(p.step);field.value=String(settings[p.key]);}
  label.append(number);const help=document.createElement('small');help.textContent=p.help;
  row.append(label,help,range);root.append(row);
  const change=(field:HTMLInputElement):void=>{
   if(!Number.isFinite(field.valueAsNumber))return;
   settings=normalize(active,{...settings,[p.key]:field.valueAsNumber});
   number.value=range.value=String(settings[p.key]);sync();replay();
  };
  number.addEventListener('change',()=>change(number));range.addEventListener('input',()=>change(range));
 }
 sync();
}
function select(effect:EffectDefinition):void{
 const keepFrame=hasSelection&&isAlienStudy(active)&&isAlienStudy(effect);
 hasSelection=true;
 active=effect;settings={...memory[effect.id]};
 history.replaceState(null,'','#'+effect.id);
 if(ready){current=programs.get(effect.id)!;locations=Object.fromEntries(Object.keys(frameUniforms(effect,settings,0,1)).map(k=>[k,gl.getUniformLocation(current,'u_'+k)]));}
 el('title').textContent=effect.name;el('description').textContent=effect.description;
 document.querySelectorAll<HTMLButtonElement>('[data-effect]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.effect===effect.id)));
 el('comparison').hidden=!isAlienStudy(effect);
 el('reset').textContent=isAlienStudy(effect)?'Reset A/B/C preset':'Reset preset';
 controls();if(!keepFrame)replay();
}
function upload(image:HTMLCanvasElement|HTMLImageElement):void{
 const width=image instanceof HTMLImageElement?image.naturalWidth:image.width;
 const height=image instanceof HTMLImageElement?image.naturalHeight:image.height;
 const size=backgroundSize(width,height,gl.getParameter(gl.MAX_TEXTURE_SIZE));
 const resized=document.createElement('canvas');resized.width=size.width;resized.height=size.height;
 resized.getContext('2d')!.drawImage(image,0,0,size.width,size.height);
 const next=gl.createTexture();if(!next)throw new Error('Unable to allocate the background texture.');
 gl.bindTexture(gl.TEXTURE_2D,next);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
 gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);
 gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,resized);
 if(gl.getError()!==gl.NO_ERROR){gl.deleteTexture(next);gl.bindTexture(gl.TEXTURE_2D,texture);throw new Error('Unable to load this image into WebGL.');}
 gl.deleteTexture(texture);texture=next;
 canvas.width=size.width;canvas.height=size.height;gl.viewport(0,0,size.width,size.height);replay();
}
let backgroundRequest=0,backgroundName='UFO.png (default)';
async function changeBackground(source:File|string='UFO.png'):Promise<void>{
 const request=++backgroundRequest;
 const file=typeof source==='string'?undefined:source;
 let objectUrl:string|undefined;
 try{
  if(file)validateBackgroundFile(file);
  el('backgroundStatus').textContent='Loading background…';
  const image=new Image();
  image.src=file?(objectUrl=URL.createObjectURL(file)):'./'+source;
  await image.decode();
  if(request!==backgroundRequest)return;
  upload(image);backgroundName=file?file.name:String(source);
  el('backgroundStatus').textContent=backgroundName+' · '+canvas.width+' × '+canvas.height;
  el('backgroundError').textContent='';
 }catch(error){
  if(request===backgroundRequest){
   el('backgroundStatus').textContent=backgroundName;
   el('backgroundError').textContent=error instanceof Error&&error.name!=='EncodingError'?error.message:'Unable to decode this image. Choose another PNG, JPG or WebP.';
  }
 }finally{if(objectUrl)URL.revokeObjectURL(objectUrl);}
}
function download(blob:Blob,name:string):void{const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
async function downloadCode():Promise<void>{
 const button=el<HTMLButtonElement>('download');button.disabled=true;
 // Snapshot before asynchronous loading so edits cannot mix presets and examples.
 const chosen=active,options={...settings};
 try{
  const sources=integrationFiles(chosen,options);
  download(zipFiles(sources),'shader-fx-'+chosen.id+'-game-integration.zip');
  el('downloadStatus').textContent=chosen.id==='alien-b'?'Downloaded standalone ShaderPass, preset, service patch and usage guide.':'Downloaded standalone ShaderPass. Service API integration is currently available for Alien B.';
 }catch(error){report(error);}finally{button.disabled=false;}
}
for(const effect of effects){
 const button=document.createElement('button');button.dataset.effect=effect.id;button.textContent=effect.name;
 const small=document.createElement('small');small.textContent=effect.category;button.append(small);button.onclick=()=>{if(ready)select(effect);};el('effects').append(button);
}
for(const button of document.querySelectorAll<HTMLButtonElement>('#comparison [data-effect]')){
 button.onclick=()=>{const effect=effects.find(e=>e.id===button.dataset.effect);if(ready&&effect)select(effect);};
}
window.addEventListener('hashchange',()=>{
 const effect=effects.find(e=>e.id===location.hash.slice(1));
 if(ready&&effect&&effect!==active)select(effect);
});
el('reset').onclick=()=>{
 if(isAlienStudy(active)){comparisonSettings=defaults(alienDetailed);Object.assign(memory,comparisonVariants(alienStudies,comparisonSettings));}
 settings=defaults(active);memory[active.id]={...settings};controls();replay();
};
el('play').onclick=replay;
el('pause').onclick=()=>{running=!running;if(running)start=performance.now()-elapsed;el('pause').textContent=running?'Pause':'Resume';};
input('scrub').oninput=()=>{elapsed=input('scrub').valueAsNumber*settings.duration;running=false;el('pause').textContent='Resume';};
el('gameReference').onclick=()=>{
 if(!ready)return;
 const effect=effects.find(e=>e.id==='alien-b')!;
 select(effect);settings=normalize(effect,{...gameReference});controls();replay();
};
for(const button of document.querySelectorAll<HTMLButtonElement>('[data-progress]')){
 button.onclick=()=>{
  if(!ready)return;
  elapsed=Number(button.dataset.progress)*settings.duration;running=false;el('pause').textContent='Resume';
 };
}
el('download').onclick=()=>void downloadCode();
input('backgroundFile').onchange=()=>{
 const file=input('backgroundFile').files?.[0];
 input('backgroundFile').value=''; // Allow choosing the same file again.
 if(ready&&file)void changeBackground(file);
};
el<HTMLSelectElement>('backgroundSelect').onchange=()=>{
 const value=el<HTMLSelectElement>('backgroundSelect').value;
 el('customBackground').hidden=value!=='custom';
 if(ready&&value!=='custom')void changeBackground(value);
};
el('defaultBackground').onclick=()=>{
 if(!ready)return;
 el<HTMLSelectElement>('backgroundSelect').value='UFO.png';el('customBackground').hidden=true;
 void changeBackground();
};
el('json').onclick=()=>download(new Blob([JSON.stringify(configuration(),null,2)],{type:'application/json'}),'fx-'+active.id+'.json');
canvas.onclick=event=>{
 if(!('centerX' in settings))return;
 const rect=canvas.getBoundingClientRect();
 settings.centerX=Number(((event.clientX-rect.left)/rect.width).toFixed(3));settings.centerY=Number(((event.clientY-rect.top)/rect.height).toFixed(3));controls();replay();
};
function frame(now:number):void{
 if(running){elapsed=now-start;if(elapsed>settings.duration+500){if(input('loop').checked)replay();else{elapsed=settings.duration;running=false;el('pause').textContent='Resume';}}}
 const progress=Math.max(0,Math.min(1,elapsed/settings.duration));
 gl.disable(gl.SCISSOR_TEST);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
 gl.useProgram(current);
 for(const [key,value] of Object.entries(frameUniforms(active,settings,progress,canvas.width/canvas.height)))gl.uniform1f(locations[key],value);
 gl.drawArrays(gl.TRIANGLES,0,6);
 if(input('compare').checked){
  gl.enable(gl.SCISSOR_TEST);gl.scissor(0,0,Math.floor(canvas.width/2),canvas.height);
  gl.useProgram(plain);gl.drawArrays(gl.TRIANGLES,0,6);gl.disable(gl.SCISSOR_TEST);
 }
 input('scrub').value=String(progress);el('time').textContent=Math.round(progress*settings.duration)+' / '+settings.duration+' ms';
 requestAnimationFrame(frame);
}
async function boot():Promise<void>{
try{
 for(const effect of effects)programs.set(effect.id,program(effect.fragment));
 plain=program('precision highp float;uniform sampler2D u_Sampler;varying vec2 v_TexCoord;void main(){gl_FragColor=texture2D(u_Sampler,v_TexCoord);}');
 const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
 texture=gl.createTexture()!;gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
 const background=new Image();background.src='./UFO.png';await background.decode();upload(background);
 el('backgroundStatus').textContent=backgroundName+' · '+canvas.width+' × '+canvas.height;
 input('backgroundFile').disabled=false;el<HTMLButtonElement>('defaultBackground').disabled=false;
 el<HTMLSelectElement>('backgroundSelect').disabled=false;
 ready=true;select(active);el('status').textContent='● '+effects.length+' shaders compiled';el<HTMLButtonElement>('download').disabled=false;requestAnimationFrame(frame);
}catch(error){report(error);el('status').textContent='Preview unavailable';}
}
void boot();
