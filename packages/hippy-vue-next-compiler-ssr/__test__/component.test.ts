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
 * component unit test case
 */
describe('component.test.ts', () => {
  describe('component should compile correct', () => {
    it('base component compile', () => {
      const { code } = compile('<foo />');
      expect(getSsrRenderFunctionBody(code)).toEqual('const _component_foo = _resolveComponent("foo")  _push(_ssrRenderComponent(_component_foo,_attrs,null,_parent))');
    });
    it('custom tag should compile correct', () => {
      const { code } = compile('<foo />', {
        isCustomElement: tag => tag === 'foo',
      });
      expect(getSsrRenderFunctionBody(code)).toEqual('_push(`{"id":${_ssrGetUniqueId()},"index":0,"name":"foo","tagName":"foo","props":{"mergedProps":${JSON.stringify(_attrs)},},"children":[]},`)');
    });
    it('component compile props', () => {
      const { code } = compile('<foo id="a" :prop="b" />');
      expect(getSsrRenderFunctionBody(code)).toEqual('const _component_foo = _resolveComponent("foo")  _push(_ssrRenderComponent(_component_foo,_mergeProps({id:"a",prop:_ctx.b},_attrs),null,_parent))');
    });
    it('component compile event listeners', () => {
      const { code } = compile('<foo @click="bar" />');
      expect(getSsrRenderFunctionBody(code)).toEqual('const _component_foo = _resolveComponent("foo")  _push(_ssrRenderComponent(_component_foo,_mergeProps({onClick:_ctx.bar},_attrs),null,_parent))');
    });
    it('dynamic component compile', () => {
      let { code } = compile('<component is="foo" :prop="b" />');
      expect(getSsrRenderFunctionBody(code)).toEqual('_ssrRenderVNode(_push,_createVNode(_resolveDynamicComponent("foo"),_mergeProps({prop:_ctx.b},_attrs),null),_parent)');
      code = compile('<component :is="foo" :prop="b" />').code;
      expect(getSsrRenderFunctionBody(code)).toEqual('_ssrRenderVNode(_push,_createVNode(_resolveDynamicComponent(_ctx.foo),_mergeProps({prop:_ctx.b},_attrs),null),_parent)');
    });
    it('v-if component compile', () => {
      const { code } = compile('<foo v-if="ok" />');
      expect(getSsrRenderFunctionBody(code)).toEqual('const _component_foo = _resolveComponent("foo")  if (_ctx.ok) {_push(_ssrRenderComponent(_component_foo,_attrs,null,_parent))} else {_push(`{"id":-1,"name":"comment","props":{"text":""}},`)}');
    });
    it('v-for component compile', () => {
      const { code } = compile('<foo v-for="key in names" :key="key"></foo>');
      expect(getSsrRenderFunctionBody(code)).toEqual('const _component_foo = _resolveComponent("foo")  _push(`{"id":-1,"name":"comment","props":{"text":"["}},`)  _ssrRenderList(_ctx.names,(key) => {_push(_ssrRenderComponent(_component_foo,{key:key},null,_parent))})  _push(`{"id":-1,"name":"comment","props":{"text":"]"}},`)');
    });
    it('nested component compile', () => {
      const { code } = compile('<foo><bar /></foo>');
      expect(getSsrRenderFunctionBody(code)).toEqual('const _component_foo = _resolveComponent("foo")  const _component_bar = _resolveComponent("bar")  _push(_ssrRenderComponent(_component_foo,_attrs,{default:_withCtx((_,_push,_parent,_scopeId) => {if (_push) {_push(_ssrRenderComponent(_component_bar,null,null,_parent,_scopeId))} else {return [          _createVNode(_component_bar)        ]}}),_:1 /* STABLE */},_parent))');
    });
  });
  describe('component compile with slot', () => {
    it('default slot', () => {
      const { code } = compile('<foo><div></div></foo>');
      expect(getSsrRenderFunctionBody(code)).toEqual('const _component_foo = _resolveComponent("foo")  _push(_ssrRenderComponent(_component_foo,_attrs,{default:_withCtx((_,_push,_parent,_scopeId) => {if (_push) {_push(`{"id":${_ssrGetUniqueId()},"index":0,"name":"View","tagName":"div","props":{},${_scopeId}"children":[]},`)} else {return [          _createVNode("div")        ]}}),_:1 /* STABLE */},_parent))');
    });
    it('named slot', () => {
      const { code } = compile('<foo><template v-slot:named><div /></template></foo>');
      expect(getSsrRenderFunctionBody(code)).toEqual('const _component_foo = _resolveComponent("foo")  _push(_ssrRenderComponent(_component_foo,_attrs,{named:_withCtx((_,_push,_parent,_scopeId) => {if (_push) {_push(`{"id":${_ssrGetUniqueId()},"index":0,"name":"View","tagName":"div","props":{},${_scopeId}"children":[]},`)} else {return [          _createVNode("div")        ]}}),_:1 /* STABLE */},_parent))');
    });
  });
  describe('supported vue built-in component compile', () => {
    it('keep-alive compile', () => {
      const { code } = compile('<keep-alive><foo /></keep-alive>');
      expect(getSsrRenderFunctionBody(code)).toEqual('const _component_foo = _resolveComponent("foo")  _push(_ssrRenderComponent(_component_foo,_attrs,null,_parent))');
    });
    it('transition compile', () => {
      const { code } = compile('<transition><div /></transition>');
      expect(getSsrRenderFunctionBody(code)).toEqual('_push(`{"id":${_ssrGetUniqueId()},"index":0,"name":"View","tagName":"div","props":{"mergedProps":${JSON.stringify(_attrs)},},"children":[]},`)');
    });
  });
  describe('inject css vars compile', () => {
    it('base inject compile', () => {
      const { code } = compile('<foo />', { ssrCssVars: '{ color }' });
      expect(getSsrRenderFunctionBody(code)).toEqual('const _component_foo = _resolveComponent("foo")  const _cssVars = {style:{color:_ctx.color}}  _push(_ssrRenderComponent(_component_foo,_mergeProps(_attrs,_cssVars),null,_parent))');
    });
  });
  describe('scopedId compile', () => {
    it('single component compile', () => {
      const { code } = compile('<foo><div /></foo>', { scopeId: 'data-v-12345' });
      expect(getSsrRenderFunctionBody(code)).toEqual('const _component_foo = _resolveComponent("foo")  _push(_ssrRenderComponent(_component_foo,_attrs,{default:_withCtx((_,_push,_parent,_scopeId) => {if (_push) {_push(`{"id":${_ssrGetUniqueId()},"index":0,"name":"View","tagName":"div","props":{"data-v-12345":"",},${_scopeId}"children":[]},`)} else {return [          _createVNode("div")        ]}}),_:1 /* STABLE */},_parent))');
    });
  });
});
