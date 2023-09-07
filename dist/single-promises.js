"use strict";/*!
 * single-promises v0.0.0-alpha.2
 * CopyRight (c) 2023-present, luch
 * Released under the ISC License.
 * https://github.com/lei-mu/single-promises
 */Object.defineProperty(exports,Symbol.toStringTag,{value:"Module"});const f="0.0.0-alpha.2";function h(u,n={}){const a={cache:0};let e,l=-1,t;n=Object.assign({},a,n);function i(...s){let o=this,{cache:c}=n;if(c&&l>0){if(Date.now()-l<c)return Promise.resolve(t);l=-1,t=null}return e||(e=Promise.resolve(u.apply(o,s)),e.then(r=>(c&&(l=Date.now(),t=r),e=null,r)).catch(r=>(e=null,Promise.reject(r))))}return i.clear=function(){l=-1,t=null},i.update=function(s={}){n=Object.assign({},n,s)},i}exports.singlePromise=h;exports.version=f;
