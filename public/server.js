const express = require("express");
const path = require("path");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const nodemailer = require("nodemailer");
const { Pool } = require("pg");

const app = express();
const PORT = Number(process.env.PORT || 3000);
const JWT_SECRET = process.env.JWT_SECRET || "CHANGE-ME-IN-PRODUCTION";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "CHANGE-ME";
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

function money(n){ return Number(n||0).toLocaleString("ko-KR")+"원"; }

async function sendOrderEmails(order, items){
  const orderEmail = process.env.ORDER_EMAIL || "";
  const smtpHost = process.env.SMTP_HOST || "";
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpUser = process.env.SMTP_USER || "";
  const smtpPassword = process.env.SMTP_PASSWORD || "";
  const senderEmail = process.env.BREVO_SENDER_EMAIL || smtpUser || orderEmail;
  const senderName = process.env.BREVO_SENDER_NAME || "이룸 fresh fruits";

  if(!smtpHost || !smtpUser || !smtpPassword){
    console.warn("[ORDER EMAIL] SMTP environment variables are incomplete. Order saved without email.");
    return {ok:false, reason:"smtp_not_configured"};
  }

  const transporter = nodemailer.createTransport({
    host:smtpHost,
    port:smtpPort,
    secure:smtpPort===465,
    auth:{user:smtpUser,pass:smtpPassword},
    tls:{minVersion:"TLSv1.2"}
  });

  const lines = items.map(i=>`${i.product_name} × ${i.qty} = ${money(i.line_total)}`).join("\n");
  const adminText =
`[이룸 fresh fruits 새 주문]
주문번호: ${order.order_no}
주문자: ${order.customer_name}
연락처: ${order.phone}
이메일: ${order.email||"-"}
배송지: ${order.postcode||""} ${order.address1||""} ${order.address2||""}
배송메모: ${order.memo||"-"}

${lines}

총 결제금액: ${money(order.total_amount)}
결제방법: ${order.payment_method}
주문상태: ${order.status}`;

  const customerText =
`${order.customer_name} 고객님, 이룸 fresh fruits 주문이 접수되었습니다.

주문번호: ${order.order_no}
${lines}

총 금액: ${money(order.total_amount)}
입금은행: 우리은행
입금계좌: 1005-203-135891
예금주: 이룸 fresh fruits

입금 확인 후 정성껏 선별·포장해 배송하겠습니다.`;

  const jobs=[];
  if(orderEmail){
    jobs.push(transporter.sendMail({
      from:`"${senderName}" <${senderEmail}>`,
      to:orderEmail,
      subject:`[이룸] 새 주문 ${order.order_no} / ${order.customer_name}`,
      text:adminText
    }));
  }
  if(order.email){
    jobs.push(transporter.sendMail({
      from:`"${senderName}" <${senderEmail}>`,
      to:order.email,
      subject:`[이룸 fresh fruits] 주문접수 ${order.order_no}`,
      text:customerText
    }));
  }
  if(!jobs.length){
    console.warn("[ORDER EMAIL] No recipient configured.");
    return {ok:false, reason:"no_recipient"};
  }
  const results=await Promise.allSettled(jobs);
  const failed=results.filter(x=>x.status==="rejected");
  if(failed.length){
    failed.forEach(x=>console.error("[ORDER EMAIL] send failed:",x.reason?.message||x.reason));
    return {ok:false, reason:"send_failed"};
  }
  console.log("[ORDER EMAIL] sent:",order.order_no);
  return {ok:true};
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
    httpOnly:true, sameSite:"lax", secure:BASE_URL.startsWith("https://"),
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
  `);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS postcode TEXT DEFAULT ''`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS address1 TEXT DEFAULT ''`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS address2 TEXT DEFAULT ''`);
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
app.post("/api/signup", async(req,res)=>{
  const {username,password,name,email="",phone="",postcode="",address1="",address2=""}=req.body||{};
  const user=(username||"").trim().toLowerCase();
  if(!user||!password||!name) return res.status(400).json({error:"아이디, 비밀번호, 이름을 입력해주세요."});
  if(!/^[a-z0-9_]{4,20}$/.test(user)) return res.status(400).json({error:"아이디는 영문 소문자, 숫자, 밑줄로 4~20자 입력해주세요."});
  if(password.length<6) return res.status(400).json({error:"비밀번호는 6자 이상이어야 합니다."});
  try{
    const hash=await bcrypt.hash(password,12);
    const r=await pool.query(
      `INSERT INTO users(username,email,password_hash,name,phone,postcode,address1,address2)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING id,username,email,name,phone,postcode,address1,address2`,
      [user,(email||"").trim().toLowerCase()||null,hash,name.trim(),phone.trim(),postcode.trim(),address1.trim(),address2.trim()]
    );
    const u=r.rows[0]; setAuthCookie(res,token({userId:u.id,username:u.username,email:u.email,name:u.name}));
    res.json({ok:true,user:u});
  }catch(e){
    if(e.code==="23505") return res.status(409).json({error:(e.detail||"").includes("username")?"이미 사용 중인 아이디입니다.":"이미 가입된 이메일입니다."});
    console.error("signup error",e);res.status(500).json({error:"회원가입 처리 중 오류가 발생했습니다."});
  }
});

