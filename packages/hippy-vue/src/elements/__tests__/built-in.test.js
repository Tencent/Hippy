import test from 'ava';
import { HIPPY_STATIC_PROTOCOL, HIPPY_DEBUG_ADDRESS } from '../../runtime/constants';
import * as elements from '../built-in';

// See platform/hippy/renderer/__tests__/index.test.js

test('img src for normal http', (t) => {
  const url = elements.img.component.attributeMaps.src('http://wwww.qq.com');
  t.is(url, 'http://wwww.qq.com');
});

test('img src for static resource', (t) => {
  const url = elements.img.component.attributeMaps.src('assets/test.png');
  t.is(url, `${HIPPY_DEBUG_ADDRESS}assets/test.png`);
});

test('img src for static resource for production', (t) => {
  process.env.NODE_ENV = 'production';
  const url = elements.img.component.attributeMaps.src('assets/test.png');
  delete process.env.NODE_ENV;
  t.is(url, `${HIPPY_STATIC_PROTOCOL}./assets/test.png`);
});

test('img placeholder for normal http', (t) => {
  const url = elements.img.component.attributeMaps.placeholder.propsValue('http://wwww.qq.com');
  // Should be popup a warning.
  t.is(url, 'http://wwww.qq.com');
});

test('img placeholder for base64 image', (t) => {
  const url = elements.img.component.attributeMaps.placeholder.propsValue('base64:image/jpeg?xxxx');
  // Should not be popup a warning.
  t.is(url, 'base64:image/jpeg?xxxx');
});
