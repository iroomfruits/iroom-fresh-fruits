'use strict';

/*
 * IROOM Home1 Kakao return bridge
 * Loaded AFTER security-v98.js and BEFORE server.js.
 *
 * security-v98.js intentionally hardens the callback and historically forced
 * the callback destination to Home2. This tiny bridge restores the original,
 * safe iroom_kakao_next cookie value after that guard runs, so:
 *   Home1 start ?next=/home1     -> returns to /home1
 *   Home2 start ?next=/home2.html -> returns to /home2.html
 *
 * It does not alter Home1/Home2 UI, DB, orders, or admin routing.
 */

const express = require('express');
const downstreamGet = express.application.get;

function rawCookie(req, wanted) {
  const raw = String(req.headers?.cookie || '');
  for (const part of raw.split(';')) {
    const i = part.indexOf('=');
    if (i < 0) continue;
    const key = part.slice(0, i).trim();
    if (key !== wanted) continue;
    try { return decodeURIComponent(part.slice(i + 1).trim()); }
    catch (_) { return part.slice(i + 1).trim(); }
  }
  return '';
}

function restoreOriginalKakaoNext(req, res, next) {
  try {
    const original = rawCookie(req, 'iroom_kakao_next');
    const safe =
      original === '/home1' ||
      original === '/home1/' ||
      original.startsWith('/home1?') ||
      original.startsWith('/home1#')
        ? '/home1'
        : '';

    if (safe && req.cookies && typeof req.cookies === 'object') {
      req.cookies.iroom_kakao_next = safe;
    }
  } catch (_) {}
  res.setHeader('Cache-Control', 'no-store');
  next();
}

express.application.get = function homeAwareGet(path, ...handlers) {
  if (path === '/api/auth/kakao/callback') {
    // security-v98.js will prepend its state guard and legacy Home2 return
    // middleware after this wrapper delegates. Our restore handler therefore
    // runs immediately after them and before the real server callback.
    handlers.unshift(restoreOriginalKakaoNext);
  }
  return downstreamGet.call(this, path, ...handlers);
};
