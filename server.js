const express = require("express");
const path = require("path");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { Pool } = require("pg");

const app = express();
const PORT = Number(process.env.PORT || 3000);
const NODE_ENV = String(process.env.NODE_ENV || "development").trim();
const IS_PROD = NODE_ENV === "production";
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString("hex");
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
const ADMIN_SESSION_HOURS = Math.min(12, Math.max(1, Number(process.env.ADMIN_SESSION_HOURS || 4) || 4));
if(!process.env.JWT_SECRET) console.warn("[SECURITY] JWT_SECRET is not configured. A temporary secret is being used; set JWT_SECRET in Render Environment.");
if(process.env.JWT_SECRET && String(process.env.JWT_SECRET).length < 48) console.warn("[SECURITY] JWT_SECRET should be at least 48 random characters.");
if(!ADMIN_PASSWORD) console.warn("[SECURITY] ADMIN_PASSWORD is not configured. Admin login is disabled until it is set or changed in DB.");
const BASE_URL = process.env.PUBLIC_BASE_URL || `http://localhost:${PORT}`;
const OPENAI_API_KEY = String(process.env.OPENAI_API_KEY || "").trim();
const OPENAI_MODEL = String(process.env.OPENAI_MODEL || "gpt-5.6-luna").trim();
const KAKAO_REST_API_KEY = String(process.env.KAKAO_REST_API_KEY || "").trim();
const KAKAO_CLIENT_SECRET = String(process.env.KAKAO_CLIENT_SECRET || "").trim();
const KAKAO_REDIRECT_URI = String(process.env.KAKAO_REDIRECT_URI || `${BASE_URL}/api/auth/kakao/callback`).trim();
const AUTH_COOKIE = IS_PROD ? "__Host-iroom_token" : "iroom_token";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required. Create a PostgreSQL database and set DATABASE_URL.");
  process.exit(1);
}

const dbLocal = /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL);
const dbUrl = new URL(process.env.DATABASE_URL);
const dbSslMode = String(dbUrl.searchParams.get("sslmode") || process.env.PGSSLMODE || "").toLowerCase();
const dbWantsTls = ["require","verify-ca","verify-full"].includes(dbSslMode);
const rejectUnauthorized = String(process.env.PGSSL_REJECT_UNAUTHORIZED || "false").toLowerCase() === "true";
const poolOptions = { connectionString: process.env.DATABASE_URL, max: Math.max(2, Math.min(20, Number(process.env.PGPOOL_MAX || 10) || 10)), idleTimeoutMillis:30000, connectionTimeoutMillis:10000 };
// Render internal DATABASE_URL normally has no sslmode and should not be forced through TLS.
// Render external URLs use sslmode=require; their managed/self-signed chain commonly needs rejectUnauthorized=false unless a CA is supplied.
if(!dbLocal && dbWantsTls) poolOptions.ssl={rejectUnauthorized};
const pool = new Pool(poolOptions);
pool.on("error",err=>console.error("[DB POOL]",err.message));

app.use(express.json({ limit: "30mb", strict:true }));
app.use(express.urlencoded({ extended: false, limit:"1mb" }));
app.use(cookieParser());

app.set("trust proxy",1);
app.disable("x-powered-by");

// V60 security headers: strict by default, with the minimum exceptions required by the current static admin UI.
app.use((req,res,next)=>{
  const isAdminPreview=req.path==="/admin-preview";
  const frameAncestors=isAdminPreview?"'self'":"'none'";
  const upgrade=IS_PROD?"; upgrade-insecure-requests":"";
  res.setHeader("X-Content-Type-Options","nosniff");
  res.setHeader("X-Frame-Options",isAdminPreview?"SAMEORIGIN":"DENY");
  res.setHeader("Referrer-Policy","strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy","camera=(), microphone=(), geolocation=(), payment=(self), usb=(), serial=()");
  res.setHeader("Cross-Origin-Opener-Policy","same-origin-allow-popups");
  res.setHeader("Cross-Origin-Resource-Policy","same-origin");
  res.setHeader("X-Permitted-Cross-Domain-Policies","none");
  res.setHeader("Content-Security-Policy",`default-src 'self'; script-src 'self' 'unsafe-inline' https://t1.kakaocdn.net; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://kauth.kakao.com https://kapi.kakao.com https://api.openai.com https://api.brevo.com; media-src 'self' data: https:; worker-src 'self'; manifest-src 'self'; frame-src 'self'; frame-ancestors ${frameAncestors}; object-src 'none'; base-uri 'self'; form-action 'self'${upgrade}`);
  if(req.secure || IS_PROD) res.setHeader("Strict-Transport-Security","max-age=31536000; includeSubDomains");
  if(req.path.startsWith("/api/admin") || req.path.startsWith("/api/auth") || req.path==="/api/me" || req.path==="/band-admin.html" || isAdminPreview){
    res.setHeader("Cache-Control","no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma","no-cache");
  }
  next();
});

const rateBuckets=new Map();
function simpleRateLimit({windowMs,max,keyPrefix,message}){
  return (req,res,next)=>{
    const now=Date.now();
    const account=String(req.body?.username||req.body?.email||"").toLowerCase().slice(0,80);
    const key=`${keyPrefix}:${req.ip}:${account}`;
    let b=rateBuckets.get(key);
    if(!b || now>b.reset){b={count:0,reset:now+windowMs};rateBuckets.set(key,b)}
    b.count++;
    res.setHeader("X-RateLimit-Limit",String(max));
    res.setHeader("X-RateLimit-Remaining",String(Math.max(0,max-b.count)));
    if(b.count>max) return res.status(429).json({error:message||"요청이 너무 많습니다. 잠시 후 다시 시도해주세요."});
    next();
  };
}
setInterval(()=>{const n=Date.now();for(const [k,v] of rateBuckets)if(n>v.reset)rateBuckets.delete(k)},10*60*1000).unref();

function requestOrigin(req){
  const forwardedProto=String(req.get("x-forwarded-proto")||"").split(",")[0].trim();
  const forwardedHost=String(req.get("x-forwarded-host")||"").split(",")[0].trim();
  const proto=forwardedProto || req.protocol || "https";
  const host=forwardedHost || String(req.get("host")||"").trim();
  if(!host)return "";
  try{return new URL(`${proto}://${host}`).origin}catch(_){return ""}
}
function allowedRequestOrigins(req){
  const allowed=new Set();
  try{if(BASE_URL)allowed.add(new URL(BASE_URL).origin)}catch(_){}
  const live=requestOrigin(req);
  if(live)allowed.add(live);
  // Optional comma-separated custom domains, useful while moving between Render/custom domains.
  for(const item of String(process.env.ALLOWED_ORIGINS||"").split(",")){
    const value=item.trim();
    if(!value)continue;
    try{allowed.add(new URL(value).origin)}catch(_){}
  }
  return allowed;
}
function sameOriginGuard(req,res,next){
  if(["GET","HEAD","OPTIONS"].includes(req.method)) return next();
  const fetchSite=String(req.get("sec-fetch-site")||"").toLowerCase();
  if(fetchSite==="cross-site") return res.status(403).json({error:"교차 사이트 요청이 차단되었습니다."});
  let source=String(req.get("origin")||"").trim();
  if(!source){
    const ref=String(req.get("referer")||"").trim();
    if(ref){try{source=new URL(ref).origin}catch(_){source=""}}
  }
  if(source){
    try{
      const sourceOrigin=new URL(source).origin;
      if(!allowedRequestOrigins(req).has(sourceOrigin))return res.status(403).json({error:"허용되지 않은 요청입니다."});
    }catch(_){return res.status(403).json({error:"허용되지 않은 요청입니다."})}
  }else if(req.cookies?.[AUTH_COOKIE] || req.cookies?.iroom_token){
    return res.status(403).json({error:"요청 출처를 확인할 수 없습니다."});
  }
  next();
}
app.use("/api",sameOriginGuard);

function cleanText(v,max=200){return String(v??"").replace(/\0/g,"").trim().slice(0,max)}
function cleanEmail(v){const s=cleanText(v,180).toLowerCase();return s && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)?s:""}
function cleanPhone(v){return cleanText(v,30).replace(/[^0-9+ \-]/g,"")}
function safeHttpsUrl(v,max=1000){const s=cleanText(v,max);if(!s)return "";try{const u=new URL(s);return u.protocol==="https:"?u.toString().slice(0,max):""}catch(_){return ""}}
function safeLocalOrHttpsUrl(v,max=2000){
  const s=cleanText(v,max);
  if(!s)return "";
  if(s.startsWith("/") && !s.startsWith("//"))return s.slice(0,max);
  return safeHttpsUrl(s,max);
}
function sanitizeConfigValue(value,depth=0){
  if(depth>10)return null;
  if(value===null || typeof value==="boolean")return value;
  if(typeof value==="number")return Number.isFinite(value)?value:0;
  if(typeof value==="string"){
    const x=value.replace(/\0/g,"");
    if(/^data:image\/(?:jpeg|jpg|png|webp);base64,/i.test(x))return x.length<=900000?x:"";
    return x.slice(0,12000);
  }
  if(Array.isArray(value))return value.slice(0,250).map(v=>sanitizeConfigValue(v,depth+1));
  if(typeof value==="object"){
    const out={};
    for(const [k,v] of Object.entries(value).slice(0,300)){
      const key=String(k).slice(0,100);
      if(["__proto__","prototype","constructor"].includes(key))continue;
      out[key]=sanitizeConfigValue(v,depth+1);
    }
    return out;
  }
  return null;
}
function configRevision(value){return crypto.createHash("sha256").update(JSON.stringify(value||{})).digest("hex").slice(0,20)}
function cleanNonNegative(v,max=100000000){const n=Number(v);return Number.isFinite(n)?Math.max(0,Math.min(max,Math.round(n))):0}
function passwordBytes(v){return Buffer.byteLength(String(v||""),"utf8")}
function safeEqual(a,b){const x=Buffer.from(String(a)),y=Buffer.from(String(b));return x.length===y.length && crypto.timingSafeEqual(x,y)}
function ipHash(req){return crypto.createHash("sha256").update(String(req.ip)+JWT_SECRET.slice(0,16)).digest("hex").slice(0,20)}
async function logSecurity(type,actor,req,detail=""){
  try{await pool.query("INSERT INTO security_events(event_type,actor,ip_hash,detail) VALUES($1,$2,$3,$4)",[cleanText(type,60),cleanText(actor,100),ipHash(req),cleanText(detail,300)])}catch(e){console.warn("[SECURITY LOG]",e.message)}
}


function mailSettings(){
  return {
    apiKey:String(process.env.BREVO_API_KEY||"").trim(),
    senderEmail:String(process.env.BREVO_SENDER_EMAIL||"").trim(),
    senderName:String(process.env.BREVO_SENDER_NAME||"이룸 fresh fruits").trim(),
    orderEmail:String(process.env.ORDER_EMAIL||"").trim()
  };
}
async function sendBrevoMail({to,subject,text}){
  const c=mailSettings();
  if(!c.apiKey) throw new Error("BREVO_API_KEY_MISSING");
  if(!c.senderEmail) throw new Error("BREVO_SENDER_EMAIL_MISSING");
  const recipients=String(to||"").split(",").map(x=>x.trim()).filter(Boolean).map(email=>({email}));
  if(!recipients.length) throw new Error("RECIPIENT_MISSING");
  const r=await fetch("https://api.brevo.com/v3/smtp/email",{
    method:"POST",
    headers:{"Content-Type":"application/json","api-key":c.apiKey},
    body:JSON.stringify({
      sender:{name:c.senderName,email:c.senderEmail},
      to:recipients,
      subject,
      textContent:text
    })
  });
  if(!r.ok){
    const body=await r.text().catch(()=>"");
    throw new Error(`BREVO_${r.status}:${body.slice(0,240)}`);
  }
  return r.json().catch(()=>({ok:true}));
}
function money(n){return Number(n||0).toLocaleString("ko-KR")+"원"}

