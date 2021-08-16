import{getCommittedValue as l,insertPart as i,removePart as n,setChildPartValue as o,setCommittedValue as f}from"../directive-helpers.js";
import{directive as s,Directive as t,PartType as r}from"../directive.js";
import{noChange as e}from"../lit-html.js";

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const u=(e,s,t)=>{const r=new Map;for(let l=s;l<=t;l++)r.set(e[l],l);return r},c=s(class extends t{constructor(e){if(super(e),e.type!==r.CHILD)throw Error("repeat() can only be used in text expressions")}Mt(e,s,t){let r;void 0===t?t=s:void 0!==s&&(r=s);const l=[],o=[];let i=0;for(const s of e)l[i]=r?r(s,i):i,o[i]=t(s,i),i++;return{values:o,keys:l}}render(e,s,t){return this.Mt(e,s,t).values}update(s,[t,r,c]){var d;const p=l(s),{values:v,keys:a}=this.Mt(t,r,c);if(!p)return this.Pt=a,v;const h=null!==(d=this.Pt)&&void 0!==d?d:this.Pt=[],m=[];let x,y,j=0,k=p.length-1,w=0,b=v.length-1;for(;j<=k&&w<=b;)if(null===p[j])j++;else if(null===p[k])k--;else if(h[j]===a[w])m[w]=o(p[j],v[w]),j++,w++;else if(h[k]===a[b])m[b]=o(p[k],v[b]),k--,b--;else if(h[j]===a[b])m[b]=o(p[j],v[b]),i(s,m[b+1],p[j]),j++,b--;else if(h[k]===a[w])m[w]=o(p[k],v[w]),i(s,p[j],p[k]),k--,w++;else if(void 0===x&&(x=u(a,w,b),y=u(h,j,k)),x.has(h[j]))if(x.has(h[k])){const e=y.get(a[w]),t=void 0!==e?p[e]:null;if(null===t){const e=i(s,p[j]);o(e,v[w]),m[w]=e}else m[w]=o(t,v[w]),i(s,p[j],t),p[e]=null;w++}else n(p[k]),k--;else n(p[j]),j++;for(;w<=b;){const e=i(s,m[b+1]);o(e,v[w]),m[w++]=e}for(;j<=k;){const e=p[j++];null!==e&&n(e)}return this.Pt=a,f(s,m),e}});export{c as repeat};
//# sourceMappingURL=repeat.js.map
