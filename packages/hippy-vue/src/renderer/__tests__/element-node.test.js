/* eslint-disable no-underscore-dangle */

// Most nodes test is executed in node-ops.test.js
// here just test the lacked testing for ElementNode for coverage.

import test, { before } from 'ava';
import ElementNode from '../element-node';
import DocumentNode from '../document-node';
import ListNode from '../list-node';

before(() => {
  global.__GLOBAL__ = {
    nodeId: 101,
  };
});

test('Element.toString test', (t) => {
  const testNode = new ElementNode('div');
  t.is(testNode.toString(), 'ElementNode(div)');
});

test('Element.setAttribute("text") test', (t) => {
  const testNode = new ElementNode('p');
  testNode.setAttribute('text', '123');
  t.is(testNode.getAttribute('text'), '123');
  testNode.setAttribute('value', 123);
  t.is(testNode.getAttribute('value'), '123');
  t.throws(() => {
    testNode.setAttribute('defaultValue', undefined);
  }, TypeError);
});

test('Element.setAttribute("caretColor") test', (t) => {
  const caretColorNode = new ElementNode('div');
  caretColorNode.setAttribute('caretColor', '#abcdef');
  t.is(caretColorNode.attributes['caret-color'], 4289449455);
  caretColorNode.setAttribute('caret-color', '#abc');
  t.is(caretColorNode.attributes['caret-color'], 4289379276);
});

test('Element.setNativeProps test', (t) => {
  const node = new ElementNode('p');
  node.setNativeProps({ abc: 'abc' });
  t.is(node.style.abc, undefined);
  node.setNativeProps({ style: { abc: 'abc' } });
  t.is(node.style.abc, 'abc');
  node.setNativeProps({ style: { bcd: '123' } });
  t.is(node.style.bcd, 123);
  node.setNativeProps({ style: { fontWeight: '100' } });
  t.is(node.style.fontWeight, '100');
  node.setNativeProps({ style: { fontWeight: 200 } });
  t.is(node.style.fontWeight, '200');
  node.setNativeProps({ style: { fontWeight: 'bold' } });
  t.is(node.style.fontWeight, 'bold');
  node.setNativeProps({ style: { width: '100px' } });
  t.is(node.style.width, 100);
  node.setNativeProps({ style: { height: '100.201px' } });
  t.is(node.style.height, 100.201);
  node.setNativeProps({ style: { cde: {} } });
  t.deepEqual(node.style.cde, {});
  node.setNativeProps({ style: { caretColor: '#abcdef' } });
  t.is(node.attributes['caret-color'], 4289449455);
});

test('Element.hasAttribute test', (t) => {
  const testNode = new ElementNode('div');
  const key = 'test';
  t.false(testNode.hasAttribute(key));
  testNode.setAttribute(key, '123');
  t.true(testNode.hasAttribute(key));
});

test('Element.removeAttribute test', (t) => {
  const testNode = new ElementNode('div');
  const key = 'test';
  testNode.setAttribute(key, '123');
  t.is(testNode.getAttribute(key), 123);
  testNode.removeAttribute(key);
  t.is(testNode.getAttribute(key), undefined);
});

test('Element.addEventListener and removeEventListener test', (t) => {
  const node = new ElementNode('div');
  let called = false;
  const callback = (event) => {
    called = true;
    return event;
  };
  callback.called = false;
  t.is(called, false);
  t.is(node._emitter, null);
  t.is(node.removeEventListener('click', callback), null);
  node.addEventListener('click', callback);
  t.true(!!node._emitter);
  const event = DocumentNode.createEvent('click');
  node.dispatchEvent(event);
  // t.is(called, true); // FIXME
  node.removeEventListener('click', callback);
  t.true(!!node._emitter);
});

test('Element.dispatchEvent test', (t) => {
  const parentNode = new ElementNode('div');
  const childNode = new ElementNode('div');
  const key = 'test';
  const event = DocumentNode.createEvent(key);
  parentNode.appendChild(childNode);
  const err = t.throws(() => {
    parentNode.dispatchEvent(123);
  }, Error);
  t.is(err.message, 'dispatchEvent method only accept Event instance');
  childNode.dispatchEvent(event);
  // TODO: bubbles testing.
});

test('Element.setText test', (t) => {
  const node = new ElementNode('p');
  node.setText('abc');
  t.is(node.getAttribute('text'), 'abc');
  node.setText(123);
  t.is(node.getAttribute('text'), '123');
  node.setText({});
  t.is(node.getAttribute('text'), '[object Object]');
  node.setText(() => {});
  t.is(node.getAttribute('text'), '() => {}');
  node.setText('     ');
  t.is(node.getAttribute('text'), '');
  node.setText('&nbsp;');
  t.is(node.getAttribute('text'), ' ');
  node.setText('Â');
  t.is(node.getAttribute('text'), ' ');
  node.setText('Â&nbsp;');
  t.is(node.getAttribute('text'), '  ');
  node.setText('&nbsp;Â');
  t.is(node.getAttribute('text'), '  ');
  node.setText('&nbsp;Â&nbsp;Â');
  t.is(node.getAttribute('text'), '    ');
  node.setText('&nbsp;Â&nbsp;Â&nbsp;Â');
  t.is(node.getAttribute('text'), '      ');
  node.setText('a&nbsp;Â&nbsp;Â&nbsp;Âb');
  t.is(node.getAttribute('text'), 'a      b');
  node.setText('a&nbsp;Â&nbsp;bÂ&nbsp;Âc');
  t.is(node.getAttribute('text'), 'a   b   c');
});

