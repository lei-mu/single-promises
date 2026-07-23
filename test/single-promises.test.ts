import { afterEach, describe, expect, it, vi } from 'vitest'
import { keyedSinglePromise, singlePromise } from '../lib'

afterEach(() => vi.useRealTimers())

describe('singlePromise', () => {
  it('并发调用只执行一次并共享结果', async () => {
    let resolve!: (value: string) => void
    const source = vi.fn(() => new Promise<string>((done) => { resolve = done }))
    const wrapped = singlePromise(source)
    const first = wrapped('first')
    const second = wrapped('second')

    expect(source).toHaveBeenCalledOnce()
    expect(source).toHaveBeenCalledWith('first')
    resolve('result')
    await expect(Promise.all([first, second])).resolves.toEqual(['result', 'result'])
  })

  it('未启用缓存时完成后可再次执行', async () => {
    const source = vi.fn(async (value: number) => value * 2)
    const wrapped = singlePromise(source)
    await expect(wrapped(2)).resolves.toBe(4)
    await expect(wrapped(3)).resolves.toBe(6)
    expect(source).toHaveBeenCalledTimes(2)
  })

  it('缓存有效期内复用结果，过期后重新执行', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
    const source = vi.fn(async () => source.mock.calls.length)
    const wrapped = singlePromise(source, { cache: 1000 })
    await expect(wrapped()).resolves.toBe(1)
    vi.advanceTimersByTime(999)
    await expect(wrapped()).resolves.toBe(1)
    vi.advanceTimersByTime(1)
    await expect(wrapped()).resolves.toBe(2)
  })

  it('clear 清除缓存，update 更新配置', async () => {
    const source = vi.fn(async () => source.mock.calls.length)
    const wrapped = singlePromise(source, { cache: 1000 })
    await expect(wrapped()).resolves.toBe(1)
    wrapped.clear()
    await expect(wrapped()).resolves.toBe(2)
    wrapped.update({ cache: 0 })
    await wrapped()
    await wrapped()
    expect(source).toHaveBeenCalledTimes(4)
  })

  it('失败不缓存且保留 this 上下文', async () => {
    const target = {
      base: 2,
      source: vi.fn()
        .mockRejectedValueOnce(new Error('失败'))
        .mockImplementation(function (this: { base: number }, value: number) { return this.base + value }),
    }
    const wrapped = singlePromise(target.source, { cache: 1000 })
    await expect(wrapped.call(target, 3)).rejects.toThrow('失败')
    await expect(wrapped.call(target, 3)).resolves.toBe(5)
    expect(target.source).toHaveBeenCalledTimes(2)
  })

  it('将同步异常转换为 rejected Promise', async () => {
    const error = new Error('同步失败')
    const wrapped = singlePromise(() => {
      throw error
    })

    const result = wrapped()

    expect(result).toBeInstanceOf(Promise)
    await expect(result).rejects.toBe(error)
  })
})

describe('keyedSinglePromise', () => {
  it('相同 key 合并执行，不同 key 独立执行', async () => {
    const resolvers = new Map<number, (value: string) => void>()
    const source = vi.fn((id: number) => new Promise<string>((resolve) => {
      resolvers.set(id, resolve)
    }))
    const wrapped = keyedSinglePromise(source, { key: (id) => id })

    const first = wrapped(1)
    const sameKey = wrapped(1)
    const otherKey = wrapped(2)

    expect(source).toHaveBeenCalledTimes(2)
    resolvers.get(1)?.('user-1')
    resolvers.get(2)?.('user-2')
    await expect(Promise.all([first, sameKey, otherKey])).resolves.toEqual(['user-1', 'user-1', 'user-2'])
  })

  it('按 key 缓存结果并在过期后重新执行', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
    const source = vi.fn(async (id: number) => `${id}-${source.mock.calls.length}`)
    const wrapped = keyedSinglePromise(source, { key: (id) => id, cache: 1000 })

    await expect(wrapped(1)).resolves.toBe('1-1')
    await expect(wrapped(2)).resolves.toBe('2-2')
    await expect(wrapped(1)).resolves.toBe('1-1')
    vi.advanceTimersByTime(1000)
    await expect(wrapped(1)).resolves.toBe('1-3')
  })

  it('clear 可清除指定 key 或全部缓存', async () => {
    const source = vi.fn(async (id: number) => source.mock.calls.length)
    const wrapped = keyedSinglePromise(source, { key: (id) => id, cache: 1000 })

    await wrapped(1)
    await wrapped(2)
    wrapped.clear(1)
    await wrapped(1)
    await wrapped(2)
    expect(source).toHaveBeenCalledTimes(3)

    wrapped.clear()
    await wrapped(1)
    await wrapped(2)
    expect(source).toHaveBeenCalledTimes(5)
  })

  it('update 更新所有 key 的缓存配置', async () => {
    const source = vi.fn(async (id: number) => id)
    const wrapped = keyedSinglePromise(source, { key: (id) => id, cache: 1000 })

    await wrapped(1)
    wrapped.update({ cache: 0 })
    await wrapped(1)
    await wrapped(1)
    expect(source).toHaveBeenCalledTimes(3)
  })

  it('失败不缓存，并保留 fn 和 key 的 this 上下文', async () => {
    const target = {
      prefix: 'user',
      source: vi.fn()
        .mockRejectedValueOnce(new Error('失败'))
        .mockImplementation(function (this: { prefix: string }, id: number) {
          return `${this.prefix}-${id}`
        }),
      getKey(this: { prefix: string }, id: number) {
        return `${this.prefix}-${id}`
      },
    }
    const wrapped = keyedSinglePromise(target.source, { key: target.getKey, cache: 1000 })

    await expect(wrapped.call(target, 1)).rejects.toThrow('失败')
    await expect(wrapped.call(target, 1)).resolves.toBe('user-1')
    expect(target.source).toHaveBeenCalledTimes(2)
  })
})