function cleanLongText(v,max=5000){return String(v??"").replace(/\0/g,"").trim().slice(0,max)}
function safeMediaValue(v){
  const s=String(v||"").trim();
  if(!s) return "";
  if(s.startsWith("/assets/") || s.startsWith("assets/")) return s.startsWith("/")?s:"/"+s;
  if(/^https:\/\/[^\s]+$/i.test(s)) return s.slice(0,2000);
  if(/^data:image\/(?:jpeg|jpg|png|webp);base64,/i.test(s) && s.length<=900000) return s;
  return "";
}
function normalizeTodayPick(body={}){
  const images=Array.isArray(body.images)?body.images.map(safeMediaValue).filter(Boolean).slice(0,4):[];
  return {
    eyebrow:cleanText(body.eyebrow||"TODAY'S PICK",40),
    dateNote:cleanText(body.dateNote||"오늘의 이룸 PICK · 입고 당일 업데이트",100),
    title:cleanText(body.title||"오늘 가장 좋은 과일",80),
    summary:cleanLongText(body.summary||"",700),
    reason:cleanLongText(body.reason||"",900),
    productName:cleanText(body.productName||"",80),
    origin:cleanText(body.origin||"",100),
    taste:cleanText(body.taste||"",120),
    price:Math.max(0,Number(body.price||0)||0),
    stockText:cleanText(body.stockText||"한정 수량",60),
    status:["판매중","품절","준비중"].includes(body.status)?body.status:"판매중",
    images,
    updatedAt:new Date().toISOString()
  };
}
async function getSetting(key,fallback={}){
  const r=await pool.query("SELECT setting_value FROM site_settings WHERE setting_key=$1",[key]);
  return r.rows[0]?.setting_value || fallback;
}
async function putSetting(key,value){
  const r=await pool.query(`
    INSERT INTO site_settings(setting_key,setting_value,updated_at)
    VALUES($1,$2::jsonb,NOW())
    ON CONFLICT(setting_key) DO UPDATE SET setting_value=EXCLUDED.setting_value,updated_at=NOW()
    RETURNING setting_value,updated_at
  `,[key,JSON.stringify(value)]);
  return r.rows[0];
}

