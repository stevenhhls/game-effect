/** Minimal ZIP STORE writer: no runtime dependency, UTF-8 paths and CRC32. */
export function zipFiles(files: Record<string,string>): Blob {
  const encoder=new TextEncoder(), chunks: Uint8Array[] = [], central: Uint8Array[] = [];
  let offset=0;
  const crc=(bytes:Uint8Array):number=>{
    let c=0xffffffff;
    for(const byte of bytes){c^=byte;for(let bit=0;bit<8;bit++)c=(c>>>1)^((c&1)?0xedb88320:0);}
    return (c^0xffffffff)>>>0;
  };
  for(const [name,source] of Object.entries(files)){
    const filename=encoder.encode(name),data=encoder.encode(source),checksum=crc(data);
    const local=new Uint8Array(30+filename.length),lv=new DataView(local.buffer);
    lv.setUint32(0,0x04034b50,true);lv.setUint16(4,20,true);lv.setUint16(6,0x800,true);
    lv.setUint32(14,checksum,true);lv.setUint32(18,data.length,true);lv.setUint32(22,data.length,true);
    lv.setUint16(26,filename.length,true);local.set(filename,30);
    const record=new Uint8Array(46+filename.length),cv=new DataView(record.buffer);
    cv.setUint32(0,0x02014b50,true);cv.setUint16(4,20,true);cv.setUint16(6,20,true);cv.setUint16(8,0x800,true);
    cv.setUint32(16,checksum,true);cv.setUint32(20,data.length,true);cv.setUint32(24,data.length,true);
    cv.setUint16(28,filename.length,true);cv.setUint32(42,offset,true);record.set(filename,46);
    chunks.push(local,data);central.push(record);offset+=local.length+data.length;
  }
  const end=new Uint8Array(22),ev=new DataView(end.buffer);
  ev.setUint32(0,0x06054b50,true);ev.setUint16(8,central.length,true);ev.setUint16(10,central.length,true);
  ev.setUint32(12,central.reduce((n,c)=>n+c.length,0),true);ev.setUint32(16,offset,true);
  return new Blob([...chunks,...central,end].map(a=>a.buffer as ArrayBuffer),{type:'application/zip'});
}
