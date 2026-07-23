declare const version: string;
export interface SinglePromiseOptions {
    /** 缓存时长（毫秒），0 表示不缓存。 */
    cache?: number;
}
type AnyFunction = (this: any, ...args: any[]) => any;
export interface SinglePromiseHandler<Fn extends AnyFunction> {
    (this: ThisParameterType<Fn>, ...args: Parameters<OmitThisParameter<Fn>>): Promise<Awaited<ReturnType<Fn>>>;
    clear(): void;
    update(options?: SinglePromiseOptions): void;
}
/** 包装函数，使并发调用共享同一次执行。 */
declare function singlePromise<Fn extends AnyFunction>(fn: Fn, options?: SinglePromiseOptions): SinglePromiseHandler<Fn>;
export { singlePromise, version };
