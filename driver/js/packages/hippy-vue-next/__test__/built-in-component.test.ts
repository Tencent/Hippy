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

import type { NeedToTyped } from '../src/types';
import { NATIVE_COMPONENT_MAP, HIPPY_DEBUG_ADDRESS } from '../src/config';
import { Native } from '../src/runtime/native';
import BuiltInComponent from '../src/built-in-component';
import { getTagComponent, registerElement } from '../src/runtime/component';
import { HippyElement } from '../src/runtime/element/hippy-element';
import { HippyListElement } from '../src/runtime/element/hippy-list-element';
import { HippyInputElement } from '../src/runtime/element/hippy-input-element';
import { HippyText } from '../src/runtime/text/hippy-text';
import { setHippyCachedInstance } from '../src/util/instance';
import '../src/runtime/event/hippy-event-dispatcher';
import { preCacheNode } from '../src/util/node';

/**
 * built-in-component.ts unit test case
 */
describe('built-in-component', () => {
  const { EventDispatcher: eventDispatcher } = global.__GLOBAL__.jsModuleList;
  beforeAll(() => {
    BuiltInComponent.install();
    registerElement('div', { component: { name: 'View' } });
    const root = new HippyElement('div');
    root.id = 'testRoot';
    setHippyCachedInstance({
      rootView: 'testRoot',
      rootContainer: 'root',
      rootViewId: 1,
      ratioBaseWidth: 750,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      instance: {
        $el: root,
      },
    });
  });

  it('all of the built-in tag component should registered', async () => {
    const tagList = [
      'div',
      'button',
      'form',
      'img',
      'ul',
      'li',
      'span',
      'label',
      'p',
      'a',
      'input',
      'textarea',
      'iframe',
    ];

    tagList.forEach((tag) => {
      const component = getTagComponent(tag);
      expect(component).toBeDefined();
    });
  });

  describe('each type of tag should contain there property', () => {
    it('div tag test', () => {
      const divElement = new HippyElement('div');
      expect(divElement.component.name).toEqual(NATIVE_COMPONENT_MAP.View);
      preCacheNode(divElement, divElement.nodeId);

      let [[[nativeNode]]] = divElement.convertToNativeNodes(false);
      divElement.setStyle('overflowX', 'scroll');
      divElement.setStyle('backgroundImage', 'assets/index.png');
      const divChildElement = new HippyElement('div');
      divElement.appendChild(divChildElement);
      [[[nativeNode]]] = divElement.convertToNativeNodes(false);
      expect(nativeNode?.name).toEqual('ScrollView');
      expect(nativeNode?.props?.horizontal).toBeTruthy();
      expect(nativeNode?.props?.style?.flexDirection).toEqual('row');
      expect(nativeNode?.props?.style?.backgroundImage).toEqual(`${HIPPY_DEBUG_ADDRESS}assets/index.png`);
      expect((divElement.childNodes[0] as HippyElement).getAttribute('collapsable')).toBeFalsy();

      const offset = {
        x: 0,
        y: 0,
      };
      divElement.addEventListener('scroll', (event) => {
        offset.x = event.offsetX;
        offset.y = event.offsetY;
      });
      const scrollEvent = {
        id: divChildElement.nodeId,
        currentId: divChildElement.nodeId,
        nativeName: 'onScroll',
        originalName: 'scroll',
        params: { contentOffset: {
          x: 1,
          y: 2,
        } },
      };
      eventDispatcher.receiveComponentEvent(scrollEvent, {
        eventPhase: 2,
      });
      expect(offset).toEqual({
        x: 1,
        y: 2,
      });


      const dragOffset = {
        x: 0,
        y: 0,
        scrollWidth: 0,
        scrollHeight: 0,
      };
      divElement.addEventListener('scrollBeginDrag', (event) => {
        dragOffset.x = event.offsetX;
        dragOffset.y = event.offsetY;
        dragOffset.scrollWidth = event.scrollWidth;
        dragOffset.scrollHeight = event.scrollHeight;
      });
      const scrollBeginEvent = {
        id: divChildElement.nodeId,
        currentId: divChildElement.nodeId,
        nativeName: 'onScrollBeginDrag',
        originalName: 'scrollBeginDrag',
        params: {  contentOffset: {
          x: 3,
          y: 4,
        },
        contentSize: {
          width: 1,
          height: 2,
        } },
      };
      eventDispatcher.receiveComponentEvent(scrollBeginEvent, {
        eventPhase: 2,
      });
      expect(dragOffset).toEqual({
        x: 3,
        y: 4,
        scrollWidth: 1,
        scrollHeight: 2,
      });

      const touches = {
        clientX: 1,
        clientY: 2,
      };
      divElement.addEventListener('touchstart', (event) => {
        touches.clientX = event.touches[0].clientX;
        touches.clientY = event.touches[0].clientY;
      });
      const touchEvent = {
        id: divChildElement.nodeId,
        currentId: divChildElement.nodeId,
        nativeName: 'onTouchDown',
        originalName: 'touchStart',
        params: {
          page_x: 1,
          page_y: 2,
        },
      };
      eventDispatcher.receiveComponentEvent(touchEvent, {
        eventPhase: 2,
      });
      expect(touches).toEqual({
        clientX: 1,
        clientY: 2,
      });

      let isFocus = false;
      divElement.addEventListener('focus', (event) => {
        isFocus = event.isFocused;
      });
      const focusEvent: NeedToTyped = {
        id: divChildElement.nodeId,
        currentId: divChildElement.nodeId,
        nativeName: 'onFocus',
        originalName: 'focus',
        params: {
          focus: true,
        },
      };
      eventDispatcher.receiveComponentEvent(focusEvent, {
        eventPhase: 2,
      });
      expect(isFocus).toEqual(true);
    });

    it('button tag test', () => {
      const buttonElement = new HippyElement('button');
      expect(buttonElement.component.name).toEqual(NATIVE_COMPONENT_MAP.View);
    });

    it('form tag test', () => {
      const formElement = new HippyElement('form');
      expect(formElement.component.name).toEqual(NATIVE_COMPONENT_MAP.View);
    });

    it('img tag test', () => {
      const imgElement = new HippyElement('img');
      expect(imgElement.component.name).toEqual(NATIVE_COMPONENT_MAP.Image);

      imgElement.setAttribute('placeholder', 'https://hippyjs.org/index.png');
      let [[[nativeNode]]] = imgElement.convertToNativeNodes(false);
      expect(nativeNode?.props?.defaultSource).toEqual('https://hippyjs.org/index.png');
      imgElement.setAttribute('placeholder', 'assets/index.png');
      [[[nativeNode]]] = imgElement.convertToNativeNodes(false);
      expect(nativeNode?.props?.defaultSource).toEqual(`${HIPPY_DEBUG_ADDRESS}assets/index.png`);
      imgElement.setAttribute('src', 'https://hippyjs.org/index.png');
      [[[nativeNode]]] = imgElement.convertToNativeNodes(false);
      expect(nativeNode?.props?.src).toEqual('https://hippyjs.org/index.png');
      imgElement.setAttribute('src', 'assets/index.png');
      [[[nativeNode]]] = imgElement.convertToNativeNodes(false);
      expect(nativeNode?.props?.defaultSource).toEqual(`${HIPPY_DEBUG_ADDRESS}assets/index.png`);
      Native.Platform = 'ios';
      imgElement.setAttribute('src', 'https://hippyjs.org/index.png');
      [[[nativeNode]]] = imgElement.convertToNativeNodes(false);
      expect(nativeNode?.props?.source).toEqual([
        {
          uri: 'https://hippyjs.org/index.png',
        },
      ]);
      expect(nativeNode?.props?.src).toBeUndefined();
    });

    it('ul tag test', () => {
      const listElement = new HippyListElement('ul');
      expect(listElement.component.name).toEqual(NATIVE_COMPONENT_MAP.ListView);
      const sign = {
        x: 0,
        y: 0,
      };
      preCacheNode(listElement, listElement.nodeId);
      // scroll event
      listElement.addEventListener('scroll', (event) => {
        sign.x = event.offsetX;
        sign.y = event.offsetY;
      });
      const scrollEvent: NeedToTyped = {
        id: listElement.nodeId,
        currentId: listElement.nodeId,
        nativeName: 'onScroll',
        originalName: 'scroll',
        params: {
          contentOffset: {
            x: 1,
            y: 2,
          },
        },
      };
      eventDispatcher.receiveComponentEvent(scrollEvent, {
        eventPhase: 2,
      });
      expect(sign).toEqual({
        x: 1,
        y: 2,
      });

      let index = 0;
      // scroll event
      listElement.addEventListener('delete', (event) => {
        index = event.index;
      });
      const deleteEvent: NeedToTyped = {
        id: listElement.nodeId,
        currentId: listElement.nodeId,
        nativeName: 'onDelete',
        originalName: 'delete',
        params: {
          index: 1,
        },
      };
      eventDispatcher.receiveComponentEvent(deleteEvent, {
        eventPhase: 2,
      });
      expect(index).toEqual(1);
    });

    it('li tag test', () => {
      const listElement = new HippyListElement('ul');
      const listItemElement = new HippyElement('li');
      expect(listItemElement.component.name).toEqual(NATIVE_COMPONENT_MAP.ListViewItem);
      listElement.appendChild(listItemElement);
      const textElement = new HippyText('hello');
      listElement.appendChild(textElement);
      let [[[nativeNode]]] = listElement.convertToNativeNodes(true);
      expect(nativeNode?.props?.numberOfRows).toEqual(1);
      const divElement = new HippyElement('div');
      listElement.appendChild(divElement);
      [[[nativeNode]]] = listElement.convertToNativeNodes(true);
      expect(nativeNode?.props?.numberOfRows).toEqual(2);
      const textElementTwo = new HippyText('world');
      listElement.appendChild(textElementTwo);
      [[[nativeNode]]] = listElement.convertToNativeNodes(true);
      expect(nativeNode?.props?.numberOfRows).toEqual(2);
    });

    it('label tag test', () => {
      const labelElement = new HippyElement('label');
      expect(labelElement.component.name).toEqual(NATIVE_COMPONENT_MAP.Text);
    });

    it('span tag test', () => {
      const spanElement = new HippyElement('span');
      expect(spanElement.component.name).toEqual(NATIVE_COMPONENT_MAP.Text);
    });

    it('p tag test', () => {
      const pElement = new HippyElement('p');
      expect(pElement.component.name).toEqual(NATIVE_COMPONENT_MAP.Text);
    });

    it('a tag test', () => {
      const aElement = new HippyElement('a');
      expect(aElement.component.name).toEqual(NATIVE_COMPONENT_MAP.Text);
      // href link should not contain protocol
      aElement.setAttribute('href', 'hippyjs.org/index.html');
      let [[[nativeNode]]] = aElement.convertToNativeNodes(false);
      expect(nativeNode?.props?.href).toEqual('hippyjs.org/index.html');
      aElement.setAttribute('href', 'https://hippyjs.org/index.html');
      [[[nativeNode]]] = aElement.convertToNativeNodes(false);
      expect(nativeNode?.props?.href).toEqual('');
    });

    it('input tag test', () => {
      const inputElement = new HippyInputElement('input');
      expect(inputElement.component.name).toEqual(NATIVE_COMPONENT_MAP.TextInput);
      preCacheNode(inputElement, inputElement.nodeId);

      // input type should return special native type
      inputElement.setAttribute('type', 'text');
      let [[[nativeNode]]] = inputElement.convertToNativeNodes(false);
      expect(nativeNode?.props?.keyboardType).toEqual('default');
      // input type should return special native type
      inputElement.setAttribute('type', 'number');
      [[[nativeNode]]] = inputElement.convertToNativeNodes(false);
      expect(nativeNode?.props?.keyboardType).toEqual('numeric');
      // input type should return special native type
      inputElement.setAttribute('type', 'search');
      [[[nativeNode]]] = inputElement.convertToNativeNodes(false);
      expect(nativeNode?.props?.keyboardType).toEqual('web-search');
      // input type should return special native type
      inputElement.setAttribute('type', 'password');
      [[[nativeNode]]] = inputElement.convertToNativeNodes(false);
      expect(nativeNode?.props?.keyboardType).toEqual('password');

      // test editable props
      inputElement.setAttribute('disabled', true);
      [[[nativeNode]]] = inputElement.convertToNativeNodes(false);
      expect(nativeNode?.props?.editable).toBeFalsy();
      inputElement.setAttribute('disabled', false);
      [[[nativeNode]]] = inputElement.convertToNativeNodes(false);
      expect(nativeNode?.props?.editable).toBeTruthy();
      inputElement.setAttribute('value', 'hello');
      [[[nativeNode]]] = inputElement.convertToNativeNodes(false);
      expect(nativeNode?.props?.defaultValue).toEqual('hello');
      inputElement.setAttribute('maxlength', 10);
      [[[nativeNode]]] = inputElement.convertToNativeNodes(false);
      expect(nativeNode?.props?.maxLength).toEqual(10);
      Native.Localization.direction = 1;
      [[[nativeNode]]] = inputElement.convertToNativeNodes(false);
      expect(nativeNode?.props?.style?.textAlign).toEqual('right');

      // test event handle
      let text = 'hello';
      // changeText event
      inputElement.addEventListener('change', (event) => {
        text = event.value;
      });
      const changeEvent: NeedToTyped = {
        id: inputElement.nodeId,
        currentId: inputElement.nodeId,
        nativeName: 'onChangeText',
        originalName: 'changeText',
        params: {
          text: 'world',
        },
      };
      eventDispatcher.receiveComponentEvent(changeEvent, {
        eventPhase: 2,
      });
      expect(text).toEqual('world');

      inputElement.addEventListener('endEditing', (event) => {
        text = event.value;
      });

      const editEvent: NeedToTyped = {
        id: inputElement.nodeId,
        currentId: inputElement.nodeId,
        nativeName: 'onEndEditing',
        originalName: 'endEditing',
        params: {
          text: 'edit',
        },
      };
      eventDispatcher.receiveComponentEvent(editEvent, {
        eventPhase: 2,
      });
      expect(text).toEqual('edit');

      const selection = {
        start: 0,
        end: 0,
      };
      inputElement.addEventListener('select', (event) => {
        selection.start = event.start;
        selection.end = event.end;
      });
      const selectionEvent: NeedToTyped = {
        id: inputElement.nodeId,
        currentId: inputElement.nodeId,
        nativeName: 'onSelectionChange',
        originalName: 'selectionChange',
        params: {
          selection: {
            start: 1,
            end: 2,
          },
        },
      };
      eventDispatcher.receiveComponentEvent(selectionEvent, {
        eventPhase: 2,
      });
      expect(selection).toEqual({
        start: 1,
        end: 2,
      });

      const contentSize = {
        width: 0,
        height: 0,
      };
      inputElement.addEventListener('contentSizeChange', (event) => {
        contentSize.width = event.width;
        contentSize.height = event.height;
      });
      const contentSizeEvent: NeedToTyped = {
        id: inputElement.nodeId,
        currentId: inputElement.nodeId,
        nativeName: 'onContentSizeChange',
        originalName: 'contentSizeChange',
        params: {
          contentSize: {
            width: 1,
            height: 2,
          },
        },
      };
      eventDispatcher.receiveComponentEvent(contentSizeEvent, {
        eventPhase: 2,
      });
      expect(contentSize).toEqual({
        width: 1,
        height: 2,
      });

      let keyboardHeight = 0;
      Native.Platform = 'android';
      inputElement.addEventListener('keyboardWillShow', (event) => {
        keyboardHeight = event.keyboardHeight;
      });
      const keyboardHeightEvent: NeedToTyped = {
        id: inputElement.nodeId,
        currentId: inputElement.nodeId,
        nativeName: 'onKeyboardWillShow',
        originalName: 'keyboardWillShow',
        params: {
          keyboardHeight: 100,
        },
      };
      eventDispatcher.receiveComponentEvent(keyboardHeightEvent, {
        eventPhase: 2,
      });
      expect(keyboardHeight).toEqual(100);
    });

    it('textarea tag test', () => {
      const textareaElement = new HippyInputElement('textarea');
      expect(textareaElement.component.name).toEqual(NATIVE_COMPONENT_MAP.TextInput);
    });

    it('iframe tag test', () => {
      const iframeElement = new HippyElement('iframe');
      expect(iframeElement.component.name).toEqual(NATIVE_COMPONENT_MAP.WebView);
      preCacheNode(iframeElement, iframeElement.nodeId);


      iframeElement.setAttribute('src', 'https://hippyjs.org/');
      const [[[nativeNode]]] = iframeElement.convertToNativeNodes(false);
      expect(nativeNode?.props?.source?.uri).toEqual('https://hippyjs.org/');

      let url = '';
      iframeElement.addEventListener('load', (event) => {
        url = event.url;
      });
      const onLoadEvent: NeedToTyped = {
        id: iframeElement.nodeId,
        currentId: iframeElement.nodeId,
        nativeName: 'onLoad',
        originalName: 'load',
        params: {
          url: 'https://hippyjs.org/',
        },
      };
      eventDispatcher.receiveComponentEvent(onLoadEvent, {
        eventPhase: 2,
      });
      expect(url).toEqual('https://hippyjs.org/');

      iframeElement.addEventListener('loadStart', (event) => {
        url = event.url;
      });
      const onLoadStartEvent: NeedToTyped = {
        id: iframeElement.nodeId,
        currentId: iframeElement.nodeId,
        nativeName: 'onLoadStart',
        originalName: 'loadStart',
        params: {
          url: 'https://hippyjs.org/start',
        },
      };
      eventDispatcher.receiveComponentEvent(onLoadStartEvent, {
        eventPhase: 2,
      });
      expect(url).toEqual('https://hippyjs.org/start');

      iframeElement.addEventListener('loadEnd', (event) => {
        url = event.url;
      });
      const onLoadEndEvent: NeedToTyped = {
        id: iframeElement.nodeId,
        currentId: iframeElement.nodeId,
        nativeName: 'onLoadEnd',
        originalName: 'loadEnd',
        params: {
          url: 'https://hippyjs.org/end',
        },
      };
      eventDispatcher.receiveComponentEvent(onLoadEndEvent, {
        eventPhase: 2,
      });
      expect(url).toEqual('https://hippyjs.org/end');
    });
  });
});
