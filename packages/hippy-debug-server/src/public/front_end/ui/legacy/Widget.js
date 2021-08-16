// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/*
 * Copyright (C) 2008 Apple Inc. All Rights Reserved.
 * Copyright (C) 2011 Google Inc. All Rights Reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE INC. ``AS IS'' AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL APPLE INC. OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
 * OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as DOMExtension from '../../core/dom_extension/dom_extension.js';
import { Constraints, Size } from './Geometry.js';
import { appendStyle } from './utils/append-style.js';
import { createShadowRootWithCoreStyles } from './utils/create-shadow-root-with-core-styles.js';
import { XWidget } from './XWidget.js';
export class WidgetElement extends HTMLDivElement {
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __widget;
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __widgetCounter;
    constructor() {
        super();
    }
}
export class Widget extends Common.ObjectWrapper.ObjectWrapper {
    element;
    contentElement;
    _shadowRoot;
    _isWebComponent;
    _visible;
    _isRoot;
    _isShowing;
    _children;
    _hideOnDetach;
    _notificationDepth;
    _invalidationsSuspended;
    _defaultFocusedChild;
    _parentWidget;
    _defaultFocusedElement;
    _cachedConstraints;
    _constraints;
    _invalidationsRequested;
    _externallyManaged;
    constructor(isWebComponent, delegatesFocus) {
        super();
        this.contentElement = document.createElement('div');
        this.contentElement.classList.add('widget');
        if (isWebComponent) {
            this.element = document.createElement('div');
            this.element.classList.add('vbox');
            this.element.classList.add('flex-auto');
            this._shadowRoot = createShadowRootWithCoreStyles(this.element, {
                cssFile: undefined,
                enableLegacyPatching: false,
                delegatesFocus,
            });
            this._shadowRoot.appendChild(this.contentElement);
        }
        else {
            this.element = this.contentElement;
        }
        this._isWebComponent = isWebComponent;
        this.element.__widget = this;
        this._visible = false;
        this._isRoot = false;
        this._isShowing = false;
        this._children = [];
        this._hideOnDetach = false;
        this._notificationDepth = 0;
        this._invalidationsSuspended = 0;
        this._defaultFocusedChild = null;
        this._parentWidget = null;
    }
    static _incrementWidgetCounter(parentElement, childElement) {
        const count = (childElement.__widgetCounter || 0) + (childElement.__widget ? 1 : 0);
        if (!count) {
            return;
        }
        let currentElement = parentElement;
        while (currentElement) {
            currentElement.__widgetCounter = (currentElement.__widgetCounter || 0) + count;
            currentElement = parentWidgetElementOrShadowHost(currentElement);
        }
    }
    static _decrementWidgetCounter(parentElement, childElement) {
        const count = (childElement.__widgetCounter || 0) + (childElement.__widget ? 1 : 0);
        if (!count) {
            return;
        }
        let currentElement = parentElement;
        while (currentElement) {
            if (currentElement.__widgetCounter) {
                currentElement.__widgetCounter -= count;
            }
            currentElement = parentWidgetElementOrShadowHost(currentElement);
        }
    }
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/naming-convention
    static __assert(condition, message) {
        if (!condition) {
            throw new Error(message);
        }
    }
    markAsRoot() {
        Widget.__assert(!this.element.parentElement, 'Attempt to mark as root attached node');
        this._isRoot = true;
    }
    parentWidget() {
        return this._parentWidget;
    }
    children() {
        return this._children;
    }
    childWasDetached(_widget) {
    }
    isShowing() {
        return this._isShowing;
    }
    shouldHideOnDetach() {
        if (!this.element.parentElement) {
            return false;
        }
        if (this._hideOnDetach) {
            return true;
        }
        for (const child of this._children) {
            if (child.shouldHideOnDetach()) {
                return true;
            }
        }
        return false;
    }
    setHideOnDetach() {
        this._hideOnDetach = true;
    }
    _inNotification() {
        return Boolean(this._notificationDepth) || Boolean(this._parentWidget && this._parentWidget._inNotification());
    }
    _parentIsShowing() {
        if (this._isRoot) {
            return true;
        }
        return this._parentWidget !== null && this._parentWidget.isShowing();
    }
    _callOnVisibleChildren(method) {
        const copy = this._children.slice();
        for (let i = 0; i < copy.length; ++i) {
            if (copy[i]._parentWidget === this && copy[i]._visible) {
                method.call(copy[i]);
            }
        }
    }
    _processWillShow() {
        this._callOnVisibleChildren(this._processWillShow);
        this._isShowing = true;
    }
    _processWasShown() {
        if (this._inNotification()) {
            return;
        }
        this.restoreScrollPositions();
        this._notify(this.wasShown);
        this._callOnVisibleChildren(this._processWasShown);
    }
    _processWillHide() {
        if (this._inNotification()) {
            return;
        }
        this.storeScrollPositions();
        this._callOnVisibleChildren(this._processWillHide);
        this._notify(this.willHide);
        this._isShowing = false;
    }
    _processWasHidden() {
        this._callOnVisibleChildren(this._processWasHidden);
    }
    _processOnResize() {
        if (this._inNotification()) {
            return;
        }
        if (!this.isShowing()) {
            return;
        }
        this._notify(this.onResize);
        this._callOnVisibleChildren(this._processOnResize);
    }
    _notify(notification) {
        ++this._notificationDepth;
        try {
            notification.call(this);
        }
        finally {
            --this._notificationDepth;
        }
    }
    wasShown() {
    }
    willHide() {
    }
    onResize() {
    }
    onLayout() {
    }
    async ownerViewDisposed() {
    }
    show(parentElement, insertBefore) {
        Widget.__assert(parentElement, 'Attempt to attach widget with no parent element');
        if (!this._isRoot) {
            // Update widget hierarchy.
            let currentParent = parentElement;
            while (currentParent && !currentParent.__widget) {
                currentParent = parentWidgetElementOrShadowHost(currentParent);
            }
            if (!currentParent || !currentParent.__widget) {
                throw new Error('Attempt to attach widget to orphan node');
            }
            this._attach(currentParent.__widget);
        }
        this._showWidget(parentElement, insertBefore);
    }
    _attach(parentWidget) {
        if (parentWidget === this._parentWidget) {
            return;
        }
        if (this._parentWidget) {
            this.detach();
        }
        /** @type {?Widget} */
        this._parentWidget = parentWidget;
        this._parentWidget._children.push(this);
        this._isRoot = false;
    }
    showWidget() {
        if (this._visible) {
            return;
        }
        if (!this.element.parentElement) {
            throw new Error('Attempt to show widget that is not hidden using hideWidget().');
        }
        this._showWidget(this.element.parentElement, this.element.nextSibling);
    }
    _showWidget(parentElement, insertBefore) {
        let currentParent = parentElement;
        while (currentParent && !currentParent.__widget) {
            currentParent = parentWidgetElementOrShadowHost(currentParent);
        }
        if (this._isRoot) {
            Widget.__assert(!currentParent, 'Attempt to show root widget under another widget');
        }
        else {
            Widget.__assert(currentParent && currentParent.__widget === this._parentWidget, 'Attempt to show under node belonging to alien widget');
        }
        const wasVisible = this._visible;
        if (wasVisible && this.element.parentElement === parentElement) {
            return;
        }
        this._visible = true;
        if (!wasVisible && this._parentIsShowing()) {
            this._processWillShow();
        }
        this.element.classList.remove('hidden');
        // Reparent
        if (this.element.parentElement !== parentElement) {
            if (!this._externallyManaged) {
                Widget._incrementWidgetCounter(parentElement, this.element);
            }
            if (insertBefore) {
                DOMExtension.DOMExtension.originalInsertBefore.call(parentElement, this.element, insertBefore);
            }
            else {
                DOMExtension.DOMExtension.originalAppendChild.call(parentElement, this.element);
            }
        }
        if (!wasVisible && this._parentIsShowing()) {
            this._processWasShown();
        }
        if (this._parentWidget && this._hasNonZeroConstraints()) {
            this._parentWidget.invalidateConstraints();
        }
        else {
            this._processOnResize();
        }
    }
    hideWidget() {
        if (!this._visible) {
            return;
        }
        this._hideWidget(false);
    }
    _hideWidget(removeFromDOM) {
        this._visible = false;
        const parentElement = this.element.parentElement;
        if (this._parentIsShowing()) {
            this._processWillHide();
        }
        if (removeFromDOM) {
            // Force legal removal
            Widget._decrementWidgetCounter(parentElement, this.element);
            DOMExtension.DOMExtension.originalRemoveChild.call(parentElement, this.element);
        }
        else {
            this.element.classList.add('hidden');
        }
        if (this._parentIsShowing()) {
            this._processWasHidden();
        }
        if (this._parentWidget && this._hasNonZeroConstraints()) {
            this._parentWidget.invalidateConstraints();
        }
    }
    detach(overrideHideOnDetach) {
        if (!this._parentWidget && !this._isRoot) {
            return;
        }
        // hideOnDetach means that we should never remove element from dom - content
        // has iframes and detaching it will hurt.
        //
        // overrideHideOnDetach will override hideOnDetach and the client takes
        // responsibility for the consequences.
        const removeFromDOM = overrideHideOnDetach || !this.shouldHideOnDetach();
        if (this._visible) {
            this._hideWidget(removeFromDOM);
        }
        else if (removeFromDOM && this.element.parentElement) {
            const parentElement = this.element.parentElement;
            // Force kick out from DOM.
            Widget._decrementWidgetCounter(parentElement, this.element);
            DOMExtension.DOMExtension.originalRemoveChild.call(parentElement, this.element);
        }
        // Update widget hierarchy.
        if (this._parentWidget) {
            const childIndex = this._parentWidget._children.indexOf(this);
            Widget.__assert(childIndex >= 0, 'Attempt to remove non-child widget');
            this._parentWidget._children.splice(childIndex, 1);
            if (this._parentWidget._defaultFocusedChild === this) {
                this._parentWidget._defaultFocusedChild = null;
            }
            this._parentWidget.childWasDetached(this);
            this._parentWidget = null;
        }
        else {
            Widget.__assert(this._isRoot, 'Removing non-root widget from DOM');
        }
    }
    detachChildWidgets() {
        const children = this._children.slice();
        for (let i = 0; i < children.length; ++i) {
            children[i].detach();
        }
    }
    elementsToRestoreScrollPositionsFor() {
        return [this.element];
    }
    storeScrollPositions() {
        const elements = this.elementsToRestoreScrollPositionsFor();
        for (const container of elements) {
            storedScrollPositions.set(container, { scrollLeft: container.scrollLeft, scrollTop: container.scrollTop });
        }
    }
    restoreScrollPositions() {
        const elements = this.elementsToRestoreScrollPositionsFor();
        for (const container of elements) {
            const storedPositions = storedScrollPositions.get(container);
            if (storedPositions) {
                container.scrollLeft = storedPositions.scrollLeft;
                container.scrollTop = storedPositions.scrollTop;
            }
        }
    }
    doResize() {
        if (!this.isShowing()) {
            return;
        }
        // No matter what notification we are in, dispatching onResize is not needed.
        if (!this._inNotification()) {
            this._callOnVisibleChildren(this._processOnResize);
        }
    }
    doLayout() {
        if (!this.isShowing()) {
            return;
        }
        this._notify(this.onLayout);
        this.doResize();
    }
    registerRequiredCSS(cssFile, options) {
        if (this._isWebComponent) {
            appendStyle(this._shadowRoot, cssFile, options);
        }
        else {
            appendStyle(this.element, cssFile, options);
        }
    }
    printWidgetHierarchy() {
        const lines = [];
        this._collectWidgetHierarchy('', lines);
        console.log(lines.join('\n')); // eslint-disable-line no-console
    }
    _collectWidgetHierarchy(prefix, lines) {
        lines.push(prefix + '[' + this.element.className + ']' + (this._children.length ? ' {' : ''));
        for (let i = 0; i < this._children.length; ++i) {
            this._children[i]._collectWidgetHierarchy(prefix + '    ', lines);
        }
        if (this._children.length) {
            lines.push(prefix + '}');
        }
    }
    setDefaultFocusedElement(element) {
        this._defaultFocusedElement = element;
    }
    setDefaultFocusedChild(child) {
        Widget.__assert(child._parentWidget === this, 'Attempt to set non-child widget as default focused.');
        this._defaultFocusedChild = child;
    }
    focus() {
        if (!this.isShowing()) {
            return;
        }
        const element = this._defaultFocusedElement;
        if (element) {
            if (!element.hasFocus()) {
                element.focus();
            }
            return;
        }
        if (this._defaultFocusedChild && this._defaultFocusedChild._visible) {
            this._defaultFocusedChild.focus();
        }
        else {
            for (const child of this._children) {
                if (child._visible) {
                    child.focus();
                    return;
                }
            }
            let child = this.contentElement.traverseNextNode(this.contentElement);
            while (child) {
                if (child instanceof XWidget) {
                    child.focus();
                    return;
                }
                child = child.traverseNextNode(this.contentElement);
            }
        }
    }
    hasFocus() {
        return this.element.hasFocus();
    }
    calculateConstraints() {
        return new Constraints();
    }
    constraints() {
        if (typeof this._constraints !== 'undefined') {
            return this._constraints;
        }
        if (typeof this._cachedConstraints === 'undefined') {
            this._cachedConstraints = this.calculateConstraints();
        }
        return this._cachedConstraints;
    }
    setMinimumAndPreferredSizes(width, height, preferredWidth, preferredHeight) {
        this._constraints = new Constraints(new Size(width, height), new Size(preferredWidth, preferredHeight));
        this.invalidateConstraints();
    }
    setMinimumSize(width, height) {
        this._constraints = new Constraints(new Size(width, height));
        this.invalidateConstraints();
    }
    _hasNonZeroConstraints() {
        const constraints = this.constraints();
        return Boolean(constraints.minimum.width || constraints.minimum.height || constraints.preferred.width ||
            constraints.preferred.height);
    }
    suspendInvalidations() {
        ++this._invalidationsSuspended;
    }
    resumeInvalidations() {
        --this._invalidationsSuspended;
        if (!this._invalidationsSuspended && this._invalidationsRequested) {
            this.invalidateConstraints();
        }
    }
    invalidateConstraints() {
        if (this._invalidationsSuspended) {
            this._invalidationsRequested = true;
            return;
        }
        this._invalidationsRequested = false;
        const cached = this._cachedConstraints;
        delete this._cachedConstraints;
        const actual = this.constraints();
        if (!actual.isEqual(cached || null) && this._parentWidget) {
            this._parentWidget.invalidateConstraints();
        }
        else {
            this.doLayout();
        }
    }
    // Excludes the widget from being tracked by its parents/ancestors via
    // __widgetCounter because the widget is being handled by external code.
    // Widgets marked as being externally managed are responsible for
    // finishing out their own lifecycle (i.e. calling detach() before being
    // removed from the DOM). This is e.g. used for CodeMirror.
    //
    // Also note that this must be called before the widget is shown so that
    // so that its ancestor's __widgetCounter is not incremented.
    markAsExternallyManaged() {
        Widget.__assert(!this._parentWidget, 'Attempt to mark widget as externally managed after insertion to the DOM');
        this._externallyManaged = true;
    }
}
const storedScrollPositions = new WeakMap();
export class VBox extends Widget {
    constructor(isWebComponent, delegatesFocus) {
        super(isWebComponent, delegatesFocus);
        this.contentElement.classList.add('vbox');
    }
    calculateConstraints() {
        let constraints = new Constraints();
        function updateForChild() {
            const child = this.constraints();
            constraints = constraints.widthToMax(child);
            constraints = constraints.addHeight(child);
        }
        this._callOnVisibleChildren(updateForChild);
        return constraints;
    }
}
export class HBox extends Widget {
    constructor(isWebComponent) {
        super(isWebComponent);
        this.contentElement.classList.add('hbox');
    }
    calculateConstraints() {
        let constraints = new Constraints();
        function updateForChild() {
            const child = this.constraints();
            constraints = constraints.addWidth(child);
            constraints = constraints.heightToMax(child);
        }
        this._callOnVisibleChildren(updateForChild);
        return constraints;
    }
}
export class VBoxWithResizeCallback extends VBox {
    _resizeCallback;
    constructor(resizeCallback) {
        super();
        this._resizeCallback = resizeCallback;
    }
    onResize() {
        this._resizeCallback();
    }
}
export class WidgetFocusRestorer {
    _widget;
    _previous;
    constructor(widget) {
        this._widget = widget;
        this._previous = widget.element.ownerDocument.deepActiveElement();
        widget.focus();
    }
    restore() {
        if (!this._widget) {
            return;
        }
        if (this._widget.hasFocus() && this._previous) {
            this._previous.focus();
        }
        this._previous = null;
        this._widget = null;
    }
}
function parentWidgetElementOrShadowHost(element) {
    return element.parentElementOrShadowHost();
}
//# sourceMappingURL=Widget.js.map