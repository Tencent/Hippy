/* eslint-disable no-underscore-dangle */

// Most nodes test is executed in node-ops.test.js
// here just test the lacked testing for ElementNode for coverage.

import test from 'ava';
import ElementNode from '../element-node';
import DocumentNode from '../document-node';

test.before(() => {
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
  const childNode =  new ElementNode('div');
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
});
