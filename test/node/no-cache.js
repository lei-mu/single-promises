const { singlePromise} = require('../../dist/single-promises.js')


const getTokenTime = 1500
const getNewToken = (...arg) => {
  console.log('请求getNewToken的参数：', arg);
  console.log('请求了getNewToken,时间：' + Date.now());

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('新的token：' + Date.now())
    }, getTokenTime)
  })
}

const getToken = singlePromise(getNewToken, {
  cache: 0
})
const updateCacheTime = (time = 0) => {
  console.log('更新数据缓存时间：' + time);
  getToken.update({
    cache: time
  })
}
updateCacheTime()

let allToken = []
for (let i = 0; i < 5; i++) {
  console.log('调用了getToken' +i);
  getToken(i).then(res => {
    console.log('获取的token 是一样的' + res);
    allToken.push(res)
  })
}

const allSame = (arr) => {
  return arr.every((item, index) => {
    return item === arr[0]
  })
}
setTimeout(() => {
  console.log('allToken check', allSame(allToken));
}, getTokenTime + 500)

setTimeout(() => {
  getToken().then(res => {
    console.log('重新获取新的token：' + res);
  })
}, getTokenTime + 1000)
