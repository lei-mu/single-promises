(function(e,i){typeof exports=="object"&&typeof module<"u"?i(exports):typeof define=="function"&&define.amd?define(["exports"],i):(e=typeof globalThis<"u"?globalThis:e||self,i(e.singlePromises={}))})(this,function(e){"use strict";/*!
 * single-promises v1.0.0
 * CopyRight (c) 2023-present, luch
 * Released under the ISC License.
 * https://github.com/lei-mu/single-promises
 */const i="1.0.0";function f(a,t={}){const d={cache:0};let n,l=-1,s;t=Object.assign({},d,t);function r(...u){let h=this,{cache:c}=t;if(c&&l>0){if(Date.now()-l<c)return Promise.resolve(s);l=-1,s=null}return n||(n=Promise.resolve(a.apply(h,u)),n.then(o=>(c&&(l=Date.now(),s=o),n=null,o)).catch(o=>(n=null,Promise.reject(o))))}return r.clear=function(){l=-1,s=null},r.update=function(u={}){t=Object.assign({},t,u)},r}e.singlePromise=f,e.version=i,Object.defineProperty(e,Symbol.toStringTag,{value:"Module"})});
