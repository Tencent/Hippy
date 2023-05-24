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
import { h, defineComponent, createSSRApp, Comment, defineAsyncComponent, Teleport, withDirectives } from 'vue';
import * as vueRuntimeCore from '@vue/runtime-core';
import { isPromise } from '@vue/shared';
import { renderComponentVNode, SSRBuffer } from '../src/render-vnode';
import { SSR_UNIQUE_ID_KEY } from '../src/renderer';
import { getObjectNodeList } from '../src/util';

let globalApp;
jest.spyOn(vueRuntimeCore, 'getCurrentInstance').mockImplementation(() => ({
  ...globalApp,
  appContext: globalApp._context,
}));

/**
 * render component to get vnode
 *
 * @param rootComp
 */
async function getRenderedVNode(rootComp) {
  // create vnode
  const rootVNode = h(rootComp);
  // render component vnode
  const nodeString = renderComponentVNode(rootVNode) as SSRBuffer;
  let ssrNodeTree = null;
  if (nodeString?.length) {
    const nodeStringList: any = [];
    for (let i = 0; i < nodeString.length; i++) {
      const node = nodeString[i];
      if (typeof node === 'string') {
        nodeStringList.push(node);
      } else if (Array.isArray(node)) {
        nodeStringList.push(node);
      } else if (isPromise(node)) {
        const result = await node;
        nodeStringList.push(result);
      }
    }
    ssrNodeTree = getObjectNodeList(nodeStringList as string[]);
  }
  return ssrNodeTree;
}

/**
 * render-vnode.ts unit test case
 */
