import {version} from '../package.json'



/**
 * 用于包装一个函数并返回一个新函数，使其调用这个新函数只有一个promise在执行，后续的调用都会返回这个promise
 * @param fn {function(...[*]): (Promise<Awaited<*>>)} - 需要包装的函数
 * @param opt {object} - 配置项
 * @param opt.cache {number} [opt.cache = 0] - 缓存时间，单位毫秒，如果大于0，则会缓存结果，下次调用如何结果仍在有效缓存时间内，则会直接返回缓存的结果。默认0，不缓存
 * @return {(function(...[*]): (Promise<Awaited<*>>))|*}
 */
function singlePromise(fn, opt = {}) {
  const defaultOpt = {
    cache: 0
  }
  let promise
  let cacheMill = -1
  let cacheRes

  opt = Object.assign({}, defaultOpt, opt)

  function handle(...args) {
    let self = this
    let {cache} = opt

    if (cache && cacheMill > 0) {
      if (Date.now() - cacheMill < cache) {
        return Promise.resolve(cacheRes)
      } else {
        cacheMill = -1
        cacheRes = null
      }
    }
    if (promise) {
      return promise
    } else {
      promise = Promise.resolve(fn.apply(self, args))
    }
    return promise.then((res) => {
      if (cache) {
        cacheMill = Date.now()
        cacheRes = res
      }
      promise = null
      return res
    }).catch((err) => {
      promise = null
      return Promise.reject(err)
    })
  }

  handle.clear = function () {
    cacheMill = -1
    cacheRes = null

  }
  handle.update = function (newOpt = {}) {
    opt = Object.assign({}, opt, newOpt)
  }

  return handle

}

export {
  singlePromise,
  version
}
