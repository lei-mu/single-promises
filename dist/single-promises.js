"use strict";/*!
 * single-promises v1.0.1
 * CopyRight (c) 2023-present, luch
 * Released under the ISC License.
 * https://github.com/lei-mu/single-promises
 */Object.defineProperty(exports,Symbol.toStringTag,{value:"Module"});const f="1.0.1";function h(u,n={}){const o={cache:0};let e,t=-1,l;n=Object.assign({},o,n);function i(...s){let a=this,{cache:c}=n;if(c&&t>0){if(Date.now()-t<c)return Promise.resolve(l);t=-1,l=null}return e||(e=Promise.resolve(u.apply(a,s)),e.then(r=>(c&&(t=Date.now(),l=r),e=null,r)).catch(r=>(e=null,Promise.reject(r))))}return i.clear=function(){t=-1,l=null},i.update=function(s={}){n=Object.assign({},n,s)},i}exports.singlePromise=h;exports.version=f;
