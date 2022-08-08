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

/**
 * runtime/native unit test
 */
import type { NeedToTyped } from '../../../src/config';
import { HippyListElement } from '../../../src/runtime/element/hippy-list-element';
import { Native, CACHE } from '../../../src/runtime/native/index';

/**
 * @author mitnickliu
 * @priority P0
 * @casetype unit
 */
describe('runtime/native.ts', () => {
  const nativePlatformOrigin = Object.getOwnPropertyDescriptor(
    Native,
    'platform',
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
    Object.defineProperty(Native, 'platform', nativePlatformOrigin ?? {});
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
    Object.defineProperty(Native, 'platform', {
      get() {
        return Native.platform;
      },
    });
    const deviceSpy = jest.spyOn(Native, 'platform', 'get');
    deviceSpy.mockImplementation(() => 'ios');
    expect(Native.apiLevel).toEqual(null);
    expect(Native.osVersion).toEqual('1.0.0.0');
    expect(Native.sdkVersion).toEqual('1.0.0.0');
  });
  it('android test native inject osversion, sdkversion and api level', async () => {
    // after will reset defineProperty
    expect(Native.apiLevel).toEqual('1.0.0.0');
    expect(Native.osVersion).toEqual(null);
    expect(Native.sdkVersion).toEqual(null);
  });
  it('test native cal onePixel', async () => {
    expect(Native.onePixel).toEqual(1);
  });
  it('test native isIphoneX', async () => {
    Object.defineProperty(Native, 'platform', {
      get() {
        return Native.platform;
      },
    });
    const deviceSpy = jest.spyOn(Native, 'platform', 'get');
    deviceSpy.mockImplementation(() => 'ios');
    expect(Native.isIphoneX).toEqual(false);
  });
  it('test native isVerticalScreen', async () => {
    expect(Native.isVerticalScreen).toEqual(true);
  });
  it('test native output android device', async () => {
    expect(Native.device).toEqual('Android device');
    // Native.device has side effect，which needs reset after test
    CACHE.Device = undefined;
  });
  it('test native output ios device', async () => {
    Object.defineProperty(Native, 'platform', {
      get() {
        return Native.platform;
      },
    });
    const deviceSpy = jest.spyOn(Native, 'platform', 'get');
    deviceSpy.mockImplementation(() => 'ios');
    expect(Native.device).toEqual('iPhone 12');
    CACHE.Device = undefined;
  });
  it('test native output dimensions', async () => {
    expect(Native.dimensions).toEqual({
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
    expect(await Native.clipboard.getString()).toEqual('123');
    expect(Native.clipboard.setString('123')).toBeUndefined();
  });
  it('test native bridge calls: cookie', async () => {
    Object.defineProperty(Native, 'callNativeWithPromise', {
      value: async () => Promise.resolve('https://www.qq.com'),
    });
    expect(await Native.cookie.getAll('https://www.qq.com')).toEqual('https://www.qq.com');
    expect(Native.cookie.set('https://www.qq.com', 'uin', new Date())).toBeUndefined();
  });
  it('test native bridge calls: imageLoader', async () => {
    Object.defineProperty(Native, 'callNativeWithPromise', {
      value: async () => Promise.resolve(100),
    });
    expect(await Native.imageLoader.getSize('https://www.qq.com')).toEqual(100);
    expect(Native.imageLoader.prefetch('https://www.qq.com')).toBeUndefined();
  });
  it('test native bridge calls: netInfo', async () => {
    Object.defineProperty(Native, 'callNativeWithPromise', {
      value: async () => Promise.resolve({
        network_info: '4G',
      }),
    });
    expect(await Native.netInfo.fetch()).toEqual('4G');
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
});