async function getPaymentBankInfo(){
  let site={};
  try{
    const saved=await getSetting("iroom1_store",{});
    site=(saved&&saved.site)||{};
  }catch(_){}
  return {
    name:String(site.bankName||process.env.BANK_NAME||"우리은행").trim(),
    account:String(site.bankAccount||process.env.BANK_ACCOUNT||"1005-203-135891").trim(),
    holder:String(site.bankOwner||process.env.BANK_HOLDER||"한효철").trim()
  };
}
function extractOpenAIResult(data){
  const texts=[], sources=[];
  for(const item of (data?.output||[])){
    if(item?.type==="message"){
      for(const c of (item.content||[])){
        if(c?.type==="output_text" && c.text) texts.push(c.text);
        for(const a of (c?.annotations||[])){
          if(a?.type==="url_citation" && a.url) sources.push({title:a.title||a.url,url:a.url});
        }
      }
    }
    if(item?.type==="web_search_call"){
      for(const s of (item.action?.sources||[])){
        if(s?.url) sources.push({title:s.title||s.url,url:s.url});
      }
    }
  }
  const uniq=[]; const seen=new Set();
  for(const s of sources){ if(!seen.has(s.url)){seen.add(s.url);uniq.push(s)} }
  return {text:(data?.output_text||texts.join("\n")).trim(),sources:uniq.slice(0,8)};
}
async function openAiAssist({mode,subject,audience,tone,details,useWeb}){
  if(!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY_MISSING");
  const modeGuide={
    today:"오늘의 이룸 PICK 고객용 문구를 작성한다. 결과는 [제목] [요약] [오늘의 선택 이유] [상세설명] 순서로 작성한다.",
    product:"상품 상세페이지 설명을 작성한다. 결과는 [한줄소개] [상세설명] [구매 전 확인] 순서로 작성한다.",
    promotion:"네이버 블로그/인스타그램용 홍보 문구를 과장 없이 작성한다.",
    seo:"검색용 제목, 메타 설명, 핵심 키워드를 작성한다.",
    audit:"입력한 운영 정보를 고객 신뢰·구매 편의·운영 현실성 관점에서 점검한다."
  }[mode]||"과일 쇼핑몰 운영 문구를 작성한다.";
  const instructions=`당신은 한국의 프리미엄 과일 쇼핑몰 '이룸 fresh fruits' 관리자 보조 AI다.
브랜드 원칙은 '오늘 가장 좋은 맛을 고릅니다.'이며 가락시장 당일 선별, 맛 우선, 기준 미달 시 억지 판매하지 않는 운영 철학을 따른다.
중요: 사용자가 입력하지 않은 산지, 등급, 당도(Brix), 중량, 가격, 재고, 인증, 효능을 사실처럼 지어내지 마라.
인터넷 검색을 사용한 경우에도 실제 판매 상품의 산지·등급·당도는 관리자 입력값을 우선하고, 일반적인 참고 정보와 실제 상품 사실을 명확히 구분하라.
건강·치료 효과를 보장하는 표현, 근거 없는 최상급 표현, 허위 희소성 표현을 피하라.
문장은 한국어로 고급스럽지만 쉽게 읽히게 작성한다.
${modeGuide}`;
  const input=`주제/상품명: ${cleanText(subject,120)}
대상/상황: ${cleanText(audience,180)}
말투: ${cleanText(tone,100)}
관리자가 확인한 실제 정보:
${cleanLongText(details,3500)}

필요하면 부족한 실제 정보는 '확인 필요'라고 표시하고 임의로 채우지 마라.`;
  const payload={model:OPENAI_MODEL,instructions,input,store:false};
  if(useWeb){
    payload.tools=[{type:"web_search",search_context_size:"medium",user_location:{type:"approximate",country:"KR",timezone:"Asia/Seoul"}}];
  }
  const r=await fetch("https://api.openai.com/v1/responses",{
    method:"POST",
    headers:{"Authorization":`Bearer ${OPENAI_API_KEY}`,"Content-Type":"application/json"},
    body:JSON.stringify(payload)
  });
  const data=await r.json().catch(()=>({}));
  if(!r.ok) throw new Error(data?.error?.message||`OPENAI_${r.status}`);
  return extractOpenAIResult(data);
}
async function notifyOrder(order,items){
  const c=mailSettings();
  const bank=await getPaymentBankInfo();
  const lines=items.map(i=>`${i.product_name} × ${i.qty} = ${money(i.line_total)}`).join("\n");
  const status={seller:{sent:false,reason:""},customer:{sent:false,reason:""}};

  const seller=`[이룸 새 주문]
주문번호: ${order.order_no}
주문자: ${order.customer_name}
연락처: ${order.phone}
이메일: ${order.email||"-"}
배송지: ${order.postcode||""} ${order.address1||""} ${order.address2||""}
배송지역: ${{normal:"일반지역",jeju:"제주도",remote:"제주 외 도서산간"}[order.shipping_region]||"일반지역"}
배송메모: ${order.memo||"-"}

${lines}

상품금액: ${money(order.subtotal||Math.max(0,Number(order.total_amount||0)-Number(order.shipping_fee||0)))}
배송비: ${Number(order.shipping_fee||0)===0?"무료":money(order.shipping_fee)}
총금액: ${money(order.total_amount)}
입금계좌: ${bank.name} ${bank.account}
예금주: ${bank.holder}`;

  if(!c.orderEmail){
    status.seller.reason="ORDER_EMAIL_MISSING";
    console.error("[ORDER EMAIL] ORDER_EMAIL_MISSING");
  }else{
    try{
      await sendBrevoMail({to:c.orderEmail,subject:`[이룸] 새 주문 ${order.order_no} / ${order.customer_name}`,text:seller});
      status.seller.sent=true;
      console.log("[ORDER EMAIL] BREVO SENT",order.order_no,c.orderEmail);
    }catch(e){
      status.seller.reason=e.message;
      console.error("[ORDER EMAIL] BREVO FAILED",order.order_no,e.message);
    }
  }

  if(order.email){
    const customer=`${order.customer_name} 고객님, 이룸 fresh fruits 주문이 접수되었습니다.

주문번호: ${order.order_no}
배송지역: ${{normal:"일반지역",jeju:"제주도",remote:"제주 외 도서산간"}[order.shipping_region]||"일반지역"}

${lines}

상품금액: ${money(order.subtotal||Math.max(0,Number(order.total_amount||0)-Number(order.shipping_fee||0)))}
배송비: ${Number(order.shipping_fee||0)===0?"무료":money(order.shipping_fee)}
총금액: ${money(order.total_amount)}
${bank.name} ${bank.account}
예금주: ${bank.holder}

입금 확인 후 정성껏 선별·포장해 배송하겠습니다.`;
    try{
      await sendBrevoMail({to:order.email,subject:`[이룸 fresh fruits] 주문접수 ${order.order_no}`,text:customer});
      status.customer.sent=true;
      console.log("[CUSTOMER EMAIL] BREVO SENT",order.order_no,order.email);
    }catch(e){
      status.customer.reason=e.message;
      console.error("[CUSTOMER EMAIL] BREVO FAILED",order.order_no,e.message);
    }
  }else{
    status.customer.reason="CUSTOMER_EMAIL_EMPTY";
  }
  return status;
}


function nowIso(){ return new Date().toISOString(); }
function orderNo(){
  const d = new Date();
  const y = d.getFullYear().toString();
  const m = String(d.getMonth()+1).padStart(2,"0");
  const day = String(d.getDate()).padStart(2,"0");
  const rnd = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `IR${y}${m}${day}-${rnd}`;
}

async function initOptionalTables(){
  try{
    await pool.query(`
      CREATE TABLE IF NOT EXISTS consultations(
        id BIGSERIAL PRIMARY KEY,
        consult_no TEXT UNIQUE NOT NULL,
        user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
        guide_type TEXT NOT NULL,
        customer_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT DEFAULT '',
        recipient TEXT DEFAULT '',
        budget TEXT DEFAULT '',
        quantity_note TEXT DEFAULT '',
        preferred_fruits TEXT DEFAULT '',
        avoid_fruits TEXT DEFAULT '',
        taste_preference TEXT DEFAULT '',
        packaging TEXT DEFAULT '',
        delivery_date TEXT DEFAULT '',
        message TEXT DEFAULT '',
        status TEXT NOT NULL DEFAULT '상담접수',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    console.log("[DB] optional consultation table ready");
  }catch(e){
    console.error("[DB] optional consultation table failed:",e.message);
  }
}

function token(payload, expires="7d"){
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn:expires,
    issuer:"iroom-home1",
    audience:"iroom-web",
    jwtid:crypto.randomBytes(12).toString("hex")
  });
}
function readToken(req){
  const raw = req.cookies?.[AUTH_COOKIE] || req.cookies?.iroom_token || (req.headers.authorization||"").replace(/^Bearer\s+/i,"");
  if(!raw) return null;
  try { return jwt.verify(raw, JWT_SECRET,{issuer:"iroom-home1",audience:"iroom-web"}); } catch { return null; }
}
function requireUser(req,res,next){
  const u = readToken(req);
  if(!u || !u.userId) return res.status(401).json({error:"로그인이 필요합니다."});
  req.user=u; next();
}
let adminSessionCache={value:1,ts:0};
async function getAdminSessionVersion(force=false){
  if(!force && Date.now()-adminSessionCache.ts<30000)return adminSessionCache.value;
  try{
    const saved=await getSetting("admin_session_version",{version:1});
    const value=Math.max(1,Number(saved?.version||1)||1);
    adminSessionCache={value,ts:Date.now()};return value;
  }catch(_){return adminSessionCache.value||1}
}
async function requireAdmin(req,res,next){
  try{
    const u=readToken(req);
    if(!u || !u.admin)return res.status(401).json({error:"관리자 로그인이 필요합니다."});
    const version=await getAdminSessionVersion();
    if(Number(u.adminSessionVersion||1)!==version)return res.status(401).json({error:"관리자 세션이 만료되었습니다. 다시 로그인해주세요."});
    req.user=u;next();
  }catch(e){next(e)}
}
function setAuthCookie(res,tok,admin=false){
  const secure=IS_PROD || BASE_URL.startsWith("https://");
  const opts={httpOnly:true,sameSite:"strict",secure,path:"/",priority:"high",maxAge:(admin?ADMIN_SESSION_HOURS*60*60:7*24*60*60)*1000};
  res.cookie(AUTH_COOKIE,tok,opts);
  if(AUTH_COOKIE!=="iroom_token")res.clearCookie("iroom_token",{path:"/"});
}
function clearAuthCookie(res){
  res.clearCookie(AUTH_COOKIE,{path:"/"});
  res.clearCookie("iroom_token",{path:"/"});
}

async function initDb(){
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users(
      id BIGSERIAL PRIMARY KEY,
      username TEXT UNIQUE,
      email TEXT UNIQUE,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT DEFAULT '',
      postcode TEXT DEFAULT '',
      address1 TEXT DEFAULT '',
      address2 TEXT DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS products(
      id BIGSERIAL PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      unit TEXT DEFAULT '',
      price INTEGER NOT NULL CHECK(price >= 0),
      stock INTEGER NOT NULL DEFAULT 0 CHECK(stock >= 0),
      image TEXT DEFAULT '',
      category TEXT DEFAULT '과일',
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      sort_order INTEGER NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS orders(
      id BIGSERIAL PRIMARY KEY,
      order_no TEXT UNIQUE NOT NULL,
      user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
      customer_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT DEFAULT '',
      postcode TEXT DEFAULT '',
      address1 TEXT NOT NULL,
      address2 TEXT DEFAULT '',
      memo TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT '주문접수',
      payment_method TEXT NOT NULL DEFAULT '무통장입금',
      payment_status TEXT NOT NULL DEFAULT '입금대기',
      total_amount INTEGER NOT NULL CHECK(total_amount >= 0),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS order_items(
      id BIGSERIAL PRIMARY KEY,
      order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id BIGINT REFERENCES products(id) ON DELETE SET NULL,
      product_name TEXT NOT NULL,
      unit_price INTEGER NOT NULL,
      qty INTEGER NOT NULL CHECK(qty > 0),
      line_total INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
    CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
    CREATE TABLE IF NOT EXISTS security_events(
      id BIGSERIAL PRIMARY KEY,
      event_type TEXT NOT NULL,
      actor TEXT DEFAULT '',
      ip_hash TEXT DEFAULT '',
      detail TEXT DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_security_events_created ON security_events(created_at DESC);
    DELETE FROM security_events WHERE created_at < NOW() - INTERVAL '180 days';
    CREATE TABLE IF NOT EXISTS site_settings(
      setting_key TEXT PRIMARY KEY,
      setting_value JSONB NOT NULL DEFAULT '{}'::jsonb,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS postcode TEXT DEFAULT ''`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS address1 TEXT DEFAULT ''`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS address2 TEXT DEFAULT ''`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS kakao_id TEXT`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider TEXT DEFAULT 'local'`);
  await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_kakao_id_unique ON users(kakao_id) WHERE kakao_id IS NOT NULL`);
  await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal INTEGER NOT NULL DEFAULT 0`).catch(()=>{});
  await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_fee INTEGER NOT NULL DEFAULT 0`).catch(()=>{});
  await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_region TEXT NOT NULL DEFAULT 'normal'`).catch(()=>{});
  await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS privacy_agreed_at TIMESTAMPTZ`).catch(()=>{});
  await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS terms_agreed_at TIMESTAMPTZ`).catch(()=>{});
  await pool.query(`ALTER TABLE users ALTER COLUMN email DROP NOT NULL`).catch(()=>{});
  await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_unique ON users(username) WHERE username IS NOT NULL`);

  const seed = [
    ["shine-muscat","샤인머스켓","향긋한 머스캣 향과 높은 당도가 특징인 프리미엄 포도입니다.","2kg (3~4송이)",28000,30,"/assets/prod-shine.jpg","과일",10],
    ["naju-pear","나주 신고배 특선","아삭한 식감과 풍부한 과즙이 좋은 나주 신고배 특선입니다.","5kg (7~9과)",38000,30,"/assets/prod-pear.jpg","과일",20],
    ["red-apple","경북 홍사과","산뜻한 향과 달콤한 맛이 균형 잡힌 경북 홍사과입니다.","3kg",32000,30,"/assets/prod-apple.jpg","과일",30],
    ["hallabong","제주 한라봉","향이 진하고 과즙이 풍부한 제주 한라봉입니다.","3kg",28000,30,"/assets/prod-hallabong.jpg","과일",40],
    ["premium-gift","프리미엄 과일세트","받는 분과 예산에 맞춰 엄선한 과일을 품격 있게 구성한 선물세트입니다.","혼합 구성",85000,20,"/assets/prod-gift.jpg","선물세트",50],
    ["white-peach","복숭아 백도","부드러운 과육과 향긋한 단맛이 좋은 백도 복숭아입니다.","4kg",29000,30,"/assets/prod-peach.jpg","과일",60]
  ];
  for(const p of seed){
    await pool.query(`
      INSERT INTO products(slug,name,description,unit,price,stock,image,category,sort_order)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)
      ON CONFLICT(slug) DO NOTHING
    `,p);
  }

  // V37 commerce starters: exact storefront names so every visible sale fruit can
  // resolve to a real product id. Prices/stock are starter values and remain
  // editable from the existing admin product manager as market prices change.
  const commerceSeed = [
    ["v37-geumsil-strawberry","금실딸기","향긋하고 산뜻한 프리미엄 딸기입니다.","1kg 내외",25000,30,"/iroom_assets/fruits/01_딸기_strawberry.png","과일",101],
    ["v37-seongju-melon","성주참외","아삭하고 맑은 단맛의 성주 참외입니다.","2kg",24000,30,"/iroom_assets/fruits/02_참외_korean_melon.png","과일",102],
    ["v37-daejeo-tomato","대저토마토","신선하고 산뜻한 자연의 맛을 살린 대저토마토입니다.","2kg",18000,30,"/iroom_assets/fruits/37_토마토_tomato.png","과일",103],
    ["v37-shine-muscat","샤인머스캣","향긋하고 맑은 달콤함이 좋은 샤인머스캣입니다.","2kg (3~4송이)",28000,30,"/iroom_assets/fruits/12_샤인머스캣_shine_muscat.png","과일",104],
    ["v37-cherry","체리","상큼하고 진한 과즙을 즐기는 체리입니다.","1kg",32000,30,"/iroom_assets/fruits/04_체리_cherry.png","과일",105],
    ["v37-white-peach","백도복숭아","부드럽고 향긋한 여름 단맛의 백도복숭아입니다.","4kg",29000,30,"/iroom_assets/fruits/06_복숭아_peach.png","과일",106],
    ["v37-high-sugar-watermelon","고당도수박","시원하고 풍부한 과즙을 즐기는 고당도수박입니다.","1통",25000,30,"/iroom_assets/fruits/05_수박_watermelon.png","과일",107],
    ["v37-musk-melon","머스크멜론","부드럽고 은은한 달콤함의 머스크멜론입니다.","2수",26000,30,"/iroom_assets/fruits/28_멜론_melon.png","과일",108],
    ["v37-plum","자두","새콤달콤한 과즙이 좋은 자두입니다.","2kg",19000,30,"/iroom_assets/fruits/27_자두_plum.png","과일",109],
    ["v37-purple-grape","포도","풍부한 향과 진한 단맛의 포도입니다.","2kg",26000,30,"/iroom_assets/fruits/08_포도_purple_grape.png","과일",110],
    ["v37-hongro-apple","홍로사과","아삭하고 선명한 달콤함의 홍로사과입니다.","3kg",32000,30,"/iroom_assets/fruits/09_사과_apple.png","과일",111],
    ["v37-naju-pear","나주배","시원하고 풍부한 과즙의 나주배입니다.","5kg (7~9과)",38000,30,"/iroom_assets/fruits/10_배_pear.png","과일",112],
    ["v37-daebong","대봉","후숙할수록 부드럽고 깊어지는 단맛의 대봉입니다.","3kg",26000,30,"/iroom_assets/fruits/11_감_persimmon.png","과일",113],
    ["v37-pomegranate","석류","선명하고 진한 가을빛의 석류입니다.","2kg",28000,30,"/iroom_assets/fruits/24_석류_pomegranate.png","과일",114],
    ["v37-jeju-mandarin","제주감귤","새콤달콤하고 산뜻한 겨울 맛의 제주감귤입니다.","5kg",25000,30,"/iroom_assets/fruits/21_오렌지_orange.png","과일",115],
    ["v37-busa-apple","부사사과","아삭하고 선명한 달콤함의 부사사과입니다.","3kg",32000,30,"/iroom_assets/fruits/09_사과_apple.png","과일",116],
    ["v37-kiwi","키위","상큼하고 깊은 달콤함의 키위입니다.","2kg",22000,30,"/iroom_assets/fruits/19_키위_kiwi.png","과일",117],
    ["v37-blueberry","블루베리","작지만 깊고 산뜻한 맛의 블루베리입니다.","500g",24000,30,"/iroom_assets/fruits/16_블루베리_blueberry.png","과일",118],
    ["v37-grapefruit","자몽","상큼하고 깨끗한 균형의 자몽입니다.","6과",22000,30,"/iroom_assets/fruits/15_자몽_grapefruit.png","과일",119],
    ["v37-mango","망고","부드럽고 진한 열대의 달콤함을 즐기는 망고입니다.","2~3과",29000,30,"/iroom_assets/fruits/07_망고_mango.png","과일",120],
    ["v37-pineapple","파인애플","상큼하고 풍부한 과즙의 파인애플입니다.","2수",18000,30,"/iroom_assets/fruits/18_파인애플_pineapple.png","과일",121],
    ["v37-blackberry","블랙베리","짙은 향과 산뜻한 균형의 블랙베리입니다.","500g",26000,30,"/iroom_assets/fruits/34_블랙베리_blackberry.png","과일",122],
    ["v37-kumquat","금귤","작고 향긋한 상큼함의 금귤입니다.","2kg",23000,30,"/iroom_assets/fruits/35_금귤_kumquat.png","과일",123],
    ["v37-apple","사과","아삭하고 선명한 달콤함의 사과입니다.","3kg",32000,30,"/iroom_assets/fruits/09_사과_apple.png","과일",124],
    ["v37-pear","배","시원하고 풍부한 과즙의 배입니다.","5kg (7~9과)",38000,30,"/iroom_assets/fruits/10_배_pear.png","과일",125],
    ["v37-persimmon","감","깊고 진한 계절의 단맛을 즐기는 감입니다.","3kg",24000,30,"/iroom_assets/fruits/11_감_persimmon.png","과일",126],
    ["v37-strawberry","딸기","향긋하고 산뜻한 단맛의 딸기입니다.","1kg 내외",22000,30,"/iroom_assets/fruits/01_딸기_strawberry.png","과일",127],
    ["v37-korean-melon","참외","아삭하고 맑은 달콤함의 참외입니다.","2kg",22000,30,"/iroom_assets/fruits/02_참외_korean_melon.png","과일",128],
    ["v37-tomato","토마토","신선하고 산뜻한 자연의 맛을 즐기는 토마토입니다.","2kg",16000,30,"/iroom_assets/fruits/37_토마토_tomato.png","과일",129],
    ["v37-watermelon","수박","시원하고 풍부한 과즙의 수박입니다.","1통",25000,30,"/iroom_assets/fruits/05_수박_watermelon.png","과일",130],
    ["v37-peach","복숭아","부드럽고 향긋한 여름 단맛의 복숭아입니다.","4kg",29000,30,"/iroom_assets/fruits/06_복숭아_peach.png","과일",131],
    ["v37-melon","멜론","부드럽고 은은한 달콤함의 멜론입니다.","2수",24000,30,"/iroom_assets/fruits/28_멜론_melon.png","과일",132],
    ["v37-green-grape","청포도","청량하고 향긋한 단맛의 청포도입니다.","2kg",24000,30,"/iroom_assets/fruits/03_청포도_green_grape.png","과일",133]
    ,["v40-avocado","아보카도","고소하고 부드러운 식감의 프리미엄 아보카도입니다.","5~6과",23000,30,"/iroom_assets/fruits/22_아보카도_avocado.png","수입과일",134]
    ,["v40-dragonfruit","용과","담백하고 청량한 열대의 맛을 즐기는 용과입니다.","3~4과",26000,30,"/iroom_assets/fruits/23_용과_dragonfruit.png","수입과일",135]
    ,["v40-banana","바나나","부드럽고 편안한 달콤함의 바나나입니다.","1.5kg 내외",12000,30,"/iroom_assets/fruits/29_바나나_banana.png","수입과일",136]
    ,["v40-lime","라임","또렷하고 상쾌한 시트러스 향의 라임입니다.","8~10과",16000,30,"/iroom_assets/fruits/30_라임_lime.png","수입과일",137]
    ,["v40-passionfruit","패션후르츠","향긋하고 선명한 새콤달콤함의 패션후르츠입니다.","1kg",24000,30,"/iroom_assets/fruits/31_패션후르츠_passionfruit.png","수입과일",138]
    ,["v40-mangosteen","망고스틴","부드럽고 깨끗한 열대의 단맛을 즐기는 망고스틴입니다.","1kg",35000,30,"/iroom_assets/fruits/32_망고스틴_mangosteen.png","수입과일",139]
    ,["v40-lychee","리치","은은한 꽃향과 맑은 단맛의 리치입니다.","1kg",26000,30,"/iroom_assets/fruits/33_리치_lychee.png","수입과일",140]
    ,["v40-lemon","레몬","깨끗하고 산뜻한 시트러스 향의 레몬입니다.","8~10과",15000,30,"/iroom_assets/fruits/14_레몬_lemon.png","수입과일",141]
    ,["v40-orange","오렌지","풍부한 과즙과 산뜻한 향의 오렌지입니다.","8~10과",18000,30,"/iroom_assets/fruits/21_오렌지_orange.png","수입과일",142]
    ,["v40-raspberry","라즈베리","화사한 산미와 부드러운 향의 라즈베리입니다.","500g",28000,30,"/iroom_assets/fruits/17_라즈베리_raspberry.png","수입과일",143]
    ,["v40-chestnut","밤","포근하고 고소한 가을 풍미의 국내산 밤입니다.","2kg",22000,30,"/iroom_assets/fruits/26_밤_chestnut.png","과일",144]
  ];
  for(const p of commerceSeed){
    await pool.query(`
      INSERT INTO products(slug,name,description,unit,price,stock,image,category,sort_order)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)
      ON CONFLICT(slug) DO NOTHING
    `,p);
  }
}

// Health
app.get("/api/health", async(req,res)=>{
  try{ await pool.query("SELECT 1"); res.json({ok:true,time:nowIso()}); }
  catch(e){ console.error("[HEALTH]",e.message);res.status(503).json({ok:false,error:"database_unavailable"}); }
});

// Auth
app.post("/api/signup", simpleRateLimit({windowMs:15*60*1000,max:8,keyPrefix:"signup"}), async(req,res)=>{
  const {username,password,name,email="",phone="",postcode="",address1="",address2=""}=req.body||{};
  const user=cleanText(username,20).toLowerCase();
  const safeName=cleanText(name,60),safeEmail=cleanEmail(email),safePhone=cleanPhone(phone),safePost=cleanText(postcode,12),safeAddr1=cleanText(address1,180),safeAddr2=cleanText(address2,120);
  if(!user||!password||!safeName) return res.status(400).json({error:"아이디, 비밀번호, 이름을 입력해주세요."});
  if(!/^[a-z0-9_]{4,20}$/.test(user)) return res.status(400).json({error:"아이디는 영문·숫자·밑줄로 4~20자 입력해주세요."});
  if(String(password).length<10 || passwordBytes(password)>72) return res.status(400).json({error:"비밀번호는 10자 이상, 72바이트 이하로 설정해주세요."});
  try{
    const hash=await bcrypt.hash(password,12);
    const r=await pool.query(
      `INSERT INTO users(username,email,password_hash,name,phone,postcode,address1,address2)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING id,username,email,name,phone,postcode,address1,address2`,
      [user,safeEmail||null,hash,safeName,safePhone,safePost,safeAddr1,safeAddr2]
    );
    const u=r.rows[0]; setAuthCookie(res,token({userId:u.id,username:u.username,email:u.email,name:u.name}));
    res.json({ok:true,user:u});
  }catch(e){
    if(e.code==="23505") return res.status(409).json({error:(e.detail||"").includes("username")?"이미 사용 중인 아이디입니다.":"이미 가입된 이메일입니다."});
    console.error("signup error",e);res.status(500).json({error:"회원가입 처리 중 오류가 발생했습니다."});
  }
});

app.post("/api/login", simpleRateLimit({windowMs:15*60*1000,max:12,keyPrefix:"login"}), async(req,res)=>{
  const {username,email,password}=req.body||{};
  const account=String(username||email||"").trim().toLowerCase();

  if(!account||!password){
    return res.status(400).json({error:"아이디와 비밀번호를 입력해주세요."});
  }
  if(account.length>180 || passwordBytes(password)>72) return res.status(400).json({error:"입력값을 확인해주세요."});

  // V79: 아이디 로그인 우선. 과거 이메일 회원도 이메일로 계속 로그인 가능.
  const r=await pool.query(
    `SELECT * FROM users
     WHERE LOWER(COALESCE(username,''))=$1
        OR LOWER(COALESCE(email,''))=$1
     LIMIT 1`,
    [account]
  );
  const u=r.rows[0];

  if(!u || !(await bcrypt.compare(password,u.password_hash))){
    logSecurity("user_login_failed",account,req);
    return res.status(401).json({error:"아이디 또는 비밀번호가 올바르지 않습니다."});
  }
  await pool.query("UPDATE users SET last_login_at=NOW() WHERE id=$1",[u.id]).catch(()=>{});
  logSecurity("user_login_success",u.username||u.email||String(u.id),req);

  setAuthCookie(res,token({
    userId:u.id,
    username:u.username,
    email:u.email,
    name:u.name
  }));

  res.json({
    ok:true,
    user:{
      id:u.id,
      username:u.username,
      email:u.email,
      name:u.name,
      phone:u.phone,
      postcode:u.postcode,
      address1:u.address1,
      address2:u.address2
    }
  });
});

app.post("/api/logout",(req,res)=>{clearAuthCookie(res);res.json({ok:true});});
app.get("/api/me", async(req,res)=>{
  const t=readToken(req); if(!t) return res.json({user:null});
  if(t.admin) return res.json({admin:true});
  const r=await pool.query("SELECT id,username,email,name,phone,postcode,address1,address2,created_at FROM users WHERE id=$1",[t.userId]);
  res.json({user:r.rows[0]||null});
});


// Kakao Login: JavaScript SDK obtains an authorization code, server exchanges it for tokens.
app.get("/api/auth/kakao/callback", simpleRateLimit({windowMs:10*60*1000,max:20,keyPrefix:"kakao"}), async(req,res)=>{
  const code=String(req.query.code||"").trim();
  const error=String(req.query.error||"").trim();
  if(error||!code) return res.redirect("/?kakao=error");
  if(!KAKAO_REST_API_KEY) return res.status(503).send("KAKAO_REST_API_KEY가 설정되지 않았습니다.");
  try{
    const form=new URLSearchParams({grant_type:"authorization_code",client_id:KAKAO_REST_API_KEY,redirect_uri:KAKAO_REDIRECT_URI,code});
    if(KAKAO_CLIENT_SECRET)form.set("client_secret",KAKAO_CLIENT_SECRET);
    const tr=await fetch("https://kauth.kakao.com/oauth/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded;charset=utf-8"},body:form.toString()});
    const td=await tr.json().catch(()=>({}));
    if(!tr.ok||!td.access_token)throw new Error(td.error_description||td.error||`TOKEN_${tr.status}`);
    const ur=await fetch("https://kapi.kakao.com/v2/user/me",{headers:{Authorization:`Bearer ${td.access_token}`,"Content-Type":"application/x-www-form-urlencoded;charset=utf-8"}});
    const ud=await ur.json().catch(()=>({}));
    if(!ur.ok||!ud.id)throw new Error(ud.msg||`USER_${ur.status}`);
    const kakaoId=String(ud.id),account=ud.kakao_account||{},profile=account.profile||{};
    const email=cleanEmail(account.email||"");
    const name=cleanText(profile.nickname||`카카오회원${kakaoId.slice(-4)}`,60);
    let user=null;
    let q=await pool.query("SELECT * FROM users WHERE kakao_id=$1 LIMIT 1",[kakaoId]);user=q.rows[0];
    if(!user&&email){q=await pool.query("SELECT * FROM users WHERE LOWER(COALESCE(email,''))=$1 LIMIT 1",[email]);user=q.rows[0];}
    if(user){
      const r=await pool.query("UPDATE users SET kakao_id=$1,auth_provider='kakao',last_login_at=NOW(),name=CASE WHEN name='' THEN $2 ELSE name END WHERE id=$3 RETURNING *",[kakaoId,name,user.id]);user=r.rows[0];
    }else{
      const username=`kakao_${kakaoId}`.slice(0,20);
      const hash=await bcrypt.hash(crypto.randomBytes(32).toString("hex"),12);
      const r=await pool.query("INSERT INTO users(username,email,password_hash,name,kakao_id,auth_provider,last_login_at) VALUES($1,$2,$3,$4,$5,'kakao',NOW()) RETURNING *",[username,email||null,hash,name,kakaoId]);user=r.rows[0];
    }
    setAuthCookie(res,token({userId:user.id,username:user.username,email:user.email,name:user.name}));
    logSecurity("kakao_login_success",user.username||kakaoId,req).catch(()=>{});
    res.redirect("/?kakao=success");
  }catch(e){console.error("[KAKAO LOGIN]",e.message);logSecurity("kakao_login_failed","kakao",req,e.message).catch(()=>{});res.redirect("/?kakao=error")}
});

// Products
app.get("/api/products", async(req,res)=>{
  const r=await pool.query("SELECT id,slug,name,description,unit,price,stock,image,category,is_active,sort_order FROM products WHERE is_active=TRUE ORDER BY sort_order,id");
  res.json({products:r.rows});
});

// Orders
app.post("/api/orders", simpleRateLimit({windowMs:10*60*1000,max:20,keyPrefix:"order"}), async(req,res)=>{
  const {items,customer_name,phone,email="",postcode="",address1,address2="",memo="",payment_method="무통장입금",shipping_region="normal",privacy_consent=false,terms_consent=false}=req.body||{};
  const safeCustomer=cleanText(customer_name,60),safePhone=cleanPhone(phone),safeEmail=cleanEmail(email),safePost=cleanText(postcode,12),safeAddr1=cleanText(address1,180),safeAddr2=cleanText(address2,120),safeMemo=cleanText(memo,500);
  const privacyAgreed=privacy_consent===true || String(privacy_consent).toLowerCase()==="yes" || String(privacy_consent)==="1";
  const termsAgreed=terms_consent===true || String(terms_consent).toLowerCase()==="yes" || String(terms_consent)==="1";
  const safeShippingRegion=["normal","jeju","remote"].includes(String(shipping_region))?String(shipping_region):"normal";
  const safePayment=["무통장입금","토스결제"].includes(String(payment_method))?String(payment_method):"무통장입금";
  if(!Array.isArray(items)||!items.length||items.length>30) return res.status(400).json({error:"주문 상품이 없습니다."});
  if(!safeCustomer||!safePhone||!safeAddr1) return res.status(400).json({error:"주문자명, 연락처, 배송지를 입력해주세요."});
  if(!privacyAgreed||!termsAgreed) return res.status(400).json({error:"개인정보 수집·이용과 구매조건 확인에 동의해주세요."});

  const client=await pool.connect();
  try{
    await client.query("BEGIN");
    let subtotal=0;
    const finalItems=[];
    for(const it of items){
      const pid=Number(it.product_id||it.id);
      const qty=Math.max(1,Math.min(20,Math.floor(Number(it.qty||1)||1)));
      const pr=await client.query("SELECT id,name,price,stock,is_active FROM products WHERE id=$1 FOR UPDATE",[pid]);
      const p=pr.rows[0];
      if(!p||!p.is_active) throw new Error("판매하지 않는 상품이 포함되어 있습니다.");
      if(p.stock<qty) throw new Error(`${p.name} 재고가 부족합니다.`);
      const line=p.price*qty; subtotal+=line;
      finalItems.push({p,qty,line});
    }
    const savedStore=await getSetting("iroom1_store",{});
    const savedValue=savedStore?.setting_value||savedStore||{};
    const site=savedValue.site||{};
    const baseShipping=Math.max(0,Number(site.shippingFee ?? 4000)||0);
    const freeFrom=Math.max(0,Number(site.freeShippingFrom ?? 50000)||0);
    const jejuExtra=Math.max(0,Number(site.jejuShippingExtra ?? 4000)||0);
    const remoteExtra=Math.max(0,Number(site.remoteShippingExtra ?? 5000)||0);
    const baseFee=(freeFrom>0 && subtotal>=freeFrom)?0:baseShipping;
    const regionalExtra=safeShippingRegion==="jeju"?jejuExtra:safeShippingRegion==="remote"?remoteExtra:0;
    const shippingFee=baseFee+regionalExtra;
    const total=subtotal+shippingFee;
    const t=readToken(req);
    const ono=orderNo();
    const or=await client.query(`
      INSERT INTO orders(order_no,user_id,customer_name,phone,email,postcode,address1,address2,memo,payment_method,subtotal,shipping_fee,total_amount,shipping_region,privacy_agreed_at,terms_agreed_at)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,NOW(),NOW()) RETURNING *
    `,[ono,t?.userId||null,safeCustomer,safePhone,safeEmail,safePost,safeAddr1,safeAddr2,safeMemo,safePayment,subtotal,shippingFee,total,safeShippingRegion]);
    const order=or.rows[0];
    for(const x of finalItems){
      await client.query(`
        INSERT INTO order_items(order_id,product_id,product_name,unit_price,qty,line_total)
        VALUES($1,$2,$3,$4,$5,$6)
      `,[order.id,x.p.id,x.p.name,x.p.price,x.qty,x.line]);
      await client.query("UPDATE products SET stock=stock-$1,updated_at=NOW() WHERE id=$2",[x.qty,x.p.id]);
    }
    await client.query("COMMIT");
    const orderForMail={...order};
    const itemsForMail=finalItems.map(x=>({
      product_name:x.p.name,unit_price:x.p.price,qty:x.qty,line_total:x.line
    }));
    const mail_status=await notifyOrder(orderForMail,itemsForMail);
    res.json({
      ok:true,order_no:ono,subtotal,shipping_fee:shippingFee,total_amount:total,free_shipping_from:freeFrom,shipping_region:safeShippingRegion,shipping_region_label:({normal:"일반지역",jeju:"제주도",remote:"제주 외 도서산간"}[safeShippingRegion]),regional_extra:regionalExtra,mail_status,
      bank:await getPaymentBankInfo()
    });
  }catch(e){
    await client.query("ROLLBACK");
    res.status(400).json({error:e.message||"주문 처리 중 오류가 발생했습니다."});
  }finally{client.release();}
});

app.post("/api/orders/lookup", simpleRateLimit({windowMs:10*60*1000,max:10,keyPrefix:"guest_order_lookup",message:"주문조회 요청이 많습니다. 잠시 후 다시 시도해주세요."}), async(req,res)=>{
  const ono=cleanText(req.body?.order_no,40).toUpperCase();
  const phoneDigits=cleanPhone(req.body?.phone).replace(/\D/g,"");
  if(!ono || phoneDigits.length<9) return res.status(400).json({error:"주문번호와 주문자 연락처를 정확히 입력해주세요."});
  const r=await pool.query(`
    SELECT o.id,o.order_no,o.status,o.payment_status,o.payment_method,o.subtotal,o.shipping_fee,o.total_amount,o.shipping_region,o.created_at,o.updated_at,
      COALESCE(json_agg(json_build_object(
        'product_name',oi.product_name,'unit_price',oi.unit_price,'qty',oi.qty,'line_total',oi.line_total
      ) ORDER BY oi.id) FILTER (WHERE oi.id IS NOT NULL),'[]'::json) items
    FROM orders o LEFT JOIN order_items oi ON oi.order_id=o.id
    WHERE UPPER(o.order_no)=UPPER($1) AND regexp_replace(o.phone,'[^0-9]','','g')=$2
    GROUP BY o.id
    LIMIT 1
  `,[ono,phoneDigits]);
  if(!r.rows[0]) return res.status(404).json({error:"일치하는 주문을 찾지 못했습니다. 주문번호와 연락처를 다시 확인해주세요."});
  const order=r.rows[0];
  res.setHeader("Cache-Control","no-store");
  res.json({ok:true,order:{
    order_no:order.order_no,status:order.status,payment_status:order.payment_status,payment_method:order.payment_method,
    subtotal:order.subtotal,shipping_fee:order.shipping_fee,total_amount:order.total_amount,shipping_region:order.shipping_region,
    created_at:order.created_at,updated_at:order.updated_at,items:order.items
  }});
});

app.get("/api/my/orders", requireUser, async(req,res)=>{
  const r=await pool.query(`
    SELECT o.*,
      COALESCE(json_agg(json_build_object(
        'product_name',oi.product_name,'unit_price',oi.unit_price,'qty',oi.qty,'line_total',oi.line_total
      ) ORDER BY oi.id) FILTER (WHERE oi.id IS NOT NULL),'[]') items
    FROM orders o LEFT JOIN order_items oi ON oi.order_id=o.id
    WHERE o.user_id=$1 GROUP BY o.id ORDER BY o.created_at DESC
  `,[req.user.userId]);
  res.json({orders:r.rows});
});

app.get("/api/order/:orderNo", simpleRateLimit({windowMs:10*60*1000,max:20,keyPrefix:"lookup"}), async(req,res)=>{
  const phone=(req.query.phone||"").trim();
  if(!phone) return res.status(400).json({error:"연락처를 입력해주세요."});
  const r=await pool.query(`
    SELECT o.*,COALESCE(json_agg(json_build_object(
      'product_name',oi.product_name,'unit_price',oi.unit_price,'qty',oi.qty,'line_total',oi.line_total
    ) ORDER BY oi.id) FILTER (WHERE oi.id IS NOT NULL),'[]') items
    FROM orders o LEFT JOIN order_items oi ON oi.order_id=o.id
    WHERE o.order_no=$1 AND o.phone=$2 GROUP BY o.id
  `,[req.params.orderNo,phone]);
  if(!r.rows[0]) return res.status(404).json({error:"주문을 찾을 수 없습니다."});
  res.json({order:r.rows[0]});
});

// Admin auth
app.post("/api/admin/login",simpleRateLimit({windowMs:30*60*1000,max:8,keyPrefix:"admin"}),async(req,res)=>{
  const {password}=req.body||{};
  let valid=false;
  try{
    const saved=await getSetting("admin_password_hash",{});
    const hash=String(saved?.hash||"");
    if(hash) valid=!!password && await bcrypt.compare(String(password),hash);
    else valid=!!password && !!ADMIN_PASSWORD && safeEqual(String(password),ADMIN_PASSWORD);
  }catch(_){valid=!!password && !!ADMIN_PASSWORD && safeEqual(String(password),ADMIN_PASSWORD)}
  if(!ADMIN_PASSWORD){
    try{const saved=await getSetting("admin_password_hash",{});if(!saved?.hash)return res.status(503).json({error:"관리자 비밀번호가 서버에 설정되지 않았습니다."})}catch(_){return res.status(503).json({error:"관리자 비밀번호가 서버에 설정되지 않았습니다."})}
  }
  if(!valid){
    logSecurity("admin_login_failed","admin",req);
    return res.status(401).json({error:"관리자 비밀번호가 올바르지 않습니다."});
  }
  logSecurity("admin_login_success","admin",req);
  const adminSessionVersion=await getAdminSessionVersion();
  setAuthCookie(res,token({admin:true,scope:"admin",adminSessionVersion},`${ADMIN_SESSION_HOURS}h`),true); res.json({ok:true,expires_hours:ADMIN_SESSION_HOURS});
});
app.post("/api/admin/logout",(req,res)=>{clearAuthCookie(res);res.json({ok:true});});
app.get("/api/admin/me",requireAdmin,(req,res)=>res.json({admin:true}));
app.get("/api/admin/session",requireAdmin,(req,res)=>res.json({authenticated:true}));

app.post("/api/admin/password",requireAdmin,async(req,res)=>{
  try{
    const password=String(req.body?.password||"");
    if(password.length<12 || passwordBytes(password)>72)return res.status(400).json({error:"관리자 비밀번호는 12자 이상, 72바이트 이하로 설정해 주세요."});
    const hash=await bcrypt.hash(password,12);
    await putSetting("admin_password_hash",{hash,updatedAt:new Date().toISOString()});
    const nextVersion=(await getAdminSessionVersion(true))+1;
    await putSetting("admin_session_version",{version:nextVersion,updatedAt:new Date().toISOString()});
    adminSessionCache={value:nextVersion,ts:Date.now()};
    setAuthCookie(res,token({admin:true,scope:"admin",adminSessionVersion:nextVersion},`${ADMIN_SESSION_HOURS}h`),true);
    logSecurity("admin_password_changed","admin",req,"all older admin sessions invalidated");
    res.json({ok:true,message:"관리자 비밀번호가 변경되었고 기존 관리자 세션은 모두 만료되었습니다."});
  }catch(e){res.status(500).json({error:"관리자 비밀번호 변경에 실패했습니다."})}
});


app.post("/api/consultations",simpleRateLimit({windowMs:10*60*1000,max:12,keyPrefix:"consult"}),async(req,res)=>{
  const b=req.body||{};
  const guideType=cleanText(b.guide_type,40);
  const name=cleanText(b.customer_name,60);
  const phone=cleanPhone(b.phone);
  const email=cleanEmail(b.email);
  if(!guideType||!name||!phone) return res.status(400).json({error:"상담 유형, 이름, 연락처를 입력해주세요."});
  const consultNo="C"+Date.now().toString(36).toUpperCase()+crypto.randomBytes(2).toString("hex").toUpperCase();
  try{
    const auth=readToken(req);
    const r=await pool.query(`
      INSERT INTO consultations(
        consult_no,user_id,guide_type,customer_name,phone,email,recipient,budget,quantity_note,
        preferred_fruits,avoid_fruits,taste_preference,packaging,delivery_date,message
      ) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *
    `,[consultNo,auth?.userId||null,guideType,name,phone,email,cleanText(b.recipient,160),
       cleanText(b.budget,100),cleanText(b.quantity_note,160),cleanText(b.preferred_fruits,500),
       cleanText(b.avoid_fruits,500),cleanText(b.taste_preference,300),cleanText(b.packaging,200),
       cleanText(b.delivery_date,60),cleanLongText(b.message,1800)]);
    const cst=r.rows[0], c=mailSettings();
    if(c.orderEmail){
      const text=`[이룸 과일 추천 상담요청]
