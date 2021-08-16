import * as LitHtml from '../../lit-html/lit-html.js';
import type { TreeNode } from './TreeOutlineUtils.js';
export interface TreeOutlineData<TreeNodeDataType> {
    defaultRenderer: (node: TreeNode<TreeNodeDataType>, state: {
        isExpanded: boolean;
    }) => LitHtml.TemplateResult;
    /**
     * Note: it is important that all the TreeNode objects are unique. They are
     * used internally to the TreeOutline as keys to track state (such as if a
     * node is expanded or not), and providing the same object multiple times will
     * cause issues in the TreeOutline.
     */
    tree: readonly TreeNode<TreeNodeDataType>[];
}
export declare function defaultRenderer(node: TreeNode<string>): LitHtml.TemplateResult;
export declare class ItemSelectedEvent<TreeNodeDataType> extends Event {
    data: {
        node: TreeNode<TreeNodeDataType>;
    };
    constructor(node: TreeNode<TreeNodeDataType>);
}
export declare class ItemMouseOverEvent<TreeNodeDataType> extends Event {
    data: {
        node: TreeNode<TreeNodeDataType>;
    };
    constructor(node: TreeNode<TreeNodeDataType>);
}
export declare class ItemMouseOutEvent<TreeNodeDataType> extends Event {
    data: {
        node: TreeNode<TreeNodeDataType>;
    };
    constructor(node: TreeNode<TreeNodeDataType>);
}
export declare class TreeOutline<TreeNodeDataType> extends HTMLElement {
    private readonly shadow;
    private treeData;
    private nodeExpandedMap;
    private domNodeToTreeNodeMap;
    private hasRenderedAtLeastOnce;
    /**
     * If we have expanded to a certain node, we want to focus it once we've
     * rendered. But we render lazily and wrapped in LitHtml.until, so we can't
     * know for sure when that node will be rendered. This variable tracks the
     * node that we want focused but may not yet have been rendered.
     */
    private nodePendingFocus;
    private selectedTreeNode;
    private defaultRenderer;
    /**
     * scheduledRender = render() has been called and scheduled a render.
     */
    private scheduledRender;
    /**
     * enqueuedRender = render() was called mid-way through an existing render.
     */
    private enqueuedRender;
    static get observedAttributes(): string[];
    attributeChangedCallback(name: 'nowrap' | 'toplevelbordercolor', oldValue: string | null, newValue: string | null): void;
    connectedCallback(): void;
    get data(): TreeOutlineData<TreeNodeDataType>;
    set data(data: TreeOutlineData<TreeNodeDataType>);
    /**
     * Recursively expands the tree from the root nodes, to a max depth. The max
     * depth is 0 indexed - so a maxDepth of 2 (default) will expand 3 levels: 0,
     * 1 and 2.
     */
    expandRecursively(maxDepth?: number): Promise<void>;
    /**
     * Takes a TreeNode, expands the outline to reveal it, and focuses it.
     */
    expandToAndSelectTreeNode(targetTreeNode: TreeNode<TreeNodeDataType>): Promise<void>;
    collapseChildrenOfNode(domNode: HTMLLIElement): Promise<void>;
    private setNodeKeyNoWrapCSSVariable;
    private setTopLevelNodeBorderColorCSSVariable;
    private recursivelyCollapseTreeNodeChildren;
    private getSelectedTreeNode;
    private fetchNodeChildren;
    private setNodeExpandedState;
    private nodeIsExpanded;
    private expandAndRecurse;
    private onArrowClick;
    private onNodeClick;
    private focusTreeNode;
    private processHomeAndEndKeysNavigation;
    private processArrowKeyNavigation;
    private processEnterOrSpaceNavigation;
    private onTreeKeyDown;
    private focusPendingNode;
    private isSelectedNode;
    private renderNode;
    private render;
}
declare global {
    interface HTMLElementTagNameMap {
        'devtools-tree-outline': TreeOutline<unknown>;
    }
}
