/* eslint-disable no-underscore-dangle */

import test, { before } from 'ava';
import * as nodeOps from '../node-ops';
import { setVue, setApp } from '../../util';
import Native from '../native';

before(() => {
  global.Hippy = {
    platform: {
      OS: 'android',
      APILevel: 29,
    },
    window: {
      width: 423.5294196844927,
      height: 749.0196218494269,
      scale: 2.549999952316284,
      fontScale: 2.549999952316284,
      statusBarHeight: 28.235294645632848,
      navigatorBarHeight: 0,
    },
    screen: {
      width: 423.5294196844927,
      height: 749.0196218494269,
      scale: 2.549999952316284,
      fontScale: 2.549999952316284,
      statusBarHeight: 72,
      navigatorBarHeight: 0,
    },
    pixelRatio: 2.549999952316284,
  };
  setVue({
    config: {
      silent: true,
    },
  });
  setApp({
    $options: {
      rootView: '#root',
    },
    $on: () => {},
    $off: () => {},
    $nextTick: (cb) => {
      setTimeout(cb);
    },
  });
});

test('native device info', (t) => {
  t.is(Native.Platform, null);
  t.is(Native.PixelRatio, 2);
  t.is(Native.version, undefined);
  t.is(Native.isIPhoneX, false);
  t.is(Native.Device, 'Unknown device');
  t.is(Native.OSVersion, null);
  t.is(Native.SDKVersion, null);
  t.is(Native.APILevel, null);
  t.is(Native.Dimensions.screen.width, undefined);
  t.is(Native.Dimensions.screen.height, undefined);
  t.is(Native.Dimensions.screen.statusBarHeight, undefined);
  t.is(Native.OnePixel, 0.5);
  t.pass();
});

test('native ImageLoader', async (t) => {
  t.is(Native.ImageLoader.prefetch(), undefined);
  t.is(await Native.ImageLoader.getSize('https://user-images.githubusercontent.com/12878546/148736102-7cd9525b-aceb-41c6-a905-d3156219ef16.png'), undefined);
});

test('native backAndroid', async (t) => {
  const handler = () => {};
  t.is(Native.BackAndroid.addListener(handler).remove(), undefined);
});

test('native NetInfo', (t) => {
  const handler = () => {};
  const listener = Native.NetInfo.addEventListener('change', handler);
  Native.NetInfo.removeEventListener('change', listener);
  t.pass();
});

test('native getElemCss', async (t) => {
  const element = nodeOps.createElement('div');
  t.deepEqual(Native.getElemCss(element), {});
});
