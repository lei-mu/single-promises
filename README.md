# single-promises

[![npm](https://img.shields.io/npm/l/single-promises "npm")](https://www.npmjs.com/package/single-promises "npm")
[![npm](https://img.shields.io/npm/v/single-promises "npm")](https://www.npmjs.com/package/single-promises "npm")
[![github](https://img.shields.io/github/package-json/v/lei-mu/single-promises "github")](https://github.com/lei-mu/single-promises "github")
[![github stars](https://img.shields.io/github/stars/lei-mu/single-promises.svg "github stars")](https://github.com/lei-mu/single-promises "github stars")

生成一个单例模式的promise 调用函数。

简体中文 | [English ](./README_EN.md)

## 使用

### npm

````cmd
npm install single-promises -S
````

import

```` js
import {singlePromise, version} from 'single-promises'
````

require

```` js
const {singlePromise, version} = require('single-promises')
````



### CDN

jsDelivr CDN

```` js
<script src="https://cdn.jsdelivr.net/npm/single-promises@1.0.0/dist/single-promises.iife.js"></script>
````

unpkg CDN

```` js
<script src="https://unpkg.com/single-promises@1.0.0/dist/single-promises.iife.js"></script>
````

```` js
<script>
    const { singlePromise, version } = singlePromises
</script>
````



## Example

### test

```` js
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
// 输出5遍结果,但只获取了一次当前时间
````





### access_token 无痛刷新

实际的实现比这个更加复杂，这里只做关键代码的示例。

```` js
import axios from 'axios'
import { singlePromise } from 'single-promises'
import Cookies from 'js-cookie'

const http = axios.create({})

const getAccessToken = (refreshToken) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('新的access token：' + Date.now())
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
````

### 多组件api

多个组件同时获取用户信息，使用singlePromise 包装，只需要调用一次。

```` js
// api.js
// 多次调用，在api 请求未响应前，只会调用一次api请求，请求响应后会把api 响应结果响应给对应的调用。调用结束后 1000 ms 内，再次调用会直接返回上次调用的结果，不会再次调用api 请求。调用结束后 1000 ms 后，再次调用会直接调用api请求
const getUserInfo = singlePromise((params) => axios.get('api/userInfo', {params}), {cache: 1000})
````

````vue
<script>
/** Header.vue **/
{
    created () {
    	getUserInfo()
    }
}
</script>
````
````vue
<script>
/** Footer.vue **/
{
    created () {
    	getUserInfo()
    }
}
</script>
````
````vue
<script>
/** Article.vue **/
{
    created () {
    	getUserInfo()
    }
}
</script>
````
````vue
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
````

多个组件同时调用，只会调用一次api 请求



## API

### singlePromise

第一个参数接收一个函数，第二个参数接收一个配置项对象。返回一个函数。

singlePromise(fn[, options])

Return: `Function`

#### fn

Type: `Function`

要调用的函数。当执行返回的函数时，`this`上下文和所有参数将按原样传递给 `fn`。fn 函数可以返回promise,或其他，因为在`singlePromise `函数内部，`fn`函数将被`Promise.resolve` 函数包裹。

#### options

Type: `Object`

Default: `{cache: 0}`

可选。配置项

#### options.cache

Type: `Number`

Default: `0`

`fn`函数返回结果后的缓存时间,单位`ms`。在缓存时间内，下次调用将直接返回缓存的结果。默认0 不缓存。缓存时间从`fn` 函数返回`fulfilled`状态开始算起，如果`fn`函数返回`rejected`状态则不缓存。

#### 返回函数

```` js
const handle = singlePromise(() => Promise.resolve('response'), {cache: 1500})
````

Return: `Promise`

handle 函数调用返回一个promise, 这个promise的 `fulfilled`/ `rejected` 状态取决于 `fn`函数返回的`promise` 的状态。当执行`handle` 函数时，`this`上下文和所有参数将按原样传递给 `fn`

#### handle.clear

Type: `Function`

清除缓存结果函数。调用将清除上次的缓存结果。

#### handle.update

Type: `Function`

handle.update(options)

更新`options`函数。`handle.update({cache: 1000})`,调用后将更新handle 的配置。



### version

当前包的版本号



## 常见问题


### 如果在vue 使用

注意：需要在 `data` 配置项 调用创建，不然会丢失 `handle.clear`、`handle.update` 方法

```` vue
<script>
// vue2
import { singlePromise } from 'single-promises'
{
	data () {
		return {
            	singleGetUserInfo: singlePromise((params) => axios.get('api/userInfo', {params}), {cache: 1000})
			}
	}
}
</script>
````



### 与`throttle`  、`debounce` 的区别

throttle/debounce 都取决于指定时间内做什么事，而singlePromise 取决于 `fn`函数返回的promise `pending` 状态时做什么事
