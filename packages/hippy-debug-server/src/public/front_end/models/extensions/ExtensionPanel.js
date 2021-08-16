/*
 * Copyright (C) 2012 Google Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
import * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
import { ExtensionNotifierView, ExtensionView } from './ExtensionView.js';
export class ExtensionPanel extends UI.Panel.Panel {
    _server;
    _id;
    _panelToolbar;
    _searchableView;
    constructor(server, panelName, id, pageURL) {
        super(panelName);
        this._server = server;
        this._id = id;
        this.setHideOnDetach();
        this._panelToolbar = new UI.Toolbar.Toolbar('hidden', this.element);
        this._searchableView = new UI.SearchableView.SearchableView(this, null);
        this._searchableView.show(this.element);
        const extensionView = new ExtensionView(server, this._id, pageURL, 'extension');
        extensionView.show(this._searchableView.element);
    }
    addToolbarItem(item) {
        this._panelToolbar.element.classList.remove('hidden');
        this._panelToolbar.appendToolbarItem(item);
    }
    searchCanceled() {
        // @ts-expect-error TODO(crbug.com/1011811): Fix after extensionAPI is migrated.
        this._server.notifySearchAction(this._id, Extensions.extensionAPI.panels.SearchAction.CancelSearch);
        this._searchableView.updateSearchMatchesCount(0);
    }
    searchableView() {
        return this._searchableView;
    }
    performSearch(searchConfig, _shouldJump, _jumpBackwards) {
        const query = searchConfig.query;
        // @ts-expect-error TODO(crbug.com/1011811): Fix after extensionAPI is migrated.
        this._server.notifySearchAction(this._id, Extensions.extensionAPI.panels.SearchAction.PerformSearch, query);
    }
    jumpToNextSearchResult() {
        // @ts-expect-error TODO(crbug.com/1011811): Fix after extensionAPI is migrated.
        this._server.notifySearchAction(this._id, Extensions.extensionAPI.panels.SearchAction.NextSearchResult);
    }
    jumpToPreviousSearchResult() {
        // @ts-expect-error TODO(crbug.com/1011811): Fix after extensionAPI is migrated.
        this._server.notifySearchAction(this._id, Extensions.extensionAPI.panels.SearchAction.PreviousSearchResult);
    }
    supportsCaseSensitiveSearch() {
        return false;
    }
    supportsRegexSearch() {
        return false;
    }
}
export class ExtensionButton {
    _id;
    _toolbarButton;
    constructor(server, id, iconURL, tooltip, disabled) {
        this._id = id;
        this._toolbarButton = new UI.Toolbar.ToolbarButton('', '');
        this._toolbarButton.addEventListener(UI.Toolbar.ToolbarButton.Events.Click, server.notifyButtonClicked.bind(server, this._id));
        this.update(iconURL, tooltip, disabled);
    }
    update(iconURL, tooltip, disabled) {
        if (typeof iconURL === 'string') {
            this._toolbarButton.setBackgroundImage(iconURL);
        }
        if (typeof tooltip === 'string') {
            this._toolbarButton.setTitle(tooltip);
        }
        if (typeof disabled === 'boolean') {
            this._toolbarButton.setEnabled(!disabled);
        }
    }
    toolbarButton() {
        return this._toolbarButton;
    }
}
export class ExtensionSidebarPane extends UI.View.SimpleView {
    _panelName;
    _server;
    _id;
    _extensionView;
    _objectPropertiesView;
    constructor(server, panelName, title, id) {
        super(title);
        this.element.classList.add('fill');
        this._panelName = panelName;
        this._server = server;
        this._id = id;
    }
    id() {
        return this._id;
    }
    panelName() {
        return this._panelName;
    }
    setObject(object, title, callback) {
        this._createObjectPropertiesView();
        this._setObject(SDK.RemoteObject.RemoteObject.fromLocalObject(object), title, callback);
    }
    setExpression(expression, title, evaluateOptions, securityOrigin, callback) {
        this._createObjectPropertiesView();
        this._server.evaluate(expression, true, false, evaluateOptions, securityOrigin, this._onEvaluate.bind(this, title, callback));
    }
    setPage(url) {
        if (this._objectPropertiesView) {
            this._objectPropertiesView.detach();
            delete this._objectPropertiesView;
        }
        if (this._extensionView) {
            this._extensionView.detach(true);
        }
        this._extensionView = new ExtensionView(this._server, this._id, url, 'extension fill');
        this._extensionView.show(this.element);
        if (!this.element.style.height) {
            this.setHeight('150px');
        }
    }
    setHeight(height) {
        this.element.style.height = height;
    }
    _onEvaluate(title, callback, error, result, _wasThrown) {
        if (error) {
            callback(error.toString());
        }
        else if (!result) {
            callback();
        }
        else {
            this._setObject(result, title, callback);
        }
    }
    _createObjectPropertiesView() {
        if (this._objectPropertiesView) {
            return;
        }
        if (this._extensionView) {
            this._extensionView.detach(true);
            delete this._extensionView;
        }
        this._objectPropertiesView = new ExtensionNotifierView(this._server, this._id);
        this._objectPropertiesView.show(this.element);
    }
    _setObject(object, title, callback) {
        const objectPropertiesView = this._objectPropertiesView;
        // This may only happen if setPage() was called while we were evaluating the expression.
        if (!objectPropertiesView) {
            callback('operation cancelled');
            return;
        }
        objectPropertiesView.element.removeChildren();
        UI.UIUtils.Renderer.render(object, { title, editable: false }).then(result => {
            if (!result) {
                callback();
                return;
            }
            const firstChild = result.tree && result.tree.firstChild();
            if (firstChild) {
                firstChild.expand();
            }
            objectPropertiesView.element.appendChild(result.node);
            callback();
        });
    }
}
//# sourceMappingURL=ExtensionPanel.js.map