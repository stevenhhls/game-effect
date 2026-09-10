/** Adjustable desktop columns; narrow screens retain the stacked layout. */
export function setupPanelResize():void {
 const main=document.querySelector('main')!;
 const library=main.querySelector<HTMLElement>('.library')!;
 const stage=main.querySelector<HTMLElement>('.stage')!;
 const wide=matchMedia('(min-width: 901px)');
 const key='fx-studio-panel-widths-v1';
 let widths=[195,325];
 try{const saved=JSON.parse(localStorage.getItem(key)||'null');if(Array.isArray(saved)&&saved.length===2&&saved.every(x=>typeof x==='number'&&Number.isFinite(x)))widths=saved;}catch{}
 const available=()=>main.clientWidth-parseFloat(getComputedStyle(main).paddingLeft)-parseFloat(getComputedStyle(main).paddingRight)-24;
 const handles=[0,1].map(index=>{
  const handle=document.createElement('div');handle.className='panel-resizer';handle.tabIndex=0;
  handle.setAttribute('role','separator');handle.setAttribute('aria-orientation','vertical');
  handle.setAttribute('aria-label',index===0?'Resize effect library':'Resize parameters');
  handle.title='Drag to resize · Double-click to reset · Arrow keys to adjust';
  (index===0?library:stage).after(handle);return handle;
 });
 function apply():void{
  if(!wide.matches)return;
  const total=available();
  widths[0]=Math.max(130,Math.min(widths[0],total-560));
  widths[1]=Math.max(240,Math.min(widths[1],total-widths[0]-320));
  main.style.setProperty('--library-width',widths[0]+'px');
  main.style.setProperty('--parameters-width',widths[1]+'px');
  handles.forEach((handle,i)=>{
   handle.setAttribute('aria-valuemin',String(i===0?130:240));
   handle.setAttribute('aria-valuemax',String(Math.floor(total-widths[1-i]-320)));
   handle.setAttribute('aria-valuenow',String(Math.round(widths[i])));
  });
 }
 function save():void{try{localStorage.setItem(key,JSON.stringify(widths));}catch{}}
 handles.forEach((handle,index)=>{
  let drag:{id:number;x:number;width:number}|undefined;
  handle.onpointerdown=event=>{
   if(event.button!==0||!wide.matches)return;
   event.preventDefault();handle.focus();handle.setPointerCapture(event.pointerId);
   drag={id:event.pointerId,x:event.clientX,width:widths[index]};document.body.classList.add('resizing-panels');
  };
  handle.onpointermove=event=>{
   if(!drag||drag.id!==event.pointerId)return;
   const requested=drag.width+(event.clientX-drag.x)*(index===0?1:-1);
   widths[index]=Math.max(index===0?130:240,Math.min(requested,available()-widths[1-index]-320));apply();
  };
  const finish=()=>{if(!drag)return;drag=undefined;document.body.classList.remove('resizing-panels');save();};
  handle.onpointerup=finish;handle.onpointercancel=finish;handle.onlostpointercapture=finish;
  handle.ondblclick=()=>{widths=[195,325];apply();save();};
  handle.onkeydown=event=>{
   if(event.key!=='ArrowLeft'&&event.key!=='ArrowRight')return;
   event.preventDefault();const delta=(event.key==='ArrowRight'?1:-1)*(index===0?1:-1)*(event.shiftKey?40:10);
   widths[index]=Math.max(index===0?130:240,Math.min(widths[index]+delta,available()-widths[1-index]-320));apply();save();
  };
 });
 new ResizeObserver(apply).observe(main);wide.addEventListener('change',apply);apply();
}
