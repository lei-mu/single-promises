"use strict";/*!
 * single-promises v1.0.1
 * CopyRight (c) 2023-present, luch
 * Released under the ISC License.
 * https://github.com/lei-mu/single-promises
 */Object.defineProperty(exports,Symbol.toStringTag,{value:"Module"});const d="1.0.1",v=d;function h(u,a={}){let n={cache:0,...a},e,t=-1,o;function i(...s){const{cache:c}=n;if(c>0&&t>0){if(Date.now()-t<c)return Promise.resolve(o);t=-1,o=void 0}if(e)return e;let l;try{l=u.apply(this,s)}catch(r){return Promise.reject(r)}return e=Promise.resolve(l).then(r=>(c>0&&(t=Date.now(),o=r),e=void 0,r),r=>{throw e=void 0,r}),e}return i.clear=()=>{t=-1,o=void 0},i.update=(s={})=>{n={...n,...s}},i}exports.singlePromise=h;exports.version=v;
