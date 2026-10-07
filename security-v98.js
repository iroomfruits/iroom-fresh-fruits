'use strict';

// IROOM HOME2 V60.98.1 security preload — Kakao return compatibility fix.
// Loaded before server.js via: node -r ./security-v98.js server.js
// It strengthens the existing server without rewriting the proven Home1 backend.

const crypto = require('crypto');
const express = require('express');
let helmet = null;
try { helmet = require('helmet'); } catch (_) {}
let PgPool = null;
try { PgPool = require('pg').Pool; } catch (_) {}

const IS_PROD = String(process.env.NODE_ENV || '').toLowerCase() === 'production';
const PUBLIC_BASE_URL = String(process.env.PUBLIC_BASE_URL || '').trim();
const SECURE = IS_PROD || /^https:\/\//i.test(PUBLIC_BASE_URL);
const CSRF_COOKIE = SECURE ? '__Host-iroom_csrf_v98' : 'iroom_csrf_v98';
const KAKAO_STATE_COOKIE = SECURE ? '__Host-iroom_kakao_state' : 'iroom_kakao_state';
const CSRF_SECRET = String(process.env.JWT_SECRET || process.env.CSRF_SECRET || crypto.randomBytes(32).toString('hex'));
const ADMIN_TOTP_SECRET_ENV = String(process.env.ADMIN_TOTP_SECRET || '').replace(/\s+/g, '').toUpperCase();

function cookieValue(req, name) {
  const raw = String(req.headers.cookie || '');
  for (const part of raw.split(';')) {
    const idx = part.indexOf('=');
    if (idx < 0) continue;
    const k = part.slice(0, idx).trim();
    if (k === name) return decodeURIComponent(part.slice(idx + 1).trim());
  }
  return '';
}
function timingSafeEqualText(a, b) {
  const x = Buffer.from(String(a || ''));
  const y = Buffer.from(String(b || ''));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}
function signCsrf(nonce) {
  const sig = crypto.createHmac('sha256', CSRF_SECRET).update(nonce).digest('base64url');
  return `${nonce}.${sig}`;
}
function validCsrf(token) {
  const [nonce, sig, extra] = String(token || '').split('.');
  if (!nonce || !sig || extra || nonce.length > 128 || sig.length > 128) return false;
  const expected = signCsrf(nonce).split('.')[1];
  return timingSafeEqualText(sig, expected);
}
function newCsrfToken() {
  return signCsrf(crypto.randomBytes(24).toString('base64url'));
}
function csrfCookieHeader(token) {
  return `${CSRF_COOKIE}=${encodeURIComponent(token)}; Path=/; SameSite=Strict; HttpOnly${SECURE ? '; Secure' : ''}; Max-Age=7200; Priority=High`;
}

