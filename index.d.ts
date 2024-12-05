
declare module 'single-promises' {
    export const version: string;
  
    export interface SinglePromiseOptions {
      /** Cache duration in milliseconds, default is 0 (no cache). */
      cache?: number;
    }
  
    type AsyncFunction<T extends any[], R> = (...args: T) => Promise<R>;
    type SyncFunction<T extends any[], R> = (...args: T) => R;
  
    interface SinglePromiseHandler<T extends any[], R> {
      /** Clears the cached result. */
      clear: () => void;
      /** Updates the cache options. */
      update: (newOpt?: SinglePromiseOptions) => void;
      /** The function itself that returns a promise. */
      (...args: T): Promise<R>;
    }
  
    function singlePromise<F extends SyncFunction<any[], any> | AsyncFunction<any[], any>>(
      fn: F, 
      opt?: SinglePromiseOptions
    ): SinglePromiseHandler<Parameters<F>, Awaited<ReturnType<F>>>;
  
    export { singlePromise };
  }