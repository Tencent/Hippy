// Copyright 2016 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as SDK from '../../../../core/sdk/sdk.js';
let gCActionDelegateInstance;
export class GCActionDelegate {
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!gCActionDelegateInstance || forceNew) {
            gCActionDelegateInstance = new GCActionDelegate();
        }
        return gCActionDelegateInstance;
    }
    handleAction(_context, _actionId) {
        for (const heapProfilerModel of SDK.TargetManager.TargetManager.instance().models(SDK.HeapProfilerModel.HeapProfilerModel)) {
            heapProfilerModel.collectGarbage();
        }
        return true;
    }
}
//# sourceMappingURL=GCActionDelegate.js.map