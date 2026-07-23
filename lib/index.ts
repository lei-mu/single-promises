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

export interface KeyedSinglePromiseOptions<Fn extends AnyFunction, Key> extends SinglePromiseOptions {
  /** 根据调用参数生成用于合并请求的 key。 */
  key(this: ThisParameterType<Fn>, ...args: Parameters<OmitThisParameter<Fn>>): Key
}

export interface KeyedSinglePromiseHandler<Fn extends AnyFunction, Key> {
  (this: ThisParameterType<Fn>, ...args: Parameters<OmitThisParameter<Fn>>): Promise<Awaited<ReturnType<Fn>>>
  clear(): void
  clear(key: Key): void
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

interface KeyedEntry<Result> {
  /** 当前 key 正在执行的 Promise。 */
  pendingPromise?: Promise<Result>
  /** fulfilled 结果的缓存时间；-1 表示没有缓存。 */
  cachedAt: number
  cachedResult?: Result
  /** 缓存到期后释放当前 key 对应的条目。 */
  expirationTimer?: ReturnType<typeof setTimeout>
}

/** 按 key 合并并发调用，不同 key 之间相互独立。 */
function keyedSinglePromise<Fn extends AnyFunction, Key>(
  fn: Fn,
  options: KeyedSinglePromiseOptions<Fn, Key>,
): KeyedSinglePromiseHandler<Fn, Key> {
  const { key: getKey, ...singleOptions } = options
  let currentOptions: Required<SinglePromiseOptions> = { cache: 0, ...singleOptions }
  const entries = new Map<Key, KeyedEntry<Awaited<ReturnType<Fn>>>>()

  /** 清除缓存；如果当前 key 没有执行中的任务，则同时释放条目。 */
  function clearEntry(key: Key, entry: KeyedEntry<Awaited<ReturnType<Fn>>>) {
    if (entry.expirationTimer) clearTimeout(entry.expirationTimer)
    entry.expirationTimer = undefined
    entry.cachedAt = -1
    entry.cachedResult = undefined
    if (!entry.pendingPromise) entries.delete(key)
  }

  /** 根据最新配置安排缓存过期，update 后也会重新计算剩余时间。 */
  function scheduleExpiration(key: Key, entry: KeyedEntry<Awaited<ReturnType<Fn>>>) {
    if (entry.expirationTimer) clearTimeout(entry.expirationTimer)
    if (entry.cachedAt < 0) return

    const remaining = currentOptions.cache - (Date.now() - entry.cachedAt)
    if (currentOptions.cache <= 0 || remaining <= 0) {
      clearEntry(key, entry)
      return
    }

    entry.expirationTimer = setTimeout(() => {
      if (entries.get(key) === entry) scheduleExpiration(key, entry)
    }, remaining)
  }

  function handle(
    this: ThisParameterType<Fn>,
    ...args: Parameters<OmitThisParameter<Fn>>
  ): Promise<Awaited<ReturnType<Fn>>> {
    let key: Key
    try {
      key = getKey.apply(this, args)
    } catch (error: unknown) {
      return Promise.reject(error)
    }

    let entry = entries.get(key)
    if (!entry) {
      entry = { cachedAt: -1 }
      entries.set(key, entry)
    }

    // 每个 key 拥有独立的执行状态和缓存。
    const { cache } = currentOptions
    if (cache > 0 && entry.cachedAt > 0) {
      if (Date.now() - entry.cachedAt < cache) {
        return Promise.resolve(entry.cachedResult as Awaited<ReturnType<Fn>>)
      }
      clearEntry(key, entry)
      entry = { cachedAt: -1 }
      entries.set(key, entry)
    }
    if (entry.pendingPromise) return entry.pendingPromise

    let result: ReturnType<Fn>
    try {
      result = fn.apply(this, args)
    } catch (error: unknown) {
      entries.delete(key)
      return Promise.reject(error)
    }

    entry.pendingPromise = Promise.resolve(result).then(
      (resolvedResult) => {
        entry.pendingPromise = undefined
        if (currentOptions.cache > 0) {
          entry.cachedAt = Date.now()
          entry.cachedResult = resolvedResult
          scheduleExpiration(key, entry)
        } else {
          // 未启用缓存时，执行完成后立即释放 key，避免 Map 持续增长。
          entries.delete(key)
        }
        return resolvedResult
      },
      (error: unknown) => {
        entries.delete(key)
        throw error
      },
    )
    return entry.pendingPromise
  }

  handle.clear = function (key?: Key) {
    if (arguments.length > 0) {
      const entry = entries.get(key as Key)
      if (entry) clearEntry(key as Key, entry)
      return
    }
    entries.forEach((entry, entryKey) => clearEntry(entryKey, entry))
  }
  handle.update = (newOptions: SinglePromiseOptions = {}) => {
    currentOptions = { ...currentOptions, ...newOptions }
    entries.forEach((entry, key) => scheduleExpiration(key, entry))
  }
  return handle
}

export { keyedSinglePromise, singlePromise, version }
