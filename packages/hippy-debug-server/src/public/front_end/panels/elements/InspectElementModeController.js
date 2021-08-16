/*
 * Copyright (C) 2013 Google Inc. All rights reserved.
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
import * as Root from '../../core/root/root.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
import { ElementsPanel } from './ElementsPanel.js';
let inspectElementModeController;
export class InspectElementModeController {
    _toggleSearchAction;
    _mode;
    _showDetailedInspectTooltipSetting;
    constructor() {
        this._toggleSearchAction = UI.ActionRegistry.ActionRegistry.instance().action('elements.toggle-element-search');
        this._mode = "none" /* None */;
        SDK.TargetManager.TargetManager.instance().addEventListener(SDK.TargetManager.Events.SuspendStateChanged, this._suspendStateChanged, this);
        SDK.TargetManager.TargetManager.instance().addModelListener(SDK.OverlayModel.OverlayModel, SDK.OverlayModel.Events.ExitedInspectMode, () => this._setMode("none" /* None */));
        SDK.OverlayModel.OverlayModel.setInspectNodeHandler(this._inspectNode.bind(this));
        SDK.TargetManager.TargetManager.instance().observeModels(SDK.OverlayModel.OverlayModel, this);
        this._showDetailedInspectTooltipSetting =
            Common.Settings.Settings.instance().moduleSetting('showDetailedInspectTooltip');
        this._showDetailedInspectTooltipSetting.addChangeListener(this._showDetailedInspectTooltipChanged.bind(this));
        document.addEventListener('keydown', event => {
            if (event.keyCode !== UI.KeyboardShortcut.Keys.Esc.code) {
                return;
            }
            if (!this._isInInspectElementMode()) {
                return;
            }
            this._setMode("none" /* None */);
            event.consume(true);
        }, true);
    }
    static instance({ forceNew } = { forceNew: false }) {
        if (!inspectElementModeController || forceNew) {
            inspectElementModeController = new InspectElementModeController();
        }
        return inspectElementModeController;
    }
    modelAdded(overlayModel) {
        // When DevTools are opening in the inspect element mode, the first target comes in
        // much later than the InspectorFrontendAPI.enterInspectElementMode event.
        if (this._mode === "none" /* None */) {
            return;
        }
        overlayModel.setInspectMode(this._mode, this._showDetailedInspectTooltipSetting.get());
    }
    modelRemoved(_overlayModel) {
    }
    _isInInspectElementMode() {
        return this._mode !== "none" /* None */;
    }
    _toggleInspectMode() {
        let mode;
        if (this._isInInspectElementMode()) {
            mode = "none" /* None */;
        }
        else {
            mode = Common.Settings.Settings.instance().moduleSetting('showUAShadowDOM').get() ?
                "searchForUAShadowDOM" /* SearchForUAShadowDOM */ :
                "searchForNode" /* SearchForNode */;
        }
        this._setMode(mode);
    }
    _captureScreenshotMode() {
        this._setMode("captureAreaScreenshot" /* CaptureAreaScreenshot */);
    }
    _setMode(mode) {
        if (SDK.TargetManager.TargetManager.instance().allTargetsSuspended()) {
            return;
        }
        this._mode = mode;
        for (const overlayModel of SDK.TargetManager.TargetManager.instance().models(SDK.OverlayModel.OverlayModel)) {
            overlayModel.setInspectMode(mode, this._showDetailedInspectTooltipSetting.get());
        }
        if (this._toggleSearchAction) {
            this._toggleSearchAction.setToggled(this._isInInspectElementMode());
        }
    }
    _suspendStateChanged() {
        if (!SDK.TargetManager.TargetManager.instance().allTargetsSuspended()) {
            return;
        }
        this._mode = "none" /* None */;
        if (this._toggleSearchAction) {
            this._toggleSearchAction.setToggled(false);
        }
    }
    _inspectNode(node) {
        ElementsPanel.instance().revealAndSelectNode(node, true, true);
    }
    _showDetailedInspectTooltipChanged() {
        this._setMode(this._mode);
    }
}
let toggleSearchActionDelegateInstance;
export class ToggleSearchActionDelegate {
    handleAction(context, actionId) {
        if (Root.Runtime.Runtime.queryParam('isSharedWorker')) {
            return false;
        }
        inspectElementModeController = InspectElementModeController.instance();
        if (!inspectElementModeController) {
            return false;
        }
        if (actionId === 'elements.toggle-element-search') {
            inspectElementModeController._toggleInspectMode();
        }
        else if (actionId === 'elements.capture-area-screenshot') {
            inspectElementModeController._captureScreenshotMode();
        }
        return true;
    }
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!toggleSearchActionDelegateInstance || forceNew) {
            toggleSearchActionDelegateInstance = new ToggleSearchActionDelegate();
        }
        return toggleSearchActionDelegateInstance;
    }
}
//# sourceMappingURL=InspectElementModeController.js.map