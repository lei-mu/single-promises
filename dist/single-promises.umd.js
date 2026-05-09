(function(e,i){typeof exports=="object"&&typeof module<"u"?i(exports):typeof define=="function"&&define.amd?define(["exports"],i):(e=typeof globalThis<"u"?globalThis:e||self,i(e.singlePromises={}))})(this,function(e){"use strict";/*!
 * single-promises v1.0.1
 * CopyRight (c) 2023-present, luch
 * Released under the ISC License.
 * https://github.com/lei-mu/single-promises
 */const i="1.0.1";function f(a,d={}){const u={cache:0,...d};let n=null,r=-1,o=null;function s(...l){const m=this,{cache:c}=u;if(c&&r>0){if(Date.now()-r<c)return Promise.resolve(o);r=-1,o=null}if(n)return n;try{n=Promise.resolve(a.apply(m,l)).then(t=>(c&&(r=Date.now(),o=t),n=null,t)).catch(t=>(n=null,Promise.reject(t)))}catch(t){return Promise.reject(t)}return n}return s.clear=function(){r=-1,o=null},s.update=function(l={}){Object.assign(u,l)},s}e.singlePromise=f,e.version=i,Object.defineProperty(e,Symbol.toStringTag,{value:"Module"})});
