// Most nodes test is executed in node-ops.test.js
// here just test the lacked testing for ViewNode for coverage.
/* eslint-disable no-underscore-dangle */

import test from 'ava';
import ListItemNode from '../list-item-node';
import Native from '../../runtime/native';
import DocumentNode from '../document-node';

test.before(() => {
  global.__GLOBAL__ = {
    nodeId: 101,
  };
});

test('ListItemNode.polyFillNativeEvents test', (t) => {
  const listItemNode = new ListItemNode('li');
  // ios
  Native.Platform = 'ios';
  let called = false;
  const callback = (event) => {
    called = true;
    return event;
  };
  t.is(called, false);
  t.is(listItemNode.removeEventListener('disappear', callback), null);
  listItemNode.addEventListener('disappear', callback);
  t.true(!!listItemNode._emitter);
  t.not(listItemNode._emitter.getEventListeners().disappear, undefined);
  const event1 = DocumentNode.createEvent('disappear');
  listItemNode.dispatchEvent(event1);
  t.is(called, true);
  listItemNode.removeEventListener('disappear', callback);

  // android
  Native.Platform = 'android';
  called = false;
  t.is(called, false);
  t.is(listItemNode._emitter.getEventListeners().disappear, undefined);
  listItemNode.addEventListener('disappear', callback);
  const event2 = DocumentNode.createEvent('disappear');
  listItemNode.dispatchEvent(event2);
  t.is(called, true);
  t.true(!!listItemNode._emitter);
  t.not(listItemNode._emitter.getEventListeners().disAppear, undefined);
});
