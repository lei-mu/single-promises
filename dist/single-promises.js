"use strict";/*!
 * single-promises v1.0.1
 * CopyRight (c) 2023-present, luch
 * Released under the ISC License.
 * https://github.com/lei-mu/single-promises
 */Object.defineProperty(exports,Symbol.toStringTag,{value:"Module"});const f="1.0.1";function m(s,u={}){const o={cache:0,...u};let e=null,n=-1,r=null;function l(...c){const a=this,{cache:i}=o;if(i&&n>0){if(Date.now()-n<i)return Promise.resolve(r);n=-1,r=null}if(e)return e;try{e=Promise.resolve(s.apply(a,c)).then(t=>(i&&(n=Date.now(),r=t),e=null,t)).catch(t=>(e=null,Promise.reject(t)))}catch(t){return Promise.reject(t)}return e}return l.clear=function(){n=-1,r=null},l.update=function(c={}){Object.assign(o,c)},l}exports.singlePromise=m;exports.version=f;
