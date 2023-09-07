/*!
 * single-promises v0.0.0-alpha.2
 * CopyRight (c) 2023-present, luch
 * Released under the ISC License.
 * https://github.com/lei-mu/single-promises
 */
const f = "0.0.0-alpha.2";
function h(a, n = {}) {
  const u = {
    cache: 0
  };
  let e, l = -1, t;
  n = Object.assign({}, u, n);
  function c(...i) {
    let o = this, { cache: s } = n;
    if (s && l > 0) {
      if (Date.now() - l < s)
        return Promise.resolve(t);
      l = -1, t = null;
    }
    return e || (e = Promise.resolve(a.apply(o, i)), e.then((r) => (s && (l = Date.now(), t = r), e = null, r)).catch((r) => (e = null, Promise.reject(r))));
  }
  return c.clear = function() {
    l = -1, t = null;
  }, c.update = function(i = {}) {
    n = Object.assign({}, n, i);
  }, c;
}
export {
  h as singlePromise,
  f as version
};