describe('render-vnode.ts', () => {
  beforeAll(() => {
    const startUniqueId = 1;
    const uniqueIdContext = { ssrUniqueId: startUniqueId };
    globalApp = createSSRApp({
      template: '<div></div>',
    });
    // An additional context needs to be provided here because ssrContext is mounted after
    // the render function is called, but ssrGetUniqueId will be called in the render function
    globalApp.provide(SSR_UNIQUE_ID_KEY, uniqueIdContext);
  });
  describe('renderComponentVNode should work correctly', () => {
    it('render div tag work correct', async () => {
      // root component
      const rootComp = await defineComponent({
        render: () => h('div', {
          id: 'app',
          class: 'wrapper',
          onClick: () => {},
        }),
      });
      const ssrNodeTree = await getRenderedVNode(rootComp);
      expect(ssrNodeTree).toEqual({ id: 2, index: 0, name: 'View', tagName: 'div', props: { id: 'app', class: 'wrapper', onClick: true } });
    });
    it('render button tag work correct', async () => {
      // root component
      const rootComp = defineComponent({
        render: () => h('button', {
          class: 'btn',
          onClick: () => {},
        }),
      });
      const ssrNodeTree = await getRenderedVNode(rootComp);
      expect(ssrNodeTree).toEqual({ id: 3, index: 0, name: 'View', tagName: 'button', props: { class: 'btn', onClick: true } });
    });
    it('render form tag work correct', async () => {
      // root component
      const rootComp = defineComponent({
        render: () => h('form', {
          class: 'form',
        }),
      });
      const ssrNodeTree = await getRenderedVNode(rootComp);
      expect(ssrNodeTree).toEqual({ id: 4, index: 0, name: 'View', tagName: 'form', props: { class: 'form' } });
    });
    it('render img tag work correct', async () => {
      // root component
      const rootComp = defineComponent({
        render: () => h('img', {
          alt: '',
          class: 'img',
          src: 'https://test.com/test.png',
        }),
      });
      const ssrNodeTree = await getRenderedVNode(rootComp);
      expect(ssrNodeTree).toEqual({ id: 5, index: 0, name: 'Image', tagName: 'img', props: { alt: '', class: 'img', src: 'https://test.com/test.png' } });
    });
    it('render ul tag work correct', async () => {
      // root component
      const rootComp = defineComponent({
        render: () => h('ul', {
          class: 'list',
          onScroll: () => {},
        }),
      });
      const ssrNodeTree = await getRenderedVNode(rootComp);
      expect(ssrNodeTree).toEqual({ id: 6, index: 0, name: 'ListView', tagName: 'ul', props: { class: 'list', onScroll: true } });
    });
    it('render li tag work correct', async () => {
      // root component
      const rootComp = defineComponent({
        render: () => h('li', {
          class: 'list-item',
          onAppear: () => {},
        }),
      });
      const ssrNodeTree = await getRenderedVNode(rootComp);
      expect(ssrNodeTree).toEqual({ id: 7, index: 0, name: 'ListViewItem', tagName: 'li', props: { class: 'list-item', onAppear: true } });
    });
    it('render span tag work correct', async () => {
      // root component
      const rootComp = defineComponent({
        render: () => h('span', {
          class: 'title',
          onClick: () => {},
        }),
      });
      const ssrNodeTree = await getRenderedVNode(rootComp);
      expect(ssrNodeTree).toEqual({ id: 8, index: 0, name: 'Text', tagName: 'span', props: { class: 'title', onClick: true } });
    });
    it('render label tag work correct', async () => {
      // root component
      const rootComp = defineComponent({
        render: () => h('label', {
          class: 'title',
          onClick: () => {},
        }),
      });
      const ssrNodeTree = await getRenderedVNode(rootComp);
      expect(ssrNodeTree).toEqual({ id: 9, index: 0, name: 'Text', tagName: 'label', props: { class: 'title', onClick: true } });
    });
    it('render p tag work correct', async () => {
      // root component
      const rootComp = defineComponent({
        render: () => h('p', {
          class: 'title',
          onClick: () => {},
        }),
      });
      const ssrNodeTree = await getRenderedVNode(rootComp);
      expect(ssrNodeTree).toEqual({ id: 11, index: 0, name: 'Text', tagName: 'p', props: { class: 'title', onClick: true } });
    });
    it('render input tag work correct', async () => {
      // root component
      const rootComp = defineComponent({
        render: () => h('input', {
          class: 'input',
          onChange: () => {},
        }),
      });
      const ssrNodeTree = await getRenderedVNode(rootComp);
      expect(ssrNodeTree).toEqual({ id: 12, index: 0, name: 'TextInput', tagName: 'input', props: { class: 'input', onChange: true } });
    });
    it('render a tag work correct', async () => {
      // root component
      const rootComp = defineComponent({
        render: () => h('a', {
          class: 'link',
          href: 'https://hippyjs.org',
        }, ['this is text']),
      });
      const ssrNodeTree = await getRenderedVNode(rootComp);
      expect(ssrNodeTree).toEqual({
        id: 13,
        index: 0,
        name: 'Text',
        tagName: 'a',
        props: { class: 'link', href: 'https://hippyjs.org' },
        children: [
          { id: 14, name: 'Text', props: { text: 'this is text' } },
        ],
      });
    });
    it('render textarea tag work correct', async () => {
      // root component
      const rootComp = defineComponent({
        render: () => h('textarea', {
          class: 'textarea',
          rows: 10,
          onContentSizeChange: () => {},
        }),
      });
      const ssrNodeTree = await getRenderedVNode(rootComp);
      expect(ssrNodeTree).toEqual({ id: 15, index: 0, name: 'TextInput', tagName: 'textarea', props: { rows: 10, class: 'textarea', onContentSizeChange: true } });
    });
    it('render iframe tag work correct', async () => {
      // root component
      const rootComp = defineComponent({
        render: () => h('iframe', {
          class: 'iframe',
          onKeyup: () => {},
        }),
      });
      const ssrNodeTree = await getRenderedVNode(rootComp);
      expect(ssrNodeTree).toEqual({ id: 16, index: 0, name: 'WebView', tagName: 'iframe', props: { class: 'iframe', onKeyup: true } });
    });
    it('render dialog tag work correct', async () => {
      // root component
      const rootComp = defineComponent({
        render: () => h('dialog', {
          class: 'dialog',
        }),
      });
      const ssrNodeTree = await getRenderedVNode(rootComp);
      expect(ssrNodeTree).toEqual({ id: 17, index: 0, name: 'Modal', tagName: 'dialog', props: { class: 'dialog' } });
    });
    it('render RefreshWrapper tag work correct', async () => {
      // root component
      const rootComp = defineComponent({
        render: () => h('hi-ul-refresh-wrapper', {
          class: 'refresh',
        }),
      });
      const ssrNodeTree = await getRenderedVNode(rootComp);
      expect(ssrNodeTree).toEqual({ id: 18, index: 0, name: 'RefreshWrapper', tagName: 'hi-ul-refresh-wrapper', props: { class: 'refresh' } });
    });
    it('render RefreshWrapperItemView tag work correct', async () => {
      // root component
      const rootComp = defineComponent({
        render: () => h('hi-refresh-wrapper-item', {
          class: 'refresh-item',
        }),
      });
      const ssrNodeTree = await getRenderedVNode(rootComp);
      expect(ssrNodeTree).toEqual({ id: 19, index: 0, name: 'RefreshWrapperItemView', tagName: 'hi-refresh-wrapper-item', props: { class: 'refresh-item' } });
    });
    it('render Waterfall tag work correct', async () => {
      // root component
      const rootComp = defineComponent({
        render: () => h('hi-waterfall', {
          class: 'waterfall',
        }),
      });
      const ssrNodeTree = await getRenderedVNode(rootComp);
      expect(ssrNodeTree).toEqual({ id: 21, index: 0, name: 'WaterfallView', tagName: 'hi-waterfall', props: { class: 'waterfall' } });
    });
    it('render WaterfallItem tag work correct', async () => {
      // root component
      const rootComp = defineComponent({
        render: () => h('hi-waterfall-item', {
          class: 'waterfall-item',
        }),
      });
      const ssrNodeTree = await getRenderedVNode(rootComp);
      expect(ssrNodeTree).toEqual({ id: 22, index: 0, name: 'WaterfallItem', tagName: 'hi-waterfall-item', props: { class: 'waterfall-item' } });
    });
    it('render children tag work correct', async () => {
      // root component
      const rootComp = defineComponent({
        render: () => h('div', null, [
          h('div', null, h('div')),
          h('div'),
        ]),
      });
      const ssrNodeTree = await getRenderedVNode(rootComp);
      expect(ssrNodeTree).toEqual({
        id: 23,
        index: 0,
        name: 'View',
        tagName: 'div',
        props: {},
        children: [
          { id: 24, index: 0, name: 'View', tagName: 'div', props: {}, children: [
            { id: 25, index: 0, name: 'View', tagName: 'div', props: {} },
          ] },
          { id: 26, index: 0, name: 'View', tagName: 'div', props: {} },
        ],
      });
    });
    it('render comment tag work correct', async () => {
      // root component
      const rootComp = defineComponent({
        render: () => h('div', null, [
          h(Comment, 'this is comment node'),
        ]),
      });
      const ssrNodeTree = await getRenderedVNode(rootComp);
      expect(ssrNodeTree).toEqual({
        id: 27,
        index: 0,
        name: 'View',
        tagName: 'div',
        props: {},
        children: [
          { id: -1, name: 'comment', props: { text: 'this is comment node' } },
        ],
      });
    });
    it('render child component work correct', async () => {
      // child component
      const childComp = defineComponent({
        render: () => h('div'),
      });
      // root component
      const rootComp = defineComponent({
        render: () => h('div', null, [h(childComp)]),
      });
      const ssrNodeTree = await getRenderedVNode(rootComp);
      expect(ssrNodeTree).toEqual({
        id: 28,
        index: 0,
        name: 'View',
        tagName: 'div',
        props: {},
        children: [
          {
            id: 29,
            index: 0,
            name: 'View',
            tagName: 'div',
            props: {},
          },
        ],
      });
    });
    it('render async component work correct', async () => {
      // child component
      const childComp = defineAsyncComponent(() => Promise.resolve({
        render: () => h('div'),
      }));
      // root component
      const rootComp = defineComponent({
        render: () => h('div', null, [h(childComp)]),
      });
      const ssrNodeTree = await getRenderedVNode(rootComp);
      expect(ssrNodeTree).toEqual({
        id: 31,
        index: 0,
        name: 'View',
        tagName: 'div',
        props: {},
        children: [
          { id: 32, index: 0, name: 'View', tagName: 'div', props: {} },
        ],
      });
    });
    it('render slot work correct', async () => {
      // child component
      const childComp = defineComponent({
        // @ts-ignore
        setup: (props, { slots }) => () => h('div', slots.default()),
      });
      // root component
      const rootComp = defineComponent({
        render: () => h(childComp, null, {
          default: () => h('div', { class: 'slot-class' }),
        }),
      });
      const ssrNodeTree = await getRenderedVNode(rootComp);
      expect(ssrNodeTree).toEqual({
        id: 33,
        index: 0,
        name: 'View',
        tagName: 'div',
        props: {},
        children: [
          { id: 34, index: 0, name: 'View', tagName: 'div', props: { class: 'slot-class' } },
        ],
      });
    });
    it('render fragment work correct', async () => {
      // root component
      const rootComp = defineComponent({
        render: () => [h('div'), h('div')],
      });
      const ssrNodeTree = await getRenderedVNode(rootComp);
      // expect(ssrNodeTree).toEqual({ id: 2, index: 0, name: 'View', tagName: 'div',
      // props: { id: 'app', class: 'wrapper', onClick: true } });
      // fixme: fragment do not totally test, should fix later
      expect(ssrNodeTree).toBeNull();
    });
    it('render teleport work correct', async () => {
      const childComp = defineComponent({
        setup() {
          return () => {
            h(Teleport as unknown as string);
          };
        },
      });
      // root component
      const rootComp = defineComponent({
        render: () => h(childComp),
      });
      const ssrNodeTree = await getRenderedVNode(rootComp);
      // @hippy/vue-next do not support teleport
      expect(ssrNodeTree).toEqual({ id: -1, name: 'comment', props: { text: '' } });
    });
    it('render no template work correct', async () => {
      // root component
      const rootComp = defineComponent({});
      const ssrNodeTree = await getRenderedVNode(rootComp);
      expect(ssrNodeTree).toEqual({ id: -1, name: 'comment', props: { text: '' } });
    });
    it('ssrRender function work correct', async () => {
      // root component
      const rootComp = defineComponent({
        ssrRender: (_ctx, _push) => {
          _push('{"id": -1,"name":"comment","props":{}}');
        },
      });
      const ssrNodeTree = await getRenderedVNode(rootComp);
      expect(ssrNodeTree).toEqual({ id: -1, name: 'comment', props: {} });
    });
    it('render directives work correct', async () => {
      const dir = {
        created() {},
      };
      // root component
      const rootComp = defineComponent({
        render: () => withDirectives(h('div'), [[dir]]),
      });
      const ssrNodeTree = await getRenderedVNode(rootComp);
      expect(ssrNodeTree).toEqual({
        id: 37,
        index: 0,
        name: 'View',
        tagName: 'div',
        props: {},
      });
    });
    it('event map work correct for View', async () => {
      // root component
      const rootComp = defineComponent({
        render: () => h('hi-swiper', {
          class: 'swiper',
          onDropped: () => {},
        }),
      });
      const ssrNodeTree = await getRenderedVNode(rootComp);
      expect(ssrNodeTree).toEqual({
        id: 38,
        index: 0,
        name: 'ViewPager',
        props: {
          class: 'swiper',
          onDropped: true,
        },
        tagName: 'hi-swiper',
      });
    });
    it('render text node string children work correct', async () => {
      // root component
      let rootComp = defineComponent({
        render: () => h('a', {
          class: 'link',
          href: 'https://hippyjs.org',
        }, ' this is a'),
      });
      let ssrNodeTree = await getRenderedVNode(rootComp);
      expect(ssrNodeTree).toEqual({
        id: 39,
        index: 0,
        name: 'Text',
        tagName: 'a',
        props: { class: 'link', href: 'https://hippyjs.org', text: ' this is a' },
      });

      // root component
      rootComp = defineComponent({
        render: () => h('span', {
          class: 'text',
        }, ' this is span'),
      });
      ssrNodeTree = await getRenderedVNode(rootComp);
      expect(ssrNodeTree).toEqual({
        id: 41,
        index: 0,
        name: 'Text',
        tagName: 'span',
        props: { class: 'text', text: ' this is span' },
      });
      // 如果节点中包含的文本还夹杂有表达式等，就会被渲染为 children array text node，如
      // <span>123{{text}}456</span>，就会成为 ['123', text , '456']
      rootComp = defineComponent({
        render: () => h('span', {
          class: 'text',
        }, [' this is span']),
      });
      ssrNodeTree = await getRenderedVNode(rootComp);
      expect(ssrNodeTree).toEqual({
        id: 42,
        index: 0,
        name: 'Text',
        tagName: 'span',
        props: { class: 'text' },
        children: [{
          id: 43,
          name: 'Text',
          props: { text: ' this is span' },
        }],
      });
    });
  });
});
