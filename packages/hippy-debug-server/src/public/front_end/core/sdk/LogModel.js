// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Host from '../host/host.js';
import { Capability } from './Target.js';
import { SDKModel } from './SDKModel.js';
export class LogModel extends SDKModel {
    _logAgent;
    constructor(target) {
        super(target);
        target.registerLogDispatcher(this);
        this._logAgent = target.logAgent();
        this._logAgent.invoke_enable();
        if (!Host.InspectorFrontendHost.isUnderTest()) {
            this._logAgent.invoke_startViolationsReport({
                config: [
                    { name: "longTask" /* LongTask */, threshold: 200 },
                    { name: "longLayout" /* LongLayout */, threshold: 30 },
                    { name: "blockedEvent" /* BlockedEvent */, threshold: 100 },
                    { name: "blockedParser" /* BlockedParser */, threshold: -1 },
                    { name: "handler" /* Handler */, threshold: 150 },
                    { name: "recurringHandler" /* RecurringHandler */, threshold: 50 },
                    { name: "discouragedAPIUse" /* DiscouragedAPIUse */, threshold: -1 },
                ],
            });
        }
    }
    entryAdded({ entry }) {
        this.dispatchEventToListeners(Events.EntryAdded, { logModel: this, entry });
    }
    requestClear() {
        this._logAgent.invoke_clear();
    }
}
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var Events;
(function (Events) {
    Events["EntryAdded"] = "EntryAdded";
})(Events || (Events = {}));
SDKModel.register(LogModel, { capabilities: Capability.Log, autostart: true });
//# sourceMappingURL=LogModel.js.map