// Optional PostgreSQL-backed rate limiter. It survives Node restarts and works across instances.
let ratePool = null;
let rateReady = null;
if (PgPool && process.env.DATABASE_URL) {
  try {
    ratePool = new PgPool({
      connectionString: process.env.DATABASE_URL,
      max: 2,
      idleTimeoutMillis: 15000,
      connectionTimeoutMillis: 5000,
      ssl: /sslmode=(require|verify-ca|verify-full)/i.test(process.env.DATABASE_URL) ? { rejectUnauthorized: String(process.env.PGSSL_REJECT_UNAUTHORIZED || 'false').toLowerCase() === 'true' } : undefined
    });
    rateReady = ratePool.query(`
      CREATE TABLE IF NOT EXISTS security_rate_limits_v98(
        key_hash TEXT PRIMARY KEY,
        window_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        hits INTEGER NOT NULL DEFAULT 0,
        blocked_until TIMESTAMPTZ,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS security_admin_mfa_v98(
        id INTEGER PRIMARY KEY CHECK(id=1),
        secret_cipher TEXT NOT NULL DEFAULT '',
        enabled BOOLEAN NOT NULL DEFAULT FALSE,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      INSERT INTO security_admin_mfa_v98(id,secret_cipher,enabled)
      VALUES(1,'',FALSE) ON CONFLICT(id) DO NOTHING;
    `).catch(e => { console.warn('[V98 SECURITY INIT]', e.message); return null; });
    ratePool.on('error', e => console.warn('[V98 RATE POOL]', e.message));
    process.once('SIGTERM', () => ratePool?.end().catch(() => {}));
    process.once('SIGINT', () => ratePool?.end().catch(() => {}));
  } catch (e) {
    console.warn('[V98 RATE LIMIT]', e.message);
  }
}
function rateKey(req, prefix) {
  const account = String(req.body?.username || req.body?.email || req.body?.order_no || '').toLowerCase().slice(0, 120);
  return crypto.createHash('sha256').update(`${prefix}|${req.ip || ''}|${account}`).digest('hex');
}
function durableRateLimit({ prefix, windowSec, max, blockSec = 900 }) {
  return async (req, res, next) => {
    if (!ratePool || !rateReady) return next();
    try {
      await rateReady;
      const key = rateKey(req, prefix);
      const q = await ratePool.query(`
        INSERT INTO security_rate_limits_v98(key_hash, window_started_at, hits, blocked_until, updated_at)
        VALUES($1, NOW(), 1, NULL, NOW())
        ON CONFLICT(key_hash) DO UPDATE SET
          hits = CASE WHEN security_rate_limits_v98.window_started_at < NOW() - make_interval(secs => $2::int) THEN 1 ELSE security_rate_limits_v98.hits + 1 END,
          window_started_at = CASE WHEN security_rate_limits_v98.window_started_at < NOW() - make_interval(secs => $2::int) THEN NOW() ELSE security_rate_limits_v98.window_started_at END,
          blocked_until = CASE
            WHEN security_rate_limits_v98.blocked_until IS NOT NULL AND security_rate_limits_v98.blocked_until > NOW() THEN security_rate_limits_v98.blocked_until
            WHEN (CASE WHEN security_rate_limits_v98.window_started_at < NOW() - make_interval(secs => $2::int) THEN 1 ELSE security_rate_limits_v98.hits + 1 END) > $3::int THEN NOW() + make_interval(secs => $4::int)
            ELSE NULL
          END,
          updated_at = NOW()
        RETURNING hits, blocked_until
      `, [key, windowSec, max, blockSec]);
      const row = q.rows[0] || {};
      if (row.blocked_until && new Date(row.blocked_until).getTime() > Date.now()) {
        res.setHeader('Retry-After', String(blockSec));
        return res.status(429).json({ error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' });
      }
      if (Math.random() < 0.01) {
        ratePool.query("DELETE FROM security_rate_limits_v98 WHERE updated_at < NOW() - INTERVAL '2 days'").catch(() => {});
      }
      next();
    } catch (e) {
      console.warn('[V98 RATE LIMIT CHECK]', e.message);
      next(); // availability first; the existing in-process limiter remains active as a second layer.
    }
  };
}

// RFC 6238 TOTP + encrypted DB-backed administrator MFA.
function base32Decode(input) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const clean = String(input || '').replace(/=+$/g, '').replace(/[^A-Z2-7]/g, '');
  let bits = '';
  for (const c of clean) {
    const n = alphabet.indexOf(c);
    if (n < 0) continue;
    bits += n.toString(2).padStart(5, '0');
  }
  const out = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) out.push(parseInt(bits.slice(i, i + 8), 2));
  return Buffer.from(out);
}
function base32Encode(buf) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  for (const byte of buf) bits += byte.toString(2).padStart(8, '0');
  let out = '';
  for (let i = 0; i < bits.length; i += 5) {
    const chunk = bits.slice(i, i + 5).padEnd(5, '0');
    out += alphabet[parseInt(chunk, 2)];
  }
  return out;
}
function totpAt(secret, step) {
  const key = base32Decode(secret);
  const msg = Buffer.alloc(8);
  msg.writeBigUInt64BE(BigInt(step));
  const h = crypto.createHmac('sha1', key).update(msg).digest();
  const off = h[h.length - 1] & 15;
  const n = (h.readUInt32BE(off) & 0x7fffffff) % 1000000;
  return String(n).padStart(6, '0');
}
function verifyTotp(code, secret) {
  const c = String(code || '').replace(/\D/g, '');
  if (c.length !== 6 || !secret) return false;
  const step = Math.floor(Date.now() / 30000);
  return [-1, 0, 1].some(d => timingSafeEqualText(c, totpAt(secret, step + d)));
}
function mfaKey() { return crypto.createHash('sha256').update(CSRF_SECRET).digest(); }
function encryptSecret(secret) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', mfaKey(), iv);
  const enc = Buffer.concat([cipher.update(String(secret), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, tag, enc].map(b => b.toString('base64url')).join('.');
}
function decryptSecret(value) {
  try {
    const [ivS, tagS, encS] = String(value || '').split('.');
    if (!ivS || !tagS || !encS) return '';
    const dec = crypto.createDecipheriv('aes-256-gcm', mfaKey(), Buffer.from(ivS, 'base64url'));
    dec.setAuthTag(Buffer.from(tagS, 'base64url'));
    return Buffer.concat([dec.update(Buffer.from(encS, 'base64url')), dec.final()]).toString('utf8');
  } catch (_) { return ''; }
}
let mfaCache = { ts: 0, enabled: false, secret: '', source: 'none' };
async function activeMfa(force = false) {
  if (ADMIN_TOTP_SECRET_ENV) return { enabled: true, secret: ADMIN_TOTP_SECRET_ENV, source: 'env' };
  if (!ratePool || !rateReady) return { enabled: false, secret: '', source: 'none' };
  if (!force && Date.now() - mfaCache.ts < 15000) return mfaCache;
  try {
    await rateReady;
    const r = await ratePool.query('SELECT secret_cipher,enabled FROM security_admin_mfa_v98 WHERE id=1');
    const row = r.rows[0] || {};
    const secret = row.enabled ? decryptSecret(row.secret_cipher) : '';
    mfaCache = { ts: Date.now(), enabled: !!row.enabled && !!secret, secret, source: 'database' };
  } catch (e) { console.warn('[V98 MFA READ]', e.message); }
  return mfaCache;
}
async function storeMfa(secret, enabled) {
  if (!ratePool || !rateReady) throw new Error('MFA 저장소를 사용할 수 없습니다.');
  await rateReady;
  const cipher = secret ? encryptSecret(secret) : '';
  await ratePool.query('UPDATE security_admin_mfa_v98 SET secret_cipher=$1,enabled=$2,updated_at=NOW() WHERE id=1', [cipher, !!enabled]);
  mfaCache = { ts: 0, enabled: false, secret: '', source: 'database' };
}
function adminToken(req) {
  const jwt = require('jsonwebtoken');
  const raw = cookieValue(req, SECURE ? '__Host-iroom_token' : 'iroom_token') || cookieValue(req, 'iroom_token') || String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!raw || !process.env.JWT_SECRET) return null;
  try { return jwt.verify(raw, process.env.JWT_SECRET, { issuer: 'iroom-home1', audience: 'iroom-web' }); } catch (_) { return null; }
}
async function preloadRequireAdmin(req, res, next) {
  try {
    const t = adminToken(req);
    if (!t?.admin) return res.status(401).json({ error: '관리자 로그인이 필요합니다.' });
    if (ratePool) {
      const r = await ratePool.query("SELECT setting_value FROM site_settings WHERE setting_key='admin_session_version' LIMIT 1").catch(()=>({rows:[]}));
      const saved = r.rows[0]?.setting_value;
      const current = Math.max(1, Number(saved?.version || 1) || 1);
      if (Number(t.adminSessionVersion || 1) !== current) return res.status(401).json({ error: '관리자 세션이 만료되었습니다. 다시 로그인해주세요.' });
    }
    req.v98Admin = t;
    next();
  } catch (e) { next(e); }
}
async function optionalAdminTotp(req, res, next) {
  try {
    const mfa = await activeMfa();
    if (!mfa.enabled) return next();
    const code = req.body?.otp || req.get('x-admin-otp') || '';
    if (!verifyTotp(code, mfa.secret)) return res.status(401).json({ error: '관리자 2단계 인증번호를 확인해주세요.', mfa_required: true });
    next();
  } catch (e) { next(e); }
}
async function sensitiveAdminTotp(req, res, next) {
  try {
    const mfa = await activeMfa();
    if (!mfa.enabled) return next();
    const code = req.get('x-admin-otp') || req.body?.otp || '';
    if (!verifyTotp(code, mfa.secret)) return res.status(401).json({ error: '이 작업에는 관리자 2단계 인증이 필요합니다.', mfa_required: true });
    next();
  } catch (e) { next(e); }
}
// Clamp JSON size globally, while keeping the visual editor/store routes large enough for existing base64 assets.
const originalJson = express.json;
express.json = function hardenedJson(options = {}) {
  const small = originalJson({ ...options, limit: '1mb' });
  const large = originalJson({ ...options, limit: '30mb' });
  return (req, res, next) => {
    const p = String(req.path || req.url || '');
    if (p.startsWith('/api/admin/site/homepage-config') || p === '/api/store') return large(req, res, next);
    return small(req, res, next);
  };
};
const originalUrlencoded = express.urlencoded;
express.urlencoded = function hardenedUrlencoded(options = {}) {
  return originalUrlencoded({ ...options, limit: '256kb', parameterLimit: 200 });
};

