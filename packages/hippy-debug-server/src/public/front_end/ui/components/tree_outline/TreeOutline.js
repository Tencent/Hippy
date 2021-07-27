// Copyright (c) 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Platform from '../../../core/platform/platform.js';
import * as LitHtml from '../../lit-html/lit-html.js';
import * as ComponentHelpers from '../helpers/helpers.js';
import * as Coordinator from '../render_coordinator/render_coordinator.js';
import { findNextNodeForTreeOutlineKeyboardNavigation, getNodeChildren, getPathToTreeNode, isExpandableNode, trackDOMNodeToTreeNode } from './TreeOutlineUtils.js';
const coordinator = Coordinator.RenderCoordinator.RenderCoordinator.instance();
export function defaultRenderer(node) {
    return LitHtml.html `${node.treeNodeData}`;
}
export class ItemSelectedEvent extends Event {
    data;
    constructor(node) {
        super('itemselected', { bubbles: true, composed: true });
        this.data = { node };
    }
}
export class ItemMouseOverEvent extends Event {
    data;
    constructor(node) {
        super('itemmouseover', { bubbles: true, composed: true });
        this.data = { node };
    }
}
export class ItemMouseOutEvent extends Event {
    data;
    constructor(node) {
        super('itemmouseout', { bubbles: true, composed: true });
        this.data = { node };
    }
}
export class TreeOutline extends HTMLElement {
    shadow = this.attachShadow({ mode: 'open' });
    treeData = [];
    nodeExpandedMap = new WeakMap();
    domNodeToTreeNodeMap = new WeakMap();
    hasRenderedAtLeastOnce = false;
    /**
     * If we have expanded to a certain node, we want to focus it once we've
     * rendered. But we render lazily and wrapped in LitHtml.until, so we can't
     * know for sure when that node will be rendered. This variable tracks the
     * node that we want focused but may not yet have been rendered.
     */
    nodePendingFocus = null;
    selectedTreeNode = null;
    defaultRenderer = (node, _state) => {
        if (typeof node.treeNodeData !== 'string') {
            console.warn(`The default TreeOutline renderer simply stringifies its given value. You passed in ${JSON.stringify(node.treeNodeData, null, 2)}. Consider providing a different defaultRenderer that can handle nodes of this type.`);
        }
        return LitHtml.html `${String(node.treeNodeData)}`;
    };
    /**
     * scheduledRender = render() has been called and scheduled a render.
     */
    scheduledRender = false;
    /**
     * enqueuedRender = render() was called mid-way through an existing render.
     */
    enqueuedRender = false;
    static get observedAttributes() {
        return ['nowrap', 'toplevelbordercolor'];
    }
    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'nowrap': {
                this.setNodeKeyNoWrapCSSVariable(newValue);
                break;
            }
            case 'toplevelbordercolor': {
                this.setTopLevelNodeBorderColorCSSVariable(newValue);
                break;
            }
        }
    }
    connectedCallback() {
        this.setTopLevelNodeBorderColorCSSVariable(this.getAttribute('toplevelbordercolor'));
        this.setNodeKeyNoWrapCSSVariable(this.getAttribute('nowrap'));
    }
    get data() {
        return {
            tree: this.treeData,
            defaultRenderer: this.defaultRenderer,
        };
    }
    set data(data) {
        this.defaultRenderer = data.defaultRenderer;
        this.treeData = data.tree;
        if (!this.hasRenderedAtLeastOnce) {
            this.selectedTreeNode = this.treeData[0];
        }
        this.render();
    }
    /**
     * Recursively expands the tree from the root nodes, to a max depth. The max
     * depth is 0 indexed - so a maxDepth of 2 (default) will expand 3 levels: 0,
     * 1 and 2.
     */
    async expandRecursively(maxDepth = 2) {
        await Promise.all(this.treeData.map(rootNode => this.expandAndRecurse(rootNode, 0, maxDepth)));
        await this.render();
    }
    /**
     * Takes a TreeNode, expands the outline to reveal it, and focuses it.
     */
    async expandToAndSelectTreeNode(targetTreeNode) {
        const pathToTreeNode = await getPathToTreeNode(this.treeData, targetTreeNode);
        if (pathToTreeNode === null) {
            throw new Error(`Could not find node ${JSON.stringify(targetTreeNode)} in the tree.`);
        }
        pathToTreeNode.forEach((node, index) => {
            // We don't expand the very last node, which was the target node.
            if (index < pathToTreeNode.length - 1) {
                this.setNodeExpandedState(node, true);
            }
        });
        // Mark the node as pending focus so when it is rendered into the DOM we can focus it
        this.nodePendingFocus = targetTreeNode;
        await this.render();
    }
    async collapseChildrenOfNode(domNode) {
        const treeNode = this.domNodeToTreeNodeMap.get(domNode);
        if (!treeNode) {
            return;
        }
        await this.recursivelyCollapseTreeNodeChildren(treeNode);
        await this.render();
    }
    setNodeKeyNoWrapCSSVariable(attributeValue) {
        ComponentHelpers.SetCSSProperty.set(this, '--override-key-whitespace-wrapping', attributeValue !== null ? 'nowrap' : 'initial');
    }
    setTopLevelNodeBorderColorCSSVariable(attributeValue) {
        ComponentHelpers.SetCSSProperty.set(this, '--override-top-node-border', attributeValue ? `1px solid ${attributeValue}` : '');
    }
    async recursivelyCollapseTreeNodeChildren(treeNode) {
        if (!isExpandableNode(treeNode) || !this.nodeIsExpanded(treeNode)) {
            return;
        }
        const children = await this.fetchNodeChildren(treeNode);
        const childRecursions = Promise.all(children.map(child => this.recursivelyCollapseTreeNodeChildren(child)));
        await childRecursions;
        this.setNodeExpandedState(treeNode, false);
    }
    getSelectedTreeNode() {
        if (!this.selectedTreeNode) {
            throw new Error('getSelectedNode was called but selectedTreeNode is null');
        }
        return this.selectedTreeNode;
    }
    async fetchNodeChildren(node) {
        return getNodeChildren(node);
    }
    setNodeExpandedState(node, newExpandedState) {
        this.nodeExpandedMap.set(node, newExpandedState);
    }
    nodeIsExpanded(node) {
        return this.nodeExpandedMap.get(node) || false;
    }
    async expandAndRecurse(node, currentDepth, maxDepth) {
        if (!isExpandableNode(node)) {
            return;
        }
        this.setNodeExpandedState(node, true);
        if (currentDepth === maxDepth || !isExpandableNode(node)) {
            return;
        }
        const children = await this.fetchNodeChildren(node);
        await Promise.all(children.map(child => this.expandAndRecurse(child, currentDepth + 1, maxDepth)));
    }
    onArrowClick(node) {
        return (event) => {
            event.stopPropagation();
            if (isExpandableNode(node)) {
                this.setNodeExpandedState(node, !this.nodeIsExpanded(node));
                this.render();
            }
        };
    }
    onNodeClick(event) {
        // Avoid it bubbling up to parent tree elements, else clicking a node deep in the tree will toggle it + all its ancestor's visibility.
        event.stopPropagation();
        const nodeClickExpandsOrContracts = this.getAttribute('clickabletitle') !== null;
        const domNode = event.currentTarget;
        const node = this.domNodeToTreeNodeMap.get(domNode);
        if (nodeClickExpandsOrContracts && node && isExpandableNode(node)) {
            this.setNodeExpandedState(node, !this.nodeIsExpanded(node));
        }
        this.focusTreeNode(domNode);
    }
    async focusTreeNode(domNode) {
        const treeNode = this.domNodeToTreeNodeMap.get(domNode);
        if (!treeNode) {
            return;
        }
        this.selectedTreeNode = treeNode;
        await this.render();
        this.dispatchEvent(new ItemSelectedEvent(treeNode));
        coordinator.write('DOMNode focus', () => {
            domNode.focus();
        });
    }
    processHomeAndEndKeysNavigation(key) {
        if (key === 'Home') {
            const firstRootNode = this.shadow.querySelector('ul[role="tree"] > li[role="treeitem"]');
            if (firstRootNode) {
                this.focusTreeNode(firstRootNode);
            }
        }
        else if (key === 'End') {
            /**
             * The End key takes the user to the last visible node in the tree - you
             * can think of this as the one that's rendered closest to the bottom of
             * the page.
             *
             * We could walk our tree and compute this - but it will also be the last
             * li[role="treeitem"] in the DOM because we only render visible nodes.
             * Therefore we can select all the nodes and pick the last one.
             */
            const allTreeItems = this.shadow.querySelectorAll('li[role="treeitem"]');
            const lastTreeItem = allTreeItems[allTreeItems.length - 1];
            if (lastTreeItem) {
                this.focusTreeNode(lastTreeItem);
            }
        }
    }
    async processArrowKeyNavigation(key, currentDOMNode) {
        const currentTreeNode = this.domNodeToTreeNodeMap.get(currentDOMNode);
        if (!currentTreeNode) {
            return;
        }
        const domNode = findNextNodeForTreeOutlineKeyboardNavigation({
            currentDOMNode,
            currentTreeNode,
            direction: key,
            setNodeExpandedState: (node, expanded) => this.setNodeExpandedState(node, expanded),
        });
        this.focusTreeNode(domNode);
    }
    processEnterOrSpaceNavigation(currentDOMNode) {
        const currentTreeNode = this.domNodeToTreeNodeMap.get(currentDOMNode);
        if (!currentTreeNode) {
            return;
        }
        if (isExpandableNode(currentTreeNode)) {
            const currentExpandedState = this.nodeIsExpanded(currentTreeNode);
            this.setNodeExpandedState(currentTreeNode, !currentExpandedState);
            this.render();
        }
    }
    async onTreeKeyDown(event) {
        if (!(event.target instanceof HTMLLIElement)) {
            throw new Error('event.target was not an <li> element');
        }
        if (event.key === 'Home' || event.key === 'End') {
            event.preventDefault();
            this.processHomeAndEndKeysNavigation(event.key);
        }
        else if (Platform.KeyboardUtilities.keyIsArrowKey(event.key)) {
            event.preventDefault();
            await this.processArrowKeyNavigation(event.key, event.target);
        }
        else if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            this.processEnterOrSpaceNavigation(event.target);
        }
    }
    focusPendingNode(domNode) {
        this.nodePendingFocus = null;
        this.focusTreeNode(domNode);
    }
    isSelectedNode(node) {
        if (node.id) {
            if (this.selectedTreeNode && this.selectedTreeNode.id) {
                return node.id === this.selectedTreeNode.id;
            }
        }
        return node === this.selectedTreeNode;
    }
    renderNode(node, { depth, setSize, positionInSet }) {
        let childrenToRender;
        const nodeIsExpanded = this.nodeIsExpanded(node);
        if (!isExpandableNode(node) || !nodeIsExpanded) {
            childrenToRender = LitHtml.nothing;
        }
        else {
            const childNodes = this.fetchNodeChildren(node).then(children => {
                return children.map((childNode, index) => {
                    return this.renderNode(childNode, { depth: depth + 1, setSize: children.length, positionInSet: index });
                });
            });
            // Disabled until https://crbug.com/1079231 is fixed.
            // clang-format off
            childrenToRender = LitHtml.html `<ul role="group">${LitHtml.Directives.until(childNodes)}</ul>`;
            // clang-format on
        }
        const nodeIsFocusable = this.getSelectedTreeNode() === node;
        const tabIndex = nodeIsFocusable ? 0 : -1;
        const listItemClasses = LitHtml.Directives.classMap({
            expanded: isExpandableNode(node) && nodeIsExpanded,
            parent: isExpandableNode(node),
            selected: this.isSelectedNode(node),
            'is-top-level': depth === 0,
        });
        const ariaExpandedAttribute = LitHtml.Directives.ifDefined(isExpandableNode(node) ? String(nodeIsExpanded) : undefined);
        let renderedNodeKey;
        if (node.renderer) {
            renderedNodeKey = node.renderer(node, { isExpanded: nodeIsExpanded });
        }
        else {
            renderedNodeKey = this.defaultRenderer(node, { isExpanded: nodeIsExpanded });
        }
        // Disabled until https://crbug.com/1079231 is fixed.
        // clang-format off
        return LitHtml.html `
      <li role="treeitem"
        tabindex=${tabIndex}
        aria-setsize=${setSize}
        aria-expanded=${ariaExpandedAttribute}
        aria-level=${depth + 1}
        aria-posinset=${positionInSet + 1}
        class=${listItemClasses}
        @click=${this.onNodeClick}
        track-dom-node-to-tree-node=${trackDOMNodeToTreeNode(this.domNodeToTreeNodeMap, node)}
        on-render=${ComponentHelpers.Directives.nodeRenderedCallback(domNode => {
            /**
              * Because TreeNodes are lazily rendered, you can call
              * `outline.expandToAndSelect(NodeX)`, but `NodeX` will be rendered at some
              * later point, once it's been fully resolved, within a LitHtml.until
              * directive. That means we don't have a direct hook into when it's
              * rendered, which we need because we want to focus the element, so we use this directive to receive a callback when the node is rendered.
              */
            if (!(domNode instanceof HTMLLIElement)) {
                return;
            }
            // If an id key was supplied for the node, match on that.
            // Otherwise default to object equality.
            if (node.id && this.nodePendingFocus && this.nodePendingFocus.id && node.id === this.nodePendingFocus.id) {
                this.focusPendingNode(domNode);
            }
            else if (node === this.nodePendingFocus) {
                this.focusPendingNode(domNode);
            }
        })}
      >
        <span class="arrow-and-key-wrapper"
          @mouseover=${() => {
            this.dispatchEvent(new ItemMouseOverEvent(node));
        }}
          @mouseout=${() => {
            this.dispatchEvent(new ItemMouseOutEvent(node));
        }}
        >
          <span class="arrow-icon" @click=${this.onArrowClick(node)}>
          </span>
          <span class="tree-node-key" data-node-key=${node.treeNodeData}>${renderedNodeKey}</span>
        </span>
        ${childrenToRender}
      </li>
    `;
        // clang-format on
    }
    async render() {
        if (this.scheduledRender) {
            // If we are already rendering, don't render again immediately, but
            // enqueue it to be run after we're done on our current render.
            this.enqueuedRender = true;
            return;
        }
        this.scheduledRender = true;
        await coordinator.write('TreeOutline render', () => {
            // Disabled until https://crbug.com/1079231 is fixed.
            // clang-format off
            LitHtml.render(LitHtml.html `
      <style>
        li {
          list-style: none;
          text-overflow: ellipsis;
          min-height: 12px;
        }

        .tree-node-key {
          white-space: var(--override-key-whitespace-wrapping);
        }

        .arrow-icon {
          display: block;
          user-select: none;
          -webkit-mask-image: var(--image-file-treeoutlineTriangles);
          -webkit-mask-size: 32px 24px;
          -webkit-mask-position: 0 0;
          background-color: var(--color-text-primary);
          content: "";
          text-shadow: none;
          height: 12px;
          width: 13px;
          overflow: hidden;
        }

        ul {
          margin: 0;
          padding: 0;
        }

        ul[role="group"] {
          padding-left: 16px;
        }

        li:not(.parent) > .arrow-and-key-wrapper > .arrow-icon {
          -webkit-mask-size: 0;
        }

        li.parent.expanded > .arrow-and-key-wrapper > .arrow-icon {
          -webkit-mask-position: -16px 0;
        }

        li.is-top-level {
          border-top: var(--override-top-node-border);
        }

        li.is-top-level:last-child {
          border-bottom: var(--override-top-node-border);
        }

        :host([animated]) li:not(.is-top-level) {
          animation-name: slideIn;
          animation-duration: 150ms;
          animation-timing-function: cubic-bezier(0, 0, 0.3, 1);
          animation-fill-mode: forwards;
        }

        @keyframes slideIn {
          from {
            transform: translateY(-5px);
            opacity: 0%;
          }

          to {
            transform: none;
            opacity: 100%;
          }
        }

        .arrow-and-key-wrapper {
          border: 2px solid transparent;
          display: flex;
          align-content: center;
        }

        [role="treeitem"]:focus {
          outline: 0;
        }

        [role="treeitem"].selected > .arrow-and-key-wrapper {
          /* stylelint-disable-next-line color-named */
          background-color: var(--legacy-selection-bg-color);
        }
      </style>
      <div class="wrapping-container">
      <ul role="tree" @keydown=${this.onTreeKeyDown}>
        ${this.treeData.map((topLevelNode, index) => {
                return this.renderNode(topLevelNode, {
                    depth: 0,
                    setSize: this.treeData.length,
                    positionInSet: index,
                });
            })}
      </ul>
      </div>
      `, this.shadow, {
                host: this,
            });
        });
        // clang-format on
        this.hasRenderedAtLeastOnce = true;
        this.scheduledRender = false;
        // If render() was called when we were already mid-render, let's re-render
        // to ensure we're not rendering any stale UI.
        if (this.enqueuedRender) {
            this.enqueuedRender = false;
            return this.render();
        }
    }
}
ComponentHelpers.CustomElements.defineComponent('devtools-tree-outline', TreeOutline);
//# sourceMappingURL=TreeOutline.js.map