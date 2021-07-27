import type * as SDK from '../../../core/sdk/sdk.js';
import type * as TreeOutline from '../../../ui/components/tree_outline/tree_outline.js';
import * as LitHtml from '../../../ui/lit-html/lit-html.js';
export declare type AXTreeNode = TreeOutline.TreeOutlineUtils.TreeNode<SDK.AccessibilityModel.AccessibilityNode>;
export declare function sdkNodeToAXTreeNode(node: SDK.AccessibilityModel.AccessibilityNode): AXTreeNode;
export declare function accessibilityNodeRenderer(node: AXTreeNode): LitHtml.TemplateResult;