test('Element.setStyle test', (t) => {
  const node = new ElementNode('p');
  node.setStyle('abc', 'abc');
  t.is(node.style.abc, 'abc');
  node.setStyle('bcd', '123');
  t.is(node.style.bcd, 123);
  node.setStyle('fontWeight', '100');
  t.is(node.style.fontWeight, '100');
  node.setStyle('fontWeight', 200);
  t.is(node.style.fontWeight, '200');
  node.setStyle('fontWeight', 'bold');
  t.is(node.style.fontWeight, 'bold');
  node.setStyle('width', '100px');
  t.is(node.style.width, 100);
  node.setStyle('height', '100.201px');
  t.is(node.style.height, 100.201);
  node.setStyle('cde', {});
  t.deepEqual(node.style.cde, {});
  node.setStyle('caretColor', '#abcdef');
  t.is(node.attributes['caret-color'], 4289449455);
  node.setStyle('backgroundImage', 'linear-gradient(to top right, red, yellow, blue 10%)');
  t.deepEqual(node.style.linearGradient, { angle: 'totopright', colorStopList: [{ color: 4294901760 }, { color: 4294967040 }, { color: 4278190335, ratio: 0.1 }] });
  node.setStyle('backgroundImage', 'linear-gradient(90deg, red, 10%, blue 10%)');
  t.deepEqual(node.style.linearGradient, { angle: '90', colorStopList: [{ color: 4294901760 }, { color: 4278190335, ratio: 0.1 }] });
  node.setStyle('backgroundImage', 'linear-gradient(red, yellow 10%, blue 10%)');
  t.deepEqual(node.style.linearGradient, { angle: '180', colorStopList: [{ color: 4294901760 }, { color: 4294967040, ratio: 0.1 }, { color: 4278190335, ratio: 0.1 }] });
  node.setStyle('backgroundImage', 'linear-gradient(10.12341234deg, red, yellow 10%, blue 10%)');
  t.deepEqual(node.style.linearGradient, { angle: '10.12', colorStopList: [{ color: 4294901760 }, { color: 4294967040, ratio: 0.1 }, { color: 4278190335, ratio: 0.1 }] });
  node.setStyle('backgroundImage', 'linear-gradient(10.12341234deg, rgba(55, 11, 43, 0.5) 5%, rgb(55, 13, 43) 10%,  rgba(55, 11, 43, 0.1) 23%)');
  t.deepEqual(node.style.linearGradient, { angle: '10.12', colorStopList: [{ ratio: 0.05, color: 2151090987 }, { ratio: 0.1, color: 4281797931 }, { ratio: 0.23, color: 439814955 }] });
  node.setStyle('textShadowRadius', 1);
  t.deepEqual(node.style.textShadowRadius, 1);
  node.setStyle('textShadowColor', '#abcdef');
  t.deepEqual(node.style.textShadowColor, 4289449455);
  node.setStyle('textShadowOffsetX', 1);
  node.setStyle('textShadowOffsetY', 2);
  t.deepEqual(node.style.textShadowOffset, { width: 1, height: 2 });
  node.setStyle('textShadowOffsetX', 10);
  t.deepEqual(node.style.textShadowOffset, { width: 10, height: 2 });
  node.setStyle('textShadowOffset', { x: 11, y: 8 });
  t.deepEqual(node.style.textShadowOffset, { width: 11, height: 8 });
});

test('Element.setStyle with pre-processed style test', (t) => {
  const node = new ElementNode('div');
  node.beforeLoadStyle = (decl) => {
    const { property, value } = decl;
    return {
      property: property.slice(0, decl.property.length - 2),
      value: value.slice(0, decl.value.length - 2),
    };
  };
  node.setStyle('backgroundColor', 'white');
  node.setStyle('width', '100px');
  t.is(node.style.backgroundCol, 'whi');
  t.is(node.style.wid, 100);
});

test('Element.dispatchEvent with polyfill event', (t) => {
  const node = new ListNode('ul');
  let called = false;
  const callback = (event) => {
    called = true;
    return event;
  };

  t.is(called, false);
  t.is(node._emitter, null);
  t.is(node.removeEventListener('loadMore', callback), null);
  node.addEventListener('loadMore', callback);
  t.true(!!node._emitter);
  let event = DocumentNode.createEvent('loadMore');
  node.dispatchEvent(event);
  t.is(called, true);
  node.removeEventListener('loadMore', callback);
  t.true(!!node._emitter);

  called = false;
  t.is(called, false);
  node.addEventListener('endReached', callback);
  event = DocumentNode.createEvent('loadMore');
  node.dispatchEvent(event);
  t.is(called, true);
  node.removeEventListener('endReached', callback);
});
