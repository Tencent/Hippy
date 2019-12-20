import { findDOMNode } from 'react-dom';

const findNodeHandle = (component: Element) => {
  let node;

  try {
    /* eslint-disable-next-line react/no-find-dom-node */
    node = findDOMNode(component);
  } catch (e) {
    // pass
  }

  return node;
};

export default findNodeHandle;