상담번호: ${consultNo}
유형: ${guideType}
고객명: ${name}
연락처: ${phone}
이메일: ${cst.email||"-"}
받는 분/상황: ${cst.recipient||"-"}
예산: ${cst.budget||"-"}
인원/수량: ${cst.quantity_note||"-"}
원하는 과일: ${cst.preferred_fruits||"-"}
피하고 싶은 과일: ${cst.avoid_fruits||"-"}
맛 선호: ${cst.taste_preference||"-"}
포장: ${cst.packaging||"-"}
희망 배송일: ${cst.delivery_date||"-"}
요청사항: ${cst.message||"-"}`;
      sendBrevoMail({to:c.orderEmail,subject:`[이룸 상담] ${guideType} / ${name}`,text})
        .then(()=>console.log("[CONSULT EMAIL] BREVO SENT",consultNo))
        .catch(e=>console.error("[CONSULT EMAIL] BREVO FAILED",e.message));
    }
    res.json({ok:true,consult_no:consultNo});
  }catch(e){
    console.error("[CONSULTATION] FAILED",e.message);
    res.status(500).json({error:"상담 요청 저장 중 오류가 발생했습니다."});
  }
});

app.get("/api/admin/email-status",requireAdmin,(req,res)=>{
  const c=mailSettings();
  res.json({
    order_email_configured:!!c.orderEmail,
    brevo_api_key_configured:!!c.apiKey,
    sender_email_configured:!!c.senderEmail,
    sender_name:c.senderName||"",
    order_email_masked:c.orderEmail?c.orderEmail.replace(/^(.{2}).*(@.*)$/,"$1***$2"):""
  });
});

app.post("/api/admin/email-test",requireAdmin,async(req,res)=>{
  const c=mailSettings();
  const to=String(req.body?.to||c.orderEmail||"").trim();
  if(!to)return res.status(400).json({ok:false,error:"ORDER_EMAIL이 설정되지 않았습니다."});
  try{
    await sendBrevoMail({
      to,
      subject:"[이룸 fresh fruits] 메일 발송 테스트",
      text:"이 메일이 도착했다면 Render의 BREVO_API_KEY / BREVO_SENDER_EMAIL / ORDER_EMAIL 설정이 정상입니다."
    });
    console.log("[EMAIL TEST] BREVO SENT",to);
    res.json({ok:true,message:"테스트 메일을 발송했습니다."});
  }catch(e){
    console.error("[EMAIL TEST] BREVO FAILED",e.message);
    res.status(500).json({ok:false,error:e.message});
  }
});


app.get("/api/site/today-pick",async(req,res)=>{
  try{
    const data=await getSetting("today_pick",normalizeTodayPick({}));
    res.json({ok:true,todayPick:data});
  }catch(e){res.status(500).json({ok:false,error:"오늘의 PICK을 불러오지 못했습니다."})}
});

app.get("/api/admin/site/today-pick",requireAdmin,async(req,res)=>{
  const data=await getSetting("today_pick",normalizeTodayPick({}));
  res.json({ok:true,todayPick:data});
});
app.put("/api/admin/site/today-pick",requireAdmin,async(req,res)=>{
  try{
    const value=normalizeTodayPick(req.body||{});
    const saved=await putSetting("today_pick",value);
    logSecurity("admin_today_pick_updated","admin",req,value.productName||value.title);
    res.json({ok:true,todayPick:saved.setting_value,updatedAt:saved.updated_at});
  }catch(e){
    console.error("[TODAY PICK SAVE]",e.message);
    res.status(500).json({ok:false,error:"오늘의 PICK 저장 중 오류가 발생했습니다."});
  }
});

app.get("/api/admin/system-status",requireAdmin,async(req,res)=>{
  let db=false;
  try{await pool.query("SELECT 1");db=true}catch{}
  const mail=mailSettings();
  res.json({
    ok:true,db,
    openai_configured:!!OPENAI_API_KEY,
    openai_model:OPENAI_MODEL,
    email_configured:!!(mail.apiKey&&mail.senderEmail&&mail.orderEmail),
    public_base_url:BASE_URL,
    node_env:process.env.NODE_ENV||"development"
  });
});

app.post("/api/admin/ai/assist",
  requireAdmin,
  simpleRateLimit({windowMs:60*60*1000,max:40,keyPrefix:"admin_ai",message:"AI 요청이 많습니다. 잠시 후 다시 시도해주세요."}),
  async(req,res)=>{
    try{
      const b=req.body||{};
      const result=await openAiAssist({
        mode:cleanText(b.mode||"today",30),
        subject:cleanText(b.subject||"",120),
        audience:cleanText(b.audience||"",180),
        tone:cleanText(b.tone||"고급스럽고 신뢰감 있게",100),
        details:cleanLongText(b.details||"",3500),
        useWeb:!!b.useWeb
      });
      logSecurity("admin_ai_assist","admin",req,`${b.mode||"today"}:${b.subject||""}`);
      res.json({ok:true,model:OPENAI_MODEL,...result});
    }catch(e){
      console.error("[ADMIN AI]",e.message);
      const code=e.message==="OPENAI_API_KEY_MISSING"?503:502;
      res.status(code).json({ok:false,error:e.message==="OPENAI_API_KEY_MISSING"?"Render 환경변수 OPENAI_API_KEY를 먼저 설정해주세요.":"AI 요청 처리 중 오류가 발생했습니다.",detail:e.message.slice(0,240)});
    }
  }
);



// Public-safe payment information. Uses admin site settings first, then Render env, then safe defaults.
app.get("/api/site/payment-info",async(req,res)=>{
  try{res.json({ok:true,bank:await getPaymentBankInfo()})}
  catch(e){res.status(500).json({ok:false,error:"입금계좌 정보를 불러오지 못했습니다."})}
});

const DEFAULT_POLICIES={
  termsText:`이룸 fresh fruits는 상품의 산지·중량·구성·가격·재고·배송 예정일을 상품 화면에 안내합니다.
