// Copyright 2016 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
import { AccessibilitySubPane } from './AccessibilitySubPane.js';
const UIStrings = {
    /**
    *@description Text in AXBreadcrumbs Pane of the Accessibility panel
    */
    accessibilityTree: 'Accessibility Tree',
    /**
    *@description Text to scroll the displayed content into view
    */
    scrollIntoView: 'Scroll into view',
    /**
    *@description Ignored node element text content in AXBreadcrumbs Pane of the Accessibility panel
    */
    ignored: 'Ignored',
};
const str_ = i18n.i18n.registerUIStrings('panels/accessibility/AXBreadcrumbsPane.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class AXBreadcrumbsPane extends AccessibilitySubPane {
    _axSidebarView;
    _preselectedBreadcrumb;
    _inspectedNodeBreadcrumb;
    _collapsingBreadcrumbId;
    _hoveredBreadcrumb;
    _rootElement;
    constructor(axSidebarView) {
        super(i18nString(UIStrings.accessibilityTree));
        this.element.classList.add('ax-subpane');
        UI.ARIAUtils.markAsTree(this.element);
        this.element.tabIndex = -1;
        this._axSidebarView = axSidebarView;
        this._preselectedBreadcrumb = null;
        this._inspectedNodeBreadcrumb = null;
        this._collapsingBreadcrumbId = -1;
        this._hoveredBreadcrumb = null;
        this._rootElement = this.element.createChild('div', 'ax-breadcrumbs');
        this._rootElement.addEventListener('keydown', this._onKeyDown.bind(this), true);
        this._rootElement.addEventListener('mousemove', this._onMouseMove.bind(this), false);
        this._rootElement.addEventListener('mouseleave', this._onMouseLeave.bind(this), false);
        this._rootElement.addEventListener('click', this._onClick.bind(this), false);
        this._rootElement.addEventListener('contextmenu', this._contextMenuEventFired.bind(this), false);
        this._rootElement.addEventListener('focusout', this._onFocusOut.bind(this), false);
        this.registerRequiredCSS('panels/accessibility/axBreadcrumbs.css', { enableLegacyPatching: false });
    }
    focus() {
        if (this._inspectedNodeBreadcrumb) {
            this._inspectedNodeBreadcrumb.nodeElement().focus();
        }
        else {
            this.element.focus();
        }
    }
    setAXNode(axNode) {
        const hadFocus = this.element.hasFocus();
        super.setAXNode(axNode);
        this._rootElement.removeChildren();
        if (!axNode) {
            return;
        }
        const ancestorChain = [];
        let ancestor = axNode;
        while (ancestor) {
            ancestorChain.push(ancestor);
            ancestor = ancestor.parentNode();
        }
        ancestorChain.reverse();
        let depth = 0;
        let parent = null;
        this._inspectedNodeBreadcrumb = null;
        for (ancestor of ancestorChain) {
            const breadcrumb = new AXBreadcrumb(ancestor, depth, (ancestor === axNode));
            if (parent) {
                parent.appendChild(breadcrumb);
            }
            else {
                this._rootElement.appendChild(breadcrumb.element());
            }
            parent = breadcrumb;
            depth++;
            this._inspectedNodeBreadcrumb = breadcrumb;
        }
        if (this._inspectedNodeBreadcrumb) {
            this._inspectedNodeBreadcrumb.setPreselected(true, hadFocus);
        }
        this._setPreselectedBreadcrumb(this._inspectedNodeBreadcrumb);
        function append(parentBreadcrumb, axNode, localDepth) {
            const childBreadcrumb = new AXBreadcrumb(axNode, localDepth, false);
            parentBreadcrumb.appendChild(childBreadcrumb);
            // In most cases there will be no children here, but there are some special cases.
            for (const child of axNode.children()) {
                append(childBreadcrumb, child, localDepth + 1);
            }
        }
        if (this._inspectedNodeBreadcrumb) {
            for (const child of axNode.children()) {
                append(this._inspectedNodeBreadcrumb, child, depth);
                if (child.backendDOMNodeId() === this._collapsingBreadcrumbId) {
                    this._setPreselectedBreadcrumb(this._inspectedNodeBreadcrumb.lastChild());
                }
            }
        }
        this._collapsingBreadcrumbId = -1;
    }
    willHide() {
        this._setPreselectedBreadcrumb(null);
    }
    _onKeyDown(event) {
        const preselectedBreadcrumb = this._preselectedBreadcrumb;
        if (!preselectedBreadcrumb) {
            return;
        }
        const keyboardEvent = event;
        if (!keyboardEvent.composedPath().some(element => element === preselectedBreadcrumb.element())) {
            return;
        }
        if (keyboardEvent.shiftKey || keyboardEvent.metaKey || keyboardEvent.ctrlKey) {
            return;
        }
        let handled = false;
        if (keyboardEvent.key === 'ArrowUp' && !keyboardEvent.altKey) {
            handled = this._preselectPrevious();
        }
        else if ((keyboardEvent.key === 'ArrowDown') && !keyboardEvent.altKey) {
            handled = this._preselectNext();
        }
        else if (keyboardEvent.key === 'ArrowLeft' && !keyboardEvent.altKey) {
            if (preselectedBreadcrumb.hasExpandedChildren()) {
                this._collapseBreadcrumb(preselectedBreadcrumb);
            }
            else {
                handled = this._preselectParent();
            }
        }
        else if ((keyboardEvent.key === 'Enter' ||
            (keyboardEvent.key === 'ArrowRight' && !keyboardEvent.altKey &&
                preselectedBreadcrumb.axNode().hasOnlyUnloadedChildren()))) {
            handled = this._inspectDOMNode(preselectedBreadcrumb.axNode());
        }
        if (handled) {
            keyboardEvent.consume(true);
        }
    }
    _preselectPrevious() {
        if (!this._preselectedBreadcrumb) {
            return false;
        }
        const previousBreadcrumb = this._preselectedBreadcrumb.previousBreadcrumb();
        if (!previousBreadcrumb) {
            return false;
        }
        this._setPreselectedBreadcrumb(previousBreadcrumb);
        return true;
    }
    _preselectNext() {
        if (!this._preselectedBreadcrumb) {
            return false;
        }
        const nextBreadcrumb = this._preselectedBreadcrumb.nextBreadcrumb();
        if (!nextBreadcrumb) {
            return false;
        }
        this._setPreselectedBreadcrumb(nextBreadcrumb);
        return true;
    }
    _preselectParent() {
        if (!this._preselectedBreadcrumb) {
            return false;
        }
        const parentBreadcrumb = this._preselectedBreadcrumb.parentBreadcrumb();
        if (!parentBreadcrumb) {
            return false;
        }
        this._setPreselectedBreadcrumb(parentBreadcrumb);
        return true;
    }
    _setPreselectedBreadcrumb(breadcrumb) {
        if (breadcrumb === this._preselectedBreadcrumb) {
            return;
        }
        const hadFocus = this.element.hasFocus();
        if (this._preselectedBreadcrumb) {
            this._preselectedBreadcrumb.setPreselected(false, hadFocus);
        }
        if (breadcrumb) {
            this._preselectedBreadcrumb = breadcrumb;
        }
        else {
            this._preselectedBreadcrumb = this._inspectedNodeBreadcrumb;
        }
        if (this._preselectedBreadcrumb) {
            this._preselectedBreadcrumb.setPreselected(true, hadFocus);
        }
        if (!breadcrumb && hadFocus) {
            SDK.OverlayModel.OverlayModel.hideDOMNodeHighlight();
        }
    }
    _collapseBreadcrumb(breadcrumb) {
        if (!breadcrumb.parentBreadcrumb()) {
            return;
        }
        const backendNodeId = breadcrumb.axNode().backendDOMNodeId();
        if (backendNodeId !== null) {
            this._collapsingBreadcrumbId = backendNodeId;
        }
        const parentBreadcrumb = breadcrumb.parentBreadcrumb();
        if (parentBreadcrumb) {
            this._inspectDOMNode(parentBreadcrumb.axNode());
        }
    }
    _onMouseLeave(_event) {
        this._setHoveredBreadcrumb(null);
    }
    _onMouseMove(event) {
        const target = event.target;
        if (!target) {
            return;
        }
        const breadcrumbElement = target.enclosingNodeOrSelfWithClass('ax-breadcrumb');
        if (!breadcrumbElement) {
            this._setHoveredBreadcrumb(null);
            return;
        }
        const breadcrumb = elementsToAXBreadcrumb.get(breadcrumbElement);
        if (!breadcrumb || !breadcrumb.isDOMNode()) {
            return;
        }
        this._setHoveredBreadcrumb(breadcrumb);
    }
    _onFocusOut(event) {
        if (!this._preselectedBreadcrumb || event.target !== this._preselectedBreadcrumb.nodeElement()) {
            return;
        }
        this._setPreselectedBreadcrumb(null);
    }
    _onClick(event) {
        const target = event.target;
        if (!target) {
            return;
        }
        const breadcrumbElement = target.enclosingNodeOrSelfWithClass('ax-breadcrumb');
        if (!breadcrumbElement) {
            this._setHoveredBreadcrumb(null);
            return;
        }
        const breadcrumb = elementsToAXBreadcrumb.get(breadcrumbElement);
        if (!breadcrumb) {
            return;
        }
        if (breadcrumb.inspected()) {
            // This will collapse and preselect/focus the breadcrumb.
            this._collapseBreadcrumb(breadcrumb);
            breadcrumb.nodeElement().focus();
            return;
        }
        if (!breadcrumb.isDOMNode()) {
            return;
        }
        this._inspectDOMNode(breadcrumb.axNode());
    }
    _setHoveredBreadcrumb(breadcrumb) {
        if (breadcrumb === this._hoveredBreadcrumb) {
            return;
        }
        if (this._hoveredBreadcrumb) {
            this._hoveredBreadcrumb.setHovered(false);
        }
        const node = this.node();
        if (breadcrumb) {
            breadcrumb.setHovered(true);
        }
        else if (node && node.id) {
            // Highlight and scroll into view the currently inspected node.
            node.domModel().overlayModel().nodeHighlightRequested({ nodeId: node.id });
        }
        this._hoveredBreadcrumb = breadcrumb;
    }
    _inspectDOMNode(axNode) {
        if (!axNode.isDOMNode()) {
            return false;
        }
        const deferredNode = axNode.deferredDOMNode();
        if (deferredNode) {
            deferredNode.resolve(domNode => {
                this._axSidebarView.setNode(domNode, true /* fromAXTree */);
                Common.Revealer.reveal(domNode, true /* omitFocus */);
            });
        }
        return true;
    }
    _contextMenuEventFired(event) {
        const target = event.target;
        if (!target) {
            return;
        }
        const breadcrumbElement = target.enclosingNodeOrSelfWithClass('ax-breadcrumb');
        if (!breadcrumbElement) {
            return;
        }
        const breadcrumb = elementsToAXBreadcrumb.get(breadcrumbElement);
        if (!breadcrumb) {
            return;
        }
        const axNode = breadcrumb.axNode();
        if (!axNode.isDOMNode() || !axNode.deferredDOMNode()) {
            return;
        }
        const contextMenu = new UI.ContextMenu.ContextMenu(event);
        contextMenu.viewSection().appendItem(i18nString(UIStrings.scrollIntoView), () => {
            const deferredNode = axNode.deferredDOMNode();
            if (!deferredNode) {
                return;
            }
            deferredNode.resolvePromise().then(domNode => {
                if (!domNode) {
                    return;
                }
                domNode.scrollIntoView();
            });
        });
        const deferredNode = axNode.deferredDOMNode();
        if (deferredNode) {
            contextMenu.appendApplicableItems(deferredNode);
        }
        contextMenu.show();
    }
}
const elementsToAXBreadcrumb = new WeakMap();
export class AXBreadcrumb {
    _axNode;
    _element;
    _nodeElement;
    _nodeWrapper;
    _selectionElement;
    _childrenGroupElement;
    _children;
    _hovered;
    _preselected;
    _parent;
    _inspected;
    constructor(axNode, depth, inspected) {
        this._axNode = axNode;
        this._element = document.createElement('div');
        this._element.classList.add('ax-breadcrumb');
        elementsToAXBreadcrumb.set(this._element, this);
        this._nodeElement = document.createElement('div');
        this._nodeElement.classList.add('ax-node');
        UI.ARIAUtils.markAsTreeitem(this._nodeElement);
        this._nodeElement.tabIndex = -1;
        this._element.appendChild(this._nodeElement);
        this._nodeWrapper = document.createElement('div');
        this._nodeWrapper.classList.add('wrapper');
        this._nodeElement.appendChild(this._nodeWrapper);
        this._selectionElement = document.createElement('div');
        this._selectionElement.classList.add('selection');
        this._selectionElement.classList.add('fill');
        this._nodeElement.appendChild(this._selectionElement);
        this._childrenGroupElement = document.createElement('div');
        this._childrenGroupElement.classList.add('children');
        UI.ARIAUtils.markAsGroup(this._childrenGroupElement);
        this._element.appendChild(this._childrenGroupElement);
        this._children = [];
        this._hovered = false;
        this._preselected = false;
        this._parent = null;
        this._inspected = inspected;
        this._nodeElement.classList.toggle('inspected', inspected);
        this._nodeElement.style.paddingLeft = (16 * depth + 4) + 'px';
        if (this._axNode.ignored()) {
            this._appendIgnoredNodeElement();
        }
        else {
            this._appendRoleElement(this._axNode.role());
            const axNodeName = this._axNode.name();
            if (axNodeName && axNodeName.value) {
                this._nodeWrapper.createChild('span', 'separator').textContent = '\xA0';
                this._appendNameElement(axNodeName.value);
            }
        }
        if (this._axNode.hasOnlyUnloadedChildren()) {
            this._nodeElement.classList.add('children-unloaded');
            UI.ARIAUtils.setExpanded(this._nodeElement, false);
        }
        if (!this._axNode.isDOMNode()) {
            this._nodeElement.classList.add('no-dom-node');
        }
    }
    element() {
        return /** @type {!HTMLElement} */ this._element;
    }
    nodeElement() {
        return /** @type {!HTMLElement} */ this._nodeElement;
    }
    appendChild(breadcrumb) {
        this._children.push(breadcrumb);
        breadcrumb.setParent(this);
        this._nodeElement.classList.add('parent');
        UI.ARIAUtils.setExpanded(this._nodeElement, true);
        this._childrenGroupElement.appendChild(breadcrumb.element());
    }
    hasExpandedChildren() {
        return this._children.length;
    }
    setParent(breadcrumb) {
        this._parent = breadcrumb;
    }
    preselected() {
        return this._preselected;
    }
    setPreselected(preselected, selectedByUser) {
        if (this._preselected === preselected) {
            return;
        }
        this._preselected = preselected;
        this._nodeElement.classList.toggle('preselected', preselected);
        if (preselected) {
            this._nodeElement.tabIndex = 0;
        }
        else {
            this._nodeElement.tabIndex = -1;
        }
        if (this._preselected) {
            if (selectedByUser) {
                this._nodeElement.focus();
            }
            if (!this._inspected) {
                this._axNode.highlightDOMNode();
            }
            else {
                SDK.OverlayModel.OverlayModel.hideDOMNodeHighlight();
            }
        }
    }
    setHovered(hovered) {
        if (this._hovered === hovered) {
            return;
        }
        this._hovered = hovered;
        this._nodeElement.classList.toggle('hovered', hovered);
        if (this._hovered) {
            this._nodeElement.classList.toggle('hovered', true);
            this._axNode.highlightDOMNode();
        }
    }
    axNode() {
        return this._axNode;
    }
    inspected() {
        return this._inspected;
    }
    isDOMNode() {
        return this._axNode.isDOMNode();
    }
    nextBreadcrumb() {
        if (this._children.length) {
            return this._children[0];
        }
        const nextSibling = this.element().nextSibling;
        if (nextSibling) {
            return elementsToAXBreadcrumb.get(nextSibling) || null;
        }
        return null;
    }
    previousBreadcrumb() {
        const previousSibling = this.element().previousSibling;
        if (previousSibling) {
            return elementsToAXBreadcrumb.get(previousSibling) || null;
        }
        return this._parent;
    }
    parentBreadcrumb() {
        return this._parent;
    }
    lastChild() {
        return this._children[this._children.length - 1];
    }
    _appendNameElement(name) {
        const nameElement = document.createElement('span');
        nameElement.textContent = '"' + name + '"';
        nameElement.classList.add('ax-readable-string');
        this._nodeWrapper.appendChild(nameElement);
    }
    _appendRoleElement(role) {
        if (!role) {
            return;
        }
        const roleElement = document.createElement('span');
        roleElement.classList.add('monospace');
        roleElement.classList.add(RoleStyles[role.type]);
        roleElement.setTextContentTruncatedIfNeeded(role.value || '');
        this._nodeWrapper.appendChild(roleElement);
    }
    _appendIgnoredNodeElement() {
        const ignoredNodeElement = document.createElement('span');
        ignoredNodeElement.classList.add('monospace');
        ignoredNodeElement.textContent = i18nString(UIStrings.ignored);
        ignoredNodeElement.classList.add('ax-breadcrumbs-ignored-node');
        this._nodeWrapper.appendChild(ignoredNodeElement);
    }
}
export const RoleStyles = {
    internalRole: 'ax-internal-role',
    role: 'ax-role',
};
//# sourceMappingURL=AXBreadcrumbsPane.js.map