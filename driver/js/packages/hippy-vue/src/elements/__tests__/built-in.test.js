import test from 'ava';
import { HIPPY_STATIC_PROTOCOL, HIPPY_DEBUG_ADDRESS } from '../../runtime/constants';
import * as elements from '../built-in';

// See platform/hippy/renderer/__tests__/index.test.js

test('img src for normal http', (t) => {
  const url = elements.img.component.attributeMaps.src('https://hippyjs.org');
  t.is(url, 'https://hippyjs.org');
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
  const url = elements.img.component.attributeMaps.placeholder.propsValue('https://hippyjs.org');
  // Should be popup a warning.
  t.is(url, 'https://hippyjs.org');
});

test('img placeholder for base64 image', (t) => {
  const url = elements.img.component.attributeMaps.placeholder.propsValue('base64:image/jpeg?xxxx');
  // Should not be popup a warning.
  t.is(url, 'base64:image/jpeg?xxxx');
});

test('img placeholder for local path image', (t) => {
  const url = elements.img.component.attributeMaps.placeholder.propsValue('./assets/defaultImage.png');
  // Should not be popup a warning.
  t.is(url, './assets/defaultImage.png');
});

test('input disabled test', (t) => {
  const disabled = elements.input.component.attributeMaps.disabled.propsValue(false);
  // Should not be popup a warning.
  t.true(disabled);
});
