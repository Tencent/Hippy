import{AsyncDirective as i}from"../async-directive.js";
import{isPrimitive as s}from"../directive-helpers.js";
import{directive as r}from"../directive.js";
import{noChange as t}from"../lit-html.js";

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const e=t=>!s(t)&&"function"==typeof t.then,o=r(class extends i{constructor(){super(...arguments),this.Ct=2147483647,this.Rt=[]}render(...r){var s;return null!==(s=r.find((t=>!e(t))))&&void 0!==s?s:t}update(r,s){const i=this.Rt;let o=i.length;this.Rt=s;for(let t=0;t<s.length&&!(t>this.Ct);t++){const r=s[t];if(!e(r))return this.Ct=t,r;t<o&&r===i[t]||(this.Ct=2147483647,o=0,Promise.resolve(r).then((t=>{const s=this.Rt.indexOf(r);s>-1&&s<this.Ct&&(this.Ct=s,this.setValue(t))})))}return t}});export{o as until};
//# sourceMappingURL=until.js.map
