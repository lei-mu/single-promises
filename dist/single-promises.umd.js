(function(e,o){typeof exports=="object"&&typeof module<"u"?o(exports):typeof define=="function"&&define.amd?define(["exports"],o):(e=typeof globalThis<"u"?globalThis:e||self,o(e.singlePromises={}))})(this,function(e){"use strict";/*!
 * single-promises v1.0.2.alpha.0
 * CopyRight (c) 2023-present, luch
 * Released under the ISC License.
 * https://github.com/lei-mu/single-promises
 */const f="1.0.2.alpha.0";function a(h,p={}){let s={cache:0,...p},n,i=-1,r;function c(...d){const{cache:l}=s;if(l>0&&i>0){if(Date.now()-i<l)return Promise.resolve(r);i=-1,r=void 0}if(n)return n;let u;try{u=h.apply(this,d)}catch(t){return Promise.reject(t)}return n=Promise.resolve(u).then(t=>(l>0&&(i=Date.now(),r=t),n=void 0,t),t=>{throw n=void 0,t}),n}return c.clear=()=>{i=-1,r=void 0},c.update=(d={})=>{s={...s,...d}},c}e.singlePromise=a,e.version=f,Object.defineProperty(e,Symbol.toStringTag,{value:"Module"})});
