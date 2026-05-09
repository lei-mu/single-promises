var singlePromises=function(t){"use strict";/*!
 * single-promises v1.0.1
 * CopyRight (c) 2023-present, luch
 * Released under the ISC License.
 * https://github.com/lei-mu/single-promises
 */const s="1.0.1";function a(f,m={}){const u={cache:0,...m};let e=null,r=-1,i=null;function l(...c){const h=this,{cache:o}=u;if(o&&r>0){if(Date.now()-r<o)return Promise.resolve(i);r=-1,i=null}if(e)return e;try{e=Promise.resolve(f.apply(h,c)).then(n=>(o&&(r=Date.now(),i=n),e=null,n)).catch(n=>(e=null,Promise.reject(n)))}catch(n){return Promise.reject(n)}return e}return l.clear=function(){r=-1,i=null},l.update=function(c={}){Object.assign(u,c)},l}return t.singlePromise=a,t.version=s,Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),t}({});
