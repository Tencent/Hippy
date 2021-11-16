type MeasureReturns = (
  x: number,
  y: number,
  width: number,
  height: number,
  left: number,
  top: number
) => void;

function getRect(node: HTMLElement) {
  let targetNode = node as any;
  const height = targetNode.offsetHeight;
  const width = targetNode.offsetWidth;
  let left = targetNode.offsetLeft;
  let top = targetNode.offsetTop;
  targetNode = targetNode.offsetParent;

  while (targetNode && targetNode.nodeType === 1 /* Node.ELEMENT_NODE */) {
    left += targetNode.offsetLeft - targetNode.scrollLeft;
    top += targetNode.offsetTop - targetNode.scrollTop;
    targetNode = targetNode.offsetParent;
  }
  return {
    height,
    left,
    top,
    width,
  };
}

const UIManager = {
  measure(node: HTMLElement, callback: MeasureReturns) {
    const relativeNode = node.parentNode as HTMLElement;
    if (node && relativeNode) {
      setTimeout(() => {
        const relativeRect = getRect(relativeNode);
        const {
          height, left, top, width,
        } = getRect(node);
        const x = left - relativeRect.left;
        const y = top - relativeRect.top;
        callback(x, y, width, height, left, top);
      }, 0);
    }
  },
};

export default UIManager;
