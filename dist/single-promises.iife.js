var singlePromises=function(n){"use strict";/*!
 * single-promises v1.0.1
 * CopyRight (c) 2023-present, luch
 * Released under the ISC License.
 * https://github.com/lei-mu/single-promises
 */const a="1.0.1";function v(d,h={}){let o={cache:0,...h},e,t=-1,i;function s(...c){const{cache:l}=o;if(l>0&&t>0){if(Date.now()-t<l)return Promise.resolve(i);t=-1,i=void 0}if(e)return e;let u;try{u=d.apply(this,c)}catch(r){return Promise.reject(r)}return e=Promise.resolve(u).then(r=>(l>0&&(t=Date.now(),i=r),e=void 0,r),r=>{throw e=void 0,r}),e}return s.clear=()=>{t=-1,i=void 0},s.update=(c={})=>{o={...o,...c}},s}return n.singlePromise=v,n.version=a,Object.defineProperty(n,Symbol.toStringTag,{value:"Module"}),n}({});
