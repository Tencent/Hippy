/* eslint-disable no-underscore-dangle */

// Most nodes test is executed in node-ops.test.js
// here just test the lacked testing for DocumentNode for coverage.

import test from 'ava';
import DocumentNode from '../document-node';

test.before(() => {
  global.__GLOBAL__ = {
    nodeId: 101,
  };
});

test('Document.createElement test', (t) => {
  const testNode1 = DocumentNode.createElement('div');
  t.is(testNode1.toString(), 'ElementNode(div)');
  const testNode2 = DocumentNode.createElement('input');
  t.is(testNode2.toString(), 'InputNode(input)');
  const testNode3 = DocumentNode.createElement('textarea');
  t.is(testNode3.toString(), 'InputNode(textarea)');
  const testNode4 = DocumentNode.createElement('ul');
  t.is(testNode4.toString(), 'ListNode(ul)');
  const testNode5 = DocumentNode.createElement('li');
  t.is(testNode5.toString(), 'ListItemNode(li)');
});

test('Document.createTextNode test', (t) => {
  const testNode = DocumentNode.createTextNode('aaa');
  t.is(testNode.toString(), 'TextNode');
  t.is(testNode.text, 'aaa');
});

test('Document.createComment test', (t) => {
  const testNode = DocumentNode.createComment('aaa');
  t.is(testNode.toString(), 'CommentNode(comment)');
  t.is(testNode.text, 'aaa');
});

test('Document.createEvent test', (t) => {
  const testNode = DocumentNode.createEvent('addEvent');
  t.is(testNode.type, 'addEvent');
});