app.post("/api/login", async(req,res)=>{
  const {username,email,password}=req.body||{};
  const account=(email||username||"").toLowerCase().trim();
  if(!account||!password) return res.status(400).json({error:"이메일과 비밀번호를 입력해주세요."});
  const r=await pool.query("SELECT * FROM users WHERE email=$1",[account]);
  const u=r.rows[0];
  if(!u || !(await bcrypt.compare(password,u.password_hash))) return res.status(401).json({error:"이메일 또는 비밀번호가 올바르지 않습니다."});
  setAuthCookie(res,token({userId:u.id,email:u.email,name:u.name}));
  res.json({ok:true,user:{id:u.id,email:u.email,name:u.name,phone:u.phone}});
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
app.post("/api/orders", async(req,res)=>{
  const {items,customer_name,phone,email="",postcode="",address1,address2="",memo="",payment_method="무통장입금"}=req.body||{};
  if(!Array.isArray(items)||!items.length) return res.status(400).json({error:"주문 상품이 없습니다."});
  if(!customer_name||!phone||!address1) return res.status(400).json({error:"주문자명, 연락처, 배송지를 입력해주세요."});

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
    `,[ono,t?.userId||null,customer_name,phone,email,postcode,address1,address2,memo,payment_method,total]);
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
    sendOrderEmails(orderForMail,itemsForMail).catch(e=>console.error("[ORDER EMAIL] unexpected:",e.message));
    res.json({
      ok:true,order_no:ono,total_amount:total,
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

app.get("/api/order/:orderNo", async(req,res)=>{
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
app.post("/api/admin/login",(req,res)=>{
  const {password}=req.body||{};
  if(!password || password!==ADMIN_PASSWORD) return res.status(401).json({error:"관리자 비밀번호가 올바르지 않습니다."});
  setAuthCookie(res,token({admin:true},"12h")); res.json({ok:true});
});
app.post("/api/admin/logout",(req,res)=>{res.clearCookie("iroom_token");res.json({ok:true});});
app.get("/api/admin/me",(req,res)=>{const t=readToken(req);res.json({admin:!!t?.admin});});

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
  res.json({ok:true,order:r.rows[0]});
});

app.get("/api/admin/users",requireAdmin,async(req,res)=>{
  const r=await pool.query("SELECT id,username,email,name,phone,postcode,address1,address2,created_at FROM users ORDER BY created_at DESC LIMIT 500");
  res.json({users:r.rows});
});

// Toss readiness information endpoint
app.get("/api/payment/config",(req,res)=>{
  res.json({
    toss_enabled:!!process.env.TOSS_CLIENT_KEY,
    client_key:process.env.TOSS_CLIENT_KEY||null
  });
});

// static site
app.use(express.static(path.join(__dirname,"public"),{
  etag:true,maxAge:"5m",setHeaders(res,file){if(file.endsWith("service-worker.js")||file.endsWith("manifest.webmanifest"))res.setHeader("Cache-Control","no-cache");}
}));
app.get("*",(req,res)=>res.sendFile(path.join(__dirname,"public","index.html")));

initDb().then(()=>{
  app.listen(PORT,()=>console.log(`IROOM production shop listening on ${PORT}`));
}).catch(err=>{
  console.error("Database initialization failed:",err);
  process.exit(1);
});
