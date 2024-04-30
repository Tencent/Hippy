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

import type { NeedToTyped } from '../../../src/types';
import { HippyListElement } from '../../../src/runtime/element/hippy-list-element';
import { Native, CACHE } from '../../../src/runtime/native/index';
import { EventBus } from '../../../src/runtime/event/event-bus';

/**
 * native/index.ts unit test case
 */
describe('runtime/native.ts', () => {
  const nativePlatformOrigin = Object.getOwnPropertyDescriptor(
    Native,
    'Platform',
  );
  const callNativeWithPromiseOrigin = Object.getOwnPropertyDescriptor(
    Native,
    'callNativeWithPromise',
  );
  const callNativeOrigin = Object.getOwnPropertyDescriptor(
    Native,
    'callNative',
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });
  afterEach(() => {
    Object.defineProperty(Native, 'Platform', nativePlatformOrigin ?? {});
    Object.defineProperty(
      Native,
      'callNativeWithPromise',
      callNativeWithPromiseOrigin ?? {},
    );
    Object.defineProperty(Native, 'callNative', callNativeOrigin ?? {});
  });

  it('judge platform is ios or android', async () => {
    expect(Native.isIOS()).toEqual(false);
    expect(Native.isAndroid()).toEqual(true);
  });
  it('ios test native inject osversion, sdkversion and api level', async () => {
    Object.defineProperty(Native, 'Platform', {
      get() {
        return Native.Platform;
      },
    });
    const deviceSpy = jest.spyOn(Native, 'Platform', 'get');
    deviceSpy.mockImplementation(() => 'ios');
    expect(Native.APILevel).toEqual(null);
    expect(Native.OSVersion).toEqual('1.0.0.0');
    expect(Native.SDKVersion).toEqual('1.0.0.0');
  });
  it('android test native inject osversion, sdkversion and api level', async () => {
    // after will reset defineProperty
    expect(Native.APILevel).toEqual('1.0.0.0');
    expect(Native.OSVersion).toEqual(null);
    expect(Native.SDKVersion).toEqual(null);
  });
  it('test native cal onePixel', async () => {
    expect(Native.OnePixel).toEqual(1);
  });
  it('test native isIphoneX', async () => {
    Object.defineProperty(Native, 'Platform', {
      get() {
        return Native.Platform;
      },
    });
    const deviceSpy = jest.spyOn(Native, 'Platform', 'get');
    deviceSpy.mockImplementation(() => 'ios');
    expect(Native.isIPhoneX).toEqual(false);
  });
  it('test native screenIsVertical', async () => {
    expect(Native.screenIsVertical).toEqual(true);
  });
  it('test native output android device', async () => {
    expect(Native.Device).toEqual('Android device');
    // Native.device has side effect，which need reset after test
    CACHE.Device = undefined;
  });
  it('test native output ios device', async () => {
    Object.defineProperty(Native, 'Platform', {
      get() {
        return Native.Platform;
      },
    });
    const deviceSpy = jest.spyOn(Native, 'Platform', 'get');
    deviceSpy.mockImplementation(() => 'ios');
    expect(Native.Device).toEqual('iPhone 12');
    CACHE.Device = undefined;
  });
  it('test native output dimensions', async () => {
    expect(Native.Dimensions).toEqual({
      screen: {
        width: 375,
        height: 667,
        scale: 1,
        fontScale: 1,
        statusBarHeight: 20,
        navigatorBarHeight: 20,
      },
      window: {
        width: 375,
        height: 667,
        scale: 1,
        fontScale: 1,
        statusBarHeight: 20,
        navigatorBarHeight: 20,
      },
    });
  });
  // mock native bridge calls
  it('test native bridge calls: clipboard', async () => {
    Object.defineProperty(Native, 'callNativeWithPromise', {
      value: async () => '123',
    });
    Native.Clipboard.setString('123');
    expect(await Native.Clipboard.getString()).toEqual('123');
  });
  it('test native bridge calls: cookie.getAll invalid', async () => {
    await expect(() => Native.Cookie.getAll('')).toThrow(new Error('Native.Cookie.getAll() must have url argument'));
  });

  it('test native bridge calls: cookie.set invalid', async () => {
    expect(() => Native.Cookie.set('', '')).toThrow(new Error('Native.Cookie.set() must have url argument'));
  });

  it('test native bridge calls: cookie', async () => {
    Object.defineProperty(Native, 'callNativeWithPromise', {
      value: async () => Promise.resolve('https://hippyjs.org'),
    });
    Native.Cookie.set('https://hippyjs.org', 'uin', new Date());
    expect(await Native.Cookie.getAll('https://hippyjs.org')).toEqual('https://hippyjs.org');
  });

  it('test native bridge calls: imageLoader', async () => {
    Object.defineProperty(Native, 'callNativeWithPromise', {
      value: async () => Promise.resolve(100),
    });
    Native.ImageLoader.prefetch('https://hippyjs.org');
    expect(await Native.ImageLoader.getSize('https://hippyjs.org')).toEqual(100);
  });
  it('test native bridge calls: netInfo', async () => {
    Object.defineProperty(Native, 'callNativeWithPromise', {
      value: async () => Promise.resolve({
        network_info: '4G',
      }),
    });
    expect(await Native.NetInfo.fetch()).toEqual('4G');

    let network = '4G';
    const networkCb = (realNetwork) => {
      network = realNetwork;
    };
    Native.NetInfo.addEventListener('change', networkCb);
    EventBus.$emit('networkStatusDidChange', 'WiFi');
    expect(network).toEqual('WiFi');
    Native.NetInfo.removeEventListener('change', networkCb);
    EventBus.$emit('networkStatusDidChange', '5G');
    expect(network).toEqual('WiFi');
  });
  it('test parseColor', async () => {
    expect(Native.parseColor('#ffffff', { platform: 'ios' })).toEqual(4294967295);
  });
  it('test native bridge calls: callUIFunction', async () => {
    // always return void
    const el = new HippyListElement('ul');
    expect(Native.callUIFunction(el, 'scrollToIndex', [0, 0, true])).toBeUndefined();
  });
  it('test native bridge calls: measureInAppWindow empty', async () => {
    // an empty node
    const el = new HippyListElement('ul');
    expect(await Native.measureInAppWindow(el)).toEqual({
      top: -1,
      left: -1,
      bottom: -1,
      right: -1,
      width: -1,
      height: -1,
    });
  });
  it('test native bridge calls: measureInAppWindow', async () => {
    // this view is null
    const el = new HippyListElement('ul');
    Object.defineProperty(Native, 'callNative', {
      value: (
        moduleName: string,
        methodName: string,
        ...args: NeedToTyped[]
      ) => {
        const [, callback] = args;
        callback('this view is null');
      },
    });
    el.isMounted = true;
    expect(await Native.measureInAppWindow(el)).toEqual({
      top: -1,
      left: -1,
      bottom: -1,
      right: -1,
      width: -1,
      height: -1,
    });
  });
  it('test native bridge calls: measureInAppWindow regular res', async () => {
    const el = new HippyListElement('ul');
    Object.defineProperty(Native, 'callNative', {
      value: (
        moduleName: string,
        methodName: string,
        ...args: NeedToTyped[]
      ) => {
        const [, callback] = args;
        callback({
          x: 0,
          y: 0,
          width: 375,
          height: 667,
        });
      },
    });
    el.isMounted = true;
    expect(await Native.measureInAppWindow(el)).toEqual({
      top: 0,
      left: 0,
      bottom: 667,
      right: 375,
      width: 375,
      height: 667,
    });
  });
  it('test native bridge calls: getBoundingClientRect with successful response', async () => {
    const el = new HippyListElement('ul');
    Object.defineProperty(Native, 'callNative', {
      value: (
        moduleName: string,
        methodName: string,
        ...args: NeedToTyped[]
      ) => {
        const [,, callback] = args;
        callback({
          x: 0,
          y: 0,
          width: 375,
          height: 667,
        });
      },
    });
    el.isMounted = true;
    expect(await Native.getBoundingClientRect(el)).toEqual({
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      bottom: 667,
      right: 375,
      width: 375,
      height: 667,
    });
  });
  it('test native bridge calls: getBoundingClientRect error', async () => {
    const el = new HippyListElement('ul');
    Object.defineProperty(Native, 'callNative', {
      value: (
        moduleName: string,
        methodName: string,
        ...args: NeedToTyped[]
      ) => {
        const [, , callback] = args;
        callback({
          errMsg: 'this view is null',
        });
      },
    });
    el.isMounted = true;
    await expect(Native.getBoundingClientRect(el)).rejects.toThrow(new Error('this view is null'));
  });
  it('test native bridge calls: getBoundingClientRect with no response', async () => {
    const el = new HippyListElement('ul');
    Object.defineProperty(Native, 'callNative', {
      value: (
        moduleName: string,
        methodName: string,
        ...args: NeedToTyped[]
      ) => {
        const [, , callback] = args;
        callback();
      },
    });
    el.isMounted = true;
    await expect(Native.getBoundingClientRect(el)).rejects.toThrow(new Error('getBoundingClientRect error with no response'));
  });
  it('test native bridge calls: getBoundingClientRect node not mounted', async () => {
    const el = new HippyListElement('ul');
    Object.defineProperty(Native, 'callNative', {
      value: (
        moduleName: string,
        methodName: string,
        ...args: NeedToTyped[]
      ) => {
        const [, , callback] = args;
        callback({});
      },
    });
    await expect(Native.getBoundingClientRect(el))
      .rejects
      .toThrow(new Error(`getBoundingClientRect cannot get nodeId of ${el} or ${el} is not mounted`));
  });

  it('get element css should work correct', () => {
    expect(Native.getElemCss(new HippyListElement('ul'))).toEqual({});
    // todo, add css case
  });
});
