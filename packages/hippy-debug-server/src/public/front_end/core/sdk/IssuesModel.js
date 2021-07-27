// Copyright 2019 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { Capability } from './Target.js';
import { SDKModel } from './SDKModel.js';
/**
 * The `IssuesModel` is a thin dispatch that does not store issues, but only creates the representation
 * class (usually derived from `Issue`) and passes the instances on via a dispatched event.
 * We chose this approach here because the lifetime of the Model is tied to the target, but DevTools
 * wants to preserve issues for targets (e.g. iframes) that are already gone as well.
 */
export class IssuesModel extends SDKModel {
    disposed;
    enabled;
    auditsAgent;
    constructor(target) {
        super(target);
        this.enabled = false;
        this.auditsAgent = null;
        this.ensureEnabled();
        this.disposed = false;
    }
    async ensureEnabled() {
        if (this.enabled) {
            return;
        }
        this.enabled = true;
        this.target().registerAuditsDispatcher(this);
        this.auditsAgent = this.target().auditsAgent();
        await this.auditsAgent.invoke_enable();
    }
    issueAdded(issueAddedEvent) {
        this.dispatchEventToListeners(Events.IssueAdded, { issuesModel: this, inspectorIssue: issueAddedEvent.issue });
    }
    dispose() {
        super.dispose();
        this.disposed = true;
    }
    getTargetIfNotDisposed() {
        if (!this.disposed) {
            return this.target();
        }
        return null;
    }
}
export const Events = {
    IssueAdded: Symbol('IssueAdded'),
};
SDKModel.register(IssuesModel, { capabilities: Capability.Audits, autostart: true });
//# sourceMappingURL=IssuesModel.js.map