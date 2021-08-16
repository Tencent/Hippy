// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as TreeOutline from '../../ui/components/tree_outline/tree_outline.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as ElementsComponents from './components/components.js';
export class AccessibilityTreeView extends UI.Widget.VBox {
    accessibilityTreeComponent = new TreeOutline.TreeOutline.TreeOutline();
    treeData = [];
    toggleButton;
    accessibilityModel = null;
    rootAXNode = null;
    selectedTreeNode = null;
    inspectedDOMNode = null;
    constructor(toggleButton) {
        super();
        // toggleButton is bound to a click handler on ElementsPanel to switch between the DOM tree
        // and accessibility tree views.
        this.toggleButton = toggleButton;
        this.contentElement.appendChild(this.toggleButton);
        this.contentElement.appendChild(this.accessibilityTreeComponent);
        // The DOM tree and accessibility are kept in sync as much as possible, so
        // on node selection, update the currently inspected node and reveal in the
        // DOM tree.
        this.accessibilityTreeComponent.addEventListener('itemselected', (event) => {
            const evt = event;
            const axNode = evt.data.node.treeNodeData;
            if (!axNode.isDOMNode()) {
                return;
            }
            const deferredNode = axNode.deferredDOMNode();
            if (deferredNode) {
                deferredNode.resolve(domNode => {
                    if (domNode && domNode.nodeName() === '#document') {
                        return;
                    }
                    Common.Revealer.reveal(domNode, true /* omitFocus */);
                });
            }
            // Highlight the node as well, for keyboard navigation.
            evt.data.node.treeNodeData.highlightDOMNode();
        });
        this.accessibilityTreeComponent.addEventListener('itemmouseover', (event) => {
            const evt = event;
            evt.data.node.treeNodeData.highlightDOMNode();
        });
        this.accessibilityTreeComponent.addEventListener('itemmouseout', () => {
            SDK.OverlayModel.OverlayModel.hideDOMNodeHighlight();
        });
    }
    wasShown() {
        if (this.selectedTreeNode) {
            this.accessibilityTreeComponent.expandToAndSelectTreeNode(this.selectedTreeNode);
        }
    }
    setAccessibilityModel(model) {
        this.accessibilityModel = model;
        this.refreshAccessibilityTree();
    }
    async refreshAccessibilityTree() {
        if (!this.accessibilityModel) {
            return;
        }
        const root = await this.accessibilityModel.requestRootNode();
        if (!root) {
            return;
        }
        this.rootAXNode = root;
        this.treeData = [ElementsComponents.AccessibilityTreeUtils.sdkNodeToAXTreeNode(this.rootAXNode)];
        this.accessibilityTreeComponent.data = {
            defaultRenderer: (node) => ElementsComponents.AccessibilityTreeUtils.accessibilityNodeRenderer(node),
            tree: this.treeData,
        };
        this.accessibilityTreeComponent.expandRecursively(2);
        this.selectedTreeNode = this.treeData[0];
    }
    // Given a selected DOM node, asks the model to load the missing subtree from the root to the
    // selected node and then re-renders the tree.
    async loadSubTreeIntoAccessibilityModel(selectedNode) {
        if (!this.accessibilityModel) {
            return;
        }
        this.inspectedDOMNode = selectedNode;
        // If this node has been loaded previously, the accessibility tree will return it's cached node.
        // Eventually we'll need some mechanism for forcing it to fetch a new node when we are subscribing
        // for updates, but TBD later.
        // EG for a backend tree like:
        //
        // A*
        //   B
        //     C
        //   D
        //     E
        // Where only A is already loaded into the model, calling requestAndLoadSubTreeToNode(C) will
        // load [A, B, D, C] into the model, and return C.
        const inspectedAXNode = await this.accessibilityModel.requestAndLoadSubTreeToNode(selectedNode);
        if (!inspectedAXNode) {
            return;
        }
        this.accessibilityTreeComponent.data = {
            defaultRenderer: (node) => ElementsComponents.AccessibilityTreeUtils.accessibilityNodeRenderer(node),
            tree: this.treeData,
        };
        // These nodes require a special case, as they don't have an unignored node in the
        // accessibility tree. Someone inspecting these in the DOM is probably expecting to
        // be focused on the root WebArea of the accessibility tree.
        // TODO(meredithl): Fix for when the inspected node is ingored in the accessibility
        // tree. Eg, inspecting <head> in the DOM tree.
        if (selectedNode.nodeName() === 'BODY' || selectedNode.nodeName() === 'HTML') {
            this.accessibilityTreeComponent.expandToAndSelectTreeNode(this.treeData[0]);
            this.selectedTreeNode = this.treeData[0];
            return;
        }
        this.selectedTreeNode = ElementsComponents.AccessibilityTreeUtils.sdkNodeToAXTreeNode(inspectedAXNode);
        this.accessibilityTreeComponent.expandToAndSelectTreeNode(this.selectedTreeNode);
    }
    // Selected node in the DOM has changed, and the corresponding accessibility node may be
    // unloaded. We probably only want to do this when the AccessibilityTree is visible.
    async selectedNodeChanged(inspectedNode) {
        if (inspectedNode === this.inspectedDOMNode) {
            return;
        }
        await this.loadSubTreeIntoAccessibilityModel(inspectedNode);
    }
}
//# sourceMappingURL=AccessibilityTreeView.js.map