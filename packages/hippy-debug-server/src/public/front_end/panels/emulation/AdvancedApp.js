// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js'; // eslint-disable-line no-unused-vars
import * as Host from '../../core/host/host.js';
import * as UI from '../../ui/legacy/legacy.js';
import { DeviceModeWrapper } from './DeviceModeWrapper.js';
import { InspectedPagePlaceholder } from './InspectedPagePlaceholder.js'; // eslint-disable-line no-unused-vars
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
// eslint-disable-next-line @typescript-eslint/naming-convention
let _appInstance;
export class AdvancedApp {
    _rootSplitWidget;
    _deviceModeView;
    _inspectedPagePlaceholder;
    _toolboxWindow;
    _toolboxRootView;
    _changingDockSide;
    constructor() {
        UI.DockController.DockController.instance().addEventListener("BeforeDockSideChanged" /* BeforeDockSideChanged */, this._openToolboxWindow, this);
    }
    /**
     * Note: it's used by toolbox.ts without real type checks.
     */
    static _instance() {
        if (!_appInstance) {
            _appInstance = new AdvancedApp();
        }
        return _appInstance;
    }
    presentUI(document) {
        const rootView = new UI.RootView.RootView();
        this._rootSplitWidget = new UI.SplitWidget.SplitWidget(false, true, 'InspectorView.splitViewState', 555, 300, true);
        this._rootSplitWidget.show(rootView.element);
        this._rootSplitWidget.setSidebarWidget(UI.InspectorView.InspectorView.instance());
        this._rootSplitWidget.setDefaultFocusedChild(UI.InspectorView.InspectorView.instance());
        UI.InspectorView.InspectorView.instance().setOwnerSplit(this._rootSplitWidget);
        this._inspectedPagePlaceholder = InspectedPagePlaceholder.instance();
        this._inspectedPagePlaceholder.addEventListener("Update" /* Update */, this._onSetInspectedPageBounds.bind(this), this);
        this._deviceModeView =
            DeviceModeWrapper.instance({ inspectedPagePlaceholder: this._inspectedPagePlaceholder, forceNew: false });
        UI.DockController.DockController.instance().addEventListener("BeforeDockSideChanged" /* BeforeDockSideChanged */, this._onBeforeDockSideChange, this);
        UI.DockController.DockController.instance().addEventListener("DockSideChanged" /* DockSideChanged */, this._onDockSideChange, this);
        UI.DockController.DockController.instance().addEventListener("AfterDockSideChanged" /* AfterDockSideChanged */, this._onAfterDockSideChange, this);
        this._onDockSideChange();
        console.timeStamp('AdvancedApp.attachToBody');
        rootView.attachToDocument(document);
        rootView.focus();
        this._inspectedPagePlaceholder.update();
    }
    _openToolboxWindow(event) {
        if (event.data.to !== UI.DockController.State.Undocked) {
            return;
        }
        if (this._toolboxWindow) {
            return;
        }
        const url = window.location.href.replace('devtools_app.html', 'toolbox.html');
        this._toolboxWindow = window.open(url, undefined);
    }
    toolboxLoaded(toolboxDocument) {
        UI.UIUtils.initializeUIUtils(toolboxDocument, Common.Settings.Settings.instance().createSetting('uiTheme', 'default'));
        UI.UIUtils.installComponentRootStyles(toolboxDocument.body);
        UI.ContextMenu.ContextMenu.installHandler(toolboxDocument);
        UI.Tooltip.Tooltip.installHandler(toolboxDocument);
        this._toolboxRootView = new UI.RootView.RootView();
        this._toolboxRootView.attachToDocument(toolboxDocument);
        this._updateDeviceModeView();
    }
    _updateDeviceModeView() {
        if (this._isDocked()) {
            this._rootSplitWidget.setMainWidget(this._deviceModeView);
        }
        else if (this._toolboxRootView) {
            this._deviceModeView.show(this._toolboxRootView.element);
        }
    }
    _onBeforeDockSideChange(event) {
        if (event.data.to === UI.DockController.State.Undocked && this._toolboxRootView) {
            // Hide inspectorView and force layout to mimic the undocked state.
            this._rootSplitWidget.hideSidebar();
            this._inspectedPagePlaceholder.update();
        }
        this._changingDockSide = true;
    }
    _onDockSideChange(event) {
        this._updateDeviceModeView();
        const toDockSide = event ? event.data.to : UI.DockController.DockController.instance().dockSide();
        if (toDockSide === UI.DockController.State.Undocked) {
            this._updateForUndocked();
        }
        else if (this._toolboxRootView && event && event.data.from === UI.DockController.State.Undocked) {
            // Don't update yet for smooth transition.
            this._rootSplitWidget.hideSidebar();
        }
        else {
            this._updateForDocked(toDockSide);
        }
    }
    _onAfterDockSideChange(event) {
        // We may get here on the first dock side change while loading without BeforeDockSideChange.
        if (!this._changingDockSide) {
            return;
        }
        if (event.data.from === UI.DockController.State.Undocked) {
            this._updateForDocked(event.data.to);
        }
        this._changingDockSide = false;
        this._inspectedPagePlaceholder.update();
    }
    _updateForDocked(dockSide) {
        const resizerElement = this._rootSplitWidget.resizerElement();
        resizerElement.style.transform = dockSide === UI.DockController.State.DockedToRight ?
            'translateX(2px)' :
            dockSide === UI.DockController.State.DockedToLeft ? 'translateX(-2px)' : '';
        this._rootSplitWidget.setVertical(dockSide === UI.DockController.State.DockedToRight || dockSide === UI.DockController.State.DockedToLeft);
        this._rootSplitWidget.setSecondIsSidebar(dockSide === UI.DockController.State.DockedToRight || dockSide === UI.DockController.State.DockedToBottom);
        this._rootSplitWidget.toggleResizer(this._rootSplitWidget.resizerElement(), true);
        this._rootSplitWidget.toggleResizer(UI.InspectorView.InspectorView.instance().topResizerElement(), dockSide === UI.DockController.State.DockedToBottom);
        this._rootSplitWidget.showBoth();
    }
    _updateForUndocked() {
        this._rootSplitWidget.toggleResizer(this._rootSplitWidget.resizerElement(), false);
        this._rootSplitWidget.toggleResizer(UI.InspectorView.InspectorView.instance().topResizerElement(), false);
        this._rootSplitWidget.hideMain();
    }
    _isDocked() {
        return UI.DockController.DockController.instance().dockSide() !== UI.DockController.State.Undocked;
    }
    _onSetInspectedPageBounds(event) {
        if (this._changingDockSide) {
            return;
        }
        const window = this._inspectedPagePlaceholder.element.window();
        if (!window.innerWidth || !window.innerHeight) {
            return;
        }
        if (!this._inspectedPagePlaceholder.isShowing()) {
            return;
        }
        const bounds = event.data;
        console.timeStamp('AdvancedApp.setInspectedPageBounds');
        Host.InspectorFrontendHost.InspectorFrontendHostInstance.setInspectedPageBounds(bounds);
    }
}
// Export required for usage in toolbox.ts
// @ts-ignore Exported for Tests.js
globalThis.Emulation = globalThis.Emulation || {};
// @ts-ignore Exported for Tests.js
globalThis.Emulation.AdvancedApp = AdvancedApp;
let advancedAppProviderInstance;
export class AdvancedAppProvider {
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!advancedAppProviderInstance || forceNew) {
            advancedAppProviderInstance = new AdvancedAppProvider();
        }
        return advancedAppProviderInstance;
    }
    createApp() {
        return AdvancedApp._instance();
    }
}
//# sourceMappingURL=AdvancedApp.js.map