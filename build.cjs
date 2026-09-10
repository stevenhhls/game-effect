const {spawnSync}=require('node:child_process');
const fs=require('node:fs');
const path=require('node:path');

const compiler=process.env.FX_TYPESCRIPT || require.resolve('typescript/bin/tsc');
const result=spawnSync(process.execPath,[compiler,'-p',path.join(__dirname,'tsconfig.json')],{stdio:'inherit'});
if(result.status!==0)process.exit(result.status ?? 1);

const output=path.join(__dirname,'_site');
fs.rmSync(output,{recursive:true,force:true});
fs.mkdirSync(path.join(output,'tests'),{recursive:true});
for(const name of ['index.html','style.css','UFO.png','bbb2.png'])fs.copyFileSync(path.join(__dirname,name),path.join(output,name));
fs.cpSync(path.join(__dirname,'dist'),path.join(output,'dist'),{recursive:true});
fs.copyFileSync(path.join(__dirname,'tests','alien-study-gpu.html'),path.join(output,'tests','alien-study-gpu.html'));
fs.writeFileSync(path.join(output,'.nojekyll'),'');
console.log('Static site built in _site');
