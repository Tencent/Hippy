import test from 'ava';
import { recursivelyUnCacheNode, requestIdleCallback, cancelIdleCallback, preCacheNode, getNodeById } from '../node';
import ElementNode from '../../renderer/element-node';

test('check node cache operation', (t) => {
  const node = new ElementNode('div');
  const childNode = new ElementNode('div');
  node.nodeId = 12;
  childNode.nodeId = 13;
  node.childNodes = [childNode];
  preCacheNode(node, 12);
  preCacheNode(childNode, 13);
  let cachedCode = getNodeById(12);
  t.is(node, cachedCode);
  let cachedChildCode = getNodeById(13);
  t.is(childNode, cachedChildCode);
  recursivelyUnCacheNode(node);
  cachedCode = getNodeById(12);
  t.is(cachedCode, null);
  cachedChildCode = getNodeById(13);
  t.is(cachedChildCode, null);
  const id = requestIdleCallback(() => {});
  cancelIdleCallback(id);
  t.pass();
});
