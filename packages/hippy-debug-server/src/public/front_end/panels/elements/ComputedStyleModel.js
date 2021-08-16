// Copyright (c) 2015 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
export class ComputedStyleModel extends Common.ObjectWrapper.ObjectWrapper {
    _node;
    _cssModel;
    _eventListeners;
    _frameResizedTimer;
    _computedStylePromise;
    constructor() {
        super();
        this._node = UI.Context.Context.instance().flavor(SDK.DOMModel.DOMNode);
        this._cssModel = null;
        this._eventListeners = [];
        UI.Context.Context.instance().addFlavorChangeListener(SDK.DOMModel.DOMNode, this._onNodeChanged, this);
    }
    node() {
        return this._node;
    }
    cssModel() {
        return this._cssModel && this._cssModel.isEnabled() ? this._cssModel : null;
    }
    _onNodeChanged(event) {
        this._node = event.data;
        this._updateModel(this._node ? this._node.domModel().cssModel() : null);
        this._onComputedStyleChanged(null);
    }
    _updateModel(cssModel) {
        if (this._cssModel === cssModel) {
            return;
        }
        Common.EventTarget.EventTarget.removeEventListeners(this._eventListeners);
        this._cssModel = cssModel;
        const domModel = cssModel ? cssModel.domModel() : null;
        const resourceTreeModel = cssModel ? cssModel.target().model(SDK.ResourceTreeModel.ResourceTreeModel) : null;
        if (cssModel && domModel && resourceTreeModel) {
            this._eventListeners = [
                cssModel.addEventListener(SDK.CSSModel.Events.StyleSheetAdded, this._onComputedStyleChanged, this),
                cssModel.addEventListener(SDK.CSSModel.Events.StyleSheetRemoved, this._onComputedStyleChanged, this),
                cssModel.addEventListener(SDK.CSSModel.Events.StyleSheetChanged, this._onComputedStyleChanged, this),
                cssModel.addEventListener(SDK.CSSModel.Events.FontsUpdated, this._onComputedStyleChanged, this),
                cssModel.addEventListener(SDK.CSSModel.Events.MediaQueryResultChanged, this._onComputedStyleChanged, this),
                cssModel.addEventListener(SDK.CSSModel.Events.PseudoStateForced, this._onComputedStyleChanged, this),
                cssModel.addEventListener(SDK.CSSModel.Events.ModelWasEnabled, this._onComputedStyleChanged, this),
                domModel.addEventListener(SDK.DOMModel.Events.DOMMutated, this._onDOMModelChanged, this),
                resourceTreeModel.addEventListener(SDK.ResourceTreeModel.Events.FrameResized, this._onFrameResized, this),
            ];
        }
    }
    _onComputedStyleChanged(event) {
        delete this._computedStylePromise;
        this.dispatchEventToListeners("ComputedStyleChanged" /* ComputedStyleChanged */, event ? event.data : null);
    }
    _onDOMModelChanged(event) {
        // Any attribute removal or modification can affect the styles of "related" nodes.
        const node = event.data;
        if (!this._node ||
            this._node !== node && node.parentNode !== this._node.parentNode && !node.isAncestor(this._node)) {
            return;
        }
        this._onComputedStyleChanged(null);
    }
    _onFrameResized(_event) {
        function refreshContents() {
            this._onComputedStyleChanged(null);
            delete this._frameResizedTimer;
        }
        if (this._frameResizedTimer) {
            clearTimeout(this._frameResizedTimer);
        }
        this._frameResizedTimer = setTimeout(refreshContents.bind(this), 100);
    }
    _elementNode() {
        const node = this.node();
        if (!node) {
            return null;
        }
        return node.enclosingElementOrSelf();
    }
    async fetchComputedStyle() {
        const elementNode = this._elementNode();
        const cssModel = this.cssModel();
        if (!elementNode || !cssModel) {
            return /** @type {?ComputedStyle} */ null;
        }
        const nodeId = elementNode.id;
        if (!nodeId) {
            return /** @type {?ComputedStyle} */ null;
        }
        if (!this._computedStylePromise) {
            this._computedStylePromise = cssModel.computedStylePromise(nodeId).then(verifyOutdated.bind(this, elementNode));
        }
        return this._computedStylePromise;
        function verifyOutdated(elementNode, style) {
            return elementNode === this._elementNode() && style ? new ComputedStyle(elementNode, style) :
                null;
        }
    }
}
export class ComputedStyle {
    node;
    computedStyle;
    constructor(node, computedStyle) {
        this.node = node;
        this.computedStyle = computedStyle;
    }
}
//# sourceMappingURL=ComputedStyleModel.js.map