계절 과일은 산지와 기상, 당일 입고 상태에 따라 색상·크기·구성이 달라질 수 있으며, 주문 시 표시된 상품 정보와 결제 안내가 우선 적용됩니다.
회원과 비회원은 정확한 주문·배송 정보를 입력해야 하며, 부정한 이용이나 서비스 운영을 방해하는 행위는 제한될 수 있습니다.
결제·배송·청약철회·환불 등에 관한 사항은 관련 법령과 이룸의 배송·교환·환불 안내에 따릅니다.`,
  privacyText:`이룸 fresh fruits는 주문, 배송, 상담, 회원관리 및 고객지원에 필요한 범위에서 이름, 연락처, 이메일, 배송지, 주문내역 등의 정보를 처리합니다.
수집한 정보는 해당 목적과 관계 법령상 보관 의무가 있는 기간 동안만 보관하며, 목적이 달성되고 법적 보관 의무가 끝나면 안전한 방법으로 파기합니다.
결제대행사, 배송사, 이메일 발송 서비스 등 주문 이행에 필요한 외부 서비스에는 필요한 범위에서만 정보가 전달될 수 있습니다.
개인정보 관련 문의는 홈페이지에 표시된 고객센터 또는 이메일로 접수할 수 있습니다.`,
  shippingPolicyText:`기본 배송비는 4,000원이며 상품 합계 50,000원 이상은 기본 배송비가 무료입니다.
