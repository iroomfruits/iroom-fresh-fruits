const http=require("http"),https=require("https"),tls=require("tls"),fs=require("fs"),path=require("path"),crypto=require("crypto");
const {URL}=require("url");
const ROOT=__dirname,DATA=path.join(ROOT,"data","store.json"),PUBLIC=path.join(ROOT,"public"),BACKUP=path.join(ROOT,"backups");
fs.mkdirSync(path.join(PUBLIC,"uploads"),{recursive:true});
fs.mkdirSync(path.join(PUBLIC,"uploads","library"),{recursive:true});
fs.mkdirSync(BACKUP,{recursive:true});

const ENV={
  NODE_ENV:process.env.NODE_ENV||"development",
  PUBLIC_URL:String(process.env.PUBLIC_URL||"").replace(/\/+$/,""),
  ADMIN_PASSWORD:process.env.ADMIN_PASSWORD||"",
  OPENAI_API_KEY:process.env.OPENAI_API_KEY||"",
  SMTP_HOST:process.env.SMTP_HOST||"",
  SMTP_PORT:Number(process.env.SMTP_PORT||0),
  SMTP_USER:process.env.SMTP_USER||"",
  SMTP_PASSWORD:process.env.SMTP_PASSWORD||"",
  ORDER_EMAIL:process.env.ORDER_EMAIL||"",
  BREVO_API_KEY:process.env.BREVO_API_KEY||"",
  BREVO_SENDER_EMAIL:process.env.BREVO_SENDER_EMAIL||"",
  BREVO_SENDER_NAME:process.env.BREVO_SENDER_NAME||"이룸 fresh fruits",
  SENS_ACCESS_KEY:process.env.SENS_ACCESS_KEY||"",
  SENS_SECRET_KEY:process.env.SENS_SECRET_KEY||"",
  SENS_SERVICE_ID:process.env.SENS_SERVICE_ID||"",
  SENS_FROM:process.env.SENS_FROM||"",
  ADMIN_PHONE:process.env.ADMIN_PHONE||"",
  TRUST_PROXY:String(process.env.TRUST_PROXY||"1")==="1"
};

const sessions=new Map(),adminSessions=new Map(),rateBuckets=new Map();
const SESSION_TTL=1000*60*60*24*7,ADMIN_TTL=1000*60*60*8;
let lastBackupAt=0;

function read(){
  const s=JSON.parse(fs.readFileSync(DATA,"utf8"));
  for(const k of ["products","members","orders","reviews","inquiries","coupons","events","banners","popups","adminLogs","mediaLibrary","mediaFolders","groupBuys","groupBuyParticipants"])s[k]||=[];
  s.settings||={};s.marketingStats||={visits:0,shares:0,bandClicks:0,cartAdds:0,orders:0,sources:{}};s.marketingStats.sources||={};
  return s;
}
function safeBackup(){
  const now=Date.now();if(now-lastBackupAt<1000*60*10)return;
  lastBackupAt=now;
  try{
    const stamp=new Date().toISOString().replace(/[:.]/g,"-");
    fs.copyFileSync(DATA,path.join(BACKUP,`store_${stamp}.json`));
    const files=fs.readdirSync(BACKUP).filter(x=>x.startsWith("store_")&&x.endsWith(".json")).sort().reverse();
    for(const f of files.slice(30))try{fs.unlinkSync(path.join(BACKUP,f))}catch{}
  }catch(e){console.error("backup failed",e.message)}
}
function write(s){
  safeBackup();
  const tmp=DATA+".tmp";
  fs.writeFileSync(tmp,JSON.stringify(s,null,2),"utf8");
  fs.renameSync(tmp,DATA);
}
function send(res,status,obj,headers={}){
  const b=JSON.stringify(obj);
  res.writeHead(status,{
    "Content-Type":"application/json; charset=utf-8",
    "X-Content-Type-Options":"nosniff",
    "X-Frame-Options":"DENY",
    "Referrer-Policy":"strict-origin-when-cross-origin",
    "Permissions-Policy":"camera=(), microphone=(), geolocation=()",
    ...headers
  });
  res.end(b);
}
function parse(req){return new Promise((ok,bad)=>{let b="";req.on("data",c=>{b+=c;if(b.length>80*1024*1024){bad(new Error("업로드 용량 초과"));req.destroy()}});req.on("end",()=>{try{ok(b?JSON.parse(b):{})}catch(e){bad(e)}});req.on("error",bad)})}
function hash(p,s=crypto.randomBytes(16).toString("hex")){return {salt:s,hash:crypto.scryptSync(String(p),s,64).toString("hex")}}
function verify(p,m){if(!m.passwordHash)return false;try{return crypto.timingSafeEqual(crypto.scryptSync(String(p),m.passwordSalt,64),Buffer.from(m.passwordHash,"hex"))}catch{return false}}
function token(){return crypto.randomBytes(32).toString("hex")}
function bearer(req){const h=req.headers.authorization||"";return h.startsWith("Bearer ")?h.slice(7):""}
function sessionGet(map,key,ttl){
  const v=map.get(key);if(!v)return null;
  if(Date.now()-v.at>ttl){map.delete(key);return null}
  v.at=Date.now();return v.value;
}
function memberAuth(req){const id=sessionGet(sessions,bearer(req),SESSION_TTL);return id?read().members.find(m=>m.id===id):null}
function adminAuth(req){return !!sessionGet(adminSessions,bearer(req),ADMIN_TTL)}
function ipOf(req){return String((ENV.TRUST_PROXY&&req.headers["x-forwarded-for"]?String(req.headers["x-forwarded-for"]).split(",")[0]:"")||req.socket.remoteAddress||"unknown").trim()}
function rateLimit(req,key,limit,windowMs){
  const k=key+":"+ipOf(req),now=Date.now();let b=rateBuckets.get(k);
  if(!b||now>b.reset)b={count:0,reset:now+windowMs};
  b.count++;rateBuckets.set(k,b);return b.count<=limit;
}
setInterval(()=>{const now=Date.now();for(const [k,v] of rateBuckets)if(now>v.reset)rateBuckets.delete(k)},60_000).unref();
function pubMember(m){return {id:m.id,username:m.username,name:m.name,phone:m.phone,email:m.email||"",postcode:m.postcode||"",address:m.address||"",detailAddress:m.detailAddress||"",wishlist:m.wishlist||[],createdAt:m.createdAt}}
function log(s,action,detail=""){s.adminLogs.unshift({id:"LG"+Date.now(),at:new Date().toISOString(),action,detail});s.adminLogs=s.adminLogs.slice(0,500)}
function sanitizeStore(s){const x=JSON.parse(JSON.stringify(s));x.members=[];x.adminLogs=[];x.groupBuyParticipants=[];if(x.settings){for(const k of ["adminPassword","pgClientKey","pgSecretKey","naverPayClientId","kakaoPayCid","sensAccessKey","sensSecretKey","sensServiceId","sensFrom","smtpPassword","openaiApiKey","bandAccessToken","bandClientSecret"])delete x.settings[k]}return x}
function extFromMime(mime){return {"image/jpeg":"jpg","image/png":"png","image/webp":"webp","image/gif":"gif","video/mp4":"mp4","video/webm":"webm","video/quicktime":"mov"}[mime]||"bin"}
function trackingUrl(carrier,no){
  const q=encodeURIComponent((carrier||"택배")+" "+(no||"")+" 배송조회");
  return "https://search.naver.com/search.naver?query="+q;
}
function csvEscape(v){v=v==null?"":String(v);return `"${v.replace(/"/g,'""')}"`}


function localAdvisor(s){
  const low=(s.products||[]).filter(p=>Number(p.stock)<=Number(s.settings.lowStockThreshold||5));
  const pending=(s.orders||[]).filter(o=>["주문접수","입금대기","결제대기","상품준비중"].includes(o.status));
  const refund=(s.orders||[]).filter(o=>["취소요청","환불요청"].includes(o.status));
  const best=[...(s.products||[])].sort((a,b)=>Number(b.stock||0)-Number(a.stock||0)).slice(0,3);
  const m=s.marketingStats||{};
  const tips=[];
  if(low.length) tips.push(`저재고 상품 ${low.length}개를 먼저 확인하세요: ${low.slice(0,5).map(x=>x.name).join(", ")}`);
  if(pending.length) tips.push(`처리 대기 주문이 ${pending.length}건 있습니다. 오늘 출고 가능한 주문부터 상태를 업데이트하세요.`);
  if(refund.length) tips.push(`취소/환불 요청이 ${refund.length}건 있습니다. 고객 응답 속도가 재구매 신뢰에 중요합니다.`);
  if(Number(m.visits||0)>0 && Number(m.orders||0)===0) tips.push("방문은 있지만 주문 전환이 없습니다. 첫구매 혜택, 배송비, BEST 상품 노출을 점검해 보세요.");
  if(!tips.length) tips.push("현재 긴급 운영 이슈가 크지 않습니다. BEST 상품, 계절 이벤트, 고객 리뷰를 주기적으로 갱신해 보세요.");
  return {
    summary:`상품 ${(s.products||[]).length}개 · 주문 ${(s.orders||[]).length}건 · 회원 ${(s.members||[]).length}명 · 저재고 ${low.length}개 · 취소/환불 요청 ${refund.length}건`,
    tips,
    best:best.map(x=>x.name)
  };
}
function openaiResponse(apiKey,model,input){
  return new Promise((resolve,reject)=>{
    const payload=JSON.stringify({model:model||"gpt-5.6-luna",input});
    const req=https.request({
      hostname:"api.openai.com",path:"/v1/responses",method:"POST",
      headers:{"Content-Type":"application/json","Authorization":"Bearer "+apiKey,"Content-Length":Buffer.byteLength(payload)}
    },r=>{let body="";r.on("data",c=>body+=c);r.on("end",()=>{try{const d=JSON.parse(body);if(r.statusCode<200||r.statusCode>=300)return reject(new Error(d.error?.message||"AI 요청 실패"));let text=d.output_text;if(!text&&Array.isArray(d.output)){text=d.output.flatMap(o=>o.content||[]).map(c=>c.text||"").join("\n")}resolve(text||"응답이 비어 있습니다.")}catch(e){reject(e)}})});
    req.on("error",reject);req.write(payload);req.end();
  });
}


