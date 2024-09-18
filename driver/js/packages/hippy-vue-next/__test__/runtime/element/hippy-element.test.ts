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

import { registerElement, type ElementComponent } from '../../../src/runtime/component';
import { HippyElement } from '../../../src/runtime/element/hippy-element';
import { NodeType } from '../../../src/runtime/node/hippy-node';
import { Native } from '../../../src/runtime/native';
import * as Render from '../../../src/runtime/render';
import { setHippyCachedInstance } from '../../../src/util/instance';
import { setTrimWhitespace } from '../../../src/util';

/**
 * hippy-element.ts unit test case
 */
describe('runtime/element/hippy-element', () => {
  beforeAll(() => {
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

    // clear mocked platform
    Native.Platform = '';
  });

  it('should convert the tag name to lowercase.', () => {
    const hippyElement = new HippyElement('DIV');
    expect(hippyElement.tagName).toBe('div');
  });

  describe('test the element operation methods.', () => {
    describe('append child element.', () => {
      it('should update the tree level properties after appending element.', () => {
        const parentHippyElement = new HippyElement('div');
        const childHippyElementPre = new HippyElement('div');
        const childHippyElementNext = new HippyElement('div');
        parentHippyElement.appendChild(childHippyElementPre);
        parentHippyElement.appendChild(childHippyElementNext);

        expect(childHippyElementPre.parentNode === parentHippyElement
            && childHippyElementNext.parentNode === parentHippyElement).toBeTruthy();
        expect(parentHippyElement.childNodes.length).toBe(2);
        expect(parentHippyElement.firstChild === childHippyElementPre).toBeTruthy();
        expect(parentHippyElement.lastChild === childHippyElementNext).toBeTruthy();
        expect(childHippyElementPre.nextSibling === childHippyElementNext).toBeTruthy();
        expect(childHippyElementNext.prevSibling === childHippyElementPre).toBeTruthy();
      });
    });

    describe('insert before child element.', () => {
      it('should update the tree level properties after insert element.', () => {
        const parentHippyElement = new HippyElement('div');
        const childHippyElementPre = new HippyElement('div');
        const childHippyElementNext = new HippyElement('div');
        parentHippyElement.appendChild(childHippyElementNext);
        parentHippyElement.insertBefore(
          childHippyElementPre,
          childHippyElementNext,
        );
        expect(childHippyElementPre.parentNode === parentHippyElement
            && childHippyElementNext.parentNode === parentHippyElement).toBeTruthy();
        expect(parentHippyElement.childNodes.length).toBe(2);
        expect(parentHippyElement.firstChild === childHippyElementPre).toBeTruthy();
        expect(parentHippyElement.lastChild === childHippyElementNext).toBeTruthy();
        expect(childHippyElementPre.nextSibling === childHippyElementNext).toBeTruthy();
        expect(childHippyElementNext.prevSibling === childHippyElementPre).toBeTruthy();
      });
    });

    describe('move child element.', () => {
      it('should update the tree level properties after move element.', () => {
        const parentHippyElement = new HippyElement('div');
        const childHippyElementFirst = new HippyElement('div');
        const childHippyElementMiddle = new HippyElement('div');
        const childHippyElementLast = new HippyElement('div');
        parentHippyElement.appendChild(childHippyElementFirst);
        parentHippyElement.appendChild(childHippyElementMiddle);
        parentHippyElement.appendChild(childHippyElementLast);
        // remove last child to the front of first child
        parentHippyElement.moveChild(
          childHippyElementLast,
          childHippyElementFirst,
        );

        expect(parentHippyElement.firstChild === childHippyElementLast).toBeTruthy();
        expect(parentHippyElement.lastChild === childHippyElementMiddle).toBeTruthy();
        expect(childHippyElementFirst.prevSibling === childHippyElementLast).toBeTruthy();
        expect(childHippyElementLast.nextSibling === childHippyElementFirst).toBeTruthy();
      });
    });

    describe('remove child element.', () => {
      it('should update the tree level properties after remove element.', () => {
        const parentHippyElement = new HippyElement('div');
        const childHippyElementFirst = new HippyElement('div');
        const childHippyElementMiddle = new HippyElement('div');
        const childHippyElementLast = new HippyElement('div');
        parentHippyElement.appendChild(childHippyElementFirst);
        parentHippyElement.appendChild(childHippyElementMiddle);
        parentHippyElement.appendChild(childHippyElementLast);
        parentHippyElement.removeChild(childHippyElementFirst);

        expect(parentHippyElement.childNodes.length).toEqual(2);
        expect(parentHippyElement.firstChild === childHippyElementMiddle).toBeTruthy();
        expect(childHippyElementMiddle.prevSibling).toBeNull();
      });
    });
  });

  describe('methods related to attributes.', () => {
    it('should return false if the attribute does not exist.', () => {
      const hippyElement = new HippyElement('div');
      expect(hippyElement.hasAttribute('style')).toBeFalsy();
    });

    it('should return true if the attribute exists.', () => {
      const hippyElement = new HippyElement('div');
      hippyElement.setAttribute('attr', 'test-attr');
      expect(hippyElement.hasAttribute('attr')).toBeTruthy();
    });

    it('should return the value of attributes by key.', () => {
      const hippyElement = new HippyElement('div');
      hippyElement.setAttribute('attr', 'test-attr');
      expect(hippyElement.getAttribute('attr')).toBe('test-attr');
    });

    it('should return false if delete the attribute.', () => {
      const hippyElement = new HippyElement('div');
      hippyElement.setAttribute('attr', 'test-attr');
      expect(hippyElement.hasAttribute('attr')).toBeTruthy();
      hippyElement.removeAttribute('attr');
      expect(hippyElement.hasAttribute('attr')).toBeFalsy();
    });

    it('should update the classList property instead of the attributes property.', () => {
      const hippyElement = new HippyElement('div');
      hippyElement.setAttribute('class', 'test-class');

      expect(hippyElement.hasAttribute('class')).toBeFalsy();
      expect(hippyElement.classList.has('test-class')).toBeTruthy();
    });

    it('should update the id property instead of the attributes property.', () => {
      const hippyElement = new HippyElement('div');
      hippyElement.setAttribute('id', 'divId');

      expect(hippyElement.hasAttribute('id')).toBeFalsy();
      expect(hippyElement.id).toBe('divId');
    });

    it('should convert the value to string.', () => {
      const hippyElement = new HippyElement('div');
      hippyElement.setAttribute('value', 100);

      expect(hippyElement.getAttribute('value')).toBe('100');
    });

    it('should convert the empty character.', () => {
      const hippyElement = new HippyElement('div');
      setTrimWhitespace(true);
      hippyElement.setAttribute('value', ' hello&nbsp;world ');
      expect(hippyElement.getAttribute('value')).toBe('hello&nbsp;world');
      setTrimWhitespace(false);
      hippyElement.setAttribute('value', ' hello&nbsp;world ');
      expect(hippyElement.getAttribute('value')).toBe(' hello&nbsp;world ');
    });

    it('should not take effect if set the numberOfRows attribute on ios.', () => {
      jest.spyOn(Native, 'isIOS').mockReturnValue(false);
      const updateChildSpy = jest
        .spyOn(Render, 'renderUpdateChildNativeNode')
        .mockImplementation(() => {});
      const hippyElement = new HippyElement('div');
      hippyElement.setAttribute('numberOfRows', '2');

      expect(updateChildSpy).not.toHaveBeenCalled();
    });

    it('should convert caretColor to caret-color.', () => {
      const hippyElement = new HippyElement('div');
      hippyElement.setAttribute('caretColor', 'black');

      expect(hippyElement.hasAttribute('caretColor')).toBeFalsy();
      expect(hippyElement.hasAttribute('caret-color')).toBeTruthy();
      expect(hippyElement.getAttribute('caret-color')).toEqual(4278190080);
      hippyElement.setAttribute('caret-color', 'white');
      expect(hippyElement.getAttribute('caret-color')).toEqual(4294967295);
    });

    it('color string value should be convert to native number', () => {
      const element = new HippyElement('div');
      element.setAttribute('nativeBackgroundAndroid', { color: '#00000011' });
      expect(element.attributes.nativeBackgroundAndroid.color).toEqual(285212672);
      element.setAttribute('nativeBackgroundAndroid', {
        color: 'rgba(0,0,0,0.07)',
      });
      expect(element.attributes.nativeBackgroundAndroid.color).toEqual(301989888);
      element.setAttribute('placeholderTextColor', '#abcdef');
      expect(element.attributes.placeholderTextColor).toEqual(4289449455);
      element.setAttribute('placeholder-text-color', '#abcdef');
      expect(element.attributes.placeholderTextColor).toEqual(4289449455);
      element.setAttribute('underlineColorAndroid', '#abc');
      expect(element.attributes.underlineColorAndroid).toEqual(4289379276);
      element.setAttribute('underline-color-android', '#abc');
      expect(element.attributes.underlineColorAndroid).toEqual(4289379276);
    });

    it('element text attribute should be string', () => {
      let element = new HippyElement('p');
      // non string will convert to string if value has toString method
      element.setAttribute('text', 123);
      expect(element.getAttribute('text')).toEqual('123');
      element.setAttribute('value', 123);
      expect(element.getAttribute('value')).toEqual('123');
      element.setAttribute('defaultValue', 123);
      expect(element.getAttribute('defaultValue')).toEqual('123');
      element.setAttribute('placeholder', 123);
      expect(element.getAttribute('placeholder')).toEqual('123');

      // string still string
      element = new HippyElement('span');
      element.setAttribute('text', '123', { textUpdate: true });
      expect(element.getAttribute('text')).toEqual('123');
      element.setAttribute('value', '123', { textUpdate: false });
      expect(element.getAttribute('value')).toEqual('123');
      element.setAttribute('defaultValue', '123', { notToNative: true });
      expect(element.getAttribute('defaultValue')).toEqual('123');
      element.setAttribute('placeholder', '123');
      expect(element.getAttribute('placeholder')).toEqual('123');

      // can not convert to string will throw error
      expect(() => element.setAttribute('text', undefined)).toThrow(TypeError);
      expect(() => element.setAttribute('value', undefined)).toThrow(TypeError);
      expect(() => element.setAttribute('defaultValue', undefined)).toThrow(TypeError);
      expect(() => element.setAttribute('placeholder', undefined)).toThrow(TypeError);
    });
  });

  describe('set text of hippy-element.', () => {
    it('should set the text attribute.', () => {
      const hippyElement = new HippyElement('div');
      hippyElement.setText('div texts');
      expect(hippyElement.attributes.text).toBe('div texts');
    });
  });

  describe('set style of hippy-element.', () => {
    it('should convert  style value to string.', () => {
      const hippyElement = new HippyElement('div');
      hippyElement.setStyle('fontWeight', 500);

      expect(hippyElement.style.fontWeight).toBe('500');
    });

    it('should convert caretColor to caret-color.', () => {
      const hippyElement = new HippyElement('div');

      hippyElement.setStyle('caretColor', '#abcdef');
      expect(hippyElement.style.caretColor).toBe(4289449455);
    });

    it('should set the backgroundImage style.', () => {
      const hippyElement = new HippyElement('div');
      hippyElement.setStyle(
        'backgroundImage',
        'https://mat1.gtimg.com/www/qq2018/imgs/qq_logo_2018x2.png',
      );

      expect(hippyElement.style.backgroundImage).toBe('https://mat1.gtimg.com/www/qq2018/imgs/qq_logo_2018x2.png');
    });

    it('should set the textShadowOffset style using single variable textShadowOffsetX or textShadowOffsetY.', () => {
      const hippyElement = new HippyElement('div');
      hippyElement.setStyle('textShadowOffsetX', 20);
      hippyElement.setStyle('textShadowOffsetY', 30);

      expect(hippyElement.style.textShadowOffset).toEqual({
        width: 20,
        height: 30,
      });
    });

    it('should set the textShadowOffset style using object textShadowOffset.', () => {
      const hippyElement = new HippyElement('div');
      hippyElement.setStyle('textShadowOffset', { x: 20, y: 30 });

      expect(hippyElement.style.textShadowOffset).toEqual({
        width: 20,
        height: 30,
      });
    });

    it('should set the style using object textShadowOffset.', () => {
      const hippyElement = new HippyElement('div');
      hippyElement.setStyle('textShadowOffset', { x: 20, y: 30 });

      expect(hippyElement.style.textShadowOffset).toEqual({
        width: 20,
        height: 30,
      });
    });

    it('should set other style names.', () => {
      const hippyElement = new HippyElement('div');
      hippyElement.setStyle('boxShadowOpacity', '0');
      hippyElement.setStyle('boxShadowRadius', '20px');
      hippyElement.setStyle('boxShadowColor', 'black');
      hippyElement.setStyle('testStyle', 0);

      expect(hippyElement.style.shadowOpacity).toBe(0);
      expect(hippyElement.style.shadowRadius).toBe(20);
      expect(hippyElement.style.shadowColor).not.toBeUndefined();
      expect(hippyElement.style.testStyle).toBe(0);
    });

    it('should not execute updateChild if set style in batches.', () => {
      const updateChildSpy = jest
        .spyOn(Render, 'renderUpdateChildNativeNode')
        .mockImplementation(() => {});
      const hippyElement = new HippyElement('div');
      hippyElement.setStyle('boxShadowColor', 'black', true);

      expect(updateChildSpy).not.toHaveBeenCalled();
    });

    it('removeStyle should clear all style attribute', () => {
      const hippyElement = new HippyElement('div');
      hippyElement.setStyle('boxShadowOpacity', '0');
      expect(hippyElement.style.shadowOpacity).toBe(0);
      hippyElement.removeStyle();
      expect(hippyElement.style).toEqual({});
    });

    it('set style value to undefined should delete property', () => {
      const hippyElement = new HippyElement('div');
      hippyElement.setStyle('flex', 1);
      expect(hippyElement.style.flex).toBeDefined();
      // remove property
      hippyElement.setStyle('flex', undefined);
      expect(hippyElement.style.flex).toBeUndefined();
    });

    it('default branch of set style should work correct', () => {
      const hippyElement = new HippyElement('div');
      hippyElement.setStyle('width', '100px');
      expect(hippyElement.style.width).toEqual(100);
      hippyElement.setStyle('width', '101.123');
      expect(hippyElement.style.width).toEqual(101.123);
    });

    it('null or value same should not change value', () => {
      const hippyElement = new HippyElement('div');
      hippyElement.setStyle('width', '101.1');
      expect(hippyElement.style.width).toEqual(101.1);
      hippyElement.setStyle('width', '101.1px');
      expect(hippyElement.style.width).toEqual(101.1);
    });

    it('setStyles method should work correct', () => {
      const hippyElement = new HippyElement('div');
      hippyElement.setStyles({
        width: '101.1',
        flex: 1,
        textShadowOffset: { x: 20, y: 30 },
      });
      expect(hippyElement.style.width).toEqual(101.1);
      expect(hippyElement.style.flex).toEqual(1);
      expect(hippyElement.style.textShadowOffset).toEqual({ width: 20, height: 30 });
    });
  });

  describe('test scroll methods of hippy-element.', () => {
    it('should invoke callUIFunction when call scrollToPosition.', () => {
      const callUIFunctionSpy = jest.spyOn(Native, 'callUIFunction');
      const hippyElement = new HippyElement('div');
      hippyElement.scrollToPosition(0, 0, false);
      expect(callUIFunctionSpy).toHaveBeenCalled();
    });

    it('should invoke callUIFunction when call scrollTo method and the param x is number.', () => {
      const callUIFunctionSpy = jest.spyOn(Native, 'callUIFunction');
      const hippyElement = new HippyElement('div');
      hippyElement.scrollTo(0, 0);
      expect(callUIFunctionSpy).toHaveBeenCalled();
    });

    it('should invoke callUIFunction when call scrollTo method and the param x is object.', () => {
      const callUIFunctionSpy = jest.spyOn(Native, 'callUIFunction');
      const hippyElement = new HippyElement('div');
      hippyElement.scrollTo(
        { left: 0, top: 0, behavior: 'none', duration: 100 },
        0,
      );
      expect(callUIFunctionSpy).toHaveBeenCalled();
    });
  });

  describe('test event methods of hippy-element.', () => {
    it('should invoke updateChild when call addEventListener method.', () => {
      const updateChildSpy = jest
        .spyOn(Render, 'renderUpdateChildNativeNode')
        .mockImplementation(() => {});
      const hippyElement = new HippyElement('div');
      hippyElement.isMounted = true;
      hippyElement.addEventListener('hello', () => {});
      expect(updateChildSpy).toHaveBeenCalled();
    });
  });

  describe('test style.display attribute of hippy-element.', () => {
    it('display should be undefined by default', () => {
      const hippyElement = new HippyElement('div');
      expect(hippyElement.style.display).toBeUndefined();
    });

    it('display should be flex when set undefined', () => {
      const hippyElement = new HippyElement('div');
      hippyElement.style.display = undefined;
      expect(hippyElement.style.display).toEqual('flex');
    });

    it('display should be the same value when set others', () => {
      const hippyElement = new HippyElement('div');
      hippyElement.style.display = 'none';
      expect(hippyElement.style.display).toEqual('none');
      hippyElement.style.display = 'flex';
      expect(hippyElement.style.display).toEqual('flex');
      hippyElement.style.display = 'block';
      expect(hippyElement.style.display).toEqual('block');
    });
  });

  describe('test setNativeProps method of hippy-element', () => {
    it('set NativeProps method should work correct', () => {
      const element = new HippyElement('p');
      element.setNativeProps({ abc: 'abc' });
      expect(element.style.abc).toEqual(undefined);
      element.setNativeProps({ style: { abc: 'abc' } });
      expect(element.style.abc).toEqual('abc');
      element.setNativeProps({ style: { bcd: '123' } });
      expect(element.style.bcd).toEqual(123);
      element.setNativeProps({ style: { fontWeight: '100' } });
      expect(element.style.fontWeight).toEqual('100');
      element.setNativeProps({ style: { fontWeight: 200 } });
      expect(element.style.fontWeight).toEqual('200');
      element.setNativeProps({ style: { fontWeight: 'bold' } });
      expect(element.style.fontWeight).toEqual('bold');
      element.setNativeProps({ style: { width: '100px' } });
      expect(element.style.width).toEqual(100);
      element.setNativeProps({ style: { height: '100.201px' } });
      expect(element.style.height).toEqual(100.201);
      element.setNativeProps({ style: { cde: {} } });
      expect(element.style.cde).toEqual({});
      element.setNativeProps({ style: { caretColor: '#abcdef' } });
      expect(element.style.caretColor).toEqual(4289449455);
      element.setNativeProps({ style: { placeholderTextColor: '#abcdef' } });
      expect(element.style.placeholderTextColor).toEqual(4289449455);
      element.setNativeProps({ style: { underlineColorAndroid: '#abcdef' } });
      expect(element.style.underlineColorAndroid).toEqual(4289449455);
    });
  });

  describe('ui function should exist', () => {
    const element = new HippyElement('p');

    it('setHotspot method should exist', () => {
      const callUIFunctionSpy = jest.spyOn(Native, 'callUIFunction');
      element.setHotspot(10, 100);
      expect(callUIFunctionSpy).toHaveBeenCalled();
    });
    it('setPressed method should exist', () => {
      const callUIFunctionSpy = jest.spyOn(Native, 'callUIFunction');
      element.setPressed(true);
      expect(callUIFunctionSpy).toHaveBeenCalled();
    });
  });

  describe('repaintWithChildren function should exist', () => {
    it('repaintWithChildren method should exist', () => {
      const element = new HippyElement('p');
      const callUIFunctionSpy = jest.spyOn(element, 'updateNativeNode');
      element.repaintWithChildren();
      expect(callUIFunctionSpy).toHaveBeenCalled();
    });
  });

  describe('convertToNativeNodes method should return correct native node', () => {
    it('no registered tag should throw error', () => {
      const element = new HippyElement('vue-next-tag');
      expect(() => element.convertToNativeNodes(false)).toThrow(Error);
    });

    it('no need insert node should return empty array', () => {
      // span component
      const p: ElementComponent = {
        component: {
          name: 'Text',
        },
      };
      registerElement('p', p);
      const element = new HippyElement('p');
      element.isNeedInsertToNative = false;
      const [nativeNode] = element.convertToNativeNodes(false);
      expect(nativeNode).toEqual([]);
    });

    it('registered tag should return correct native node', () => {
      // span component
      const span: ElementComponent = {
        component: {
          name: 'Text',
          attributeMaps: {},
          eventNamesMap: new Map(),
          defaultNativeProps: {
            text: '',
          },
        },
      };
      registerElement('span', span);
      const element = new HippyElement('span');
      const childElement = new HippyElement('span');
      element.appendChild(childElement);
      const [[[nativeNode]]] = element.convertToNativeNodes(false);
      expect(nativeNode).toEqual(expect.objectContaining({
        pId: 1,
        name: 'Text',
        id: 62,
        props: {
          text: '',
          style: {},
          attributes: {
            id: '',
            class: '',
            hippyNodeId: '62',
          },
        },
        tagName: 'span',
      }));
      const nativeNodeList = element.convertToNativeNodes(true);
      expect(nativeNodeList.length).toEqual(3);
    });
    it('registered camelize custom tag should return correct native node', () => {
      // custom component
      const customElement: ElementComponent = {
        component: {
          name: 'Text',
          attributeMaps: {},
          eventNamesMap: new Map(),
          defaultNativeProps: {
            text: '',
          },
        },
      };
      registerElement('CustomTag', customElement);
      const element = new HippyElement('custom-tag');
      const childElement = new HippyElement('custom-tag');
      element.appendChild(childElement);
      const [[[nativeNode]]] = element.convertToNativeNodes(false);
      expect(nativeNode).toEqual(expect.objectContaining({
        pId: 1,
        name: 'Text',
        id: 64,
        props: {
          text: '',
          style: {},
          attributes: {
            id: '',
            class: '',
            hippyNodeId: '64',
          },
        },
        tagName: 'custom-tag',
      }));
      const nativeNodeList = element.convertToNativeNodes(true);
      expect(nativeNodeList.length).toEqual(3);
    });
    it('registered hyphenate custom tag should return correct native node', () => {
      // custom component
      const customElement: ElementComponent = {
        component: {
          name: 'Text',
          attributeMaps: {},
          eventNamesMap: new Map(),
          defaultNativeProps: {
            text: '',
          },
        },
      };
      registerElement('Custom-Tag', customElement);
      const element = new HippyElement('custom-tag');
      const childElement = new HippyElement('custom-tag');
      element.appendChild(childElement);
      const [[[nativeNode]]] = element.convertToNativeNodes(false);
      expect(nativeNode).toEqual(expect.objectContaining({
        pId: 1,
        name: 'Text',
        id: 66,
        props: {
          text: '',
          style: {},
          attributes: {
            id: '',
            class: '',
            hippyNodeId: '66',
          },
        },
        tagName: 'custom-tag',
      }));
      const nativeNodeList = element.convertToNativeNodes(true);
      expect(nativeNodeList.length).toEqual(3);
    });
  });

  describe('root node id check', () => {
    it('return is or not root node', () => {
      const node = new HippyElement('div');
      expect(node.isRootNode()).toBeFalsy();
      node.id = 'root';
      expect(node.isRootNode()).toBeTruthy();
    });
  });

  it('parseRem method check', () => {
    const resultStyle = HippyElement.parseRem({
      width: '1.2rem',
      height: '120px',
    });
    expect(resultStyle).toEqual({ width: 60, height: '120px' });
  });

  it('setStyleScopedId method should work correct', () => {
    const element = new HippyElement('div');
    element.setStyleScope('style-scoped-id');
    expect(element.styleScopeId).toEqual(['style-scoped-id']);
    element.setStyleScope({});
    expect(element.styleScopeId).toEqual(['style-scoped-id', '[object Object]']);
    element.setStyleScope(12345);
    expect(element.styleScopeId).toEqual(['style-scoped-id', '[object Object]', '12345']);
  });


  describe('ssr node should work correctly', () => {
    it('ssr node should init correctly', () => {
      const commentElement = new HippyElement('comment');
      expect(commentElement.nodeType).toEqual(NodeType.CommentNode);
      const ssrElement = new HippyElement('div', {
        id: 1001,
        index: 0,
        name: 'View',
        props: {
          attributes: {
            id: 'root',
            class: 'classA  classB',
          },
          text: 'hello',
          inlineStyle: {
            fontSize: 24,
          },
        },
      });

      expect(ssrElement.nodeId).toEqual(1001);
      expect(ssrElement.id).toEqual('root');
      expect(ssrElement.classList).toEqual(new Set(['classA', 'classB']));
      expect(ssrElement.nodeId).toEqual(1001);
      expect(ssrElement.value).toEqual('hello');
      expect(ssrElement.textContent).toEqual('hello');
      expect(ssrElement.ssrInlineStyle).toEqual({
        fontSize: 24,
      });
      expect(ssrElement.attributes).toEqual({
        text: 'hello',
      });
    });
    it('ssr node event handle correctly', () => {
      const element = new HippyElement('div', {
        id: 1001,
        index: 0,
        name: 'View',
        props: {
          attributes: {
            id: 'root',
            class: 'classA  classB',
          },
          text: 'hello',
          innerStyle: {
            fontSize: 24,
          },
          onClick: true,
        },
      });
      expect(element.attributes.onClick).toBeTruthy();
      const callUIFunctionSpy = jest.spyOn(element, 'updateNativeNode');
      // add event listener, ssr props exist event listener, should not update native
      element.addEventListener('click', () => {});
      expect(callUIFunctionSpy).toHaveBeenCalledTimes(0);
      // add event listener, new event listener, should update native
      element.addEventListener('drop', () => {});
      expect(callUIFunctionSpy).toHaveBeenCalledTimes(1);
      // add event listener, new event listener, should update native
      element.addEventListener('touchmove', () => {});
      expect(callUIFunctionSpy).toHaveBeenCalledTimes(2);
      // remove event listener
      element.removeEventListener('click', () => {});
      expect(element.attributes.onClick).toBeUndefined();
    });
  });
});
