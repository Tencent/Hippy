import type { SsrNode } from './types';

import { HippyCommentElement } from './runtime/element/hippy-comment-element';
import { HippyElement } from './runtime/element/hippy-element';
import { HippyInputElement } from './runtime/element/hippy-input-element';
import { HippyListElement } from './runtime/element/hippy-list-element';
import { HippyText } from './runtime/text/hippy-text';
import { type HippyNode, NodeType } from './runtime/node/hippy-node';

/**
 * create hippy node by ssr node
 *
 * @param node - ssr node
 */
function createHippyNodeBySsrNode(node: SsrNode): HippyNode {
  if (node.name === 'comment') {
    // comment node
    return new HippyCommentElement(node.props.text, node);
  }
  if (node.name === 'Text' && !node.tagName) {
    // pure text node
    const retNode = new HippyText(node.props.text, node);
    // fix hydration
    retNode.nodeType = NodeType.TextNode; // todo fixme TextNode or CommentNode
    retNode.data = node.props.text;
    return retNode;
  }
  // other node
  switch (node.tagName) {
    case 'input':
    case 'textarea':
      return new HippyInputElement(node.tagName, node);
    case 'ul':
      return new HippyListElement(node.tagName, node);
    default:
      return new HippyElement(node.tagName ?? '', node);
  }
}

/**
 * convert SSR Node List to Hippy Node Tree
 *
 * @param parent - parent node
 * @param ssrNodeList - ssr node list
 */
function appendChildList(parent: SsrNode, ssrNodeList: SsrNode[]): HippyNode {
  // first, create the parent node
  const parentNode: HippyNode = createHippyNodeBySsrNode(parent);
  // Then find out the child nodes of the current parent node from the ssr node
  // list and sort them so that their order is consistent with the order rendered by the server
  let childList = ssrNodeList
    .filter(node => node.pId === parent.id)
    .sort((v, k) => v.index - k.index);
  // Because the comment node index rules are different, we
  // need to re-insert the comment nodes in order to make it consistent with ssr
  const commentNodes = childList.filter(v => v.name === 'comment');
  if (commentNodes.length) {
    childList = childList.filter(v => v.name !== 'comment');
    for (let i = commentNodes.length - 1; i >= 0; i--) {
      childList.splice(commentNodes[i].index, 0, commentNodes[i]);
    }
  }
  // Recursively transform the child nodes, and append the child nodes to the parent node.
  // Here, because the ssr node has already been rendered, there is no need to render it again
  childList.forEach((node) => {
    parentNode.appendChild(appendChildList(node, ssrNodeList), true);
  });

  return parentNode;
}

/**
 * convert ssr native node list to hippy element tree, then vue can use to hydrate
 *
 * @param ssrNodeList
 */
export function convertToHippyElementTree(ssrNodeList: SsrNode[]): HippyElement {
  const [root] = ssrNodeList;
  return appendChildList(root, ssrNodeList) as HippyElement;
}
