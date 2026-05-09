import { version } from '../package.json';
export interface SinglePromiseOptions {
    /** Cache duration in milliseconds, default is 0 (no cache). */
    cache?: number;
}
export interface SinglePromiseHandler<T extends any[], R> {
    (this: any, ...args: T): Promise<R>;
    clear: () => void;
    update: (newOpt?: SinglePromiseOptions) => void;
}
declare function singlePromise<F extends (...args: any[]) => any>(fn: F, opt?: SinglePromiseOptions): SinglePromiseHandler<Parameters<F>, Awaited<ReturnType<F>>>;
export { singlePromise, version };
