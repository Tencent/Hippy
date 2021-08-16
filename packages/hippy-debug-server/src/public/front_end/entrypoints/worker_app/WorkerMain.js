// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as MobileThrottling from '../../panels/mobile_throttling/mobile_throttling.js';
import * as Components from '../../ui/legacy/components/utils/utils.js';
const UIStrings = {
    /**
    *@description Text that refers to the main target.
    */
    main: 'Main',
};
const str_ = i18n.i18n.registerUIStrings('entrypoints/worker_app/WorkerMain.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
let workerMainImplInstance;
export class WorkerMainImpl extends Common.ObjectWrapper.ObjectWrapper {
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!workerMainImplInstance || forceNew) {
            workerMainImplInstance = new WorkerMainImpl();
        }
        return workerMainImplInstance;
    }
    async run() {
        SDK.Connections.initMainConnection(async () => {
            SDK.TargetManager.TargetManager.instance().createTarget('main', i18nString(UIStrings.main), SDK.Target.Type.ServiceWorker, null);
        }, Components.TargetDetachedDialog.TargetDetachedDialog.webSocketConnectionLost);
        new MobileThrottling.NetworkPanelIndicator.NetworkPanelIndicator();
    }
}
Common.Runnable.registerEarlyInitializationRunnable(WorkerMainImpl.instance);
SDK.ChildTargetManager.ChildTargetManager.install(async ({ target, waitingForDebugger }) => {
    // Only pause the new worker if debugging SW - we are going through the pause on start checkbox.
    if (target.parentTarget() || target.type() !== SDK.Target.Type.ServiceWorker || !waitingForDebugger) {
        return;
    }
    const debuggerModel = target.model(SDK.DebuggerModel.DebuggerModel);
    if (!debuggerModel) {
        return;
    }
    if (!debuggerModel.isReadyToPause()) {
        await debuggerModel.once(SDK.DebuggerModel.Events.DebuggerIsReadyToPause);
    }
    debuggerModel.pause();
});
//# sourceMappingURL=WorkerMain.js.map