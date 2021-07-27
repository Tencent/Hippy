import{isSingleExpression as e}from"./directive-helpers.js";
import{Directive as t,PartType as s}from"./directive.js";
import{noChange as i}from"./lit-html.js";

export{directive}from"./directive.js";

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const r=(i,t)=>{var s,e;const o=i.N;if(void 0===o)return!1;for(const i of o)null===(e=(s=i).O)||void 0===e||e.call(s,t,!1),r(i,t);return!0},o=i=>{let t,s;do{if(void 0===(t=i.M))break;s=t.N,s.delete(i),i=t}while(0===(null==s?void 0:s.size))},h=i=>{for(let t;t=i.M;i=t){let s=t.N;if(void 0===s)t.N=s=new Set;else if(s.has(i))break;s.add(i),d(t)}};function n(i){void 0!==this.N?(o(this),this.M=i,h(this)):this.M=i}function l(i,t=!1,s=0){const e=this.H,h=this.N;if(void 0!==h&&0!==h.size)if(t)if(Array.isArray(e))for(let i=s;i<e.length;i++)r(e[i],!1),o(e[i]);else null!=e&&(r(e,!1),o(e));else r(this,i)}const d=i=>{var t,e,r,o;i.type==s.CHILD&&(null!==(t=(r=i).P)&&void 0!==t||(r.P=l),null!==(e=(o=i).Q)&&void 0!==e||(o.Q=n))};class c extends t{constructor(){super(...arguments),this.isConnected=!0,this.ut=i,this.N=void 0}T(i,t,s){super.T(i,t,s),h(this)}O(i,t=!0){this.at(i),t&&(r(this,i),o(this))}at(t){var s,e;t!==this.isConnected&&(t?(this.isConnected=!0,this.ut!==i&&(this.setValue(this.ut),this.ut=i),null===(s=this.reconnected)||void 0===s||s.call(this)):(this.isConnected=!1,null===(e=this.disconnected)||void 0===e||e.call(this)))}S(i,t){if(!this.isConnected)throw Error(`AsyncDirective ${this.constructor.name} was rendered while its tree was disconnected.`);return super.S(i,t)}setValue(i){if(this.isConnected)if(e(this.Σdt))this.Σdt.I(i,this);else{const t=[...this.Σdt.H];t[this.Σct]=i,this.Σdt.I(t,this,0)}else this.ut=i}disconnected(){}reconnected(){}}export{c as AsyncDirective};
//# sourceMappingURL=async-directive.js.map
