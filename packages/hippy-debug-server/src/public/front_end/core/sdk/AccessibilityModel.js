// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { DeferredDOMNode } from './DOMModel.js'; // eslint-disable-line no-unused-vars
import { Capability } from './Target.js';
import { SDKModel } from './SDKModel.js'; // eslint-disable-line no-unused-vars
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var CoreAxPropertyName;
(function (CoreAxPropertyName) {
    CoreAxPropertyName["Name"] = "name";
    CoreAxPropertyName["Description"] = "description";
    CoreAxPropertyName["Value"] = "value";
    CoreAxPropertyName["Role"] = "role";
})(CoreAxPropertyName || (CoreAxPropertyName = {}));
export class AccessibilityNode {
    _accessibilityModel;
    _agent;
    _id;
    _backendDOMNodeId;
    _deferredDOMNode;
    _ignored;
    _ignoredReasons;
    _role;
    _name;
    _description;
    _value;
    _properties;
    _childIds;
    _parentNode;
    constructor(accessibilityModel, payload) {
        this._accessibilityModel = accessibilityModel;
        this._agent = accessibilityModel._agent;
        this._id = payload.nodeId;
        accessibilityModel._setAXNodeForAXId(this._id, this);
        if (payload.backendDOMNodeId) {
            accessibilityModel._setAXNodeForBackendDOMNodeId(payload.backendDOMNodeId, this);
            this._backendDOMNodeId = payload.backendDOMNodeId;
            this._deferredDOMNode = new DeferredDOMNode(accessibilityModel.target(), payload.backendDOMNodeId);
        }
        else {
            this._backendDOMNodeId = null;
            this._deferredDOMNode = null;
        }
        this._ignored = payload.ignored;
        if (this._ignored && 'ignoredReasons' in payload) {
            this._ignoredReasons = payload.ignoredReasons;
        }
        this._role = payload.role || null;
        this._name = payload.name || null;
        this._description = payload.description || null;
        this._value = payload.value || null;
        this._properties = payload.properties || null;
        this._childIds = payload.childIds || null;
        this._parentNode = null;
    }
    id() {
        return this._id;
    }
    accessibilityModel() {
        return this._accessibilityModel;
    }
    ignored() {
        return this._ignored;
    }
    ignoredReasons() {
        return this._ignoredReasons || null;
    }
    role() {
        return this._role || null;
    }
    coreProperties() {
        const properties = [];
        if (this._name) {
            properties.push({ name: CoreAxPropertyName.Name, value: this._name });
        }
        if (this._description) {
            properties.push({ name: CoreAxPropertyName.Description, value: this._description });
        }
        if (this._value) {
            properties.push({ name: CoreAxPropertyName.Value, value: this._value });
        }
        return properties;
    }
    name() {
        return this._name || null;
    }
    description() {
        return this._description || null;
    }
    value() {
        return this._value || null;
    }
    properties() {
        return this._properties || null;
    }
    parentNode() {
        return this._parentNode;
    }
    _setParentNode(parentNode) {
        this._parentNode = parentNode;
    }
    isDOMNode() {
        return Boolean(this._backendDOMNodeId);
    }
    backendDOMNodeId() {
        return this._backendDOMNodeId;
    }
    deferredDOMNode() {
        return this._deferredDOMNode;
    }
    highlightDOMNode() {
        const deferredNode = this.deferredDOMNode();
        if (!deferredNode) {
            return;
        }
        // Highlight node in page.
        deferredNode.highlight();
    }
    children() {
        if (!this._childIds) {
            return [];
        }
        const children = [];
        for (const childId of this._childIds) {
            const child = this._accessibilityModel.axNodeForId(childId);
            if (child) {
                children.push(child);
            }
        }
        return children;
    }
    numChildren() {
        if (!this._childIds) {
            return 0;
        }
        return this._childIds.length;
    }
    hasOnlyUnloadedChildren() {
        if (!this._childIds || !this._childIds.length) {
            return false;
        }
        return !this._childIds.some(id => this._accessibilityModel.axNodeForId(id) !== null);
    }
}
export class AccessibilityModel extends SDKModel {
    _agent;
    _axIdToAXNode;
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _backendDOMNodeIdToAXNode;
    constructor(target) {
        super(target);
        this._agent = target.accessibilityAgent();
        this.resumeModel();
        this._axIdToAXNode = new Map();
        this._backendDOMNodeIdToAXNode = new Map();
    }
    clear() {
        this._axIdToAXNode.clear();
    }
    async resumeModel() {
        await this._agent.invoke_enable();
    }
    async suspendModel() {
        await this._agent.invoke_disable();
    }
    async requestPartialAXTree(node) {
        const { nodes } = await this._agent.invoke_getPartialAXTree({ nodeId: node.id, backendNodeId: undefined, objectId: undefined, fetchRelatives: true });
        if (!nodes) {
            return;
        }
        for (const payload of nodes) {
            new AccessibilityNode(this, payload);
        }
        for (const axNode of this._axIdToAXNode.values()) {
            for (const axChild of axNode.children()) {
                axChild._setParentNode(axNode);
            }
        }
    }
    async requestRootNode(depth = 2) {
        const { nodes } = await this._agent.invoke_getFullAXTree({ max_depth: depth });
        if (!nodes) {
            return;
        }
        const axNodes = nodes.map(node => new AccessibilityNode(this, node));
        for (const axNode of this._axIdToAXNode.values()) {
            for (const axChild of axNode.children()) {
                axChild._setParentNode(axNode);
            }
        }
        return axNodes[0];
    }
    async requestAXChildren(nodeId) {
        const { nodes } = await this._agent.invoke_getChildAXNodes({ id: nodeId });
        if (!nodes) {
            return [];
        }
        const axNodes = [];
        for (const payload of nodes) {
            if (!this._axIdToAXNode.has(payload.nodeId)) {
                axNodes.push(new AccessibilityNode(this, payload));
            }
        }
        for (const axNode of this._axIdToAXNode.values()) {
            for (const axChild of axNode.children()) {
                axChild._setParentNode(axNode);
            }
        }
        return axNodes;
    }
    /**
     *
     * @param {!DOMNode} node
     * @return ?{!Promise<!AccessibilityNode[]>}
     */
    async requestAndLoadSubTreeToNode(node) {
        // Node may have already been loaded, so don't bother requesting it again.
        const loadedAXNode = this.axNodeForDOMNode(node);
        if (loadedAXNode) {
            return loadedAXNode;
        }
        const { nodes } = await this._agent.invoke_getPartialAXTree({ nodeId: node.id, backendNodeId: undefined, objectId: undefined, fetchRelatives: true });
        if (!nodes) {
            return null;
        }
        const ancestors = [];
        for (const payload of nodes) {
            if (!this._axIdToAXNode.has(payload.nodeId)) {
                ancestors.push(new AccessibilityNode(this, payload));
            }
        }
        for (const axNode of this._axIdToAXNode.values()) {
            for (const axChild of axNode.children()) {
                axChild._setParentNode(axNode);
            }
        }
        // Request top level children nodes.
        for (const node of ancestors) {
            await this.requestAXChildren(node.id());
        }
        return this.axNodeForDOMNode(node);
    }
    /**
     * @param {string} axId
     * @return {?AccessibilityNode}
     */
    axNodeForId(axId) {
        return this._axIdToAXNode.get(axId) || null;
    }
    _setAXNodeForAXId(axId, axNode) {
        this._axIdToAXNode.set(axId, axNode);
    }
    axNodeForDOMNode(domNode) {
        if (!domNode) {
            return null;
        }
        return this._backendDOMNodeIdToAXNode.get(domNode.backendNodeId());
    }
    _setAXNodeForBackendDOMNodeId(backendDOMNodeId, axNode) {
        this._backendDOMNodeIdToAXNode.set(backendDOMNodeId, axNode);
    }
}
SDKModel.register(AccessibilityModel, { capabilities: Capability.DOM, autostart: false });
//# sourceMappingURL=AccessibilityModel.js.map