// Copyright 2015 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as EventListeners from '../event_listeners/event_listeners.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
const UIStrings = {
    /**
    *@description Label for a button in the sources panel that refreshes the list of global event listeners.
    */
    refreshGlobalListeners: 'Refresh global listeners',
};
const str_ = i18n.i18n.registerUIStrings('panels/browser_debugger/ObjectEventListenersSidebarPane.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
let objectEventListenersSidebarPaneInstance;
export class ObjectEventListenersSidebarPane extends UI.Widget.VBox {
    _refreshButton;
    _eventListenersView;
    _lastRequestedContext;
    constructor() {
        super();
        this._refreshButton =
            new UI.Toolbar.ToolbarButton(i18nString(UIStrings.refreshGlobalListeners), 'largeicon-refresh');
        this._refreshButton.addEventListener(UI.Toolbar.ToolbarButton.Events.Click, this._refreshClick, this);
        this._refreshButton.setEnabled(false);
        this._eventListenersView = new EventListeners.EventListenersView.EventListenersView(this.update.bind(this), /* enableDefaultTreeFocus */ true);
        this._eventListenersView.show(this.element);
        this.setDefaultFocusedChild(this._eventListenersView);
    }
    static instance() {
        if (!objectEventListenersSidebarPaneInstance) {
            objectEventListenersSidebarPaneInstance = new ObjectEventListenersSidebarPane();
        }
        return objectEventListenersSidebarPaneInstance;
    }
    toolbarItems() {
        return [this._refreshButton];
    }
    update() {
        if (this._lastRequestedContext) {
            this._lastRequestedContext.runtimeModel.releaseObjectGroup(objectGroupName);
            delete this._lastRequestedContext;
        }
        const executionContext = UI.Context.Context.instance().flavor(SDK.RuntimeModel.ExecutionContext);
        if (!executionContext) {
            this._eventListenersView.reset();
            this._eventListenersView.addEmptyHolderIfNeeded();
            return;
        }
        this._lastRequestedContext = executionContext;
        Promise.all([this._windowObjectInContext(executionContext)])
            .then(this._eventListenersView.addObjects.bind(this._eventListenersView));
    }
    wasShown() {
        super.wasShown();
        UI.Context.Context.instance().addFlavorChangeListener(SDK.RuntimeModel.ExecutionContext, this.update, this);
        this._refreshButton.setEnabled(true);
        this.update();
    }
    willHide() {
        super.willHide();
        UI.Context.Context.instance().removeFlavorChangeListener(SDK.RuntimeModel.ExecutionContext, this.update, this);
        this._refreshButton.setEnabled(false);
    }
    _windowObjectInContext(executionContext) {
        return executionContext
            .evaluate({
            expression: 'self',
            objectGroup: objectGroupName,
            includeCommandLineAPI: false,
            silent: true,
            returnByValue: false,
            generatePreview: false,
            timeout: undefined,
            throwOnSideEffect: undefined,
            disableBreaks: undefined,
            replMode: undefined,
            allowUnsafeEvalBlockedByCSP: undefined,
        }, 
        /* userGesture */ false, 
        /* awaitPromise */ false)
            .then(result => {
            if ('error' in result || result.exceptionDetails) {
                return null;
            }
            return result.object;
        });
    }
    _refreshClick(event) {
        event.data.consume();
        this.update();
    }
}
export const objectGroupName = 'object-event-listeners-sidebar-pane';
//# sourceMappingURL=ObjectEventListenersSidebarPane.js.map