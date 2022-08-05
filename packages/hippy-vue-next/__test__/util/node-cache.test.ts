import { HippyElement } from '../../src/runtime/element/hippy-element';
import {
  recursivelyUnCacheNode,
  requestIdleCallback,
  cancelIdleCallback,
  preCacheNode,
  getNodeById,
} from '../../src/util/node-cache';

/**
 * @author birdguo
 * @priority P0
 * @casetype unit
 */
describe('util/index.ts', () => {
  it('check node cache operation', async () => {
    const node = new HippyElement('div');
    const childNode = new HippyElement('div');
    node.nodeId = 12;
    childNode.nodeId = 13;
    node.childNodes = [childNode];
    preCacheNode(node, 12);
    preCacheNode(childNode, 13);
    let cachedNode = getNodeById(12);
    expect(node).toEqual(cachedNode);

    let cachedChildNode = getNodeById(13);
    expect(childNode).toEqual(cachedChildNode);

    recursivelyUnCacheNode(node);
    cachedNode = getNodeById(12);
    expect(cachedNode).toEqual(null);

    cachedChildNode = getNodeById(13);
    expect(cachedChildNode).toEqual(null);

    const id = requestIdleCallback(() => {});
    cancelIdleCallback(id);
  });
});