const originalUse = express.application.use;
const originalGet = express.application.get;
const originalPost = express.application.post;
const originalPut = express.application.put;
const installed = new WeakSet();

function kakaoStateGuard(req, res, next) {
  const expected = cookieValue(req, KAKAO_STATE_COOKIE);
  const actual = String(req.query?.state || '');
  if (!expected || !actual || !timingSafeEqualText(expected, actual)) return res.redirect('/home2.html?kakao=error');
  res.setHeader('Set-Cookie', `${KAKAO_STATE_COOKIE}=; Path=/; SameSite=Lax; HttpOnly${SECURE ? '; Secure' : ''}; Max-Age=0`);
  next();
}

function installSecurity(app) {
  if (installed.has(app)) return;
  installed.add(app);

  if (helmet) {
    originalUse.call(app, helmet({
      contentSecurityPolicy: false, // server.js already has a tailored CSP; Home2 adds a stricter meta CSP.
      crossOriginEmbedderPolicy: false,
      strictTransportSecurity: false // server.js sets HSTS only when appropriate.
    }));
  }

  originalUse.call(app, (req, res, next) => {
    res.setHeader('X-Iroom-Security', 'v60.98.1');
    if (!res.getHeader('X-Request-ID')) res.setHeader('X-Request-ID', crypto.randomUUID());
    next();
  });

  // CSRF token is required for Home2 V60.98 state-changing requests.
  // This middleware is intentionally registered before the custom V98 API routes.
  originalUse.call(app, '/api', (req, res, next) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
    if (String(req.get('x-iroom-client') || '') !== 'home2-v98') return next();
    const header = String(req.get('x-csrf-token') || '');
    const cookie = cookieValue(req, CSRF_COOKIE);
    if (!header || !cookie || !timingSafeEqualText(header, cookie) || !validCsrf(header)) {
      return res.status(403).json({ error: '보안 토큰이 만료되었거나 올바르지 않습니다. 페이지를 새로고침한 뒤 다시 시도해주세요.' });
    }
    next();
  });

  const tinyJson = originalJson({ limit: '32kb', strict: true });
  originalGet.call(app, '/api/security/csrf', (req, res) => {
    const token = newCsrfToken();
    res.setHeader('Set-Cookie', csrfCookieHeader(token));
    res.setHeader('Cache-Control', 'no-store');
    res.json({ ok: true, token, expires_in: 7200 });
  });
  originalGet.call(app, '/api/security/features', (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    activeMfa().then(mfa=>res.json({ ok: true, csrf: true, durable_rate_limit: !!ratePool, admin_totp_ready: true, admin_totp_enabled: !!mfa.enabled })).catch(()=>res.json({ ok: true, csrf: true, durable_rate_limit: !!ratePool, admin_totp_ready: true, admin_totp_enabled: false }));
  });
  originalGet.call(app, '/api/security/admin/mfa/status', preloadRequireAdmin, async (req, res) => {
    const mfa = await activeMfa(true);
    res.setHeader('Cache-Control', 'no-store');
    res.json({ ok: true, enabled: !!mfa.enabled, source: mfa.source });
  });
  originalPost.call(app, '/api/security/admin/mfa/setup', tinyJson, preloadRequireAdmin, async (req, res) => {
    if (ADMIN_TOTP_SECRET_ENV) return res.status(409).json({ error: 'ADMIN_TOTP_SECRET 환경변수 방식으로 이미 관리 중입니다.' });
    if (!ratePool || !rateReady) return res.status(503).json({ error: 'MFA 저장소를 사용할 수 없습니다.' });
    const secret = base32Encode(crypto.randomBytes(20));
    await rateReady;
    await ratePool.query('UPDATE security_admin_mfa_v98 SET secret_cipher=$1,enabled=FALSE,updated_at=NOW() WHERE id=1', [encryptSecret(secret)]);
    mfaCache.ts = 0;
    const issuer = encodeURIComponent('IROOM fresh fruits');
    const label = encodeURIComponent('IROOM:admin');
    res.setHeader('Cache-Control', 'no-store');
    res.json({ ok: true, secret, otpauth_uri: `otpauth://totp/${label}?secret=${secret}&issuer=${issuer}&digits=6&period=30` });
  });
  originalPost.call(app, '/api/security/admin/mfa/enable', tinyJson, preloadRequireAdmin, async (req, res) => {
    if (ADMIN_TOTP_SECRET_ENV) return res.status(409).json({ error: '환경변수 MFA는 이미 활성 상태입니다.' });
    if (!ratePool || !rateReady) return res.status(503).json({ error: 'MFA 저장소를 사용할 수 없습니다.' });
    await rateReady;
    const r = await ratePool.query('SELECT secret_cipher FROM security_admin_mfa_v98 WHERE id=1');
    const secret = decryptSecret(r.rows[0]?.secret_cipher || '');
    if (!secret || !verifyTotp(req.body?.otp, secret)) return res.status(400).json({ error: '인증번호가 올바르지 않습니다.' });
    await ratePool.query('UPDATE security_admin_mfa_v98 SET enabled=TRUE,updated_at=NOW() WHERE id=1');
    mfaCache.ts = 0;
    res.json({ ok: true, enabled: true });
  });
  originalPost.call(app, '/api/security/admin/mfa/disable', tinyJson, preloadRequireAdmin, async (req, res) => {
    if (ADMIN_TOTP_SECRET_ENV) return res.status(409).json({ error: '환경변수 MFA는 Render 환경변수에서 해제해야 합니다.' });
    if (!ratePool || !rateReady) return res.status(503).json({ error: 'MFA 저장소를 사용할 수 없습니다.' });
    const mfa = await activeMfa(true);
    if (mfa.enabled && !verifyTotp(req.body?.otp, mfa.secret)) return res.status(400).json({ error: '인증번호가 올바르지 않습니다.' });
    await ratePool.query("UPDATE security_admin_mfa_v98 SET secret_cipher='',enabled=FALSE,updated_at=NOW() WHERE id=1");
    mfaCache.ts = 0;
    res.json({ ok: true, enabled: false });
  });
  originalGet.call(app, '/api/auth/kakao/start', (req, res) => {
    const clientId = String(process.env.KAKAO_REST_API_KEY || '').trim();
    if (!clientId) return res.status(503).send('카카오 로그인 설정이 아직 완료되지 않았습니다.');
    const redirect = String(process.env.KAKAO_REDIRECT_URI || `${PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}`}/api/auth/kakao/callback`).trim();
    const state = crypto.randomBytes(18).toString('base64url');
    const rawNext = String(req.query?.next || '/home2.html');
    const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext.slice(0, 300) : '/home2.html';
    const mode = req.query?.mode === 'join' ? 'join' : 'login';
    const secureFlag = SECURE ? '; Secure' : '';
    const cookies = [
      `${KAKAO_STATE_COOKIE}=${state}; Path=/; SameSite=Lax; HttpOnly${secureFlag}; Max-Age=600; Priority=High`,
      `iroom_kakao_next=${encodeURIComponent(next)}; Path=/; SameSite=Lax; HttpOnly${secureFlag}; Max-Age=600; Priority=High`,
      `iroom_kakao_mode=${mode}; Path=/; SameSite=Lax; HttpOnly${secureFlag}; Max-Age=600; Priority=High`
    ];
    // The existing Home1 Kakao callback still validates the legacy state cookie.
    // Keep the hardened __Host cookie AND the legacy cookie in sync so both guards pass.
    if (KAKAO_STATE_COOKIE !== 'iroom_kakao_state') {
      cookies.push(`iroom_kakao_state=${state}; Path=/; SameSite=Lax; HttpOnly${secureFlag}; Max-Age=600; Priority=High`);
    }
    res.setHeader('Set-Cookie', cookies);
    const u = new URL('https://kauth.kakao.com/oauth/authorize');
    u.searchParams.set('client_id', clientId);
    u.searchParams.set('redirect_uri', redirect);
    u.searchParams.set('response_type', 'code');
    u.searchParams.set('state', state);
    res.redirect(u.toString());
  });
}

express.application.use = function patchedUse(...args) {
  installSecurity(this);
  return originalUse.apply(this, args);
};
express.application.get = function patchedGet(path, ...handlers) {
  installSecurity(this);
  if (path === '/api/order/:orderNo') {
    return originalGet.call(this, path, (req, res) => {
      res.setHeader('Cache-Control', 'no-store');
      res.status(410).json({ error: '이 주문조회 방식은 보안상 종료되었습니다. POST /api/orders/lookup을 이용해주세요.' });
    });
  }
  if (path === '/api/auth/kakao/callback') handlers.unshift(kakaoStateGuard);
  if (path === '/api/admin/backup') handlers.unshift(sensitiveAdminTotp);
  return originalGet.call(this, path, ...handlers);
};
express.application.post = function patchedPost(path, ...handlers) {
  installSecurity(this);
  const durable = {
    '/api/login': { prefix: 'login', windowSec: 900, max: 12, blockSec: 900 },
    '/api/signup': { prefix: 'signup', windowSec: 900, max: 8, blockSec: 900 },
    '/api/admin/login': { prefix: 'admin-login', windowSec: 1800, max: 8, blockSec: 1800 },
    '/api/orders/lookup': { prefix: 'order-lookup', windowSec: 600, max: 10, blockSec: 900 },
    '/api/orders': { prefix: 'order', windowSec: 600, max: 20, blockSec: 900 },
    '/api/consultations': { prefix: 'consult', windowSec: 600, max: 12, blockSec: 900 }
  }[path];
  if (durable) handlers.unshift(durableRateLimit(durable));
  if (path === '/api/admin/login') handlers.unshift(optionalAdminTotp);
  if (path === '/api/admin/password' || path === '/api/store') handlers.unshift(sensitiveAdminTotp);
  return originalPost.call(this, path, ...handlers);
};
express.application.put = function patchedPut(path, ...handlers) {
  installSecurity(this);
  if (path === '/api/store' || String(path).startsWith('/api/admin/site/')) handlers.unshift(sensitiveAdminTotp);
  return originalPut.call(this, path, ...handlers);
};

console.log('[IROOM SECURITY] V60.98.1 preload active');
