const nodeCache = new Map();

/**
 * preCacheNode - cache ViewNode
 * @param {ViewNode} targetNode
 * @param {number} nodeId
 */
function preCacheNode(targetNode, nodeId) {
  nodeCache.set(nodeId, targetNode);
}

/**
 * unCacheNode - delete ViewNode from cache
 * @param {number} nodeId
 */
function unCacheNode(nodeId) {
  nodeCache.delete(nodeId);
}

/**
 * getNodeById - get ViewNode by nodeId
 * @param {number} nodeId
 */
function getNodeById(nodeId) {
  return nodeCache.get(nodeId) || null;
}

/**
 * recursivelyUnCacheNode - delete ViewNode cache recursively
 * @param {ViewNode|number} node
 */
function recursivelyUnCacheNode(node) {
  if (typeof node === 'number') {
    // if leaf node (e.g. text node)
    unCacheNode(node);
  } else if (node) {
    unCacheNode(node.nodeId);
    node.childNodes && node.childNodes.forEach(node => recursivelyUnCacheNode(node));
  }
}

export {
  preCacheNode,
  unCacheNode,
  getNodeById,
  recursivelyUnCacheNode,
};
