/*!
 * single-promises v1.0.1
 * CopyRight (c) 2023-present, luch
 * Released under the ISC License.
 * https://github.com/lei-mu/single-promises
 */
const f = "1.0.1";
function h(u, s = {}) {
  const i = { cache: 0, ...s };
  let e = null, t = -1, r = null;
  function c(...l) {
    const a = this, { cache: o } = i;
    if (o && t > 0) {
      if (Date.now() - t < o)
        return Promise.resolve(r);
      t = -1, r = null;
    }
    if (e)
      return e;
    try {
      e = Promise.resolve(u.apply(a, l)).then((n) => (o && (t = Date.now(), r = n), e = null, n)).catch((n) => (e = null, Promise.reject(n)));
    } catch (n) {
      return Promise.reject(n);
    }
    return e;
  }
  return c.clear = function() {
    t = -1, r = null;
  }, c.update = function(l = {}) {
    Object.assign(i, l);
  }, c;
}
export {
  h as singlePromise,
  f as version
};
