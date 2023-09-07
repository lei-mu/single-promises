import './style.css'
// import {singlePromise} from './lib/index.js'
import {singlePromise} from './dist/single-promises.mjs'
const originLog = console.log
console.log = function () {
  originLog.apply(console, arguments)
  document.querySelector('.cmd-panel').innerHTML += `<p>${Array.from(arguments).join(' ')}</p>`

  document.querySelector('.cmd-panel').scrollTop = document.querySelector('.cmd-panel').scrollHeight
}
document.querySelector('#app').innerHTML = `
  <div>
    <div class="cmd-panel"></div>
    <div class="card">
      <button id="doGet" type="button">请求</button>
      <button id="forceDoGet" type="button">强制重新请求</button>
      <button id="updateBtn" type="button">更新配置</button>
    </div>
  
  </div>
`

const getNewToken = (...arg) => {
  console.log('请求getNewToken api的参数：', arg);
  console.log('请求了getNewToken api,时间：' + Date.now());

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('api 返回新的token：' + Date.now())
    }, 1500)
  })
}

let getClickCount = 0

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


document.querySelector('#doGet').addEventListener('click', function () {
  getClickCount++
  this.textContent = `请求${getClickCount}次`
  getToken(1, 2, 3, 4).then(res => {
    console.log(res)
  })
})
document.querySelector('#forceDoGet').addEventListener('click', () => {
  getToken.clear()
  getToken().then(res => {
    console.log(res)
  })
})
document.querySelector('#updateBtn').addEventListener('click', () => {
  getToken.update({
    cache: 0
  })
  getToken().then(res => {
    console.log(res)
  })
})

