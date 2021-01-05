// Most nodes test is executed in node-ops.test.js
// here just test the lacked testing for ViewNode for coverage.
/* eslint-disable no-underscore-dangle */

import test from 'ava';
import ListNode from '../list-node';

test.before(() => {
  global.__GLOBAL__ = {
    nodeId: 101,
  };
});

test('ListNode.polyFillNativeEvents test', (t) => {
  const listNode = new ListNode('ul');
  let called = false;
  const callback = (event) => {
    called = true;
    return event;
  };
  t.is(called, false);
  t.is(listNode.removeEventListener('loadMore', callback), null);
  listNode.addEventListener('loadMore', callback);
  t.true(!!listNode._emitter);
  t.not(listNode._emitter.getEventListeners().loadMore, undefined);

  called = false;
  t.is(called, false);
  listNode.removeEventListener('loadMore', callback);
  listNode.removeEventListener('endReached', callback);
  listNode.addEventListener('endReached', callback);
  t.true(!!listNode._emitter);
  t.not(listNode._emitter.getEventListeners().loadMore, undefined);
});
