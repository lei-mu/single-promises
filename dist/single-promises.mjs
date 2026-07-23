/*!
 * single-promises v1.0.1
 * CopyRight (c) 2023-present, luch
 * Released under the ISC License.
 * https://github.com/lei-mu/single-promises
 */
const f = "1.0.1", g = f;
function P(l, u = {}) {
  let h = { cache: 0, ...u }, c, n = -1, i;
  function o(...s) {
    const { cache: d } = h;
    if (d > 0 && n > 0) {
      if (Date.now() - n < d)
        return Promise.resolve(i);
      n = -1, i = void 0;
    }
    if (c)
      return c;
    let r;
    try {
      r = l.apply(this, s);
    } catch (e) {
      return Promise.reject(e);
    }
    return c = Promise.resolve(r).then(
      (e) => (d > 0 && (n = Date.now(), i = e), c = void 0, e),
      (e) => {
        throw c = void 0, e;
      }
    ), c;
  }
  return o.clear = () => {
    n = -1, i = void 0;
  }, o.update = (s = {}) => {
    h = { ...h, ...s };
  }, o;
}
function v(l, u) {
  const { key: h, ...c } = u;
  let n = { cache: 0, ...c };
  const i = /* @__PURE__ */ new Map();
  function o(r, e) {
    e.expirationTimer && clearTimeout(e.expirationTimer), e.expirationTimer = void 0, e.cachedAt = -1, e.cachedResult = void 0, e.pendingPromise || i.delete(r);
  }
  function s(r, e) {
    if (e.expirationTimer && clearTimeout(e.expirationTimer), e.cachedAt < 0)
      return;
    const t = n.cache - (Date.now() - e.cachedAt);
    if (n.cache <= 0 || t <= 0) {
      o(r, e);
      return;
    }
    e.expirationTimer = setTimeout(() => {
      i.get(r) === e && s(r, e);
    }, t);
  }
  function d(...r) {
    let e;
    try {
      e = h.apply(this, r);
    } catch (a) {
      return Promise.reject(a);
    }
    let t = i.get(e);
    t || (t = { cachedAt: -1 }, i.set(e, t));
    const { cache: m } = n;
    if (m > 0 && t.cachedAt > 0) {
      if (Date.now() - t.cachedAt < m)
        return Promise.resolve(t.cachedResult);
      o(e, t), t = { cachedAt: -1 }, i.set(e, t);
    }
    if (t.pendingPromise)
      return t.pendingPromise;
    let p;
    try {
      p = l.apply(this, r);
    } catch (a) {
      return i.delete(e), Promise.reject(a);
    }
    return t.pendingPromise = Promise.resolve(p).then(
      (a) => (t.pendingPromise = void 0, n.cache > 0 ? (t.cachedAt = Date.now(), t.cachedResult = a, s(e, t)) : i.delete(e), a),
      (a) => {
        throw i.delete(e), a;
      }
    ), t.pendingPromise;
  }
  return d.clear = function(r) {
    if (arguments.length > 0) {
      const e = i.get(r);
      e && o(r, e);
      return;
    }
    i.forEach((e, t) => o(t, e));
  }, d.update = (r = {}) => {
    n = { ...n, ...r }, i.forEach((e, t) => s(t, e));
  }, d;
}
export {
  v as keyedSinglePromise,
  P as singlePromise,
  g as version
};
