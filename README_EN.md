# single-promises

[![npm](https://img.shields.io/npm/l/single-promises "npm")](https://www.npmjs.com/package/single-promises "npm")
[![npm](https://img.shields.io/npm/v/single-promises "npm")](https://www.npmjs.com/package/single-promises "npm")
[![github](https://img.shields.io/github/package-json/v/lei-mu/single-promises "github")](https://github.com/lei-mu/single-promises "github")
[![github stars](https://img.shields.io/github/stars/lei-mu/single-promises.svg "github stars")](https://github.com/lei-mu/single-promises "github stars")

Generating a Singleton Promise Calling Function



[简体中文](./README.md) | English

### Usage

#### npm

```cmd
npm install single-promises -S
```

Import

```js
import { singlePromise, version } from 'single-promises'
```

Require

```js
const { singlePromise, version } = require('single-promises')
```

#### CDN

jsDelivr CDN

```js
<script src="https://cdn.jsdelivr.net/npm/single-promises@latest/dist/single-promises.iife.js"></script>
```

unpkg CDN

```js
<script src="https://unpkg.com/single-promises@latest/dist/single-promises.iife.js"></script>
```

```js
<script>
    const { singlePromise, version } = singlePromises
</script>
```

`@latest` always points to the latest npm release and is convenient for quick evaluation. In production, replace `latest` with a version you have tested to avoid unexpected compatibility changes.

## Example

### Test

```js
import { singlePromise } from 'single-promises'
const getTime = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(Date.now())
    }, 1000)
  })
}

const singleGetTime = singlePromise(getTime)

for (let i = 0; i < 5; i++) {
  singleGetTime().then(res => {
    console.log('res', res)
  })
}
// res 1694058404950
// res 1694058404950
// res 1694058404950
// res 1694058404950
// res 1694058404950
// Outputs the result 5 times but only fetches the current time once
```

### TypeScript

`singlePromise` preserves the parameter and return types of the original function:

```ts
interface User {
  id: number
  name: string
}

const getUser = singlePromise(
  async (id: number): Promise<User> => {
    return {
      id,
      name: 'Tom'
    }
  }
)

const user = await getUser(1) // User
```

Type hints may display a TypeScript `this` parameter. It is only used to type-check the calling context and is not an actual argument.

### Access Token Refresh Without Hassle

The actual implementation is more complex than this; here's just an example of key code:

```js
import axios from 'axios'
import { singlePromise } from 'single-promises'
import Cookies from 'js-cookie'

const http = axios.create({})

const getAccessToken = (refreshToken) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('New access token: ' + Date.now())
    }, 1500)
  })
}

const singleGetAccessToken = singlePromise(getAccessToken)

http.interceptors.request.use(async config => {
  const token = Cookies.get('access_token')
  if (!token) {
    const refreshToken = Cookies.get('refresh_token')
    const res = await singleGetAccessToken(refreshToken)
    Cookies.set('access_token', res)
  }
  return config
})
```

### Multiple Component APIs

Multiple components simultaneously request user information, using `singlePromise` for wrapping, and it only needs to be called once.

```js
// api.js
// Called multiple times, only one API request will be made until the API response is received. Within 1000 ms after the call ends, a subsequent call will return the previous call's result without making another API request. After 1000 ms, a subsequent call will trigger a new API request.
const getUserInfo = singlePromise((params) => axios.get('api/userInfo', {params}), {cache: 1000})
```

```vue
<script>
/** Header.vue **/
{
    created () {
    	getUserInfo()
    }
}
</script>
```

```vue
<script>
/** Footer.vue **/
{
    created () {
    	getUserInfo()
    }
}
</script>
```

```vue
<script>
/** Article.vue **/
{
    created () {
    	getUserInfo()
    }
}
</script>
```

```vue
<template>
<div>
    <Header/>
	<Article/>
	<Footer/>
</div>

</template>
<script>
/** Layout.vue **/
{
    created () {
    	getUserInfo()
    }
}
</script>
```

Multiple components simultaneously call it, and only one API request will be made.

## API

### singlePromise

The first parameter receives a function, and the second parameter receives a configuration object. It returns a function.

singlePromise(fn[, options])

Return: `Function`

#### fn

Type: `Function`

The function to call. Its `this` context and arguments are forwarded unchanged. `fn` may return a Promise or a synchronous value; the result is always converted to a Promise. A synchronously thrown error becomes a rejected Promise.

```ts
const add = singlePromise((left: number, right: number) => left + right)

await add(1, 2) // 3

const failed = singlePromise(() => {
  throw new Error('Calculation failed')
})

await failed().catch(error => {
  console.log(error.message) // Calculation failed
})
```

#### options

Type: `Object`

Default: `{cache: 0}`

Optional. Configuration options.

#### options.cache

Type: `Number`

Default: `0`

The caching time for the result after `fn` function returns, in milliseconds. Within the cache time, the next call will directly return the cached result. Default is 0 (no caching). The cache time starts from the moment the `fn` function returns a `fulfilled` state, and if the `fn` function returns a `rejected` state, it won't be cached.

#### Cache Notes and Best Practices

- The cached value is stored in the returned function's closure and may stay in memory while that function remains reachable.
- In an SPA, route navigation does not reset the JavaScript runtime. A handle exported from a shared module therefore keeps its cache across pages.
- Cache expiration is checked on the next call; the current implementation does not release the result automatically when the duration elapses. Call `handle.clear()` when immediate cleanup is required.
- Each `singlePromise` instance stores at most one fulfilled result, so entries do not accumulate with every call. Explicit cleanup is still recommended for large results.
- Clear page-specific caches when the page or component is destroyed. Do not let one page clear a cache intentionally shared by multiple pages.
- Rejected results are not cached. A Promise that never settles can retain related references indefinitely, so configure timeout or cancellation behavior in the request layer.

A cached object is an ordinary strong reference to the same object instance. Calls that hit the cache receive the same object, so mutating it can affect other callers:

```js
const getUser = singlePromise(
  () => Promise.resolve({ name: 'Tom', roles: ['user'] }),
  { cache: 1000 }
)

const first = await getUser()
const second = await getUser()

first.name = 'Jerry'
console.log(second.name) // Jerry
```

Treat cached results as read-only. If mutation is necessary, create a deep copy first:

```js
const cachedUser = await getUser()
const editableUser = structuredClone(cachedUser)

editableUser.name = 'Jerry'
```

`structuredClone` works with cloneable data. Choose an appropriate copy strategy for functions, DOM nodes, or other non-cloneable values.

#### Returned Function

```js
const handle = singlePromise(() => Promise.resolve('response'), {cache: 1500})
```

Return: `Promise`

The `handle` function call returns a promise, and its `fulfilled`/`rejected` state depends on the state of the promise returned by the `fn` function. When you execute the `handle` function, the `this` context and all parameters will be passed to `fn`.

#### handle.clear

Type: `Function`

Clears the current fulfilled result so that the next call executes `fn` again.

`handle.clear()` does not cancel a pending Promise or change a Promise already returned to a caller. If a task is pending when `clear()` is called, it may still cache its result according to the options captured when that task started. Cancellation must be implemented by the wrapped function, for example with `AbortController`.

#### handle.update

Type: `Function`

handle.update(options)

Updates options used by subsequent calls:

```ts
handle.update({ cache: 1000 })
```

`update()` does not execute `fn`, cancel a pending Promise, or clear an existing cached value. A task that has already started uses the cache options captured at its start. Call `handle.clear()` as well if an existing cached value must be discarded immediately.

### version

The current version number of the package.

## Frequently Asked Questions

### What Happens When Concurrent Calls Use Different Arguments?

Arguments are not compared while a Promise is pending. Later calls share the Promise created by the first call:

```ts
const getUser = singlePromise((id: number) => requestUser(id))

getUser(1)
getUser(2) // Shares the result of the id=1 request
```

To merge calls separately by multiple arguments, keep one handle per argument combination in a `Map`:

```ts
type UserType = 'basic' | 'detail'

const createHandle = (userId: number, type: UserType) => {
  return singlePromise(() => requestUser(userId, type), { cache: 1000 })
}
const handles = new Map<string, ReturnType<typeof createHandle>>()

function getUser(userId: number, type: UserType) {
  const key = `${userId}:${type}`
  let handle = handles.get(key)
  if (!handle) {
    handle = createHandle(userId, type)
    handles.set(key, handle)
  }
  return handle()
}
```

If the number of argument combinations can grow continuously, call `handle.clear()` and delete unused entries from the `Map`. Avoid using `JSON.stringify` as a universal key generator for arbitrary arguments.

### When Using in Vue

Note: You need to create it in the `data` configuration to retain the `handle.clear` and `handle.update` methods; otherwise, they will be lost.

```vue
<script>
// Vue 2
import { singlePromise } from 'single-promises'
{
	data () {
		return {
            	singleGetUserInfo: singlePromise((params) => axios.get('api/userInfo', {params}), {cache: 1000})
			}
	}
}
</script>
```

### Difference from `throttle` and `debounce`

Throttle/debounce depend on what to do within a specified time, while `singlePromise` depends on what to do when the promise returned by the `fn` function is in the `pending` state.
