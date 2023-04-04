/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-2022 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { compile } from '../src';
import { getSsrRenderFunctionBody } from './utils';

/**
 * element unit test case
 */
describe('element.test.ts', () => {
  describe('tag should compile correct', () => {
    it('div should compile correct', () => {
      const { code } = compile('<div></div>');
      expect(getSsrRenderFunctionBody(code))
        .toEqual('_push(`{"id":${_ssrGetUniqueId()},"index":0,"name":"View","tagName":"div","props":{"mergedProps":${JSON.stringify(_attrs)},},"children":[]},`)');
    });
    it('button should compile correct', () => {
      const { code } = compile('<button></button>');
      expect(getSsrRenderFunctionBody(code))
        .toEqual('_push(`{"id":${_ssrGetUniqueId()},"index":0,"name":"View","tagName":"button","props":{"mergedProps":${JSON.stringify(_attrs)},},"children":[]},`)');
    });
    it('form should compile correct', () => {
      const { code } = compile('<form></form>');
      expect(getSsrRenderFunctionBody(code))
        .toEqual('_push(`{"id":${_ssrGetUniqueId()},"index":0,"name":"View","tagName":"form","props":{"mergedProps":${JSON.stringify(_attrs)},},"children":[]},`)');
    });
    it('img should compile correct', () => {
      const { code } = compile('<img />');
      expect(getSsrRenderFunctionBody(code))
        .toEqual('_push(`{"id":${_ssrGetUniqueId()},"index":0,"name":"Image","tagName":"img","props":{"mergedProps":${JSON.stringify(_attrs)},},"children":[]},`)');
    });
    it('ul should compile correct', () => {
      const { code } = compile('<ul></ul>');
      expect(getSsrRenderFunctionBody(code))
        .toEqual('_push(`{"id":${_ssrGetUniqueId()},"index":0,"name":"ListView","tagName":"ul","props":{"mergedProps":${JSON.stringify(_attrs)},},"children":[]},`)');
    });
    it('li should compile correct', () => {
      const { code } = compile('<li></li>');
      expect(getSsrRenderFunctionBody(code))
        .toEqual('_push(`{"id":${_ssrGetUniqueId()},"index":0,"name":"ListViewItem","tagName":"li","props":{"mergedProps":${JSON.stringify(_attrs)},},"children":[]},`)');
    });
    it('span should compile correct', () => {
      const { code } = compile('<span></span>');
      expect(getSsrRenderFunctionBody(code))
        .toEqual('_push(`{"id":${_ssrGetUniqueId()},"index":0,"name":"Text","tagName":"span","props":{"mergedProps":${JSON.stringify(_attrs)},},"children":[]},`)');
    });
    it('label should compile correct', () => {
      const { code } = compile('<label></label>');
      expect(getSsrRenderFunctionBody(code))
        .toEqual('_push(`{"id":${_ssrGetUniqueId()},"index":0,"name":"Text","tagName":"label","props":{"mergedProps":${JSON.stringify(_attrs)},},"children":[]},`)');
    });
    it('p should compile correct', () => {
      const { code } = compile('<p></p>');
      expect(getSsrRenderFunctionBody(code))
        .toEqual('_push(`{"id":${_ssrGetUniqueId()},"index":0,"name":"Text","tagName":"p","props":{"mergedProps":${JSON.stringify(_attrs)},},"children":[]},`)');
    });
    it('a should compile correct', () => {
      const { code } = compile('<a></a>');
      expect(getSsrRenderFunctionBody(code))
        .toEqual('_push(`{"id":${_ssrGetUniqueId()},"index":0,"name":"Text","tagName":"a","props":{"mergedProps":${JSON.stringify(_attrs)},},"children":[]},`)');
    });
    it('input should compile correct', () => {
      const { code } = compile('<input />');
      expect(getSsrRenderFunctionBody(code))
        .toEqual('_push(`{"id":${_ssrGetUniqueId()},"index":0,"name":"TextInput","tagName":"input","props":{"mergedProps":${JSON.stringify(_attrs)},},"children":[]},`)');
    });
    it('textarea should compile correct', () => {
      const { code } = compile('<textarea></textarea>');
      expect(getSsrRenderFunctionBody(code))
        .toEqual('_push(`{"id":${_ssrGetUniqueId()},"index":0,"name":"TextInput","tagName":"textarea","props":{"mergedProps":${JSON.stringify(_attrs)},},"children":[]},`)');
    });
    it('iframe should compile correct', () => {
      const { code } = compile('<iframe></iframe>');
      expect(getSsrRenderFunctionBody(code))
        .toEqual('_push(`{"id":${_ssrGetUniqueId()},"index":0,"name":"WebView","tagName":"iframe","props":{"mergedProps":${JSON.stringify(_attrs)},},"children":[]},`)');
    });
    it('hi-swiper should compile correct', () => {
      const { code } = compile('<hi-swiper></hi-swiper>', { isCustomElement: () => true });
      expect(getSsrRenderFunctionBody(code))
        .toEqual('_push(`{"id":${_ssrGetUniqueId()},"index":0,"name":"ViewPager","tagName":"hi-swiper","props":{"mergedProps":${JSON.stringify(_attrs)},},"children":[]},`)');
    });
    it('hi-swiper-slide should compile correct', () => {
      const { code } = compile('<hi-swiper-slide></hi-swiper-slide>', { isCustomElement: () => true });
      expect(getSsrRenderFunctionBody(code))
        .toEqual('_push(`{"id":${_ssrGetUniqueId()},"index":0,"name":"ViewPagerItem","tagName":"hi-swiper-slide","props":{"mergedProps":${JSON.stringify(_attrs)},},"children":[]},`)');
    });
    it('pull-header should compile correct', () => {
      const { code } = compile('<hi-pull-header></hi-pull-header>', { isCustomElement: () => true });
      expect(getSsrRenderFunctionBody(code))
        .toEqual('_push(`{"id":${_ssrGetUniqueId()},"index":0,"name":"PullHeaderView","tagName":"hi-pull-header","props":{"mergedProps":${JSON.stringify(_attrs)},},"children":[]},`)');
    });
    it('hi-pull-footer should compile correct', () => {
      const { code } = compile('<hi-pull-footer></hi-pull-footer>', { isCustomElement: () => true });
      expect(getSsrRenderFunctionBody(code))
        .toEqual('_push(`{"id":${_ssrGetUniqueId()},"index":0,"name":"PullFooterView","tagName":"hi-pull-footer","props":{"mergedProps":${JSON.stringify(_attrs)},},"children":[]},`)');
    });
    it('dialog should compile correct', () => {
      const { code } = compile('<dialog></dialog>', { isCustomElement: () => true });
      expect(getSsrRenderFunctionBody(code))
        .toEqual('_push(`{"id":${_ssrGetUniqueId()},"index":0,"name":"Modal","tagName":"dialog","props":{"mergedProps":${JSON.stringify(_attrs)},},"children":[]},`)');
    });
    it('hi-ul-refresh-wrapper should compile correct', () => {
      const { code } = compile('<hi-ul-refresh-wrapper></hi-ul-refresh-wrapper>', { isCustomElement: () => true });
      expect(getSsrRenderFunctionBody(code))
        .toEqual('_push(`{"id":${_ssrGetUniqueId()},"index":0,"name":"RefreshWrapper","tagName":"hi-ul-refresh-wrapper","props":{"mergedProps":${JSON.stringify(_attrs)},},"children":[]},`)');
    });
    it('hi-refresh-wrapper-item should compile correct', () => {
      const { code } = compile('<hi-refresh-wrapper-item></hi-refresh-wrapper-item>', { isCustomElement: () => true });
      expect(getSsrRenderFunctionBody(code))
        .toEqual('_push(`{"id":${_ssrGetUniqueId()},"index":0,"name":"RefreshWrapperItemView","tagName":"hi-refresh-wrapper-item","props":{"mergedProps":${JSON.stringify(_attrs)},},"children":[]},`)');
    });
    it('hi-waterfall should compile correct', () => {
      const { code } = compile('<hi-waterfall></hi-waterfall>', { isCustomElement: () => true });
      expect(getSsrRenderFunctionBody(code))
        .toEqual('_push(`{"id":${_ssrGetUniqueId()},"index":0,"name":"WaterfallView","tagName":"hi-waterfall","props":{"mergedProps":${JSON.stringify(_attrs)},},"children":[]},`)');
    });
    it('hi-waterfall-item should compile correct', () => {
      const { code } = compile('<hi-waterfall-item></hi-waterfall-item>', { isCustomElement: () => true });
      expect(getSsrRenderFunctionBody(code))
        .toEqual('_push(`{"id":${_ssrGetUniqueId()},"index":0,"name":"WaterfallItem","tagName":"hi-waterfall-item","props":{"mergedProps":${JSON.stringify(_attrs)},},"children":[]},`)');
    });
  });
  describe('nested tag should compile correct', () => {
    it('div with child should compile correct', () => {
      const { code } = compile('<div><div></div></div>');
      expect(getSsrRenderFunctionBody(code))
        .toEqual('_push(`{"id":${_ssrGetUniqueId()},"index":0,"name":"View","tagName":"div","props":{"mergedProps":${JSON.stringify(_attrs)},},"children":[{"id":${_ssrGetUniqueId()},"index":0,"name":"View","tagName":"div","props":{},"children":[]},]},`)');
    });
  });
  describe('attrs should compile correct', () => {
    it('props and event should compile correct', () => {
      const { code } = compile('<div id="app" class="wrapper" @click="()=>{}" />');
      expect(getSsrRenderFunctionBody(code)).toEqual('_push(`{"id":${_ssrGetUniqueId()},"index":0,"name":"View","tagName":"div","props":{"mergedProps":${JSON.stringify(_mergeProps({id:"app",class:"wrapper"},_attrs))},"onClick":true,},"children":[]},`)');
    });
    it('binding value should compile correct', () => {
      const { code } = compile('<div value="test" :data="show" :text="\'text\'"  />');
      expect(getSsrRenderFunctionBody(code)).toEqual('_push(`{"id":${_ssrGetUniqueId()},"index":0,"name":"View","tagName":"div","props":{"mergedProps":${JSON.stringify(_mergeProps({value:"test",data:_ctx.show,text:\'text\'},_attrs))},},"children":[]},`)');
    });
    it('directive v-bind should compile correct', () => {
      const { code } = compile('<div v-bind="data" />');
      expect(getSsrRenderFunctionBody(code)).toEqual('_push(`{"id":${_ssrGetUniqueId()},"index":0,"name":"View","tagName":"div","props":{"mergedProps":${JSON.stringify(_mergeProps(_ctx.data,_attrs))},},"children":[]},`)');
    });
    it('static value width dynamic value should compile correct', () => {
      const { code } = compile('<div style="color:red;" :style="b" />');
      expect(getSsrRenderFunctionBody(code)).toEqual('_push(`{"id":${_ssrGetUniqueId()},"index":0,"name":"View","tagName":"div","props":{"mergedProps":${JSON.stringify(_mergeProps({style:[{"color":"red"},_ctx.b]},_attrs))},},"children":[]},`)');
    });
    it('custom directive should compile correct', () => {
      const { code } = compile('<div v-report="data" />');
      expect(getSsrRenderFunctionBody(code)).toEqual('const _directive_report = _resolveDirective("report")  _push(`{"id":${_ssrGetUniqueId()},"index":0,"name":"View","tagName":"div","props":{"mergedProps":${JSON.stringify(_mergeProps(_attrs,_ssrGetDirectiveProps(_ctx,_directive_report,_ctx.data)))},},"children":[]},`)');
    });
    it('static key/ref should compile correct', () => {
      const { code } = compile('<div key="key" ref="ref" />');
      expect(getSsrRenderFunctionBody(code)).toEqual('_push(`{"id":${_ssrGetUniqueId()},"index":0,"name":"View","tagName":"div","props":{"mergedProps":${JSON.stringify(_mergeProps({key:"key",ref:"ref"},_attrs))},},"children":[]},`)');
    });
    it('dynamic key/ref should compile correct', () => {
      const { code } = compile('<div :key="key" :ref="ref" />');
      expect(getSsrRenderFunctionBody(code)).toEqual('_push(`{"id":${_ssrGetUniqueId()},"index":0,"name":"View","tagName":"div","props":{"mergedProps":${JSON.stringify(_mergeProps({key:_ctx.key,ref:_ctx.ref},_attrs))},},"children":[]},`)');
    });
  });
  describe('control flow compile', () => {
    it('v-if should compile correct', () => {
      const { code } = compile('<div v-if="ok" />');
      expect(getSsrRenderFunctionBody(code)).toEqual('if (_ctx.ok) {_push(`{"id":${_ssrGetUniqueId()},"index":0,"name":"View","tagName":"div","props":{"mergedProps":${JSON.stringify(_attrs)},},"children":[]},`)} else {_push(`{"id":-1,"name":"comment","props":{"text":""}},`)}');
    });
    it('v-else should compile correct', () => {
      const { code } = compile('<div v-if="ok" /><div v-else />');
      expect(getSsrRenderFunctionBody(code)).toEqual('if (_ctx.ok) {_push(`{"id":${_ssrGetUniqueId()},"index":0,"name":"View","tagName":"div","props":{"mergedProps":${JSON.stringify(_attrs)},},"children":[]},`)} else {_push(`{"id":${_ssrGetUniqueId()},"index":0,"name":"View","tagName":"div","props":{"mergedProps":${JSON.stringify(_attrs)},},"children":[]},`)}');
    });
    it('v-else-if should compile correct', () => {
      const { code } = compile('<div v-if="ok" /><div v-else-if="not" />');
      expect(getSsrRenderFunctionBody(code)).toEqual('if (_ctx.ok) {_push(`{"id":${_ssrGetUniqueId()},"index":0,"name":"View","tagName":"div","props":{"mergedProps":${JSON.stringify(_attrs)},},"children":[]},`)} else if (_ctx.not) {_push(`{"id":${_ssrGetUniqueId()},"index":0,"name":"View","tagName":"div","props":{"mergedProps":${JSON.stringify(_attrs)},},"children":[]},`)} else {_push(`{"id":-1,"name":"comment","props":{"text":""}},`)}');
    });
    it('v-for should compile correct', () => {
      const { code } = compile('<div v-for="key in names" :key="key"><span>{{ key }}</span></div>');
      expect(getSsrRenderFunctionBody(code)).toEqual('_push(`{"id":-1,"name":"comment","props":{"text":"["}},`)  _ssrRenderList(_ctx.names,(key) => {_push(`{"id":${_ssrGetUniqueId()},"index":0,"name":"View","tagName":"div","props":{},"children":[{"id":${_ssrGetUniqueId()},"index":0,"name":"Text","tagName":"span","props":{"text":"${_ssrInterpolate(key)}",},"children":[]},]},`)})  _push(`{"id":-1,"name":"comment","props":{"text":"]"}},`)');
    });
    it('v-on should compile correct', () => {
      const { code } = compile('<div v-on="foo" />');
      expect(getSsrRenderFunctionBody(code)).toEqual('_push(`{"id":${_ssrGetUniqueId()},"index":0,"name":"View","tagName":"div","props":{"mergedProps":${JSON.stringify(_attrs)},},"children":[]},`)');
    });
    it('.stop should compile correct', () => {
      const { code } = compile('<div @click.stop="foo" />');
      expect(getSsrRenderFunctionBody(code)).toEqual('_push(`{"id":${_ssrGetUniqueId()},"index":0,"name":"View","tagName":"div","props":{"mergedProps":${JSON.stringify(_attrs)},"onClick":true,},"children":[]},`)');
    });
    it('v-show should compile correct', () => {
      const { code } = compile('<div v-show="ok" />');
      expect(getSsrRenderFunctionBody(code)).toEqual('_push(`{"id":${_ssrGetUniqueId()},"index":0,"name":"View","tagName":"div","props":{"mergedProps":${JSON.stringify(_mergeProps({style:(_ctx.ok) ? null :{display:"none"}},_attrs))},},"children":[]},`)');
    });
    it('input v-model should compile correct', () => {
      const { code } = compile('<input v-model="bar" />');
      expect(getSsrRenderFunctionBody(code)).toEqual('_push(`{"id":${_ssrGetUniqueId()},"index":0,"name":"TextInput","tagName":"input","props":{"mergedProps":${JSON.stringify(_attrs)},},"children":[]},`)');
    });
    it('input v-model number should compile correct', () => {
      const { code } = compile('<input type="number" v-model="bar" />');
      expect(getSsrRenderFunctionBody(code)).toEqual('_push(`{"id":${_ssrGetUniqueId()},"index":0,"name":"TextInput","tagName":"input","props":{"mergedProps":${JSON.stringify(_mergeProps({type:"number",value:_ctx.bar},_attrs))},},"children":[]},`)');
    });
    it('input v-model password should compile correct', () => {
      const { code } = compile('<input type="password" v-model="bar" />');
      expect(getSsrRenderFunctionBody(code)).toEqual('_push(`{"id":${_ssrGetUniqueId()},"index":0,"name":"TextInput","tagName":"input","props":{"mergedProps":${JSON.stringify(_mergeProps({type:"password",value:_ctx.bar},_attrs))},},"children":[]},`)');
    });
    it('textarea v-model should compile correct', () => {
      const { code } = compile('<textarea v-model="bar"></textarea>');
      expect(getSsrRenderFunctionBody(code)).toEqual('_push(`{"id":${_ssrGetUniqueId()},"index":0,"name":"TextInput","tagName":"textarea","props":{"mergedProps":${JSON.stringify(_attrs)},},"children":[]},`)');
    });
  });
  describe('inject css vars compile', () => {
    it('base inject compile', () => {
      const { code } = compile('<div />', { ssrCssVars: '{ color }' });
      expect(getSsrRenderFunctionBody(code)).toEqual('const _cssVars = {style:{color:_ctx.color}}  _push(`{"id":${_ssrGetUniqueId()},"index":0,"name":"View","tagName":"div","props":{"mergedProps":${JSON.stringify(_mergeProps(_attrs,_cssVars))},},"children":[]},`)');
    });
  });
  describe('scopedId compile', () => {
    it('single tag scopedId compile', () => {
      const { code } = compile('<div />', { scopeId: 'data-v-12345' });
      expect(getSsrRenderFunctionBody(code)).toEqual('_push(`{"id":${_ssrGetUniqueId()},"index":0,"name":"View","tagName":"div","props":{"mergedProps":${JSON.stringify(_attrs)},"data-v-12345":"",},"children":[]},`)');
    });
    it('nested tag scopedId compile', () => {
      const { code } = compile('<div><div /></div>', { scopeId: 'data-v-12345' });
      expect(getSsrRenderFunctionBody(code)).toEqual('_push(`{"id":${_ssrGetUniqueId()},"index":0,"name":"View","tagName":"div","props":{"mergedProps":${JSON.stringify(_attrs)},"data-v-12345":"",},"children":[{"id":${_ssrGetUniqueId()},"index":0,"name":"View","tagName":"div","props":{"data-v-12345":"",},"children":[]},]},`)');
    });
  });
  describe('fragment compile', () => {
    it('fragment tag compile', () => {
      const { code } = compile('<div /><div />');
      expect(getSsrRenderFunctionBody(code)).toEqual('_push(`{"id":-1,"name":"comment","props":{"text":"["}},{"id":${_ssrGetUniqueId()},"index":0,"name":"View","tagName":"div","props":{},"children":[]},{"id":${_ssrGetUniqueId()},"index":0,"name":"View","tagName":"div","props":{},"children":[]},{"id":-1,"name":"comment","props":{"text":"]"}},`)');
    });
  });
});
