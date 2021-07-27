// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Platform from '../../../core/platform/platform.js';
import * as LitHtml from '../../lit-html/lit-html.js';
export function isExpandableNode(node) {
    return 'children' in node;
}
/**
 * This is a custom lit-html directive that lets us track the DOM nodes that Lit
 * creates and maps them to the tree node that was given to us. This means we
 * can navigate between real DOM node and structural tree node easily in code.
 */
class TrackDOMNodeToTreeNode extends LitHtml.Directive.Directive {
    constructor(partInfo) {
        super(partInfo);
        if (partInfo.type !== LitHtml.Directive.PartType.ATTRIBUTE) {
            throw new Error('TrackDOMNodeToTreeNode directive must be used as an attribute.');
        }
    }
    update(part, [weakMap, treeNode]) {
        const elem = part.element;
        if (!(elem instanceof HTMLLIElement)) {
            throw new Error('trackTreeNodeToDOMNode must be used on <li> elements.');
        }
        weakMap.set(elem, treeNode);
    }
    /*
     * Because this directive doesn't render anything, there's no implementation
     * here for the render method. But we need it to state the params the
     * directive takes so the update() method's types are correct. Unfortunately
     * we have to pass any as the generic type because we can't define this class
     * using a generic - the generic gets lost when wrapped in the directive call
     * below.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    render(_weakmap, _treeNode) {
    }
}
export const trackDOMNodeToTreeNode = LitHtml.Directive.directive(TrackDOMNodeToTreeNode);
/**
 * Finds the next sibling of the node's parent, recursing up the tree if
 * required.
 * Given:
 * A
 *   * B
 *     * C
 * D
 * If called on B, this will return D. If called on C, this will also return D.
 */
const findNextParentSibling = (currentDOMNode) => {
    // We go up two parents here because the structure is:
    // <li treeitem> => <ul group> => <li treeitem>
    // So if we are on the last treeitem (furthest to the right), we need to find its parent tree item, which is two parents up.
    const currentDOMNodeParentListItem = currentDOMNode.parentElement?.parentElement;
    if (currentDOMNodeParentListItem && currentDOMNodeParentListItem instanceof HTMLLIElement) {
        const parentNodeSibling = currentDOMNodeParentListItem.nextElementSibling;
        // If this parent doesn't have a sibling, recurse up the tree to look for
        // the nearest parent that does have a sibling.
        if (parentNodeSibling && parentNodeSibling instanceof HTMLLIElement) {
            return parentNodeSibling;
        }
        return findNextParentSibling(currentDOMNodeParentListItem);
    }
    return null;
};
const getFirstChildOfExpandedTreeNode = (currentDOMNode) => {
    const firstChild = currentDOMNode.querySelector(':scope > [role="group"] > [role="treeitem"]:first-child');
    if (!firstChild) {
        throw new Error('Could not find child of expanded node.');
    }
    return firstChild;
};
const domNodeIsExpandable = (domNode) => {
    // Nodes with no children are not given the aria-expanded attributes.
    // Nodes with children are given aria-expanded = true/false.
    return domNode.getAttribute('aria-expanded') !== null;
};
const domNodeIsLeafNode = (domNode) => {
    return !domNodeIsExpandable(domNode);
};
const domNodeIsExpanded = (domNode) => {
    // Nodes with no children are not given the aria-expanded attributes.
    // Nodes with children are given aria-expanded = true/false.
    return domNodeIsExpandable(domNode) && domNode.getAttribute('aria-expanded') === 'true';
};
const getDeepLastChildOfExpandedTreeNode = (currentDOMNode) => {
    const lastChild = currentDOMNode.querySelector(':scope > [role="group"] > [role="treeitem"]:last-child');
    if (!lastChild) {
        throw new Error('Could not find child of expanded node.');
    }
    if (domNodeIsExpanded(lastChild)) {
        return getDeepLastChildOfExpandedTreeNode(lastChild);
    }
    return lastChild;
};
const getNextSiblingOfCurrentDOMNode = (currentDOMNode) => {
    const currentNodeSibling = currentDOMNode.nextElementSibling;
    if (currentNodeSibling && currentNodeSibling instanceof HTMLLIElement) {
        return currentNodeSibling;
    }
    return null;
};
const getPreviousSiblingOfCurrentDOMNode = (currentDOMNode) => {
    const currentNodeSibling = currentDOMNode.previousElementSibling;
    if (currentNodeSibling && currentNodeSibling instanceof HTMLLIElement) {
        return currentNodeSibling;
    }
    return null;
};
const getParentListItemForDOMNode = (currentDOMNode) => {
    let parentNode = currentDOMNode.parentElement;
    if (!parentNode) {
        return null;
    }
    while (parentNode && parentNode.getAttribute('role') !== 'treeitem' &&
        (parentNode instanceof HTMLLIElement) === false) {
        parentNode = parentNode.parentElement;
    }
    return parentNode;
};
/**
 * We cache a tree node's children; they are lazily evaluated and if two code
 * paths get the children, we need to make sure they get the same objects.
 *
 * We're OK to use <unknown> here as the weakmap doesn't care and a TreeOutline that
 * adds nodes of type X to the map will always then get children of that type
 * back as that's enforced by the TreeOutline types elsewhere. We can't make
 * this WeakMap easily generic as it's a top level variable.
 */
const treeNodeChildrenWeakMap = new WeakMap();
export const getNodeChildren = async (node) => {
    if (!node.children) {
        throw new Error('Asked for children of node that does not have any children.');
    }
    const cachedChildren = treeNodeChildrenWeakMap.get(node);
    if (cachedChildren) {
        return cachedChildren;
    }
    const children = await node.children();
    treeNodeChildrenWeakMap.set(node, children);
    return children;
};
/**
 * Searches the tree and returns a path to the given node.
 * e.g. if the tree is:
 * A
 * - B
 *   - C
 * - D
 *   - E
 *   - F
 *
 * And you look for F, you'll get back [A, D, F]
 */
export const getPathToTreeNode = async (tree, nodeToFind) => {
    for (const rootNode of tree) {
        const foundPathOrNull = await getPathToTreeNodeRecursively(rootNode, nodeToFind, [rootNode]);
        if (foundPathOrNull !== null) {
            return foundPathOrNull;
        }
    }
    return null;
};
const getPathToTreeNodeRecursively = async (currentNode, nodeToFind, pathToNode) => {
    if (nodeToFind.id && currentNode.id && currentNode.id === nodeToFind.id) {
        return pathToNode;
    }
    if (currentNode === nodeToFind) {
        return pathToNode;
    }
    if (currentNode.children) {
        const children = await getNodeChildren(currentNode);
        for (const child of children) {
            const foundPathOrNull = await getPathToTreeNodeRecursively(child, nodeToFind, [...pathToNode, child]);
            if (foundPathOrNull !== null) {
                return foundPathOrNull;
            }
        }
    }
    return null;
};
export const findNextNodeForTreeOutlineKeyboardNavigation = (options) => {
    const { currentDOMNode, currentTreeNode, direction, setNodeExpandedState, } = options;
    if (!currentTreeNode) {
        return currentDOMNode;
    }
    if (direction === "ArrowDown" /* DOWN */) {
        // If the node has expanded children, down takes you into that list.
        if (domNodeIsExpanded(currentDOMNode)) {
            return getFirstChildOfExpandedTreeNode(currentDOMNode);
        }
        // If the node has a sibling, we go to that.
        const currentNodeSibling = getNextSiblingOfCurrentDOMNode(currentDOMNode);
        if (currentNodeSibling) {
            return currentNodeSibling;
        }
        // If the Node's parent has a sibling then we go to that.
        const parentSibling = findNextParentSibling(currentDOMNode);
        if (parentSibling) {
            return parentSibling;
        }
    }
    else if (direction === "ArrowRight" /* RIGHT */) {
        if (domNodeIsLeafNode(currentDOMNode)) {
            // If the node cannot be expanded, we have nothing to do and we leave everything as is.
            return currentDOMNode;
        }
        // If the current node is expanded, move and focus into the first child
        if (domNodeIsExpanded(currentDOMNode)) {
            return getFirstChildOfExpandedTreeNode(currentDOMNode);
        }
        // Else, we expand the Node (but leave focus where it is)
        setNodeExpandedState(currentTreeNode, true);
        return currentDOMNode;
    }
    else if (direction === "ArrowUp" /* UP */) {
        // First see if there is a previous sibling
        const currentNodePreviousSibling = getPreviousSiblingOfCurrentDOMNode(currentDOMNode);
        if (currentNodePreviousSibling) {
            // We now find the nested node within our previous sibling; if it has
            // children that are expanded, we want to find the last child and
            // highlight that, else we'll highlight our sibling directly.
            if (domNodeIsExpanded(currentNodePreviousSibling)) {
                return getDeepLastChildOfExpandedTreeNode(currentNodePreviousSibling);
            }
            // Otherwise, if we have a previous sibling with no children, focus it.
            return currentNodePreviousSibling;
        }
        // Otherwise, let's go to the direct parent if there is one.
        const parentNode = getParentListItemForDOMNode(currentDOMNode);
        if (parentNode && parentNode instanceof HTMLLIElement) {
            return parentNode;
        }
    }
    else if (direction === "ArrowLeft" /* LEFT */) {
        // If the node is expanded, we close it.
        if (domNodeIsExpanded(currentDOMNode)) {
            setNodeExpandedState(currentTreeNode, false);
            return currentDOMNode;
        }
        // Otherwise, let's go to the parent if there is one.
        const parentNode = getParentListItemForDOMNode(currentDOMNode);
        if (parentNode && parentNode instanceof HTMLLIElement) {
            return parentNode;
        }
    }
    // If we got here, there's no other option than to stay put.
    return currentDOMNode;
};
//# sourceMappingURL=TreeOutlineUtils.js.map