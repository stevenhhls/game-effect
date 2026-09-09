const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const server=http.createServer((req,res)=>{
  try {
    const pathname=new URL(req.url,'http://localhost').pathname;
    const name=pathname==='/'?'index.html':pathname.slice(1);
    if(!(['index.html','style.css','UFO.png','original.frag','natural.frag','tests/alien-study-gpu.html'].includes(name) || /^dist\/[a-zA-Z0-9_/-]+\.js$/.test(name))) {
      res.writeHead(404); return res.end('Not found');
    }
    const file=path.join(__dirname,name);
    if(!fs.existsSync(file)){res.writeHead(404);return res.end('Not found');}
    const type=name.endsWith('.png')?'image/png':name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':name.endsWith('.html')?'text/html':'text/plain';
    res.writeHead(200,{'Content-Type':type+'; charset=utf-8','Cache-Control':'no-store'});
    res.end(fs.readFileSync(file));
  } catch(error){res.writeHead(500);res.end(error.message);}
});
server.on('error',error=>{
  if(error.code==='EADDRINUSE') console.error('Port is already in use. Open the existing URL, stop the old server, or set $env:RIPPLE_PORT=4179.');
  else console.error(error);
  process.exitCode=1;
});
server.listen(Number(process.env.RIPPLE_PORT || 4178),'127.0.0.1',()=>console.log('Shader FX Studio: http://127.0.0.1:'+server.address().port));
