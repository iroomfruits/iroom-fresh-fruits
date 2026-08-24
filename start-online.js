const fs=require("fs"),path=require("path");
const ROOT=__dirname;

// Local .env loader (cloud services normally provide environment variables directly)
const envFile=path.join(ROOT,".env");
if(fs.existsSync(envFile)){
  for(const raw of fs.readFileSync(envFile,"utf8").split(/\r?\n/)){
    const line=raw.trim(); if(!line||line.startsWith("#")) continue;
    const i=line.indexOf("="); if(i<1) continue;
    const k=line.slice(0,i).trim(),v=line.slice(i+1).trim().replace(/^["']|["']$/g,"");
    if(process.env[k]===undefined) process.env[k]=v;
  }
}

// Render / Railway public domain auto-detection.
if(!process.env.PUBLIC_URL){
  const host=process.env.RENDER_EXTERNAL_HOSTNAME || process.env.RAILWAY_PUBLIC_DOMAIN || "";
  if(host) process.env.PUBLIC_URL=`https://${host}`;
}

function copyRecursive(src,dst){
  if(!fs.existsSync(src)) return;
  fs.mkdirSync(dst,{recursive:true});
  for(const name of fs.readdirSync(src)){
    const s=path.join(src,name),d=path.join(dst,name),st=fs.lstatSync(s);
    if(st.isDirectory()) copyRecursive(s,d);
    else if(!fs.existsSync(d)) fs.copyFileSync(s,d);
  }
}
function linkPersistent(localPath,persistentPath){
  fs.mkdirSync(persistentPath,{recursive:true});
  if(fs.existsSync(localPath)){
    const st=fs.lstatSync(localPath);
    if(st.isSymbolicLink()) fs.unlinkSync(localPath);
    else {
      copyRecursive(localPath,persistentPath); // first deploy: preserve seed/sample files
      fs.rmSync(localPath,{recursive:true,force:true});
    }
  }
  fs.mkdirSync(path.dirname(localPath),{recursive:true});
  fs.symlinkSync(persistentPath,localPath,"dir");
}

// Optional cloud persistent storage.
// Mount one persistent disk/volume to PERSIST_DIR (recommended: /data).
const persist=String(process.env.PERSIST_DIR||"").trim();
if(persist){
  try{
    fs.mkdirSync(persist,{recursive:true});
    linkPersistent(path.join(ROOT,"data"),path.join(persist,"state"));
    linkPersistent(path.join(ROOT,"public","uploads"),path.join(persist,"uploads"));
    linkPersistent(path.join(ROOT,"backups"),path.join(persist,"backups"));
    console.log(`[IROOM] persistent storage ready: ${persist}`);
  }catch(e){
    console.error("[IROOM] persistent storage setup failed:",e);
    process.exit(1);
  }
}

require("./server.js");
