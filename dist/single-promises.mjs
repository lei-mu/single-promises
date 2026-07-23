/*!
 * single-promises v1.0.2
 * CopyRight (c) 2023-present, luch
 * Released under the ISC License.
 * https://github.com/lei-mu/single-promises
 */
const d = "1.0.2", h = d;
function v(a, u = {}) {
  let o = { cache: 0, ...u }, e, t = -1, n;
  function i(...c) {
    const { cache: s } = o;
    if (s > 0 && t > 0) {
      if (Date.now() - t < s)
        return Promise.resolve(n);
      t = -1, n = void 0;
    }
    if (e)
      return e;
    let l;
    try {
      l = a.apply(this, c);
    } catch (r) {
      return Promise.reject(r);
    }
    return e = Promise.resolve(l).then(
      (r) => (s > 0 && (t = Date.now(), n = r), e = void 0, r),
      (r) => {
        throw e = void 0, r;
      }
    ), e;
  }
  return i.clear = () => {
    t = -1, n = void 0;
  }, i.update = (c = {}) => {
    o = { ...o, ...c };
  }, i;
}
export {
  v as singlePromise,
  h as version
};
