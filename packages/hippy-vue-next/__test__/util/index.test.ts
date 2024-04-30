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

import type { ComponentPublicInstance } from '@vue/runtime-core';
import * as index from '../../src/util/index';
import {  HIPPY_DEBUG_ADDRESS, HIPPY_UNIQUE_ID_KEY } from '../../src/config';
import { getEventRedirects } from '../../src/util/index';

/**
 * index.ts unit test case
 */
describe('util/index.ts', () => {
  it('tryConvertNumber should return right value when params give', async () => {
    expect(index.tryConvertNumber('123')).toEqual(123);

    expect(index.tryConvertNumber(123)).toEqual(123);

    expect(index.tryConvertNumber('123.123')).toEqual(123.123);

    expect(index.tryConvertNumber('test')).toEqual('test');
  });

  it('capitalizeFirstLetter should capitalize the first letter', async () => {
    expect(index.capitalizeFirstLetter('test')).toEqual('Test');

    expect(index.capitalizeFirstLetter('Test')).toEqual('Test');
  });

  it('lowerFirstLetter should lower the first letter', async () => {
    expect(index.lowerFirstLetter('Test')).toEqual('test');

    expect(index.lowerFirstLetter('Test')).toEqual('test');
  });

  it('normalizeTagName should lower all of the tagName', async () => {
    expect(index.normalizeTagName('LocalComponent')).toEqual('localcomponent');

    expect(index.normalizeTagName('AsyncCOMPONENT')).toEqual('asynccomponent');

    expect(index.normalizeTagName('httpcomponent')).toEqual('httpcomponent');
  });

  it('getUniqueId should return the unique id, auto increment one', async () => {
    expect(index.getUniqueId()).toEqual(1);
    expect(index.getUniqueId()).toEqual(2);
    expect(index.getUniqueId()).toEqual(3);
    expect(index.getUniqueId()).toEqual(4);
    expect(index.getUniqueId()).toEqual(5);
    expect(index.getUniqueId()).toEqual(6);
    expect(index.getUniqueId()).toEqual(7);
    expect(index.getUniqueId()).toEqual(8);
    expect(index.getUniqueId()).toEqual(9);
    // should not equal 10, id multiples of 10 is used by native
    expect(index.getUniqueId()).toEqual(11);

    global[HIPPY_UNIQUE_ID_KEY] = 20;
    expect(index.getUniqueId()).toEqual(21);
  });

  it('unicodeToChar', async () => {
    expect(index.unicodeToChar('\u4f60\u597d')).toEqual('你好');
    expect(index.unicodeToChar('\u0068\u0065\u006c\u006c\u006f')).toEqual('hello');
  });

  it('setsAreEqual', async () => {
    expect(index.setsAreEqual(new Set([1, 2, 3]), new Set([1, 2, 3]))).toBeTruthy();
    expect(index.setsAreEqual(new Set(['a', 'b', 'c']), new Set(['a', 'b', 'c']))).toBeTruthy();
    expect(index.setsAreEqual(new Set([1, 2]), new Set([1, 2, 3]))).toBeFalsy();
    expect(index.setsAreEqual(new Set([1, 2, 3]), new Set([1, 2]))).toBeFalsy();
    expect(index.setsAreEqual(new Set([1, 2, 3]), new Set([1, 2, 4]))).toBeFalsy();
  });

  it('getNormalizeEventName should return right event Name, start with on and capitalize first letter', async () => {
    expect(index.getNormalizeEventName('click')).toEqual('onClick');
    expect(index.getNormalizeEventName('change')).toEqual('onChange');
    expect(index.getNormalizeEventName('keyup')).toEqual('onKeyup');
  });

  it('mapEvent should return correct map with given event or event list', () => {
    expect(index.mapHippyEvent('listReady', 'initialListReady')).toEqual(new Map().set('listReady', 'initialListReady')
      .set('initialListReady', 'listReady'));
    const eventMap = new Map();
    eventMap.set('change', 'onChangeText');
    eventMap.set('onChangeText', 'change');
    eventMap.set('select', 'onSelectionChange');
    eventMap.set('onSelectionChange', 'select');
    expect(index.mapHippyEvent([
      ['change', 'onChangeText'],
      ['select', 'onSelectionChange'],
    ])).toEqual(eventMap);
  });

  it('arrayCount should return correct count', () => {
    expect(index.arrayCount([], () => {})).toEqual(0);
    expect(index.arrayCount([1, 2, 3], () => {})).toEqual(0);
    expect(index.arrayCount([1, 2, 3], (val: number) => val > 1)).toEqual(2);
  });

  it('convertImageLocalPath should return correct local path', () => {
    expect(index.convertImageLocalPath('https://hippjs.org/image/index.png')).toEqual('https://hippjs.org/image/index.png');
    expect(index.convertImageLocalPath('assets/index.png')).toEqual(`${HIPPY_DEBUG_ADDRESS}assets/index.png`);
  });

  it('getEventRedirects should return correct event listener object', () => {
    expect(getEventRedirects.call({ $attrs: {
      dropped: true,
    } } as unknown as ComponentPublicInstance, [
      ['dropped', 'pageSelected'],
    ])).toEqual({});
    expect(getEventRedirects.call({ $attrs: {
      onDropped: true,
    } } as unknown as ComponentPublicInstance, [
      ['dropped', 'pageSelected'],
    ])).toEqual({
      onPageSelected: true,
    });
    expect(getEventRedirects.call({ $attrs: {} } as unknown as ComponentPublicInstance, [
      'headerReleased',
    ])).toEqual({});
  });

  it('setBeforeLoadStyle & getBeforeLoadStyle should work fine', () => {
    const hook = () => {};
    index.setBeforeLoadStyle(hook);
    expect(index.getBeforeLoadStyle()).toEqual(hook);
  });

  it('unicodeToChar should work correct', () => {
    expect(index.unicodeToChar('hello')).toEqual('hello');
    expect(index.unicodeToChar('\u0065\u0066')).toEqual('ef');
  });

  it('isEmpty should work correct', () => {
    expect(index.isEmpty(undefined)).toBeTruthy();
    expect(index.isEmpty(123)).toBeTruthy();
    expect(index.isEmpty('')).toBeTruthy();
    expect(index.isEmpty({})).toBeTruthy();
    expect(index.isEmpty({ test: 'test' })).toBeFalsy();
  });

  it('setSilent should work correct', () => {
    expect(index.setSilent).toBeDefined();
    index.setSilent(true);
  });

  it('isNullOrUndefined should work correct', () => {
    expect(index.isNullOrUndefined(null)).toBeTruthy();
    expect(index.isNullOrUndefined(undefined)).toBeTruthy();
    expect(index.isNullOrUndefined('123')).toBeFalsy();
    expect(index.isNullOrUndefined(123)).toBeFalsy();
    expect(index.isNullOrUndefined({})).toBeFalsy();
    expect(index.isNullOrUndefined([])).toBeFalsy();
  });

  it('deepCopy should work correct', () => {
    expect(() => index.deepCopy(123)).toThrow(Error);
    expect(() => index.deepCopy(null)).toThrow(Error);
    const rawData = {
      a: 1,
      b: '1',
      c: {
        a: 1,
      },
      d: [1],
      e: new Set([1]),
      f: new Map().set('a', 1),
    };
    const newData = index.deepCopy(rawData);
    expect(newData === rawData).toBeFalsy();
    expect(newData.a).toEqual(1);
    expect(newData.b).toEqual('1');
    expect(newData.c).toEqual({ a: 1 });
    expect(newData.d).toEqual([1]);
    expect(newData.e).toEqual(new Set([1]));
    expect(newData.f).toEqual(new Map().set('a', 1));
  });

  it('getStyleClassList should work correctly', () => {
    expect(index.getStyleClassList('')).toEqual([]);
    expect(index.getStyleClassList('a b c')).toEqual(['a', 'b', 'c']);
    expect(index.getStyleClassList(' a   b c ')).toEqual(['a', 'b', 'c']);
  });
});
