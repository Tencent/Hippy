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
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as Host from '../../core/host/host.js';
import * as i18n from '../../core/i18n/i18n.js';
import { ToolbarButton } from './Toolbar.js'; // eslint-disable-line no-unused-vars
const UIStrings = {
    /**
    *@description Text to close something
    */
    close: 'Close',
    /**
    *@description Text to dock the DevTools to the right of the browser tab
    */
    dockToRight: 'Dock to right',
    /**
    *@description Text to dock the DevTools to the bottom of the browser tab
    */
    dockToBottom: 'Dock to bottom',
    /**
    *@description Text to dock the DevTools to the left of the browser tab
    */
    dockToLeft: 'Dock to left',
    /**
    *@description Text to undock the DevTools
    */
    undockIntoSeparateWindow: 'Undock into separate window',
};
const str_ = i18n.i18n.registerUIStrings('ui/legacy/DockController.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
let dockControllerInstance;
export class DockController extends Common.ObjectWrapper.ObjectWrapper {
    _canDock;
    _closeButton;
    _currentDockStateSetting;
    _lastDockStateSetting;
    _dockSide;
    _titles;
    _savedFocus;
    constructor(canDock) {
        super();
        this._canDock = canDock;
        this._closeButton = new ToolbarButton(i18nString(UIStrings.close), 'largeicon-delete');
        this._closeButton.element.classList.add('close-devtools');
        this._closeButton.addEventListener(ToolbarButton.Events.Click, Host.InspectorFrontendHost.InspectorFrontendHostInstance.closeWindow.bind(Host.InspectorFrontendHost.InspectorFrontendHostInstance));
        this._currentDockStateSetting = Common.Settings.Settings.instance().moduleSetting('currentDockState');
        this._lastDockStateSetting = Common.Settings.Settings.instance().createSetting('lastDockState', 'bottom');
        if (!canDock) {
            this._dockSide = State.Undocked;
            this._closeButton.setVisible(false);
            return;
        }
        this._currentDockStateSetting.addChangeListener(this._dockSideChanged, this);
        if (states.indexOf(this._currentDockStateSetting.get()) === -1) {
            this._currentDockStateSetting.set('right');
        }
        if (states.indexOf(this._lastDockStateSetting.get()) === -1) {
            this._currentDockStateSetting.set('bottom');
        }
    }
    static instance(opts = { forceNew: null, canDock: false }) {
        const { forceNew, canDock } = opts;
        if (!dockControllerInstance || forceNew) {
            dockControllerInstance = new DockController(canDock);
        }
        return dockControllerInstance;
    }
    initialize() {
        if (!this._canDock) {
            return;
        }
        this._titles = [
            i18nString(UIStrings.dockToRight),
            i18nString(UIStrings.dockToBottom),
            i18nString(UIStrings.dockToLeft),
            i18nString(UIStrings.undockIntoSeparateWindow),
        ];
        this._dockSideChanged();
    }
    _dockSideChanged() {
        this.setDockSide(this._currentDockStateSetting.get());
    }
    dockSide() {
        return this._dockSide;
    }
    canDock() {
        return this._canDock;
    }
    isVertical() {
        return this._dockSide === State.DockedToRight || this._dockSide === State.DockedToLeft;
    }
    setDockSide(dockSide) {
        if (states.indexOf(dockSide) === -1) {
            dockSide = states[0];
        }
        if (this._dockSide === dockSide) {
            return;
        }
        document.body.classList.remove(this._dockSide);
        document.body.classList.add(dockSide);
        if (this._dockSide) {
            this._lastDockStateSetting.set(this._dockSide);
        }
        this._savedFocus = document.deepActiveElement();
        const eventData = { from: this._dockSide, to: dockSide };
        this.dispatchEventToListeners("BeforeDockSideChanged" /* BeforeDockSideChanged */, eventData);
        console.timeStamp('DockController.setIsDocked');
        this._dockSide = dockSide;
        this._currentDockStateSetting.set(dockSide);
        Host.InspectorFrontendHost.InspectorFrontendHostInstance.setIsDocked(dockSide !== State.Undocked, this._setIsDockedResponse.bind(this, eventData));
        this._closeButton.setVisible(this._dockSide !== State.Undocked);
        this.dispatchEventToListeners("DockSideChanged" /* DockSideChanged */, eventData);
    }
    _setIsDockedResponse(eventData) {
        this.dispatchEventToListeners("AfterDockSideChanged" /* AfterDockSideChanged */, eventData);
        if (this._savedFocus) {
            this._savedFocus.focus();
            this._savedFocus = null;
        }
    }
    _toggleDockSide() {
        if (this._lastDockStateSetting.get() === this._currentDockStateSetting.get()) {
            const index = states.indexOf(this._currentDockStateSetting.get()) || 0;
            this._lastDockStateSetting.set(states[(index + 1) % states.length]);
        }
        this.setDockSide(this._lastDockStateSetting.get());
    }
}
export const State = {
    DockedToBottom: 'bottom',
    DockedToRight: 'right',
    DockedToLeft: 'left',
    Undocked: 'undocked',
};
const states = [State.DockedToRight, State.DockedToBottom, State.DockedToLeft, State.Undocked];
let toggleDockActionDelegateInstance;
export class ToggleDockActionDelegate {
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!toggleDockActionDelegateInstance || forceNew) {
            toggleDockActionDelegateInstance = new ToggleDockActionDelegate();
        }
        return toggleDockActionDelegateInstance;
    }
    handleAction(_context, _actionId) {
        DockController.instance()._toggleDockSide();
        return true;
    }
}
let closeButtonProviderInstance;
export class CloseButtonProvider {
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!closeButtonProviderInstance || forceNew) {
            closeButtonProviderInstance = new CloseButtonProvider();
        }
        return closeButtonProviderInstance;
    }
    item() {
        return DockController.instance()._closeButton;
    }
}
//# sourceMappingURL=DockController.js.map