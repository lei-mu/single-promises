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
<script src="https://cdn.jsdelivr.net/npm/single-promises@1.0.0/dist/single-promises.iife.js"></script>
```

unpkg CDN

```js
<script src="https://unpkg.com/single-promises@1.0.0/dist/single-promises.iife.js"></script>
```

```js
<script>
    const { singlePromise, version } = singlePromises
</script>
```

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

The function to be called. When executing the returned function, the `this` context and all parameters will be passed to `fn` as they are. The `fn` function can return a promise or anything else because inside the `singlePromise` function, the `fn` function will be wrapped with `Promise.resolve`.

#### options

Type: `Object`

Default: `{cache: 0}`

Optional. Configuration options.

#### options.cache

Type: `Number`

Default: `0`

The caching time for the result after `fn` function returns, in milliseconds. Within the cache time, the next call will directly return the cached result. Default is 0 (no caching). The cache time starts from the moment the `fn` function returns a `fulfilled` state, and if the `fn` function returns a `rejected` state, it won't be cached.

#### Returned Function

```js
const handle = singlePromise(() => Promise.resolve('response'), {cache: 1500})
```

Return: `Promise`

The `handle` function call returns a promise, and its `fulfilled`/`rejected` state depends on the state of the promise returned by the `fn` function. When you execute the `handle` function, the `this` context and all parameters will be passed to `fn`.

#### handle.clear

Type: `Function`

Function to clear the cached result. Calling this will clear the previous cached result.

#### handle.update

Type: `Function`

handle.update(options)

Update the options of the handle. For example, `handle.update({cache: 1000})` will update the handle's configuration.

### version

The current version number of the package.

## Frequently Asked Questions

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



> Note: Translated by ChatGpt 3.5