제주 지역은 4,000원, 제주 외 도서산간 지역은 5,000원의 추가 운임이 발생할 수 있으며 지역 추가 운임은 무료배송 여부와 별도로 적용될 수 있습니다.
신선식품 특성상 산지·입고·택배사 사정, 기상 상황에 따라 출고 또는 도착 일정이 달라질 수 있습니다. 출고 전 변경 사항이 있으면 주문자에게 안내합니다.
수령 즉시 상품 상태를 확인해 주세요. 파손, 오배송, 심각한 품질 이상이 있는 경우 수령 당일 또는 확인 가능한 가장 빠른 시점에 사진과 함께 고객센터로 문의해 주세요.
단순 변심에 의한 교환·반품은 신선식품의 가치가 현저히 감소할 우려가 있는 경우 제한될 수 있으며, 실제 처리는 전자상거래 관련 법령과 상품별 안내를 따릅니다.`
};

// Public-safe footer/review configuration for IROOM4 storefront.
app.get("/api/site/footer-config",async(req,res)=>{
  try{
    const saved=await getSetting("iroom1_store",{});
    const value=saved?.setting_value||saved||{};
    const site=value.site||{};
    const reviews=Array.isArray(value.reviews)?value.reviews.filter(x=>x&&x.show!==false).slice(0,3).map(x=>({text:cleanLongText(x.text,1200),author:cleanText(x.author,120),verified:Boolean(x.verified),rating:Math.max(0,Math.min(5,Number(x.rating)||0))})):[];
    const policies={
      termsText:cleanLongText(site.termsText||DEFAULT_POLICIES.termsText,12000),
      privacyText:cleanLongText(site.privacyText||DEFAULT_POLICIES.privacyText,12000),
      shippingPolicyText:cleanLongText(site.shippingPolicyText||DEFAULT_POLICIES.shippingPolicyText,12000)
    };
    res.json({
      ok:true,
      site:{
        siteName:String(site.siteName||"이룸 fresh fruits"),
        representative:String(site.representative||"한효철"),
        phone:String(site.phone||"070-7762-3651"),
        email:String(site.email||"iroom4562@naver.com"),
        address:String(site.address||"서울특별시 송파구 송이로 15길 33"),
        businessNo:String(site.businessNo||"775-97-00292"),
        mailOrderNo:String(site.mailOrderNo||"제 2025-서울 송파 -1052호"),
        hostingProvider:String(site.hostingProvider||"Render"),
        bandUrl:String(site.bandUrl||"https://band.us/@iroomfruits"),
        kakaoUrl:String(site.kakaoUrl||""),
        kakaoJoinUrl:String(site.kakaoJoinUrl||""),
        kakaoEnabled:Boolean(site.kakaoEnabled),
        kakaoJsKey:String(site.kakaoJsKey||process.env.KAKAO_JAVASCRIPT_KEY||""),
        kakaoRedirectUri:KAKAO_REDIRECT_URI,
        naverUrl:String(site.naverUrl||""),
        shippingFee:Number.isFinite(Number(site.shippingFee))?Number(site.shippingFee):4000,
        freeShippingFrom:Number.isFinite(Number(site.freeShippingFrom))?Number(site.freeShippingFrom):50000,
        jejuShippingExtra:Number.isFinite(Number(site.jejuShippingExtra))?Number(site.jejuShippingExtra):4000,
        remoteShippingExtra:Number.isFinite(Number(site.remoteShippingExtra))?Number(site.remoteShippingExtra):5000,
        courier:String(site.courier||"")
      },
      reviews,
      policies
    });
  }catch(e){
    console.error("[FOOTER CONFIG]",e.message);
    res.status(500).json({ok:false,error:"홈페이지 하단 정보를 불러오지 못했습니다."});
  }
});


app.get("/api/site/home-style",async(req,res)=>{
  try{const style=await getSetting("public_home_style","home1");const v=String(style?.setting_value??style??"home1");res.json({ok:true,style:["home1","home2"].includes(v)?v:"home1"})}
  catch(e){res.json({ok:true,style:"home1"})}
});
app.get("/api/admin/site/home-style",requireAdmin,async(req,res)=>{
  const style=await getSetting("public_home_style","home1");const v=String(style?.setting_value??style??"home1");res.json({ok:true,style:["home1","home2"].includes(v)?v:"home1"});
});
app.put("/api/admin/site/home-style",requireAdmin,async(req,res)=>{
  const style=String(req.body?.style||"").trim();if(!["home1","home2"].includes(style))return res.status(400).json({ok:false,error:"홈페이지 버전을 확인해 주세요."});
  await putSetting("public_home_style",style);logSecurity("admin_home_style_updated","admin",req,style);res.json({ok:true,style});
});

app.get("/api/site/homepage-config",async(req,res)=>{
  res.set("Cache-Control","no-store, no-cache, must-revalidate, proxy-revalidate");
  res.set("Pragma","no-cache");
  res.set("Expires","0");
  try{const config=await getSetting("homepage_config",{});res.json({ok:true,config,revision:configRevision(config)})}
  catch(e){res.status(500).json({ok:false,error:"홈페이지 설정을 불러오지 못했습니다."})}
});
app.get("/api/admin/site/homepage-config",requireAdmin,async(req,res)=>{
  res.set("Cache-Control","no-store, no-cache, must-revalidate, proxy-revalidate");
  const config=await getSetting("homepage_config",{});res.json({ok:true,config,revision:configRevision(config)});
});
app.put("/api/admin/site/homepage-config",requireAdmin,async(req,res)=>{
  try{
    const incoming=req.body&&typeof req.body.config==="object"?req.body.config:{};
    const raw=sanitizeConfigValue(incoming);
    const json=JSON.stringify(raw);
    if(json.length>25000000)return res.status(413).json({ok:false,error:"상품 화면 편집 데이터가 너무 큽니다. 고해상도 사진 수를 줄이거나 이미지 보관함 경로를 사용해 주세요."});
    const saved=await putSetting("homepage_config",raw);
    const revision=configRevision(saved.setting_value);
    logSecurity("admin_homepage_config_updated","admin",req,`homepage_config:${revision}`);
    res.json({ok:true,config:saved.setting_value,revision,updatedAt:saved.updated_at});
  }catch(e){console.error("[HOME CONFIG]",e.message);res.status(500).json({ok:false,error:"홈페이지 설정 저장 중 오류가 발생했습니다."})}
});

// IROOM1 full admin store backed by PostgreSQL site_settings.
// Public storefront product feed. Only sale-safe product fields are exposed.
app.get("/api/site/products",async(req,res)=>{
  try{
    const r=await pool.query(`
      SELECT id,slug,name,description,unit,price,stock,image,category,is_active,sort_order
      FROM products WHERE is_active=TRUE ORDER BY sort_order,id
    `);
    res.json({ok:true,products:r.rows});
  }catch(e){
    console.error("[SITE PRODUCTS]",e.message);
    res.status(500).json({ok:false,error:"상품 정보를 불러오지 못했습니다."});
  }
});

app.get("/api/store",requireAdmin,async(req,res)=>{
  try{
    const saved=await getSetting("iroom1_store",{});
    // Keep real operational DB data authoritative for products/orders/members.
    const [pr,or,ur]=await Promise.all([
      pool.query("SELECT * FROM products ORDER BY sort_order,id").catch(()=>({rows:[]})),
      pool.query("SELECT * FROM orders ORDER BY created_at DESC LIMIT 500").catch(()=>({rows:[]})),
      pool.query("SELECT id,username,email,name,phone,created_at,last_login_at FROM users ORDER BY created_at DESC LIMIT 500").catch(()=>({rows:[]}))
    ]);
    const value=saved?.setting_value||saved||{};
    res.json({...value,products:pr.rows,orders:or.rows,members:ur.rows});
  }catch(e){console.error("[IROOM1 STORE GET]",e.message);res.status(500).json({error:"관리자 데이터를 불러오지 못했습니다."})}
});
async function saveIroom1Store(req,res){
  try{
    const incoming=req.body&&typeof req.body==="object"?req.body:{};
    const data={...incoming};
    delete data.products; delete data.orders; delete data.members;
    if(data.site&&typeof data.site==="object"){
      const x=data.site;
      data.site={
        siteName:cleanText(x.siteName||"이룸 fresh fruits",120),
        representative:cleanText(x.representative||"한효철",80),
        phone:cleanPhone(x.phone||"070-7762-3651"),
        email:cleanEmail(x.email||"iroom4562@naver.com")||"iroom4562@naver.com",
        address:cleanText(x.address||"서울특별시 송파구 송이로 15길 33",300),
        businessNo:cleanText(x.businessNo||"775-97-00292",60),
        mailOrderNo:cleanText(x.mailOrderNo||"제 2025-서울 송파 -1052호",100),
        hostingProvider:cleanText(x.hostingProvider||"Render",100),
        bankName:cleanText(x.bankName||"우리은행",50),
        bankAccount:cleanText(x.bankAccount||"1005-203-135891",80),
        bankOwner:cleanText(x.bankOwner||"한효철",80),
        tossClientKey:cleanText(x.tossClientKey,300),
        tossSecretKey:"",
        tossEnabled:Boolean(x.tossEnabled),
        bandUrl:safeHttpsUrl(x.bandUrl,1000),
        kakaoUrl:safeHttpsUrl(x.kakaoUrl,1000),
        kakaoJoinUrl:safeHttpsUrl(x.kakaoJoinUrl,1000),
        kakaoEnabled:Boolean(x.kakaoEnabled),
        kakaoJsKey:cleanText(x.kakaoJsKey,300),
        naverUrl:safeHttpsUrl(x.naverUrl,1000),
        shippingFee:cleanNonNegative(x.shippingFee,1000000),
        freeShippingFrom:cleanNonNegative(x.freeShippingFrom,100000000),
        jejuShippingExtra:cleanNonNegative(x.jejuShippingExtra,1000000),
        remoteShippingExtra:cleanNonNegative(x.remoteShippingExtra,1000000),
        courier:cleanText(x.courier,100),
        emailNotify:Boolean(x.emailNotify),
        stockNotify:Boolean(x.stockNotify),
        termsText:cleanLongText(x.termsText||DEFAULT_POLICIES.termsText,12000),
        privacyText:cleanLongText(x.privacyText||DEFAULT_POLICIES.privacyText,12000),
        shippingPolicyText:cleanLongText(x.shippingPolicyText||DEFAULT_POLICIES.shippingPolicyText,12000)
      };
    }
    if(Array.isArray(data.images)){
      data.images=data.images.slice(0,100).map(x=>({
        name:cleanText(x?.name,160),
        data:safeMediaValue(x?.data),
        createdAt:cleanText(x?.createdAt,60)
      })).filter(x=>x.data);
    }
    if(Array.isArray(data.reviews)){
      data.reviews=data.reviews.slice(0,100).map(x=>({
        text:cleanLongText(x?.text,1200),
        author:cleanText(x?.author,120),
        show:x?.show!==false,
        verified:Boolean(x?.verified),
        rating:Math.max(0,Math.min(5,Number(x?.rating)||0))
      })).filter(x=>x.text);
    }
    data.updatedAt=new Date().toISOString();
    await putSetting("iroom1_store",data);
    logSecurity("admin_store_updated","admin",req,"iroom1_store");
    res.json({ok:true,message:"관리자 설정을 서버에 저장했습니다.",updatedAt:data.updatedAt});
  }catch(e){console.error("[IROOM1 STORE SAVE]",e.message);res.status(500).json({error:"관리자 데이터 저장에 실패했습니다."})}
}
app.post("/api/store",requireAdmin,saveIroom1Store);
app.put("/api/store",requireAdmin,saveIroom1Store);

// IROOM1 V61 compatibility layer: keeps the proven admin UI while using the current IROOM3 server/session.
app.get("/api/admin/all",requireAdmin,async(req,res)=>{
  try{
    const [pr,or,ur,cr,rv,iq,bn,st]=await Promise.all([
      pool.query("SELECT * FROM products ORDER BY id DESC").catch(()=>({rows:[]})),
      pool.query("SELECT * FROM orders ORDER BY id DESC LIMIT 500").catch(()=>({rows:[]})),
      pool.query("SELECT id,name,email,phone,created_at FROM users ORDER BY id DESC LIMIT 500").catch(()=>({rows:[]})),
      pool.query("SELECT * FROM coupons ORDER BY id DESC").catch(()=>({rows:[]})),
      pool.query("SELECT * FROM reviews ORDER BY id DESC").catch(()=>({rows:[]})),
      pool.query("SELECT * FROM inquiries ORDER BY id DESC").catch(()=>({rows:[]})),
      pool.query("SELECT * FROM banners ORDER BY id DESC").catch(()=>({rows:[]})),
      pool.query("SELECT setting_value FROM site_settings WHERE setting_key='iroom1_settings'").catch(()=>({rows:[]}))
    ]);
    res.json({products:pr.rows,orders:or.rows,members:ur.rows,coupons:cr.rows,events:[],reviews:rv.rows,inquiries:iq.rows,banners:bn.rows,popups:[],mediaLibrary:[],settings:st.rows[0]?.setting_value||{},adminLogs:[],marketingStats:{}});
  }catch(e){console.error("[ADMIN ALL]",e.message);res.status(500).json({error:"관리자 데이터를 불러오지 못했습니다."})}
});
app.post("/api/admin/settings",requireAdmin,async(req,res)=>{
  try{
    const settings=sanitizeConfigValue(req.body||{});
    const serialized=JSON.stringify(settings);
    if(serialized.length>1000000)return res.status(413).json({error:"설정 데이터가 너무 큽니다."});
    const saved=await putSetting("iroom1_settings",settings);
    logSecurity("admin_settings_updated","admin",req,`settings:${configRevision(saved.setting_value)}`);
    res.json({ok:true,settings:saved.setting_value});
  }catch(e){res.status(500).json({error:"설정 저장 실패"})}
});
app.get("/api/admin/dashboard",requireAdmin,async(req,res)=>{
  const [p,o,u,today]=await Promise.all([
    pool.query("SELECT COUNT(*)::int count, COALESCE(SUM(stock),0)::int stock FROM products WHERE is_active=TRUE"),
    pool.query("SELECT COUNT(*)::int count FROM orders"),
    pool.query("SELECT COUNT(*)::int count FROM users"),
    pool.query("SELECT COUNT(*)::int count, COALESCE(SUM(total_amount),0)::int sales FROM orders WHERE created_at::date=CURRENT_DATE")
  ]);
  res.json({products:p.rows[0],orders:o.rows[0].count,users:u.rows[0].count,today:today.rows[0]});
});

app.get("/api/admin/products",requireAdmin,async(req,res)=>{
  const r=await pool.query("SELECT * FROM products ORDER BY sort_order,id"); res.json({products:r.rows});
});
app.post("/api/admin/products",requireAdmin,async(req,res)=>{
  const p=req.body||{};
  const name=cleanText(p.name||"새 상품",100),description=cleanLongText(p.description,1800),unit=cleanText(p.unit,80),category=cleanText(p.category||"과일",60);
  const price=Math.max(0,Math.floor(Number(p.price||0)||0)),stock=Math.max(0,Math.floor(Number(p.stock||0)||0)),sortOrder=Math.floor(Number(p.sort_order||0)||0);
  const image=safeMediaValue(p.image)||cleanText(p.image,800);
  if(!name)return res.status(400).json({error:"상품명을 입력해주세요."});
  if(price>100000000||stock>1000000)return res.status(400).json({error:"가격 또는 재고 값을 확인해주세요."});
  const slug=(p.slug||name||"product").toLowerCase().replace(/[^a-z0-9가-힣]+/g,"-").replace(/^-|-$/g,"").slice(0,80)+"-"+crypto.randomBytes(2).toString("hex");
  const r=await pool.query(`
    INSERT INTO products(slug,name,description,unit,price,stock,image,category,is_active,sort_order)
    VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *
  `,[slug,name,description,unit,price,stock,image,category,p.is_active!==false,sortOrder]);
  logSecurity("admin_product_created","admin",req,`product:${r.rows[0].id}`);
  res.json({ok:true,product:r.rows[0]});
});
app.put("/api/admin/products/:id",requireAdmin,async(req,res)=>{
  const p=req.body||{};
  const price=p.price===undefined?null:Math.max(0,Math.floor(Number(p.price)||0));
  const stock=p.stock===undefined?null:Math.max(0,Math.floor(Number(p.stock)||0));
  if((price!==null&&price>100000000)||(stock!==null&&stock>1000000))return res.status(400).json({error:"가격 또는 재고 값을 확인해주세요."});
  const r=await pool.query(`
    UPDATE products SET
      name=COALESCE($1,name),description=COALESCE($2,description),unit=COALESCE($3,unit),
      price=COALESCE($4,price),stock=COALESCE($5,stock),image=COALESCE($6,image),
      category=COALESCE($7,category),is_active=COALESCE($8,is_active),
      sort_order=COALESCE($9,sort_order),updated_at=NOW()
    WHERE id=$10 RETURNING *
  `,[p.name===undefined?null:cleanText(p.name,100),p.description===undefined?null:cleanLongText(p.description,1800),p.unit===undefined?null:cleanText(p.unit,80),price,stock,
     p.image===undefined?null:(safeMediaValue(p.image)||cleanText(p.image,800)),p.category===undefined?null:cleanText(p.category,60),p.is_active===undefined?null:!!p.is_active,p.sort_order===undefined?null:Math.floor(Number(p.sort_order)||0),req.params.id]);
  if(!r.rows[0]) return res.status(404).json({error:"상품을 찾을 수 없습니다."});
  logSecurity("admin_product_updated","admin",req,`product:${req.params.id}`);
  res.json({ok:true,product:r.rows[0]});
});

app.delete("/api/admin/products/:id",requireAdmin,async(req,res)=>{
  const r=await pool.query("DELETE FROM products WHERE id=$1 RETURNING id,name",[req.params.id]);
  if(!r.rows[0])return res.status(404).json({error:"상품을 찾을 수 없습니다."});
  logSecurity("admin_product_deleted","admin",req,`product:${req.params.id}`);
  res.json({ok:true,product:r.rows[0]});
});

app.get("/api/admin/orders",requireAdmin,async(req,res)=>{
  const r=await pool.query(`
    SELECT o.*,COALESCE(json_agg(json_build_object(
      'product_name',oi.product_name,'unit_price',oi.unit_price,'qty',oi.qty,'line_total',oi.line_total
    ) ORDER BY oi.id) FILTER (WHERE oi.id IS NOT NULL),'[]') items
    FROM orders o LEFT JOIN order_items oi ON oi.order_id=o.id
    GROUP BY o.id ORDER BY o.created_at DESC LIMIT 500
  `);
  res.json({orders:r.rows});
});
app.put("/api/admin/orders/:id",requireAdmin,async(req,res)=>{
  const {status,payment_status}=req.body||{};
  const allowedStatus=["주문접수","입금확인","상품준비","배송중","배송완료","취소","환불완료"];
  const allowedPayment=["입금대기","결제대기","결제완료","입금확인","결제취소","환불완료"];
  const nextStatus=status===undefined?null:(allowedStatus.includes(String(status))?String(status):null);
  const nextPayment=payment_status===undefined?null:(allowedPayment.includes(String(payment_status))?String(payment_status):null);
  if(status!==undefined && nextStatus===null)return res.status(400).json({error:"허용되지 않은 주문 상태입니다."});
  if(payment_status!==undefined && nextPayment===null)return res.status(400).json({error:"허용되지 않은 결제 상태입니다."});
  const r=await pool.query(`
    UPDATE orders SET status=COALESCE($1,status),payment_status=COALESCE($2,payment_status),updated_at=NOW()
    WHERE id=$3 RETURNING *
  `,[nextStatus,nextPayment,req.params.id]);
  if(!r.rows[0]) return res.status(404).json({error:"주문을 찾을 수 없습니다."});
  logSecurity("admin_order_updated","admin",req,`order:${req.params.id}`);
  res.json({ok:true,order:r.rows[0]});
});

app.get("/api/admin/users",requireAdmin,async(req,res)=>{
  const r=await pool.query(`
    SELECT u.id,u.username,u.email,u.name,u.phone,u.postcode,u.address1,u.address2,u.created_at,u.last_login_at,
      COUNT(o.id)::int order_count,
      COALESCE(SUM(o.total_amount),0)::int total_spent,
      MAX(o.created_at) last_order_at
    FROM users u LEFT JOIN orders o ON o.user_id=u.id
    GROUP BY u.id ORDER BY u.created_at DESC LIMIT 500
  `);
  res.json({users:r.rows});
});
app.get("/api/admin/operations",requireAdmin,async(req,res)=>{
  try{
    const [db,pc,oc,uc]=await Promise.all([
      pool.query("SELECT NOW() now"),
      pool.query("SELECT COUNT(*)::int count,COALESCE(SUM(stock),0)::int stock FROM products"),
      pool.query("SELECT COUNT(*)::int count FROM orders"),
      pool.query("SELECT COUNT(*)::int count FROM users")
    ]);
    const saved=await getSetting("admin_password_hash",{}).catch(()=>({}));
    const jwtConfigured=!!process.env.JWT_SECRET;
    const baseHttps=/^https:\/\//i.test(BASE_URL);
    const dbTransportOk=dbLocal || !dbWantsTls || (dbWantsTls && /^require|verify-ca|verify-full$/.test(dbSslMode));
    const email=mailSettings();
    const flags={
      database:true,
      jwtSecretConfigured:jwtConfigured,
      jwtSecretStrong:jwtConfigured && String(process.env.JWT_SECRET).length>=48,
      adminPasswordConfigured:!!ADMIN_PASSWORD || !!saved?.hash,
      publicBaseHttps:baseHttps,
      dbTransportAppropriate:dbTransportOk,
      emailConfigured:!!(email.apiKey&&email.senderEmail&&email.orderEmail),
      tossClientConfigured:!!process.env.TOSS_CLIENT_KEY,
      tossSecretConfigured:!!process.env.TOSS_SECRET_KEY,
      kakaoConfigured:!!KAKAO_REST_API_KEY,
      openaiConfigured:!!OPENAI_API_KEY,
      pwaConfigured:true
    };
    const warnings=[];
    if(!flags.jwtSecretStrong)warnings.push("JWT_SECRET를 48자 이상의 충분히 긴 난수로 설정하세요.");
    if(!flags.adminPasswordConfigured)warnings.push("관리자 비밀번호가 설정되지 않았습니다.");
    if(IS_PROD&&!flags.publicBaseHttps)warnings.push("PUBLIC_BASE_URL을 https:// 주소로 설정하세요.");
    if(!flags.dbTransportAppropriate)warnings.push("PostgreSQL 연결 방식을 확인하세요. Render 내부 URL은 사설망 연결, 외부 URL은 sslmode=require 사용을 권장합니다.");
    if(!flags.emailConfigured)warnings.push("주문 이메일 알림(Brevo) 설정이 완전하지 않습니다.");
    if(!flags.tossClientConfigured||!flags.tossSecretConfigured)warnings.push("토스 결제 운영키가 아직 완전하게 연결되지 않았습니다.");
    res.json({ok:true,version:"60.15.0",time:db.rows[0].now,flags,warnings,counts:{products:pc.rows[0].count,stock:pc.rows[0].stock,orders:oc.rows[0].count,users:uc.rows[0].count}});
  }catch(e){
    console.error("[OPERATIONS]",e.message);
    res.status(500).json({ok:false,error:"운영 상태를 점검하지 못했습니다."});
  }
});

app.get("/api/admin/backup",requireAdmin,async(req,res)=>{
  try{
    const [store,home,today,products,orders,items,users,consults,events]=await Promise.all([
      getSetting("iroom1_store",{}),
      getSetting("homepage_config",{}),
      getSetting("today_pick",{}),
      pool.query("SELECT * FROM products ORDER BY id"),
      pool.query("SELECT * FROM orders ORDER BY id DESC LIMIT 5000"),
      pool.query("SELECT * FROM order_items ORDER BY id DESC LIMIT 20000"),
      pool.query("SELECT id,username,email,name,phone,postcode,address1,address2,created_at,last_login_at,kakao_id,auth_provider FROM users ORDER BY id DESC LIMIT 5000"),
      pool.query("SELECT * FROM consultations ORDER BY id DESC LIMIT 5000").catch(()=>({rows:[]})),
      pool.query("SELECT id,event_type,actor,ip_hash,detail,created_at FROM security_events ORDER BY id DESC LIMIT 500")
    ]);
    const payload={
      meta:{product:"IROOM HOME1",version:"60.15.0",createdAt:new Date().toISOString(),notice:"비밀번호 해시, JWT 비밀키, 결제 Secret Key는 백업에 포함하지 않습니다."},
      store:store?.setting_value||store||{},
      homepageConfig:home?.setting_value||home||{},
      todayPick:today?.setting_value||today||{},
      products:products.rows,orders:orders.rows,orderItems:items.rows,users:users.rows,
      consultations:consults.rows,securityEvents:events.rows
    };
    const filename=`iroom-home1-backup-${new Date().toISOString().slice(0,10)}.json`;
    res.setHeader("Content-Type","application/json; charset=utf-8");
    res.setHeader("Content-Disposition",`attachment; filename="${filename}"`);
    res.setHeader("Cache-Control","no-store");
    logSecurity("admin_backup_downloaded","admin",req,filename);
    res.send(JSON.stringify(payload,null,2));
  }catch(e){
    console.error("[BACKUP]",e.message);
    res.status(500).json({error:"운영 백업 생성에 실패했습니다."});
  }
});

app.get("/api/admin/security-events",requireAdmin,async(req,res)=>{
  const r=await pool.query("SELECT id,event_type,actor,ip_hash,detail,created_at FROM security_events ORDER BY created_at DESC LIMIT 200");
  res.json({events:r.rows});
});

// Toss readiness information endpoint
app.get("/api/payment/config",(req,res)=>{
  res.json({
    toss_enabled:!!process.env.TOSS_CLIENT_KEY,
    client_key:process.env.TOSS_CLIENT_KEY||null
  });
});


app.get("/band-order.html",(req,res)=>res.sendFile(path.join(__dirname,"public","band-order.html")));
app.get("/band-admin.html",(req,res)=>res.sendFile(path.join(__dirname,"public","band-admin.html")));
app.get("/admin-preview",(req,res)=>{res.setHeader("Cache-Control","no-store");res.sendFile(path.join(__dirname,"public","index.html"))});
app.get("/healthz",(req,res)=>res.json({ok:true,time:new Date().toISOString()}));

// static site + dual public homes
app.get("/home1",(req,res)=>res.sendFile(path.join(__dirname,"public","index.html")));
app.get("/home2",(req,res)=>res.sendFile(path.join(__dirname,"public","home2.html")));
app.get("/home1/",(req,res)=>res.redirect(301,"/home1"));
app.get("/home2/",(req,res)=>res.redirect(301,"/home2"));
app.get("/",async(req,res)=>{
  try{const style=await getSetting("public_home_style","home1");const v=String(style?.setting_value??style??"home1");return res.sendFile(path.join(__dirname,"public",v==="home2"?"home2.html":"index.html"))}
  catch(_){return res.sendFile(path.join(__dirname,"public","index.html"))}
});
app.use(express.static(path.join(__dirname,"public"),{
  etag:true,maxAge:"5m",setHeaders(res,file){if(file.endsWith("sw.js")||file.endsWith("service-worker.js")||file.endsWith("manifest.webmanifest"))res.setHeader("Cache-Control","no-cache");}
}));
app.get("*",(req,res)=>res.sendFile(path.join(__dirname,"public","index.html")));

app.use((err,req,res,next)=>{
  console.error("[UNHANDLED REQUEST ERROR]",err?.message||err);
  if(res.headersSent)return next(err);
  res.status(500).json({error:"요청 처리 중 오류가 발생했습니다."});
});

let serverStarted=false;
let httpServer=null;
function startHttp(){
  if(serverStarted)return;
  serverStarted=true;
  httpServer=app.listen(PORT,()=>console.log(`IROOM HOME1 V60.17 DUAL HOME listening on ${PORT}`));
  httpServer.requestTimeout=30000;
  httpServer.headersTimeout=35000;
  httpServer.keepAliveTimeout=5000;
}
async function shutdown(signal){
  console.log(`[SHUTDOWN] ${signal}`);
  const force=setTimeout(()=>process.exit(1),10000);force.unref();
  if(httpServer)await new Promise(resolve=>httpServer.close(()=>resolve()));
  await pool.end().catch(()=>{});
  clearTimeout(force);
  process.exit(0);
}
process.once("SIGTERM",()=>shutdown("SIGTERM"));
process.once("SIGINT",()=>shutdown("SIGINT"));
initDb().then(async()=>{
  await initOptionalTables();
  startHttp();
}).catch(err=>{
  console.error("Database initialization failed; starting web UI in recovery mode:",err);
  startHttp();
});
