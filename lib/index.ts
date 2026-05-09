import { version } from '../package.json'

export interface SinglePromiseOptions {
  /** Cache duration in milliseconds, default is 0 (no cache). */
  cache?: number
}

export interface SinglePromiseHandler<T extends any[], R> {
  (this: any, ...args: T): Promise<R>
  clear: () => void
  update: (newOpt?: SinglePromiseOptions) => void
}

function singlePromise<F extends (...args: any[]) => any>(
  fn: F,
  opt: SinglePromiseOptions = {}
): SinglePromiseHandler<Parameters<F>, Awaited<ReturnType<F>>> {
  const mergedOpt: SinglePromiseOptions = { cache: 0, ...opt }
  let promise: Promise<any> | null = null
  let cacheTime = -1
  let cacheResult: any = null

  function handle(this: any, ...args: any[]): Promise<any> {
    const self = this
    const { cache } = mergedOpt

    if (cache && cacheTime > 0) {
      if (Date.now() - cacheTime < cache!) {
        return Promise.resolve(cacheResult)
      }
      cacheTime = -1
      cacheResult = null
    }

    if (promise) {
      return promise
    }

    try {
      promise = Promise.resolve(fn.apply(self, args))
        .then((res) => {
          if (cache) {
            cacheTime = Date.now()
            cacheResult = res
          }
          promise = null
          return res
        })
        .catch((err: any) => {
          promise = null
          return Promise.reject(err)
        })
    } catch (err) {
      return Promise.reject(err)
    }

    return promise
  }

  handle.clear = function () {
    cacheTime = -1
    cacheResult = null
  }

  handle.update = function (newOpt: SinglePromiseOptions = {}) {
    Object.assign(mergedOpt, newOpt)
  }

  return handle as SinglePromiseHandler<Parameters<F>, Awaited<ReturnType<F>>>
}

export { singlePromise, version }
