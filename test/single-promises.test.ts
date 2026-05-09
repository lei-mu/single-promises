import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { singlePromise, version } from '../lib/index'

describe('singlePromise', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('dedup', () => {
    it('concurrent calls share the same pending promise, fn invoked once', async () => {
      let callCount = 0
      const fn = () =>
        new Promise<string>((resolve) => {
          callCount++
          setTimeout(() => resolve('result'), 1000)
        })

      const wrapped = singlePromise(fn)

      const results: Promise<string>[] = []
      for (let i = 0; i < 5; i++) {
        results.push(wrapped())
      }

      await vi.runAllTimersAsync()

      const values = await Promise.all(results)
      expect(callCount).toBe(1)
      const allSame = values.every((v) => v === values[0])
      expect(allSame).toBe(true)
    })

    it('all callers get the fulfilled value, not just the first', async () => {
      let callCount = 0
      const fn = () =>
        new Promise<number>((resolve) => {
          callCount++
          setTimeout(() => resolve(42), 500)
        })

      const wrapped = singlePromise(fn)

      const p1 = wrapped()
      const p2 = wrapped()
      const p3 = wrapped()

      await vi.runAllTimersAsync()

      expect(callCount).toBe(1)
      expect(await p1).toBe(42)
      expect(await p2).toBe(42)
      expect(await p3).toBe(42)
    })
  })

  describe('cache', () => {
    it('returns cached result within cache window without invoking fn', async () => {
      let callCount = 0
      const fn = () =>
        new Promise<string>((resolve) => {
          callCount++
          setTimeout(() => resolve('cached'), 100)
        })

      const wrapped = singlePromise(fn, { cache: 1000 })

      // First call
      const p1 = wrapped()
      await vi.runAllTimersAsync()
      const result1 = await p1
      expect(callCount).toBe(1)
      expect(result1).toBe('cached')

      // Within cache window
      const p2 = wrapped()
      const result2 = await p2
      expect(callCount).toBe(1) // still 1
      expect(result2).toBe('cached')
    })

    it('invokes fn again after cache expires', async () => {
      let callCount = 0
      const fn = () =>
        new Promise<string>((resolve) => {
          callCount++
          setTimeout(() => resolve(`result-${callCount}`), 100)
        })

      const wrapped = singlePromise(fn, { cache: 500 })

      // First call
      const p1 = wrapped()
      await vi.runAllTimersAsync()
      await p1
      expect(callCount).toBe(1)

      // Advance past cache window
      vi.advanceTimersByTime(600)

      // New call should invoke fn again
      const p2 = wrapped()
      await vi.runAllTimersAsync()
      const result2 = await p2
      expect(callCount).toBe(2)
      expect(result2).toBe('result-2')
    })

    it('concurrent calls during cache window all return cached result', async () => {
      let callCount = 0
      const fn = () =>
        new Promise<string>((resolve) => {
          callCount++
          setTimeout(() => resolve('data'), 100)
        })

      const wrapped = singlePromise(fn, { cache: 2000 })

      // First call
      const p0 = wrapped()
      await vi.runAllTimersAsync()
      await p0
      expect(callCount).toBe(1)

      // Multiple concurrent calls within cache window
      const p1 = wrapped()
      const p2 = wrapped()
      const p3 = wrapped()

      const results = await Promise.all([p1, p2, p3])
      expect(callCount).toBe(1) // still 1
      expect(results).toEqual(['data', 'data', 'data'])
    })
  })

  describe('rejection', () => {
    it('rejected promise is not cached', async () => {
      let callCount = 0
      const fn = () => {
        callCount++
        return Promise.reject(new Error('fail'))
      }

      const wrapped = singlePromise(fn, { cache: 5000 })

      await expect(wrapped()).rejects.toThrow('fail')
      expect(callCount).toBe(1)

      // Not cached — next call invokes fn again
      await expect(wrapped()).rejects.toThrow('fail')
      expect(callCount).toBe(2)
    })

    it('clears in-flight state on rejection so subsequent call works', async () => {
      let shouldFail = true
      const fn = () => {
        if (shouldFail) {
          return Promise.reject(new Error('fail'))
        }
        return Promise.resolve('success')
      }

      const wrapped = singlePromise(fn)

      await expect(wrapped()).rejects.toThrow('fail')
      shouldFail = false
      const result = await wrapped()
      expect(result).toBe('success')
    })
  })

  describe('clear', () => {
    it('handle.clear() removes cached result', async () => {
      let callCount = 0
      const fn = () =>
        new Promise<string>((resolve) => {
          callCount++
          setTimeout(() => resolve('data'), 100)
        })

      const wrapped = singlePromise(fn, { cache: 5000 })

      const p1 = wrapped()
      await vi.runAllTimersAsync()
      await p1
      expect(callCount).toBe(1)

      // Cache hit
      await wrapped()
      expect(callCount).toBe(1)

      // Clear cache
      wrapped.clear()

      // Should invoke fn again
      const p2 = wrapped()
      await vi.runAllTimersAsync()
      await p2
      expect(callCount).toBe(2)
    })
  })

  describe('update', () => {
    it('handle.update() changes cache duration', async () => {
      let callCount = 0
      const fn = () =>
        new Promise<string>((resolve) => {
          callCount++
          setTimeout(() => resolve('data'), 100)
        })

      const wrapped = singlePromise(fn, { cache: 5000 })

      const p1 = wrapped()
      await vi.runAllTimersAsync()
      await p1
      expect(callCount).toBe(1)

      // Update to disable cache
      wrapped.update({ cache: 0 })

      // Should invoke fn again immediately (no cache)
      const p2 = wrapped()
      await vi.runAllTimersAsync()
      await p2
      expect(callCount).toBe(2)
    })

    it('handle.update() with empty object preserves settings', async () => {
      let callCount = 0
      const fn = () =>
        new Promise<string>((resolve) => {
          callCount++
          setTimeout(() => resolve('data'), 100)
        })

      const wrapped = singlePromise(fn, { cache: 5000 })

      const p1 = wrapped()
      await vi.runAllTimersAsync()
      await p1
      expect(callCount).toBe(1)

      // Update with empty — cache should still work
      wrapped.update({})

      await wrapped()
      expect(callCount).toBe(1) // cached
    })
  })

  describe('sync functions', () => {
    it('wraps sync function return value as promise', async () => {
      const fn = (a: number, b: number) => a + b
      const wrapped = singlePromise(fn)

      const result = await wrapped(1, 2)
      expect(result).toBe(3)
    })

    it('sync functions are deduped', async () => {
      let callCount = 0
      const fn = () => {
        callCount++
        return 'sync-result'
      }

      const wrapped = singlePromise(fn)

      const results = await Promise.all([wrapped(), wrapped(), wrapped()])
      expect(callCount).toBe(1)
      expect(results).toEqual(['sync-result', 'sync-result', 'sync-result'])
    })
  })

  describe('this context', () => {
    it('preserves this context when calling wrapped function', async () => {
      const obj = {
        value: 42,
        getValue() {
          return Promise.resolve(this.value)
        },
      }

      const wrapped = singlePromise(obj.getValue)
      const result = await wrapped.call(obj)
      expect(result).toBe(42)
    })
  })

  describe('arguments', () => {
    it('passes arguments through to the wrapped function', async () => {
      const fn = (a: number, b: number, c: number) =>
        Promise.resolve(a + b + c)

      const wrapped = singlePromise(fn)
      const result = await wrapped(1, 2, 3)
      expect(result).toBe(6)
    })

    it('different arguments share the same promise during pending', async () => {
      let receivedArgs: number[][] = []
      const fn = (...args: number[]) =>
        new Promise<number>((resolve) => {
          receivedArgs.push(args)
          setTimeout(() => resolve(args.reduce((a, b) => a + b, 0)), 100)
        })

      const wrapped = singlePromise(fn)

      const p1 = wrapped(1, 2) // first call sets the args
      const p2 = wrapped(3, 4) // ignored, shares first promise

      await vi.runAllTimersAsync()

      const r1 = await p1
      const r2 = await p2

      expect(receivedArgs.length).toBe(1)
      expect(receivedArgs[0]).toEqual([1, 2])
      expect(r1).toBe(3)
      expect(r2).toBe(3) // same as first caller
    })
  })

  describe('version', () => {
    it('exports version string', () => {
      expect(typeof version).toBe('string')
      expect(version).toMatch(/^\d+\.\d+\.\d+/)
    })
  })
})
