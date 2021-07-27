// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as Host from '../../core/host/host.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as Root from '../../core/root/root.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as MobileThrottling from '../../panels/mobile_throttling/mobile_throttling.js';
import * as Components from '../../ui/legacy/components/utils/utils.js';
import * as UI from '../../ui/legacy/legacy.js';
const UIStrings = {
    /**
    * @description Text that refers to the main target. The main target is the primary webpage that
    * DevTools is connected to. This text is used in various places in the UI as a label/name to inform
    * the user which target/webpage they are currently connected to, as DevTools may connect to multiple
    * targets at the same time in some scenarios.
    */
    main: 'Main',
    /**
    * @description A warning shown to the user when JavaScript is disabled on the webpage that
    * DevTools is connected to.
    */
    javascriptIsDisabled: 'JavaScript is disabled',
};
const str_ = i18n.i18n.registerUIStrings('entrypoints/inspector_main/InspectorMain.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
let inspectorMainImplInstance;
export class InspectorMainImpl extends Common.ObjectWrapper.ObjectWrapper {
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!inspectorMainImplInstance || forceNew) {
            inspectorMainImplInstance = new InspectorMainImpl();
        }
        return inspectorMainImplInstance;
    }
    async run() {
        let firstCall = true;
        await SDK.Connections.initMainConnection(async () => {
            const type = Root.Runtime.Runtime.queryParam('v8only') ? SDK.Target.Type.Node : SDK.Target.Type.Frame;
            const waitForDebuggerInPage = type === SDK.Target.Type.Frame && Root.Runtime.Runtime.queryParam('panel') === 'sources';
            const target = SDK.TargetManager.TargetManager.instance().createTarget('main', i18nString(UIStrings.main), type, null, undefined, waitForDebuggerInPage);
            // Only resume target during the first connection,
            // subsequent connections are due to connection hand-over,
            // there is no need to pause in debugger.
            if (!firstCall) {
                return;
            }
            firstCall = false;
            if (waitForDebuggerInPage) {
                const debuggerModel = target.model(SDK.DebuggerModel.DebuggerModel);
                if (debuggerModel) {
                    if (!debuggerModel.isReadyToPause()) {
                        await debuggerModel.once(SDK.DebuggerModel.Events.DebuggerIsReadyToPause);
                    }
                    debuggerModel.pause();
                }
            }
            target.runtimeAgent().invoke_runIfWaitingForDebugger();
        }, Components.TargetDetachedDialog.TargetDetachedDialog.webSocketConnectionLost);
        new SourcesPanelIndicator();
        new BackendSettingsSync();
        new MobileThrottling.NetworkPanelIndicator.NetworkPanelIndicator();
        Host.InspectorFrontendHost.InspectorFrontendHostInstance.events.addEventListener(Host.InspectorFrontendHostAPI.Events.ReloadInspectedPage, event => {
            const hard = event.data;
            SDK.ResourceTreeModel.ResourceTreeModel.reloadAllPages(hard);
        });
    }
}
Common.Runnable.registerEarlyInitializationRunnable(InspectorMainImpl.instance);
let reloadActionDelegateInstance;
export class ReloadActionDelegate {
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!reloadActionDelegateInstance || forceNew) {
            reloadActionDelegateInstance = new ReloadActionDelegate();
        }
        return reloadActionDelegateInstance;
    }
    handleAction(context, actionId) {
        switch (actionId) {
            case 'inspector_main.reload':
                SDK.ResourceTreeModel.ResourceTreeModel.reloadAllPages(false);
                return true;
            case 'inspector_main.hard-reload':
                SDK.ResourceTreeModel.ResourceTreeModel.reloadAllPages(true);
                return true;
        }
        return false;
    }
}
let focusDebuggeeActionDelegateInstance;
export class FocusDebuggeeActionDelegate {
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!focusDebuggeeActionDelegateInstance || forceNew) {
            focusDebuggeeActionDelegateInstance = new FocusDebuggeeActionDelegate();
        }
        return focusDebuggeeActionDelegateInstance;
    }
    handleAction(_context, _actionId) {
        const mainTarget = SDK.TargetManager.TargetManager.instance().mainTarget();
        if (!mainTarget) {
            return false;
        }
        mainTarget.pageAgent().invoke_bringToFront();
        return true;
    }
}
let nodeIndicatorInstance;
export class NodeIndicator {
    _element;
    _button;
    constructor() {
        const element = document.createElement('div');
        const shadowRoot = UI.Utils.createShadowRootWithCoreStyles(element, { cssFile: 'entrypoints/inspector_main/nodeIcon.css', enableLegacyPatching: false, delegatesFocus: undefined });
        this._element = shadowRoot.createChild('div', 'node-icon');
        element.addEventListener('click', () => Host.InspectorFrontendHost.InspectorFrontendHostInstance.openNodeFrontend(), false);
        this._button = new UI.Toolbar.ToolbarItem(element);
        this._button.setTitle(i18nString('Open dedicated DevTools for Node.js'));
        SDK.TargetManager.TargetManager.instance().addEventListener(SDK.TargetManager.Events.AvailableTargetsChanged, event => this._update(event.data));
        this._button.setVisible(false);
        this._update([]);
    }
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!nodeIndicatorInstance || forceNew) {
            nodeIndicatorInstance = new NodeIndicator();
        }
        return nodeIndicatorInstance;
    }
    _update(targetInfos) {
        const hasNode = Boolean(targetInfos.find(target => target.type === 'node' && !target.attached));
        this._element.classList.toggle('inactive', !hasNode);
        if (hasNode) {
            this._button.setVisible(true);
        }
    }
    item() {
        return this._button;
    }
}
export class SourcesPanelIndicator {
    constructor() {
        Common.Settings.Settings.instance()
            .moduleSetting('javaScriptDisabled')
            .addChangeListener(javaScriptDisabledChanged);
        javaScriptDisabledChanged();
        function javaScriptDisabledChanged() {
            let icon = null;
            const javaScriptDisabled = Common.Settings.Settings.instance().moduleSetting('javaScriptDisabled').get();
            if (javaScriptDisabled) {
                icon = UI.Icon.Icon.create('smallicon-warning');
                UI.Tooltip.Tooltip.install(icon, i18nString(UIStrings.javascriptIsDisabled));
            }
            UI.InspectorView.InspectorView.instance().setPanelIcon('sources', icon);
        }
    }
}
export class BackendSettingsSync {
    _autoAttachSetting;
    _adBlockEnabledSetting;
    _emulatePageFocusSetting;
    constructor() {
        this._autoAttachSetting = Common.Settings.Settings.instance().moduleSetting('autoAttachToCreatedPages');
        this._autoAttachSetting.addChangeListener(this._updateAutoAttach, this);
        this._updateAutoAttach();
        this._adBlockEnabledSetting = Common.Settings.Settings.instance().moduleSetting('network.adBlockingEnabled');
        this._adBlockEnabledSetting.addChangeListener(this._update, this);
        this._emulatePageFocusSetting = Common.Settings.Settings.instance().moduleSetting('emulatePageFocus');
        this._emulatePageFocusSetting.addChangeListener(this._update, this);
        SDK.TargetManager.TargetManager.instance().observeTargets(this);
    }
    _updateTarget(target) {
        if (target.type() !== SDK.Target.Type.Frame || target.parentTarget()) {
            return;
        }
        target.pageAgent().invoke_setAdBlockingEnabled({ enabled: this._adBlockEnabledSetting.get() });
        target.emulationAgent().invoke_setFocusEmulationEnabled({ enabled: this._emulatePageFocusSetting.get() });
    }
    _updateAutoAttach() {
        Host.InspectorFrontendHost.InspectorFrontendHostInstance.setOpenNewWindowForPopups(this._autoAttachSetting.get());
    }
    _update() {
        for (const target of SDK.TargetManager.TargetManager.instance().targets()) {
            this._updateTarget(target);
        }
    }
    targetAdded(target) {
        this._updateTarget(target);
    }
    targetRemoved(_target) {
    }
}
SDK.ChildTargetManager.ChildTargetManager.install();
//# sourceMappingURL=InspectorMain.js.map