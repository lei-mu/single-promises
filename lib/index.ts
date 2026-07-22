import { version as packageVersion } from '../package.json'

const version: string = packageVersion

export interface SinglePromiseOptions {
  /** 缓存时长（毫秒），0 表示不缓存。 */
  cache?: number
}

type AnyFunction = (this: any, ...args: any[]) => any

export interface SinglePromiseHandler<Fn extends AnyFunction> {
  (this: ThisParameterType<Fn>, ...args: Parameters<OmitThisParameter<Fn>>): Promise<Awaited<ReturnType<Fn>>>
  clear(): void
  update(options?: SinglePromiseOptions): void
}

/** 包装函数，使并发调用共享同一次执行。 */
function singlePromise<Fn extends AnyFunction>(
  fn: Fn,
  options: SinglePromiseOptions = {},
): SinglePromiseHandler<Fn> {
  let currentOptions: Required<SinglePromiseOptions> = { cache: 0, ...options }
  let pendingPromise: Promise<Awaited<ReturnType<Fn>>> | undefined
  let cachedAt = -1
  let cachedResult: Awaited<ReturnType<Fn>> | undefined

  function handle(
    this: ThisParameterType<Fn>,
    ...args: Parameters<OmitThisParameter<Fn>>
  ): Promise<Awaited<ReturnType<Fn>>> {
    const { cache } = currentOptions
    if (cache > 0 && cachedAt > 0) {
      if (Date.now() - cachedAt < cache) {
        return Promise.resolve(cachedResult as Awaited<ReturnType<Fn>>)
      }
      cachedAt = -1
      cachedResult = undefined
    }
    if (pendingPromise) return pendingPromise

    let result: ReturnType<Fn>
    try {
      result = fn.apply(this, args)
    } catch (error: unknown) {
      return Promise.reject(error)
    }

    pendingPromise = Promise.resolve(result).then(
      (result) => {
        if (cache > 0) {
          cachedAt = Date.now()
          cachedResult = result
        }
        pendingPromise = undefined
        return result
      },
      (error: unknown) => {
        pendingPromise = undefined
        throw error
      },
    )
    return pendingPromise
  }

  handle.clear = () => {
    cachedAt = -1
    cachedResult = undefined
  }
  handle.update = (newOptions: SinglePromiseOptions = {}) => {
    currentOptions = { ...currentOptions, ...newOptions }
  }
  return handle
}

export { singlePromise, version }
