const express = require("express");
const path = require("path");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { Pool } = require("pg");

const app = express();
const PORT = Number(process.env.PORT || 3000);
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString("hex");
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
if(!process.env.JWT_SECRET) console.warn("[SECURITY] JWT_SECRET is not configured. A temporary secret is being used; set JWT_SECRET in Render Environment.");
if(!ADMIN_PASSWORD) console.warn("[SECURITY] ADMIN_PASSWORD is not configured. Admin login is disabled until it is set.");
const BASE_URL = process.env.PUBLIC_BASE_URL || `http://localhost:${PORT}`;

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required. Create a PostgreSQL database and set DATABASE_URL.");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes("localhost") ? false : { rejectUnauthorized: false }
});

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.set("trust proxy",1);
app.disable("x-powered-by");

// Security headers without adding new runtime dependencies.
app.use((req,res,next)=>{
  res.setHeader("X-Content-Type-Options","nosniff");
  res.setHeader("X-Frame-Options","DENY");
  res.setHeader("Referrer-Policy","strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy","camera=(), microphone=(), geolocation=(), payment=(self)");
  res.setHeader("Cross-Origin-Opener-Policy","same-origin-allow-popups");
  res.setHeader("Content-Security-Policy","frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'");
  if(req.secure || process.env.NODE_ENV==="production") res.setHeader("Strict-Transport-Security","max-age=31536000; includeSubDomains");
  if(req.path.startsWith("/api/admin") || req.path==="/api/me") res.setHeader("Cache-Control","no-store");
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

function sameOriginGuard(req,res,next){
  if(["GET","HEAD","OPTIONS"].includes(req.method)) return next();
  const origin=req.get("origin");
  if(!origin) return next();
  try{
    const expected=`${req.protocol}://${req.get("host")}`;
    if(new URL(origin).origin!==new URL(expected).origin) return res.status(403).json({error:"허용되지 않은 요청입니다."});
  }catch{return res.status(403).json({error:"허용되지 않은 요청입니다."})}
  next();
}
app.use("/api",sameOriginGuard);

function cleanText(v,max=200){return String(v??"").replace(/\\0/g,"").trim().slice(0,max)}
function cleanEmail(v){const s=cleanText(v,180).toLowerCase();return s && /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(s)?s:""}
function cleanPhone(v){return cleanText(v,30).replace(/[^0-9+ \-]/g,"")}
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
async function notifyOrder(order,items){
  const c=mailSettings();
  const lines=items.map(i=>`${i.product_name} × ${i.qty} = ${money(i.line_total)}`).join("\n");
  const status={seller:{sent:false,reason:""},customer:{sent:false,reason:""}};

  const seller=`[이룸 새 주문]
주문번호: ${order.order_no}
주문자: ${order.customer_name}
연락처: ${order.phone}
이메일: ${order.email||"-"}
배송지: ${order.postcode||""} ${order.address1||""} ${order.address2||""}
배송메모: ${order.memo||"-"}

${lines}

총금액: ${money(order.total_amount)}
입금계좌: 우리은행 1005-203-135891
예금주: 이룸 fresh fruits`;

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

${lines}

총금액: ${money(order.total_amount)}
우리은행 1005-203-135891
예금주: 이룸 fresh fruits

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


app.use(cookieParser());

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

function token(payload, expires="7d"){ return jwt.sign(payload, JWT_SECRET, { expiresIn: expires }); }
function readToken(req){
  const raw = req.cookies.iroom_token || (req.headers.authorization||"").replace(/^Bearer\s+/i,"");
  if(!raw) return null;
  try { return jwt.verify(raw, JWT_SECRET); } catch { return null; }
}
function requireUser(req,res,next){
  const u = readToken(req);
  if(!u || !u.userId) return res.status(401).json({error:"로그인이 필요합니다."});
  req.user=u; next();
}
function requireAdmin(req,res,next){
  const u = readToken(req);
  if(!u || !u.admin) return res.status(401).json({error:"관리자 로그인이 필요합니다."});
  req.user=u; next();
}
function setAuthCookie(res,tok){
  res.cookie("iroom_token", tok, {
    httpOnly:true,
    sameSite:"strict",
    secure:process.env.NODE_ENV==="production" || BASE_URL.startsWith("https://"),
    path:"/",
    priority:"high",
    maxAge:7*24*60*60*1000
  });
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
  `);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS postcode TEXT DEFAULT ''`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS address1 TEXT DEFAULT ''`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS address2 TEXT DEFAULT ''`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ`);
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
}

// Health
app.get("/api/health", async(req,res)=>{
  try{ await pool.query("SELECT 1"); res.json({ok:true,time:nowIso()}); }
  catch(e){ res.status(500).json({ok:false,error:e.message}); }
});

// Auth
app.post("/api/signup", simpleRateLimit({windowMs:15*60*1000,max:8,keyPrefix:"signup"}), async(req,res)=>{
  const {username,password,name,email="",phone="",postcode="",address1="",address2=""}=req.body||{};
  const user=cleanText(username,20).toLowerCase();
  const safeName=cleanText(name,60),safeEmail=cleanEmail(email),safePhone=cleanPhone(phone),safePost=cleanText(postcode,12),safeAddr1=cleanText(address1,180),safeAddr2=cleanText(address2,120);
  if(!user||!password||!safeName) return res.status(400).json({error:"아이디, 비밀번호, 이름을 입력해주세요."});
  if(!/^[a-z0-9_]{4,20}$/.test(user)) return res.status(400).json({error:"아이디는 영문·숫자·밑줄로 4~20자 입력해주세요."});
  if(password.length<8) return res.status(400).json({error:"비밀번호는 8자 이상이어야 합니다."});
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

  // V79: 아이디 로그인 우선. 과거 이메일 회원도 이메일로 계속 로그인 가능.
  const r=await pool.query(
    `SELECT * FROM users
     WHERE LOWER(COALESCE(username,''))=$1
        OR LOWER(COALESCE(email,''))=$1
     LIMIT 1`,
    [account]
  );
  const u=r.rows[0];
  console.log("[AUTH LOGIN]", account, u ? "USER_FOUND" : "USER_NOT_FOUND");

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

app.post("/api/logout",(req,res)=>{res.clearCookie("iroom_token");res.json({ok:true});});
app.get("/api/me", async(req,res)=>{
  const t=readToken(req); if(!t) return res.json({user:null});
  if(t.admin) return res.json({admin:true});
  const r=await pool.query("SELECT id,username,email,name,phone,postcode,address1,address2,created_at FROM users WHERE id=$1",[t.userId]);
  res.json({user:r.rows[0]||null});
});

// Products
app.get("/api/products", async(req,res)=>{
  const r=await pool.query("SELECT id,slug,name,description,unit,price,stock,image,category,is_active,sort_order FROM products WHERE is_active=TRUE ORDER BY sort_order,id");
  res.json({products:r.rows});
});

// Orders
app.post("/api/orders", simpleRateLimit({windowMs:10*60*1000,max:20,keyPrefix:"order"}), async(req,res)=>{
  const {items,customer_name,phone,email="",postcode="",address1,address2="",memo="",payment_method="무통장입금"}=req.body||{};
  const safeCustomer=cleanText(customer_name,60),safePhone=cleanPhone(phone),safeEmail=cleanEmail(email),safePost=cleanText(postcode,12),safeAddr1=cleanText(address1,180),safeAddr2=cleanText(address2,120),safeMemo=cleanText(memo,500);
  if(!Array.isArray(items)||!items.length||items.length>30) return res.status(400).json({error:"주문 상품이 없습니다."});
  if(!safeCustomer||!safePhone||!safeAddr1) return res.status(400).json({error:"주문자명, 연락처, 배송지를 입력해주세요."});

  const client=await pool.connect();
  try{
    await client.query("BEGIN");
    let total=0;
    const finalItems=[];
    for(const it of items){
      const pid=Number(it.product_id||it.id);
      const qty=Math.max(1,Number(it.qty||1));
      const pr=await client.query("SELECT id,name,price,stock,is_active FROM products WHERE id=$1 FOR UPDATE",[pid]);
      const p=pr.rows[0];
      if(!p||!p.is_active) throw new Error("판매하지 않는 상품이 포함되어 있습니다.");
      if(p.stock<qty) throw new Error(`${p.name} 재고가 부족합니다.`);
      const line=p.price*qty; total+=line;
      finalItems.push({p,qty,line});
    }
    const t=readToken(req);
    const ono=orderNo();
    const or=await client.query(`
      INSERT INTO orders(order_no,user_id,customer_name,phone,email,postcode,address1,address2,memo,payment_method,total_amount)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *
    `,[ono,t?.userId||null,safeCustomer,safePhone,safeEmail,safePost,safeAddr1,safeAddr2,safeMemo,cleanText(payment_method,40),total]);
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
      ok:true,order_no:ono,total_amount:total,mail_status,
      bank:{
        name:process.env.BANK_NAME||"우리은행",
        account:process.env.BANK_ACCOUNT||"1005-203-135891",
        holder:process.env.BANK_HOLDER||"이룸 fresh fruits"
      }
    });
  }catch(e){
    await client.query("ROLLBACK");
    res.status(400).json({error:e.message||"주문 처리 중 오류가 발생했습니다."});
  }finally{client.release();}
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
app.post("/api/admin/login",simpleRateLimit({windowMs:30*60*1000,max:8,keyPrefix:"admin"}),(req,res)=>{
  const {password}=req.body||{};
  if(!ADMIN_PASSWORD) return res.status(503).json({error:"관리자 비밀번호가 서버에 설정되지 않았습니다."});
  if(!password || !safeEqual(password,ADMIN_PASSWORD)){
    logSecurity("admin_login_failed","admin",req);
    return res.status(401).json({error:"관리자 비밀번호가 올바르지 않습니다."});
  }
  logSecurity("admin_login_success","admin",req);
  setAuthCookie(res,token({admin:true},"12h")); res.json({ok:true});
});
app.post("/api/admin/logout",(req,res)=>{res.clearCookie("iroom_token");res.json({ok:true});});
app.get("/api/admin/me",(req,res)=>{const t=readToken(req);res.json({admin:!!t?.admin});});


app.post("/api/consultations",simpleRateLimit({windowMs:10*60*1000,max:12,keyPrefix:"consult"}),async(req,res)=>{
  const b=req.body||{};
  const guideType=String(b.guide_type||"").trim();
  const name=String(b.customer_name||"").trim();
  const phone=String(b.phone||"").trim();
  if(!guideType||!name||!phone) return res.status(400).json({error:"상담 유형, 이름, 연락처를 입력해주세요."});
  const consultNo="C"+Date.now().toString(36).toUpperCase()+crypto.randomBytes(2).toString("hex").toUpperCase();
  try{
    const auth=readToken(req);
    const r=await pool.query(`
      INSERT INTO consultations(
        consult_no,user_id,guide_type,customer_name,phone,email,recipient,budget,quantity_note,
        preferred_fruits,avoid_fruits,taste_preference,packaging,delivery_date,message
      ) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *
    `,[consultNo,auth?.userId||null,guideType,name,phone,String(b.email||"").trim(),String(b.recipient||"").trim(),
       String(b.budget||"").trim(),String(b.quantity_note||"").trim(),String(b.preferred_fruits||"").trim(),
       String(b.avoid_fruits||"").trim(),String(b.taste_preference||"").trim(),String(b.packaging||"").trim(),
       String(b.delivery_date||"").trim(),String(b.message||"").trim()]);
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
  const slug=(p.slug||p.name||"product").toLowerCase().replace(/[^a-z0-9가-힣]+/g,"-").replace(/^-|-$/g,"")+"-"+crypto.randomBytes(2).toString("hex");
  const r=await pool.query(`
    INSERT INTO products(slug,name,description,unit,price,stock,image,category,is_active,sort_order)
    VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *
  `,[slug,p.name||"새 상품",p.description||"",p.unit||"",Number(p.price||0),Number(p.stock||0),p.image||"",p.category||"과일",p.is_active!==false,Number(p.sort_order||0)]);
  res.json({ok:true,product:r.rows[0]});
});
app.put("/api/admin/products/:id",requireAdmin,async(req,res)=>{
  const p=req.body||{};
  const r=await pool.query(`
    UPDATE products SET
      name=COALESCE($1,name),description=COALESCE($2,description),unit=COALESCE($3,unit),
      price=COALESCE($4,price),stock=COALESCE($5,stock),image=COALESCE($6,image),
      category=COALESCE($7,category),is_active=COALESCE($8,is_active),
      sort_order=COALESCE($9,sort_order),updated_at=NOW()
    WHERE id=$10 RETURNING *
  `,[p.name??null,p.description??null,p.unit??null,p.price===undefined?null:Number(p.price),p.stock===undefined?null:Number(p.stock),
     p.image??null,p.category??null,p.is_active===undefined?null:!!p.is_active,p.sort_order===undefined?null:Number(p.sort_order),req.params.id]);
  if(!r.rows[0]) return res.status(404).json({error:"상품을 찾을 수 없습니다."});
  logSecurity("admin_product_updated","admin",req,`product:${req.params.id}`);
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
  const r=await pool.query(`
    UPDATE orders SET status=COALESCE($1,status),payment_status=COALESCE($2,payment_status),updated_at=NOW()
    WHERE id=$3 RETURNING *
  `,[status||null,payment_status||null,req.params.id]);
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
app.get("/healthz",(req,res)=>res.json({ok:true,time:new Date().toISOString()}));

// static site
app.use(express.static(path.join(__dirname,"public"),{
  etag:true,maxAge:"5m",setHeaders(res,file){if(file.endsWith("service-worker.js")||file.endsWith("manifest.webmanifest"))res.setHeader("Cache-Control","no-cache");}
}));
app.get("*",(req,res)=>res.sendFile(path.join(__dirname,"public","index.html")));

let serverStarted=false;
function startHttp(){
  if(serverStarted)return;
  serverStarted=true;
  app.listen(PORT,()=>console.log(`IROOM V83 SECURE COMMERCE listening on ${PORT}`));
}
initDb().then(async()=>{
  await initOptionalTables();
  startHttp();
}).catch(err=>{
  console.error("Database initialization failed; starting web UI in recovery mode:",err);
  startHttp();
});