function getSecret(s,key,envKey){return String(ENV[envKey]||s.settings?.[key]||"").trim()}
function bandRequest(method,endpoint,params={}){
  return new Promise((resolve,reject)=>{
    const body=new URLSearchParams(params).toString();
    const isGet=method==="GET";
    const path=endpoint+(isGet&&body?(endpoint.includes("?")?"&":"?")+body:"");
    const r=https.request({hostname:"openapi.band.us",path,method,headers:isGet?{}:{"Content-Type":"application/x-www-form-urlencoded","Content-Length":Buffer.byteLength(body)}},resp=>{let raw="";resp.on("data",c=>raw+=c);resp.on("end",()=>{try{const d=JSON.parse(raw);if(resp.statusCode<200||resp.statusCode>=300||Number(d.result_code)!==1)return reject(new Error(d.result_data?.message||d.result_data?.error_description||d.message||"BAND API 요청 실패"));resolve(d)}catch(e){reject(e)}})});
    r.on("error",reject);if(!isGet&&body)r.write(body);r.end();
  });
}
function buildBandHomepagePosts(s,siteUrlOverride=""){
  const brand=s.settings?.brand||"이룸 fresh fruits";
  const phone=s.settings?.phone||"010-6423-4562";
  const email=s.settings?.email||"iroom4562@naver.com";
  const address=s.settings?.address||"서울시 송파구 가락동 21-6 쌍용상가 B-103호";
  const bandUrl=s.settings?.bandUrl||"https://band.us/@iroomfresh";
  const siteUrl=String(siteUrlOverride||s.settings?.siteUrl||"").trim().replace(/\/$/,"");
  const siteLine=siteUrl?`\n홈페이지: ${siteUrl}?utm_source=band&utm_medium=post&utm_campaign=band_home_sync`:"";
  const active=(s.products||[]).filter(x=>x.active!==false);
  const posts=[];
  posts.push({type:"intro",title:`${brand} 소개`,content:`🍎 ${brand}\n\n신선함을 담고, 정성을 더합니다.\n\n저희는 좋은 산지의 과일을 엄선해 합리적인 가격으로 전해드립니다.\n\n✓ 신선한 과일\n✓ 엄선된 품질\n✓ 빠른 배송\n✓ 정직한 가격\n✓ 고객 만족\n\n📞 ${phone}\n✉️ ${email}\n📍 ${address}${siteLine}\nBAND: ${bandUrl}\n\n#이룸freshfruits #신선한과일 #제철과일`});
  posts.push({type:"guide",title:"주문·문의 안내",content:`📌 ${brand} 주문·문의 안내\n\n상품은 아래 게시글에서 확인하실 수 있습니다.\n주문 및 문의는 BAND 댓글/채팅 또는 전화로 남겨주세요.\n\n📞 전화: ${phone}\n✉️ 이메일: ${email}\n📍 매장: ${address}${siteLine}\n\n판매가·재고·배송조건은 주문 시점의 최신 안내를 기준으로 합니다.`});
  active.forEach((p,i)=>{
    const price=Number(p.salePrice||p.price||0).toLocaleString();
    const normal=p.salePrice&&Number(p.price)>Number(p.salePrice)?`\n정상가: ${Number(p.price).toLocaleString()}원`:"";
    const stock=Number.isFinite(Number(p.stock))?`\n재고: ${Number(p.stock)}개`:"";
    const productLink=siteUrl?`\n🛒 홈페이지 주문: ${siteUrl}?utm_source=band&utm_medium=product&utm_campaign=${encodeURIComponent(String(p.id||i+1))}`:"";
    const imageLine=p.image&&/^https?:\/\//i.test(String(p.image))?`\n상품 이미지: ${p.image}`:"";
    posts.push({type:"product",productId:p.id,title:p.name,content:`🍏 오늘의 ${brand}\n\n${p.name}\n\n• 산지: ${p.origin||"엄선 산지"}\n• 구성: ${p.unit||"상품 상세참조"}${normal}\n• 판매가: ${price}원${stock}\n\n${p.description||"신선한 과일을 정성껏 준비했습니다."}${productLink}${imageLine}\n\n주문/문의: ${phone}\nBAND: ${bandUrl}\n\n#이룸freshfruits #신선한과일 #과일선물 #과일공구`});
  });
  return posts;
}

function brevoSend(s,{to,subject,text}){
  const apiKey=ENV.BREVO_API_KEY||"";
  const senderEmail=ENV.BREVO_SENDER_EMAIL||ENV.SMTP_USER||s.settings?.smtpUser||s.settings?.email||"";
  const senderName=ENV.BREVO_SENDER_NAME||s.settings?.brand||"이룸 fresh fruits";
  if(!apiKey||!senderEmail||!to)return Promise.resolve({ok:false,skipped:true,reason:"Brevo API 미설정"});
  return new Promise(resolve=>{
    const body=JSON.stringify({
      sender:{name:senderName,email:senderEmail},
      to:[{email:to}],
      subject:String(subject||"이룸 fresh fruits 알림"),
      textContent:String(text||"")
    });
    const rq=https.request({
      hostname:"api.brevo.com",path:"/v3/smtp/email",method:"POST",
      headers:{"accept":"application/json","api-key":apiKey,"content-type":"application/json","content-length":Buffer.byteLength(body)}
    },rr=>{
      let raw="";rr.on("data",c=>raw+=c);rr.on("end",()=>{
        let data={};try{data=raw?JSON.parse(raw):{}}catch{}
        if(rr.statusCode>=200&&rr.statusCode<300)return resolve({ok:true,status:rr.statusCode,messageId:data.messageId||""});
        resolve({ok:false,status:rr.statusCode,error:data.message||raw.slice(0,500)||`Brevo HTTP ${rr.statusCode}`});
      });
    });
    rq.setTimeout(15000,()=>{rq.destroy(new Error("Brevo API timeout"))});
    rq.on("error",e=>resolve({ok:false,error:e.message}));rq.write(body);rq.end();
  });
}
async function mailSend(s,payload){
  // Render Free에서는 SMTP outbound 포트가 제한될 수 있으므로 HTTPS API를 우선 사용.
  if(ENV.BREVO_API_KEY){
    const r=await brevoSend(s,payload);
    if(r.ok||!r.skipped)return r;
  }
  return smtpSend(s,payload);
}
function smtpSend(s,{to,subject,text}){
  const host=getSecret(s,"smtpHost","SMTP_HOST")||"smtp.naver.com";
  const port=Number(ENV.SMTP_PORT||s.settings?.smtpPort||465);
  const user=getSecret(s,"smtpUser","SMTP_USER");
  const pass=getSecret(s,"smtpPassword","SMTP_PASSWORD");
  if(!user||!pass||!to)return Promise.resolve({ok:false,skipped:true,reason:"SMTP 미설정"});
  return new Promise(resolve=>{
    const sock=tls.connect({host,port,servername:host,rejectUnauthorized:true},()=>{
      let stage=0,buf="";
      const sendLine=x=>sock.write(x+"\r\n");
      const b64=x=>Buffer.from(String(x),"utf8").toString("base64");
      const mail=[
        `From: ${user}`,`To: ${to}`,`Subject: =?UTF-8?B?${b64(subject)}?=`,
        `MIME-Version: 1.0`,`Content-Type: text/plain; charset=UTF-8`,`Content-Transfer-Encoding: base64`,"",b64(text),"."
      ];
      sock.on("data",chunk=>{
        buf+=chunk.toString();
        const lines=buf.split(/\r?\n/);buf=lines.pop();
        for(const line of lines){
          if(!/^\d{3}/.test(line))continue;
          const code=Number(line.slice(0,3));
          if(code>=400){sock.end();return resolve({ok:false,error:line})}
          if(stage===0&&code===220){stage=1;sendLine("EHLO iroomfresh")}
          else if(stage===1&&code===250&&line[3]===" "){stage=2;sendLine("AUTH LOGIN")}
          else if(stage===2&&code===334){stage=3;sendLine(b64(user))}
          else if(stage===3&&code===334){stage=4;sendLine(b64(pass))}
          else if(stage===4&&code===235){stage=5;sendLine(`MAIL FROM:<${user}>`)}
          else if(stage===5&&code===250){stage=6;sendLine(`RCPT TO:<${to}>`)}
          else if(stage===6&&(code===250||code===251)){stage=7;sendLine("DATA")}
          else if(stage===7&&code===354){stage=8;for(const l of mail)sendLine(l)}
          else if(stage===8&&code===250){sendLine("QUIT");sock.end();return resolve({ok:true})}
        }
      });
    });
    sock.setTimeout(15000,()=>{sock.destroy();resolve({ok:false,error:"SMTP timeout"})});
    sock.on("error",e=>resolve({ok:false,error:e.message}));
  });
}
function sensSend(s,{to,content}){
  const access=getSecret(s,"sensAccessKey","SENS_ACCESS_KEY"),secret=getSecret(s,"sensSecretKey","SENS_SECRET_KEY");
  const serviceId=getSecret(s,"sensServiceId","SENS_SERVICE_ID"),from=(getSecret(s,"sensFrom","SENS_FROM")||"").replace(/\D/g,"");
  to=String(to||"").replace(/\D/g,"");
  if(!access||!secret||!serviceId||!from||!to)return Promise.resolve({ok:false,skipped:true,reason:"SENS 미설정"});
  return new Promise(resolve=>{
    const ts=Date.now().toString(),uri=`/sms/v2/services/${serviceId}/messages`,method="POST";
    const sig=crypto.createHmac("sha256",secret).update(`${method} ${uri}\n${ts}\n${access}`).digest("base64");
    const body=JSON.stringify({type:"SMS",contentType:"COMM",countryCode:"82",from,content:String(content).slice(0,80),messages:[{to,content:String(content).slice(0,80)}]});
    const rq=https.request({hostname:"sens.apigw.ntruss.com",path:uri,method,headers:{"Content-Type":"application/json; charset=utf-8","x-ncp-apigw-timestamp":ts,"x-ncp-iam-access-key":access,"x-ncp-apigw-signature-v2":sig,"Content-Length":Buffer.byteLength(body)}},rr=>{
      let x="";rr.on("data",c=>x+=c);rr.on("end",()=>resolve({ok:rr.statusCode>=200&&rr.statusCode<300,status:rr.statusCode,body:x.slice(0,500)}));
    });rq.on("error",e=>resolve({ok:false,error:e.message}));rq.write(body);rq.end();
  });
}
async function notifyOrder(s,o){
  const email=ENV.ORDER_EMAIL||s.settings?.orderEmail||s.settings?.email||"";
  const phone=ENV.ADMIN_PHONE||s.settings?.adminPhone||s.settings?.phone||"";
  const itemLines=(o.items||[]).map(it=>{const p=(s.products||[]).find(x=>String(x.id)===String(it.productId));return `- ${p?.name||it.productId} × ${it.qty}`}).join("\n");
  const msg=`[이룸] 새 주문 ${o.id} / ${o.customer?.name||""} / ${Number(o.total||0).toLocaleString()}원 / ${o.paymentMethod||""}`;
  const detail=[
    msg,`접수시간: ${o.createdAt||""}`,`연락처: ${o.customer?.phone||""}`,
    `이메일: ${o.customer?.email||""}`,`수령방법: ${o.customer?.receiveMethod||"택배배송"}`,
    `주소: ${o.customer?.address||""} ${o.customer?.detailAddress||""}`,
    `상품:\n${itemLines||"- 상품정보 없음"}`,`상품금액: ${Number(o.subtotal||0).toLocaleString()}원`,
    `배송비: ${Number(o.shippingFee||0).toLocaleString()}원`,`할인: ${Number(o.discount||0).toLocaleString()}원`,
    `총 결제예정액: ${Number(o.total||0).toLocaleString()}원`,`결제수단: ${o.paymentMethod||""}`,
    `배송메모: ${o.deliveryMemo||""}`
  ].join("\n");
  const [mail,sms]=await Promise.allSettled([
    mailSend(s,{to:email,subject:`[이룸] 새 주문 ${o.id} · ${o.customer?.name||""}`,text:detail}),
    sensSend(s,{to:phone,content:msg})
  ]);
  return {mail:mail.value||{ok:false},sms:sms.value||{ok:false}};
}

