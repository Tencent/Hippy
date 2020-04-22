// Most nodes test is executed in node-ops.test.js
// here just test the lacked testing for ViewNode for coverage.

import test from 'ava';
import ViewNode from '../view-node';

test.before(() => {
  global.__GLOBAL__ = {
    nodeId: 101,
  };
});

test('firstChild test', (t) => {
  const parentNode = new ViewNode();
  const childNode = new ViewNode();
  const childNode2 = new ViewNode();
  parentNode.appendChild(childNode);
  parentNode.insertBefore(childNode2, childNode);
  t.is(parentNode.firstChild, childNode2);
});

test('set isMounted test', (t) => {
  const node = new ViewNode();
  t.is(node.isMounted, false);
  node.isMounted = true;
  t.is(node.isMounted, true);
});

test('append exist child test', (t) => {
  const parentNode = new ViewNode();
  const childNode = new ViewNode();
  const childNode2 = new ViewNode();
  parentNode.appendChild(childNode);
  parentNode.appendChild(childNode2);
  parentNode.appendChild(childNode);
  t.is(parentNode.lastChild, childNode);
});

test('findChild test', (t) => {
  const parentNode = new ViewNode();
  const childNode = new ViewNode();
  const childNode2 = new ViewNode();
  childNode2.metaTest = 123;
  parentNode.appendChild(childNode);
  childNode.appendChild(childNode2);
  const targetNode = parentNode.findChild(node => node.metaTest === 123);
  t.is(targetNode, childNode2);
  const targetNode2 = parentNode.findChild(node => node.metaTest === 234);
  t.is(targetNode2, null);
});

test('traverseChildren test', (t) => {
  const parentNode = new ViewNode();
  const childNode = new ViewNode();
  const childNode2 = new ViewNode();
  childNode2.metaTest = 123;
  parentNode.appendChild(childNode);
  childNode.appendChild(childNode2);
  parentNode.traverseChildren((node) => {
    t.true([parentNode, childNode, childNode2].indexOf(node) > -1);
  });
});
