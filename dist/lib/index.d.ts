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
export interface KeyedSinglePromiseOptions<Fn extends AnyFunction, Key> extends SinglePromiseOptions {
    /** 根据调用参数生成用于合并请求的 key。 */
    key(this: ThisParameterType<Fn>, ...args: Parameters<OmitThisParameter<Fn>>): Key;
}
export interface KeyedSinglePromiseHandler<Fn extends AnyFunction, Key> {
    (this: ThisParameterType<Fn>, ...args: Parameters<OmitThisParameter<Fn>>): Promise<Awaited<ReturnType<Fn>>>;
    clear(): void;
    clear(key: Key): void;
    update(options?: SinglePromiseOptions): void;
}
/** 包装函数，使并发调用共享同一次执行。 */
declare function singlePromise<Fn extends AnyFunction>(fn: Fn, options?: SinglePromiseOptions): SinglePromiseHandler<Fn>;
/** 按 key 合并并发调用，不同 key 之间相互独立。 */
declare function keyedSinglePromise<Fn extends AnyFunction, Key>(fn: Fn, options: KeyedSinglePromiseOptions<Fn, Key>): KeyedSinglePromiseHandler<Fn, Key>;
export { keyedSinglePromise, singlePromise, version };
