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
 * @author birdguo
 * @priority P0
 * @casetype unit
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
  });
  describe('component compile with slot', () => {
    it('default slot', () => {
      const { code } = compile('<foo><div></div></foo>');
      expect(getSsrRenderFunctionBody(code)).toEqual('const _component_foo = _resolveComponent("foo")  _push(_ssrRenderComponent(_component_foo,_attrs,{default:_withCtx((_,_push,_parent,_scopeId) => {if (_push) {_push(`{"id":${_ssrGetUniqueId()},"index":0,"name":"View","tagName":"div","props":{},${_scopeId}"children":[]},`)} else {return [          _createVNode("div")        ]}}),_:1 /* STABLE */},_parent))');
    });
    it('named slot', () => {
      const { code } = compile('<foo><template v-slot:named><div /></template></foo>');
      expect(getSsrRenderFunctionBody(code)).toEqual('');
    });
  });
});
