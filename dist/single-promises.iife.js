var singlePromises=function(t){"use strict";/*!
 * single-promises v1.0.0
 * CopyRight (c) 2023-present, luch
 * Released under the ISC License.
 * https://github.com/lei-mu/single-promises
 */const a="1.0.0";function o(f,n={}){const h={cache:0};let e,l=-1,i;n=Object.assign({},h,n);function s(...c){let m=this,{cache:u}=n;if(u&&l>0){if(Date.now()-l<u)return Promise.resolve(i);l=-1,i=null}return e||(e=Promise.resolve(f.apply(m,c)),e.then(r=>(u&&(l=Date.now(),i=r),e=null,r)).catch(r=>(e=null,Promise.reject(r))))}return s.clear=function(){l=-1,i=null},s.update=function(c={}){n=Object.assign({},n,c)},s}return t.singlePromise=o,t.version=a,Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),t}({});