async function notifyGroupBuy(s,g,p){
  const email=ENV.ORDER_EMAIL||s.settings?.orderEmail||s.settings?.email||"";
  const phone=ENV.ADMIN_PHONE||s.settings?.adminPhone||s.settings?.phone||"";
  const msg=`[이룸 공구] ${g.title} / ${p.name} / ${p.qty}개`;
  const detail=[msg,`참여번호: ${p.id}`,`접수시간: ${p.createdAt}`,`연락처: ${p.phone}`,`수령방법: ${p.receiveMethod||""}`,`주소: ${p.address||""}`,`메모: ${p.memo||""}`].join("\n");
  const [mail,sms]=await Promise.allSettled([mailSend(s,{to:email,subject:`[이룸] 공동구매 참여 · ${g.title}`,text:detail}),sensSend(s,{to:phone,content:msg})]);
  return {mail:mail.value||{ok:false},sms:sms.value||{ok:false}};
}

async function api(req,res,u){
  const m=req.method,p=u.pathname,b=["POST","PUT","DELETE"].includes(m)?await parse(req):{};
  let s=read();

  if(m==="GET"&&p==="/api/health")return send(res,200,{ok:true,service:"iroom-fresh-fruits",time:new Date().toISOString(),env:ENV.NODE_ENV});
  if(m==="GET"&&p==="/api/store")return send(res,200,sanitizeStore(s));
  if(m==="GET"&&p==="/api/me"){const mem=memberAuth(req);return mem?send(res,200,{member:pubMember(mem)}):send(res,401,{error:"로그인이 필요합니다."})}

  if(m==="POST"&&p==="/api/signup"){if(!rateLimit(req,"signup",12,60*60*1000))return send(res,429,{error:"가입 요청이 너무 많습니다. 잠시 후 다시 시도하세요."});
    const username=String(b.username||"").trim();
    if(!/^[A-Za-z0-9_]{4,20}$/.test(username))return send(res,400,{error:"아이디는 영문/숫자/_ 4~20자로 입력하세요."});
    if(s.members.some(x=>String(x.username).toLowerCase()===username.toLowerCase()))return send(res,409,{error:"이미 사용 중인 아이디입니다."});
    if(String(b.password||"").length<6)return send(res,400,{error:"비밀번호는 6자 이상이어야 합니다."});
    const hp=hash(b.password);
    const mem={id:"M"+Date.now(),username,name:b.name||"",phone:b.phone||"",email:b.email||"",postcode:b.postcode||"",address:b.address||"",detailAddress:b.detailAddress||"",wishlist:[],passwordSalt:hp.salt,passwordHash:hp.hash,createdAt:new Date().toISOString()};
    s.members.unshift(mem);write(s);const t=token();sessions.set(t,{value:mem.id,at:Date.now()});return send(res,200,{token:t,member:pubMember(mem)})
  }
  if(m==="POST"&&p==="/api/login"){if(!rateLimit(req,"login",20,10*60*1000))return send(res,429,{error:"로그인 시도가 너무 많습니다. 잠시 후 다시 시도하세요."});const mem=s.members.find(x=>String(x.username).toLowerCase()===String(b.username||"").toLowerCase());if(!mem||!verify(b.password,mem))return send(res,401,{error:"아이디 또는 비밀번호가 올바르지 않습니다."});const t=token();sessions.set(t,{value:mem.id,at:Date.now()});return send(res,200,{token:t,member:pubMember(mem)})}
  if(m==="POST"&&p==="/api/logout"){sessions.delete(bearer(req));return send(res,200,{ok:true})}
  if(m==="POST"&&p==="/api/wishlist"){const mem=memberAuth(req);if(!mem)return send(res,401,{error:"로그인 후 이용하세요."});const i=s.members.findIndex(x=>x.id===mem.id),id=String(b.productId),w=s.members[i].wishlist||[],n=w.indexOf(id);n>=0?w.splice(n,1):w.push(id);s.members[i].wishlist=w;write(s);return send(res,200,{wishlist:w})}
  if(m==="GET"&&p==="/api/orders/my"){const mem=memberAuth(req);if(!mem)return send(res,401,{error:"로그인 후 이용하세요."});return send(res,200,{orders:s.orders.filter(o=>o.memberId===mem.id)})}
  if(m==="POST"&&p==="/api/orders/request"){const mem=memberAuth(req);if(!mem)return send(res,401,{error:"로그인 후 이용하세요."});const i=s.orders.findIndex(o=>o.id===b.orderId&&o.memberId===mem.id);if(i<0)return send(res,404,{error:"주문 없음"});s.orders[i].requestType=b.type;s.orders[i].requestReason=b.reason||"";s.orders[i].status=b.type==="환불"?"환불요청":"취소요청";s.orders[i].requestAt=new Date().toISOString();write(s);return send(res,200,{ok:true})}

  if(m==="POST"&&p==="/api/orders"){if(!rateLimit(req,"order",30,10*60*1000))return send(res,429,{error:"주문 요청이 너무 많습니다. 잠시 후 다시 시도하세요."});
    let subtotal=0,shipping=0;
    for(const it of b.items||[]){const pr=s.products.find(x=>String(x.id)===String(it.productId));if(!pr||Number(pr.stock)<Number(it.qty))return send(res,400,{error:"재고가 부족한 상품이 있습니다."});subtotal+=Number(pr.salePrice||pr.price||0)*Number(it.qty);shipping=Math.max(shipping,Number(pr.shippingFee||0))}
    if(subtotal>=Number(s.settings.freeShippingOver||70000))shipping=0;
    let discount=0,couponCode="";
    if(b.couponCode){const c=s.coupons.find(x=>x.code===b.couponCode&&x.active!==false);if(c&&subtotal>=Number(c.minOrder||0)){discount=c.type==="percent"?Math.floor(subtotal*Number(c.value)/100):Number(c.value);if(c.maxDiscount)discount=Math.min(discount,Number(c.maxDiscount));couponCode=c.code;c.used=Number(c.used||0)+1}}
    for(const it of b.items||[]){const pr=s.products.find(x=>String(x.id)===String(it.productId));pr.stock-=Number(it.qty)}
    const mem=memberAuth(req);
    const o={id:"IR"+Date.now(),memberId:mem?.id||null,customer:b.customer||{},items:b.items||[],couponCode,subtotal,discount,shippingFee:shipping,total:Math.max(0,subtotal-discount+shipping),paymentMethod:b.paymentMethod||"계좌이체",paymentStatus:b.paymentMethod&&b.paymentMethod.includes("계좌이체")?"입금대기":"결제대기",status:"주문접수",carrier:"",trackingNumber:"",trackingUrl:"",deliveryMemo:b.deliveryMemo||"",giftMessage:b.giftMessage||"",cashReceipt:b.cashReceipt||{},createdAt:new Date().toISOString()};
    s.orders.unshift(o);s.marketingStats||={};s.marketingStats.orders=Number(s.marketingStats.orders||0)+1;write(s);notifyOrder(s,o).then(r=>console.log("order notify",o.id,r)).catch(e=>console.error("order notify error",e.message));return send(res,200,o)
  }

  
  if(m==="GET"&&p==="/api/groupbuys"){
    const list=(s.groupBuys||[]).filter(g=>g.active!==false).map(g=>{
      const joined=(s.groupBuyParticipants||[]).filter(x=>String(x.groupBuyId)===String(g.id)).reduce((a,x)=>a+Number(x.qty||0),0);
      return {...g,joinedQty:joined,participants:(s.groupBuyParticipants||[]).filter(x=>String(x.groupBuyId)===String(g.id)).length};
    });
    return send(res,200,{groupBuys:list});
  }
  let gbm=p.match(/^\/api\/groupbuys\/([^/]+)\/join$/);
  if(gbm&&m==="POST"){
    if(!rateLimit(req,"groupbuy",30,10*60*1000))return send(res,429,{error:"공동구매 참여 요청이 너무 많습니다. 잠시 후 다시 시도하세요."});
    const g=(s.groupBuys||[]).find(x=>String(x.id)===decodeURIComponent(gbm[1])&&x.active!==false);
    if(!g)return send(res,404,{error:"진행 중인 공동구매가 아닙니다."});
    const name=String(b.name||"").trim(),phone=String(b.phone||"").trim(),qty=Math.max(1,Number(b.qty||1));
    if(!name||!phone)return send(res,400,{error:"성함과 연락처를 입력하세요."});
    const part={id:"GBP"+Date.now(),groupBuyId:g.id,name,phone,qty,receiveMethod:String(b.receiveMethod||"택배배송"),address:String(b.address||""),memo:String(b.memo||""),status:"참여접수",createdAt:new Date().toISOString()};
    s.groupBuyParticipants.unshift(part);write(s);notifyGroupBuy(s,g,part).then(r=>console.log("groupbuy notify",part.id,r)).catch(e=>console.error("groupbuy notify error",e.message));
    return send(res,200,{ok:true,participantId:part.id,title:g.title});
  }

  if(m==="POST"&&p==="/api/track"){
    const type=String(b.type||"visit"),source=String(b.source||"direct").slice(0,80);
    s.marketingStats||={visits:0,shares:0,bandClicks:0,cartAdds:0,orders:0,sources:{}};
    if(type==="visit")s.marketingStats.visits=Number(s.marketingStats.visits||0)+1;
    if(type==="share")s.marketingStats.shares=Number(s.marketingStats.shares||0)+1;
    if(type==="band")s.marketingStats.bandClicks=Number(s.marketingStats.bandClicks||0)+1;
    if(type==="cart")s.marketingStats.cartAdds=Number(s.marketingStats.cartAdds||0)+1;
    s.marketingStats.sources||={};s.marketingStats.sources[source]=Number(s.marketingStats.sources[source]||0)+1;
    write(s);return send(res,200,{ok:true});
  }


  if(m==="POST"&&p==="/api/orders/track"){
    const mem=memberAuth(req);
    if(!mem)return send(res,401,{error:"배송조회는 로그인 후 이용할 수 있습니다."});
    const username=String(b.username||"").trim().toLowerCase();
    if(username!==String(mem.username||"").toLowerCase())return send(res,403,{error:"구매자 아이디가 로그인 아이디와 일치하지 않습니다."});
    const o=s.orders.find(x=>x.id===String(b.orderId||"")&&x.memberId===mem.id);
    if(!o)return send(res,404,{error:"해당 아이디의 주문번호를 찾을 수 없습니다."});
    return send(res,200,{order:{
      id:o.id,status:o.status,paymentStatus:o.paymentStatus,total:o.total,
      carrier:o.carrier||"",trackingNumber:o.trackingNumber||"",trackingUrl:o.trackingUrl||"",
      createdAt:o.createdAt,items:o.items||[],deliveryMemo:o.deliveryMemo||""
    }});
  }


  if(m==="POST"&&p==="/api/consult"){if(!rateLimit(req,"consult",10,60*60*1000))return send(res,429,{error:"상담 접수가 너무 많습니다. 잠시 후 다시 시도하세요."});
    const name=String(b.name||"").trim();
    const phone=String(b.phone||"").trim();
    const category=String(b.category||"상품문의").trim();
    const message=String(b.message||"").trim();
    if(!name)return send(res,400,{error:"이름을 입력하세요."});
    if(!phone)return send(res,400,{error:"전화번호를 입력하세요."});
    if(!message)return send(res,400,{error:"상담 내용을 입력하세요."});
    const q={
      id:"Q"+Date.now(),memberId:null,
      name,phone,category,
      message:"[빠른상담] "+message,
      answer:"",
      status:"답변대기",
      createdAt:new Date().toISOString()
    };
    s.inquiries.unshift(q);
    log(s,"빠른 상담 접수",category+" / "+name);
    write(s);
    return send(res,200,{ok:true,id:q.id});
  }

if(m==="POST"&&p==="/api/admin/login"){
    if(!rateLimit(req,"admin-login",8,10*60*1000))return send(res,429,{error:"로그인 시도가 너무 많습니다. 잠시 후 다시 시도하세요."});
    const expected=ENV.ADMIN_PASSWORD||String(s.settings.adminPassword||"");
    if(!expected)return send(res,500,{error:"운영 서버의 ADMIN_PASSWORD가 설정되지 않았습니다."});
    if(String(b.password||"")!==expected)return send(res,401,{error:"관리자 비밀번호가 올바르지 않습니다."});
    const t=token();adminSessions.set(t,{value:true,at:Date.now()});return send(res,200,{token:t})
  }
  if(p.startsWith("/api/admin/")&&!adminAuth(req))return send(res,401,{error:"관리자 인증이 필요합니다."});
  if(m==="GET"&&p==="/api/admin/band/status"){
    const accessToken=String(s.settings.bandAccessToken||"").trim(),bandKey=String(s.settings.bandKey||"").trim();
    if(!accessToken)return send(res,200,{connected:false,reason:"BAND Access Token이 없습니다.",bandUrl:s.settings.bandUrl||"https://band.us/@iroomfresh"});
    try{
      const bands=await bandRequest("GET","/v2.1/bands",{access_token:accessToken});
      const items=bands.result_data?.bands||[];
      const selected=items.find(x=>String(x.band_key)===bandKey)||null;
      let permissions=[];
      if(bandKey){try{const pd=await bandRequest("GET","/v2/band/permissions",{access_token:accessToken,band_key:bandKey,permissions:"posting,commenting"});permissions=pd.result_data?.permissions||pd.result_data?.permission||[]}catch{}}
      return send(res,200,{connected:true,bands:items.map(x=>({band_key:x.band_key,name:x.name,cover:x.cover})),selected,permissions,bandUrl:s.settings.bandUrl||"https://band.us/@iroomfresh"});
    }catch(e){return send(res,400,{connected:false,error:e.message,bandUrl:s.settings.bandUrl||"https://band.us/@iroomfresh"})}
  }
  if(m==="POST"&&p==="/api/admin/band/settings"){
    s.settings.bandAccessToken=String(b.accessToken||s.settings.bandAccessToken||"").trim();
    s.settings.bandKey=String(b.bandKey||"").trim();
    s.settings.bandUrl=String(b.bandUrl||s.settings.bandUrl||"https://band.us/@iroomfresh").trim();
    log(s,"BAND 연동 설정 저장",s.settings.bandKey?"band_key 저장":"BAND 주소 저장");write(s);return send(res,200,{ok:true});
  }
  if(m==="POST"&&p==="/api/admin/band/post"){
    const accessToken=String(s.settings.bandAccessToken||"").trim(),bandKey=String(b.bandKey||s.settings.bandKey||"").trim(),content=String(b.content||"").trim();
    if(!accessToken)return send(res,400,{error:"BAND Access Token을 먼저 저장하세요."});
    if(!bandKey)return send(res,400,{error:"게시할 밴드를 먼저 선택하세요."});
    if(!content)return send(res,400,{error:"게시글 내용을 입력하세요."});
    try{
      const perm=await bandRequest("GET","/v2/band/permissions",{access_token:accessToken,band_key:bandKey,permissions:"posting"});
      const permissions=perm.result_data?.permissions||perm.result_data?.permission||[];
      if(!permissions.includes("posting"))return send(res,403,{error:"이 계정에는 해당 BAND 글쓰기 권한이 없습니다."});
      const d=await bandRequest("POST","/v2.2/band/post/create",{access_token:accessToken,band_key:bandKey,content,do_push:String(Boolean(b.doPush))});
      s.settings.bandKey=bandKey;s.marketingStats||={};s.marketingStats.bandPosts=Number(s.marketingStats.bandPosts||0)+1;log(s,"BAND 게시글 등록",d.result_data?.post_key||"");write(s);
      return send(res,200,{ok:true,band_key:d.result_data?.band_key,post_key:d.result_data?.post_key});
    }catch(e){return send(res,400,{error:e.message})}
  }
  if(m==="POST"&&p==="/api/admin/band/homepage-preview"){
    const posts=buildBandHomepagePosts(s,b.siteUrl||"");
    return send(res,200,{ok:true,count:posts.length,posts});
  }
  if(m==="POST"&&p==="/api/admin/band/sync-homepage"){
    const accessToken=String(s.settings.bandAccessToken||"").trim(),bandKey=String(b.bandKey||s.settings.bandKey||"").trim();
    if(!accessToken)return send(res,400,{error:"BAND Access Token을 먼저 저장하세요."});
    if(!bandKey)return send(res,400,{error:"게시할 BAND를 먼저 선택하세요."});
    const posts=buildBandHomepagePosts(s,b.siteUrl||"");
    const selected=Array.isArray(b.types)&&b.types.length?posts.filter(x=>b.types.includes(x.type)):posts;
    try{
      const perm=await bandRequest("GET","/v2/band/permissions",{access_token:accessToken,band_key:bandKey,permissions:"posting"});
      const permissions=perm.result_data?.permissions||perm.result_data?.permission||[];
      if(!permissions.includes("posting"))return send(res,403,{error:"이 계정에는 해당 BAND 글쓰기 권한이 없습니다."});
      const results=[];
      for(const post of selected){
        const d=await bandRequest("POST","/v2.2/band/post/create",{access_token:accessToken,band_key:bandKey,content:post.content,do_push:"false"});
        results.push({title:post.title,type:post.type,post_key:d.result_data?.post_key||""});
      }
      s.settings.bandKey=bandKey;
      if(String(b.siteUrl||"").trim())s.settings.siteUrl=String(b.siteUrl).trim();
      s.marketingStats||={};s.marketingStats.bandPosts=Number(s.marketingStats.bandPosts||0)+results.length;
      log(s,"홈페이지 BAND 동기화",`${results.length}개 게시글 등록`);write(s);
      return send(res,200,{ok:true,count:results.length,results});
    }catch(e){return send(res,400,{error:e.message})}
  }
  if(m==="POST"&&p==="/api/admin/band/template"){
    const product=s.products.find(x=>String(x.id)===String(b.productId||""));
    const brand=s.settings.brand||"이룸 fresh fruits";
    let content="";
    if(product){content=`🍎 오늘의 ${brand}\n\n${product.name}\n• 산지: ${product.origin||"엄선 산지"}\n• 구성: ${product.unit||"상품 상세참조"}\n• 판매가: ${Number(product.salePrice||product.price||0).toLocaleString()}원\n\n${product.description||"신선한 과일을 정성껏 준비했습니다."}\n\n주문/문의: ${s.settings.phone||"010-6423-4562"}\nBAND: ${s.settings.bandUrl||"https://band.us/@iroomfresh"}\n\n#이룸freshfruits #신선한과일 #제철과일 #과일선물 #과일공구`; }
    else content=`🎉 ${brand} 밴드에 오신 것을 환영합니다!\n\n신선하고 맛있는 과일을 좋은 품질과 합리적인 가격으로 전해드립니다.\n\n🍓 제철 과일 소식\n🍊 신상품 및 특가\n🍇 공동구매와 예약판매\n🍎 과일 추천과 보관 팁\n\n신선함을 담고, 정성을 더합니다.\n${brand}`;
    return send(res,200,{content});
  }

  if(m==="POST"&&p==="/api/admin/notify-test"){
    const type=String(b.type||"both");
    const email=ENV.ORDER_EMAIL||s.settings.orderEmail||s.settings.email||"";
    const phone=ENV.ADMIN_PHONE||s.settings.adminPhone||s.settings.phone||"";
    const result={};
    if(type==="email"||type==="both")result.email=await mailSend(s,{to:email,subject:"[이룸] 온라인 운영판 메일 테스트",text:"이룸 fresh fruits 온라인 운영판 메일 연동 테스트입니다."});
    if(type==="sms"||type==="both")result.sms=await sensSend(s,{to:phone,content:"[이룸] 온라인 운영판 문자 연동 테스트"});
    return send(res,200,result);
  }


  if(m==="GET"&&p==="/api/admin/ai/diagnose"){
    return send(res,200,localAdvisor(s));
  }
  if(m==="POST"&&p==="/api/admin/ai/chat"){
    const key=String(ENV.OPENAI_API_KEY||s.settings.openaiApiKey||"").trim();
    if(!key)return send(res,400,{error:"OpenAI API 키가 설정되지 않았습니다. 관리자 설정에서 입력하거나 환경변수 OPENAI_API_KEY를 설정하세요."});
    const advisor=localAdvisor(s);
    const context={
      brand:s.settings.brand,products:s.products.map(x=>({id:x.id,name:x.name,category:x.category,price:x.price,salePrice:x.salePrice,stock:x.stock,origin:x.origin,active:x.active})),
      recentOrders:s.orders.slice(0,20).map(o=>({id:o.id,status:o.status,total:o.total,paymentStatus:o.paymentStatus,requestType:o.requestType})),
      coupons:s.coupons,events:s.events,marketingStats:s.marketingStats,diagnosis:advisor
    };
    const prompt=`당신은 한국 프리미엄 과일 쇼핑몰 '이룸 fresh fruits'의 운영 도우미입니다.
관리자가 상품, 재고, 주문, 배송, 고객경험, 홍보, 이벤트, 쿠폰, 홈페이지 문구를 더 잘 운영하도록 실무적으로 도와주세요.
확실하지 않은 법률/세무/PG 정책은 단정하지 말고 확인이 필요하다고 말하세요.
고객 개인정보는 출력하지 마세요.
현재 운영 데이터:
${JSON.stringify(context)}
관리자 요청:
${String(b.message||"운영 상태를 분석해줘")}
짧고 실행 가능한 한국어 답변으로 작성하세요.`;
    try{
      const text=await openaiResponse(key,s.settings.openaiModel||"gpt-5.6-luna",prompt);
      s.aiHistory.unshift({id:"AI"+Date.now(),at:new Date().toISOString(),message:String(b.message||""),answer:text});
      s.aiHistory=s.aiHistory.slice(0,80);write(s);
      return send(res,200,{answer:text});
    }catch(e){return send(res,500,{error:e.message})}
  }
  if(m==="POST"&&p==="/api/admin/ai/generate"){
    const key=String(ENV.OPENAI_API_KEY||s.settings.openaiApiKey||"").trim();
    if(!key)return send(res,400,{error:"OpenAI API 키가 설정되지 않았습니다."});
    const task=String(b.task||"product"),target=String(b.target||""),extra=String(b.extra||"");
    const prompts={
      product:`프리미엄 과일 쇼핑몰 상품 상세 설명을 만들어주세요. 상품: ${target}. 첫 문장은 고객이 장점을 바로 이해하게 하고, 산지/맛과 식감/추천용도/보관법/선물가치를 포함하되 확인되지 않은 당도 수치나 효능은 만들지 마세요. 6~9문장으로 자연스럽게.`,
      event:`이룸 fresh fruits의 이벤트 홍보 문구를 만들어주세요. 주제: ${target}. 제목 1개, 짧은 부제 1개, 본문 2~3문장.`,
      banner:`럭셔리 과일 브랜드 홈페이지 메인 배너 카피를 만들어주세요. 주제: ${target}. 헤드라인 1개와 서브카피 1개.`,
      seo:`이룸 fresh fruits의 검색노출용 제목과 설명을 만들어주세요. 핵심 키워드: ${target}. 한국어 자연스러운 제목 1개, 설명 1개.`,
      sns:`네이버 BAND/인스타그램 홍보 게시물 문구를 만들어주세요. 상품/주제: ${target}. 친근하지만 고급스럽게, 해시태그 6개 포함.`
    };
    try{const text=await openaiResponse(key,s.settings.openaiModel||"gpt-5.6-luna",(prompts[task]||prompts.product)+`\n추가 요청: ${extra}`);return send(res,200,{answer:text})}catch(e){return send(res,500,{error:e.message})}
  }
  
  
  if(m==="POST"&&p==="/api/admin/ai/product-helper"){
    const name=String(b.name||"").trim(),origin=String(b.origin||"").trim(),unit=String(b.unit||"").trim(),category=String(b.category||"국내산");
    if(!name)return send(res,400,{error:"상품명을 먼저 입력하세요."});
    const fallback={
      badge:category==="선물세트"?"PREMIUM GIFT":category==="국내산"?"국내산 엄선":"PREMIUM",
      description:`${origin?origin+"에서 준비한 ":""}${name}입니다. 신선한 상태와 기본 품질을 확인해 선별하며, ${unit?unit+" 구성으로 ":""}가정용과 선물용으로 편하게 선택할 수 있도록 준비합니다. 과일은 수확 시기와 개체에 따라 크기와 색상에 자연스러운 차이가 있을 수 있습니다. 수령 후에는 상품 특성에 맞게 냉장 또는 서늘한 곳에 보관해 주세요.`,
      mode:"free"
    };
    const key=String(ENV.OPENAI_API_KEY||s.settings.openaiApiKey||"").trim();
    if(!key)return send(res,200,fallback);
    try{
      const text=await openaiResponse(key,s.settings.openaiModel||"gpt-5.4",`한국 프리미엄 과일 쇼핑몰 상품 설명을 작성하세요. 상품명:${name}, 카테고리:${category}, 산지:${origin}, 구성:${unit}. 확인되지 않은 당도수치, 효능, 원산지는 만들지 마세요. 5~7문장.`);
      return send(res,200,{...fallback,description:text,mode:"ai"});
    }catch(e){return send(res,200,fallback)}
  }
if(m==="POST"&&p==="/api/admin/ai/image"){
    const key=String(ENV.OPENAI_API_KEY||s.settings.openaiApiKey||"").trim();
    if(!key)return send(res,400,{error:"OpenAI API 키가 설정되지 않았습니다."});
    const i=s.products.findIndex(x=>String(x.id)===String(b.productId||""));
    if(i<0)return send(res,404,{error:"상품을 찾을 수 없습니다."});
    const pr=s.products[i];
    const edit=String(b.instruction||"").trim()||String(s.settings.aiImageStylePrompt||"프리미엄 과일 쇼핑몰 상품사진처럼 고급스럽고 자연스럽게 개선해주세요.");
    const content=[
      {type:"input_text",text:`다음 상품 이미지를 전자상거래용 프리미엄 상품사진으로 리디자인해 주세요.
상품명: ${pr.name}
산지: ${pr.origin||""}
설명: ${pr.description||""}
요청: ${edit}
상품의 실제 과일 종류와 핵심 특징은 유지하고, 허위로 보일 수 있는 과도한 크기/색상 변화는 피하세요. 텍스트나 로고는 추가하지 마세요.`}
    ];
    if(pr.image)content.push({type:"input_image",image_url:pr.image});
    const payload={
      model:s.settings.openaiModel||"gpt-5.4",
      tools:[{type:"image_generation",size:"1024x1024",quality:s.settings.aiImageQuality||"high"}],
      input:[{role:"user",content}]
    };
    try{
      const d=await new Promise((resolve,reject)=>{
        const body=JSON.stringify(payload);
        const rq=https.request({
          hostname:"api.openai.com",path:"/v1/responses",method:"POST",
          headers:{"Content-Type":"application/json","Authorization":"Bearer "+key,"Content-Length":Buffer.byteLength(body)}
        },rr=>{
          let z="";
          rr.on("data",c=>z+=c);
          rr.on("end",()=>{
            try{
              const x=JSON.parse(z);
              if(rr.statusCode<200||rr.statusCode>=300)return reject(new Error(x.error?.message||"AI 이미지 요청 실패"));
              resolve(x);
            }catch(e){reject(e)}
          });
        });
        rq.on("error",reject);rq.write(body);rq.end();
      });
      const call=(d.output||[]).find(x=>x.type==="image_generation_call"&&x.result);
      const img=call?.result;
      if(!img)return send(res,500,{error:"AI 이미지 결과를 받지 못했습니다. 모델 또는 이미지 생성 권한을 확인하세요."});
      const name="ai_product_"+Date.now()+".png";
      fs.writeFileSync(path.join(PUBLIC,"uploads",name),Buffer.from(img,"base64"));
      const url="/uploads/"+name;
      pr.image=url;
      pr.aiImageUpdatedAt=new Date().toISOString();
      pr.aiImageInstruction=edit;
      log(s,"AI 상품 이미지 수정",pr.name);
      write(s);
      return send(res,200,{ok:true,url,product:pr});
    }catch(e){return send(res,500,{error:e.message})}
  }

if(m==="POST"&&p==="/api/admin/ai/apply"){
    const type=String(b.type||"");
    if(type==="hero"){s.settings.heroHeadline=String(b.headline||s.settings.heroHeadline||"");s.settings.heroSubcopy=String(b.subcopy||s.settings.heroSubcopy||"");log(s,"AI 제안 적용","메인 히어로 문구");write(s);return send(res,200,{ok:true})}
    if(type==="productDescription"){const i=s.products.findIndex(x=>String(x.id)===String(b.productId));if(i<0)return send(res,404,{error:"상품 없음"});s.products[i].description=String(b.description||"");log(s,"AI 제안 적용","상품 설명: "+s.products[i].name);write(s);return send(res,200,{ok:true})}
    return send(res,400,{error:"지원하지 않는 적용 유형입니다."});
  }


  if(m==="GET"&&p==="/api/admin/all")return send(res,200,s);
  if(m==="POST"&&p==="/api/admin/password"){
    if(ENV.ADMIN_PASSWORD)return send(res,400,{error:"온라인 운영판은 서버 환경변수 ADMIN_PASSWORD로 관리자 비밀번호를 변경하세요."});
    if(String(b.current||"")!==String(s.settings.adminPassword))return send(res,401,{error:"현재 비밀번호가 다릅니다."});
    if(String(b.next||"").length<10)return send(res,400,{error:"온라인 운영용 비밀번호는 10자 이상을 권장합니다."});
    s.settings.adminPassword=b.next;log(s,"관리자 비밀번호 변경");write(s);return send(res,200,{ok:true})
  }
  if(m==="POST"&&p==="/api/admin/settings"){s.settings={...s.settings,...b};log(s,"사이트 설정 저장");write(s);return send(res,200,{ok:true})}

  if(m==="POST"&&p==="/api/admin/upload"){
    const match=String(b.data||"").match(/^data:([^;]+);base64,(.+)$/);
    if(!match)return send(res,400,{error:"파일 데이터 오류"});
    const mime=match[1],raw=Buffer.from(match[2],"base64"),ext=extFromMime(mime),name=(b.kind==="video"?"video":"image")+"_"+Date.now()+"."+ext;
    const fp=path.join(PUBLIC,"uploads",name);fs.writeFileSync(fp,raw);return send(res,200,{url:"/uploads/"+name,mime,size:raw.length})
  }

  
  
  if(m==="POST"&&p==="/api/admin/product-media-complete"){
    const productId=String(b.productId||""),kind=String(b.kind||"image");
    const i=s.products.findIndex(x=>String(x.id)===productId);
    if(i<0)return send(res,404,{error:"상품을 찾을 수 없습니다."});
    const match=String(b.data||"").match(/^data:([^;]+);base64,(.+)$/);
    if(!match)return send(res,400,{error:"파일 데이터 오류"});
    const mime=match[1],raw=Buffer.from(match[2],"base64");
    const max=kind==="video"?80*1024*1024:12*1024*1024;
    if(raw.length>max)return send(res,400,{error:kind==="video"?"동영상은 80MB 이하로 올려주세요.":"이미지는 12MB 이하로 올려주세요."});
    const ext=extFromMime(mime),folderId=String(b.folderId||(kind==="video"?"folder-video":"folder-product")).replace(/[^A-Za-z0-9_-]/g,"_");
    const dir=path.join(PUBLIC,"uploads","library",folderId);fs.mkdirSync(dir,{recursive:true});
    const filename="product_"+kind+"_"+Date.now()+"_"+crypto.randomBytes(4).toString("hex")+"."+ext;
    fs.writeFileSync(path.join(dir,filename),raw);
    const url="/uploads/library/"+folderId+"/"+filename;
    if(kind==="image")s.products[i].image=url; else s.products[i].video=url;
    const media={id:"MD"+Date.now(),kind,url,name:String(b.name||s.products[i].name),folderId,createdAt:new Date().toISOString(),size:raw.length,mime,productId:s.products[i].id};
    s.mediaLibrary.unshift(media);log(s,kind==="image"?"상품 대표이미지 등록":"상품 동영상 등록",s.products[i].name);write(s);
    return send(res,200,{ok:true,url,product:s.products[i],media});
  }
if(m==="POST"&&p==="/api/admin/product-media"){
    const productId=String(b.productId||"");
    const kind=String(b.kind||"image");
    const match=String(b.data||"").match(/^data:([^;]+);base64,(.+)$/);
    if(!match)return send(res,400,{error:"파일 데이터 오류"});
    const mime=match[1],raw=Buffer.from(match[2],"base64");
    const max=kind==="video"?80*1024*1024:12*1024*1024;
    if(raw.length>max)return send(res,400,{error:kind==="video"?"동영상은 80MB 이하로 올려주세요.":"이미지는 12MB 이하로 올려주세요."});
    if(kind==="image"&&!mime.startsWith("image/"))return send(res,400,{error:"이미지 파일만 올릴 수 있습니다."});
    if(kind==="video"&&!mime.startsWith("video/"))return send(res,400,{error:"동영상 파일만 올릴 수 있습니다."});
    const i=s.products.findIndex(x=>String(x.id)===productId);
    if(i<0)return send(res,404,{error:"상품을 먼저 저장한 뒤 파일을 등록해 주세요."});
    const ext=extFromMime(mime);
    const filename=(kind==="video"?"video":"image")+"_"+Date.now()+"_"+crypto.randomBytes(4).toString("hex")+"."+ext;
    const fp=path.join(PUBLIC,"uploads",filename);
    fs.writeFileSync(fp,raw);
    const plain="/uploads/"+filename;
    if(kind==="video")s.products[i].video=plain;
    else s.products[i].image=plain;
    s.products[i].updatedAt=new Date().toISOString();
    log(s,kind==="video"?"상품 동영상 변경":"상품 대표이미지 변경",s.products[i].name);
    write(s);
    return send(res,200,{ok:true,url:plain+"?v="+Date.now(),plainUrl:plain,product:s.products[i]});
  }

  if(m==="POST"&&p==="/api/admin/product-media/remove"){
    const productId=String(b.productId||""),kind=String(b.kind||"image");
    const i=s.products.findIndex(x=>String(x.id)===productId);
    if(i<0)return send(res,404,{error:"상품을 찾을 수 없습니다."});
    if(kind==="video")s.products[i].video="";
    else s.products[i].image="";
    s.products[i].updatedAt=new Date().toISOString();
    log(s,kind==="video"?"상품 동영상 삭제":"상품 대표이미지 삭제",s.products[i].name);
    write(s);
    return send(res,200,{ok:true,product:s.products[i]});
  }


  
  if(m==="GET"&&p==="/api/admin/media-folders"){
    return send(res,200,{folders:s.mediaFolders||[],items:s.mediaLibrary||[]});
  }
  if(m==="POST"&&p==="/api/admin/media-folders"){
    const name=String(b.name||"").trim();
    if(!name)return send(res,400,{error:"폴더 이름을 입력하세요."});
    const f={id:"FD"+Date.now(),name,kind:String(b.kind||"all"),system:false,createdAt:new Date().toISOString()};
    s.mediaFolders.push(f);log(s,"미디어 폴더 생성",name);write(s);return send(res,200,f);
  }
  if(m==="POST"&&p==="/api/admin/media-library/move"){
    const item=(s.mediaLibrary||[]).find(x=>String(x.id)===String(b.mediaId||""));
    if(!item)return send(res,404,{error:"파일을 찾을 수 없습니다."});
    item.folderId=String(b.folderId||"folder-temp");write(s);return send(res,200,{ok:true,item});
  }
if(m==="GET"&&p==="/api/admin/media-library"){
    return send(res,200,{items:s.mediaLibrary||[]});
  }

  if(m==="POST"&&p==="/api/admin/media-library/upload"){
    const match=String(b.data||"").match(/^data:([^;]+);base64,(.+)$/);
    if(!match)return send(res,400,{error:"파일 데이터 오류"});
    const mime=match[1],raw=Buffer.from(match[2],"base64"),kind=String(b.kind||"image");
    const max=kind==="video"?80*1024*1024:12*1024*1024;
    if(raw.length>max)return send(res,400,{error:kind==="video"?"동영상은 80MB 이하로 올려주세요.":"이미지는 12MB 이하로 올려주세요."});
    if(kind==="image"&&!mime.startsWith("image/"))return send(res,400,{error:"이미지 파일만 올릴 수 있습니다."});
    if(kind==="video"&&!mime.startsWith("video/"))return send(res,400,{error:"동영상 파일만 올릴 수 있습니다."});
    const ext=extFromMime(mime);
    const folderId=String(b.folderId||(kind==="video"?"folder-video":"folder-product")).replace(/[^A-Za-z0-9_-]/g,"_");
    const dir=path.join(PUBLIC,"uploads","library",folderId);fs.mkdirSync(dir,{recursive:true});
    const filename="library_"+kind+"_"+Date.now()+"_"+crypto.randomBytes(4).toString("hex")+"."+ext;
    fs.writeFileSync(path.join(dir,filename),raw);
    const item={id:"MD"+Date.now(),kind,url:"/uploads/library/"+folderId+"/"+filename,name:String(b.name||filename),folderId,createdAt:new Date().toISOString(),size:raw.length,mime};
    s.mediaLibrary.unshift(item);
    log(s,"미디어 보관함 업로드",item.name);
    write(s);
    return send(res,200,item);
  }

  if(m==="DELETE"&&p.startsWith("/api/admin/media-library/")){
    const id=p.split("/").pop();
    const item=(s.mediaLibrary||[]).find(x=>String(x.id)===String(id));
    if(!item)return send(res,404,{error:"보관함 파일을 찾을 수 없습니다."});
    s.mediaLibrary=s.mediaLibrary.filter(x=>String(x.id)!==String(id));
    try{
      const fp=path.join(PUBLIC,item.url.replace(/^\//,""));
      if(fp.startsWith(PUBLIC)&&fs.existsSync(fp))fs.unlinkSync(fp);
    }catch{}
    log(s,"미디어 보관함 삭제",item.name);
    write(s);
    return send(res,200,{ok:true});
  }

  if(m==="POST"&&p==="/api/admin/media-library/apply"){
    const productId=String(b.productId||""),mediaId=String(b.mediaId||""),kind=String(b.kind||"image");
    const pi=s.products.findIndex(x=>String(x.id)===productId);
    if(pi<0)return send(res,404,{error:"상품을 찾을 수 없습니다."});
    const item=(s.mediaLibrary||[]).find(x=>String(x.id)===mediaId);
    if(!item)return send(res,404,{error:"보관함 파일을 찾을 수 없습니다."});
    if(kind==="image")s.products[pi].image=item.url;
    else s.products[pi].video=item.url;
    s.products[pi].updatedAt=new Date().toISOString();
    log(s,"보관함 파일 상품 적용",s.products[pi].name+" ← "+item.name);
    write(s);
    return send(res,200,{ok:true,product:s.products[pi]});
  }

  if(m==="POST"&&p==="/api/admin/media-library/rename"){
    const item=(s.mediaLibrary||[]).find(x=>String(x.id)===String(b.mediaId||""));
    if(!item)return send(res,404,{error:"보관함 파일을 찾을 수 없습니다."});
    item.name=String(b.name||item.name).trim()||item.name;
    write(s);return send(res,200,{ok:true,item});
  }

  if(m==="GET"&&p==="/api/admin/groupbuys"){
    const groupBuys=(s.groupBuys||[]).map(g=>({...g,joinedQty:(s.groupBuyParticipants||[]).filter(x=>String(x.groupBuyId)===String(g.id)).reduce((a,x)=>a+Number(x.qty||0),0)}));
    return send(res,200,{groupBuys,participants:s.groupBuyParticipants||[]});
  }
  if(m==="POST"&&p==="/api/admin/groupbuys"){
    const x={id:"GB"+Date.now(),title:String(b.title||"").trim(),description:String(b.description||"").trim(),price:Number(b.price||0),unit:String(b.unit||"1개"),deadline:String(b.deadline||""),targetQty:Number(b.targetQty||0),productId:String(b.productId||""),active:true,createdAt:new Date().toISOString()};
    if(!x.title)return send(res,400,{error:"공동구매 상품명을 입력하세요."});s.groupBuys.unshift(x);log(s,"공동구매 등록",x.title);write(s);return send(res,200,x)
  }
  let agbm=p.match(/^\/api\/admin\/groupbuys\/([^/]+)$/);
  if(agbm&&m==="PUT"){
    const i=s.groupBuys.findIndex(x=>String(x.id)===decodeURIComponent(agbm[1]));if(i<0)return send(res,404,{error:"공동구매 없음"});s.groupBuys[i]={...s.groupBuys[i],...b,updatedAt:new Date().toISOString()};log(s,"공동구매 수정",s.groupBuys[i].title);write(s);return send(res,200,s.groupBuys[i])
  }
  if(agbm&&m==="DELETE"){
    const i=s.groupBuys.findIndex(x=>String(x.id)===decodeURIComponent(agbm[1]));if(i<0)return send(res,404,{error:"공동구매 없음"});s.groupBuys[i].active=false;s.groupBuys[i].updatedAt=new Date().toISOString();log(s,"공동구매 종료",s.groupBuys[i].title);write(s);return send(res,200,{ok:true})
  }

if(m==="POST"&&p==="/api/admin/products"){const x={id:"P"+Date.now(),createdAt:new Date().toISOString(),gallery:[],active:true,...b};s.products.unshift(x);log(s,"상품 등록",x.name);write(s);return send(res,200,x)}
  let mm=p.match(/^\/api\/admin\/products\/([^/]+)$/);
  if(mm&&m==="PUT"){const i=s.products.findIndex(x=>String(x.id)===mm[1]);if(i<0)return send(res,404,{error:"상품 없음"});s.products[i]={...s.products[i],...b,updatedAt:new Date().toISOString()};log(s,"상품 수정",s.products[i].name);write(s);return send(res,200,s.products[i])}
  if(mm&&m==="DELETE"){const x=s.products.find(v=>String(v.id)===mm[1]);s.products=s.products.filter(v=>String(v.id)!==mm[1]);log(s,"상품 삭제",x?.name||mm[1]);write(s);return send(res,200,{ok:true})}

  if(m==="POST"&&p==="/api/admin/orders/status"){const i=s.orders.findIndex(o=>o.id===b.orderId);if(i<0)return send(res,404,{error:"주문 없음"});const old=s.orders[i].status;s.orders[i].status=b.status||old;s.orders[i].paymentStatus=b.paymentStatus||s.orders[i].paymentStatus;s.orders[i].carrier=b.carrier??s.orders[i].carrier;s.orders[i].trackingNumber=b.trackingNumber??s.orders[i].trackingNumber;s.orders[i].trackingUrl=s.orders[i].trackingNumber?trackingUrl(s.orders[i].carrier,s.orders[i].trackingNumber):"";s.orders[i].adminMemo=b.adminMemo??s.orders[i].adminMemo;if((b.status==="취소완료"||b.status==="환불완료")&&!s.orders[i].restocked){for(const it of s.orders[i].items||[]){const pr=s.products.find(x=>String(x.id)===String(it.productId));if(pr)pr.stock+=Number(it.qty)}s.orders[i].restocked=true}s.orders[i].updatedAt=new Date().toISOString();log(s,"주문 상태 변경",`${b.orderId}: ${old} → ${s.orders[i].status}`);write(s);return send(res,200,{ok:true,order:s.orders[i]})}
  if(m==="POST"&&p==="/api/admin/orders/refund"){const i=s.orders.findIndex(o=>o.id===b.orderId);if(i<0)return send(res,404,{error:"주문 없음"});s.orders[i].refund={amount:Number(b.amount||0),reason:b.reason||"",method:b.method||"수동환불",at:new Date().toISOString()};s.orders[i].status="환불완료";if(!s.orders[i].restocked){for(const it of s.orders[i].items||[]){const pr=s.products.find(x=>String(x.id)===String(it.productId));if(pr)pr.stock+=Number(it.qty)}s.orders[i].restocked=true}log(s,"환불 처리",`${b.orderId} ${b.amount}원`);write(s);return send(res,200,{ok:true})}

  for(const key of ["events","coupons","banners","popups"]){
    if(m==="POST"&&p===`/api/admin/${key}`){const x={id:key.slice(0,2).toUpperCase()+Date.now(),createdAt:new Date().toISOString(),active:true,...b};s[key].unshift(x);log(s,`${key} 등록`,x.title||x.name||x.code||"");write(s);return send(res,200,x)}
    const rx=new RegExp(`^/api/admin/${key}/([^/]+)$`);mm=p.match(rx);
    if(mm&&m==="PUT"){const i=s[key].findIndex(x=>String(x.id)===mm[1]);if(i<0)return send(res,404,{error:"없음"});s[key][i]={...s[key][i],...b};write(s);return send(res,200,s[key][i])}
    if(mm&&m==="DELETE"){s[key]=s[key].filter(x=>String(x.id)!==mm[1]);write(s);return send(res,200,{ok:true})}
  }

  if(m==="DELETE"&&p.startsWith("/api/admin/reviews/")){const id=p.split("/").pop();s.reviews=s.reviews.filter(x=>String(x.id)!==id);write(s);return send(res,200,{ok:true})}
  if(m==="DELETE"&&p.startsWith("/api/admin/inquiries/")){const id=p.split("/").pop();s.inquiries=s.inquiries.filter(x=>String(x.id)!==id);write(s);return send(res,200,{ok:true})}

  if(m==="GET"&&p==="/api/admin/export/orders.csv"){
    const rows=[["주문번호","일시","주문자","연락처","결제수단","결제상태","주문상태","금액","택배사","송장번호"],...s.orders.map(o=>[o.id,o.createdAt,o.customer?.name||"",o.customer?.phone||"",o.paymentMethod,o.paymentStatus,o.status,o.total,o.carrier,o.trackingNumber])];
    const csv="\ufeff"+rows.map(r=>r.map(csvEscape).join(",")).join("\r\n");
    res.writeHead(200,{"Content-Type":"text/csv; charset=utf-8","Content-Disposition":"attachment; filename=iroom_orders.csv"});return res.end(csv)
  }

  return send(res,404,{error:"API 없음"})
}

function publicBase(s){
  return ENV.PUBLIC_URL||String(s.settings?.siteUrl||"").replace(/\/+$/,"")||"http://127.0.0.1:"+Number(process.env.PORT||3000);
}
function escHtml(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]))}
function seoIndexHtml(s,product=null){
  let x=fs.readFileSync(path.join(PUBLIC,"index.html"),"utf8");
  const base=publicBase(s);
  const title=product?`${product.name} | ${s.settings.brand||"이룸 fresh fruits"}`:(s.settings.siteTitle||`${s.settings.brand||"이룸 fresh fruits"} | 프리미엄 국내산 과일`);
  const desc=product?(product.description||`${product.origin||""} ${product.name}`).slice(0,150):(s.settings.siteDescription||"국내산 제철과일과 프리미엄 과일선물세트");
  const img=product?.image?new URL(product.image,base+"/").href:new URL("/assets/naju-pear-premium.jpg",base+"/").href;
  const canonical=product?`${base}/product/${encodeURIComponent(product.id)}`:base+"/";
  x=x.replace(/<title>.*?<\/title>/i,`<title>${escHtml(title)}</title>`);
  x=x.replace(/<meta name="description"[^>]*>/i,`<meta name="description" content="${escHtml(desc)}">`);
  x=x.replace(/<meta property="og:title"[^>]*>/i,`<meta property="og:title" content="${escHtml(title)}">`);
  x=x.replace(/<meta property="og:description"[^>]*>/i,`<meta property="og:description" content="${escHtml(desc)}">`);
  if(/<meta property="og:image"/i.test(x))x=x.replace(/<meta property="og:image"[^>]*>/i,`<meta property="og:image" content="${escHtml(img)}">`);
  else x=x.replace("</head>",`<meta property="og:image" content="${escHtml(img)}">`);
  x=x.replace("</head>",`<link rel="canonical" href="${escHtml(canonical)}"><meta property="og:url" content="${escHtml(canonical)}">${s.settings.naverSiteVerification?`<meta name="naver-site-verification" content="${escHtml(s.settings.naverSiteVerification)}">`:""}${s.settings.googleSiteVerification?`<meta name="google-site-verification" content="${escHtml(s.settings.googleSiteVerification)}">`:""}</head>`);
  if(product)x=x.replace("</body>",`<script>window.addEventListener("load",()=>{setTimeout(()=>{try{openProductDetail(${JSON.stringify(product.id)})}catch(e){}},250)})</script></body>`);
  return x;
}
function securityHeaders(contentType,cache){
  return {"Content-Type":contentType,"Cache-Control":cache,"X-Content-Type-Options":"nosniff","X-Frame-Options":"DENY","Referrer-Policy":"strict-origin-when-cross-origin","Permissions-Policy":"camera=(), microphone=(), geolocation=()","Cross-Origin-Opener-Policy":"same-origin"};
}
function serve(req,res,pathname){
  const s=read(),base=publicBase(s);
  if(pathname==="/robots.txt"){
    res.writeHead(200,securityHeaders("text/plain; charset=utf-8","public, max-age=3600"));
    return res.end(`User-agent: *\nAllow: /\nDisallow: /api/admin/\nSitemap: ${base}/sitemap.xml\n`);
  }
  if(pathname==="/sitemap.xml"){
    const urls=[`${base}/`,...(s.products||[]).filter(p=>p.active!==false).map(p=>`${base}/product/${encodeURIComponent(p.id)}`)];
    const xml=`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(u=>`<url><loc>${escHtml(u)}</loc></url>`).join("")}</urlset>`;
    res.writeHead(200,securityHeaders("application/xml; charset=utf-8","public, max-age=1800"));return res.end(xml);
  }
  const pm=pathname.match(/^\/product\/([^/]+)$/);
  if(pathname==="/"||pathname==="/index.html"||pm){
    const p=pm?(s.products||[]).find(x=>String(x.id)===decodeURIComponent(pm[1])):null;
    const body=seoIndexHtml(s,p);
    res.writeHead(200,securityHeaders("text/html; charset=utf-8","no-store"));return res.end(body);
  }
  let f=pathname,fp=path.join(PUBLIC,decodeURIComponent(f));
  if(!fp.startsWith(PUBLIC)||!fs.existsSync(fp)||fs.statSync(fp).isDirectory()){
    const body=seoIndexHtml(s,null);res.writeHead(200,securityHeaders("text/html; charset=utf-8","no-store"));return res.end(body);
  }
  const ext=path.extname(fp).toLowerCase(),types={".html":"text/html; charset=utf-8",".js":"application/javascript",".css":"text/css",".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg",".webp":"image/webp",".gif":"image/gif",".mp4":"video/mp4",".webm":"video/webm",".webmanifest":"application/manifest+json",".svg":"image/svg+xml"};
  const cache=f.startsWith("/uploads/")?"public, max-age=31536000, immutable":"public, max-age=3600";
  res.writeHead(200,securityHeaders(types[ext]||"application/octet-stream",cache));fs.createReadStream(fp).pipe(res)
}
const PORT=Number(process.env.PORT||3000);
const HOST=process.env.HOST||"0.0.0.0";
const server=http.createServer(async(req,res)=>{
  try{
    const u=new URL(req.url,`http://${HOST}:${PORT}`);
    if(u.pathname.startsWith("/api/"))return await api(req,res,u);
    return serve(req,res,u.pathname);
  }catch(e){
    console.error(new Date().toISOString(),"REQUEST ERROR",e&&e.stack||e);
    return send(res,500,{error:e.message});
  }
});
server.on("error",e=>{
  console.error(new Date().toISOString(),"SERVER ERROR",e&&e.stack||e);
  process.exitCode=1;
});
server.listen(PORT,HOST,()=>console.log(`IROOM V35 ONLINE READY http://${HOST}:${PORT}`));
