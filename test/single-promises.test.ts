import { afterEach, describe, expect, it, vi } from 'vitest'
import { singlePromise } from '../lib'

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
