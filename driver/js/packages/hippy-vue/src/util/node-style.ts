const nodeStyleMap = new Map();

/**
 * setCacheNodeStyle - cache node style
 * @param {number} nodeId
 * @param style
 */
function setCacheNodeStyle(nodeId: number, style) {
  nodeStyleMap.set(nodeId, style);
}

/**
 * deleteCacheNodeStyle - delete ViewNode from cache
 * @param {number} nodeId
 */
function deleteCacheNodeStyle(nodeId: number) {
  nodeStyleMap.delete(nodeId);
}

/**
 * getNodeById - get ViewNode by nodeId
 * @param {number} nodeId
 */
function getCacheNodeStyle(nodeId: number) {
  return nodeStyleMap.get(nodeId) || {};
}

function clearCacheNodeStyle() {
  nodeStyleMap.clear();
}

export {
  setCacheNodeStyle,
  deleteCacheNodeStyle,
  getCacheNodeStyle,
  clearCacheNodeStyle,
};
