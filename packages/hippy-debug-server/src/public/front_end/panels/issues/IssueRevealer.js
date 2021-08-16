// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as IssuesManager from '../../models/issues_manager/issues_manager.js';
import * as UI from '../../ui/legacy/legacy.js';
import { IssuesPane } from './IssuesPane.js';
let issueRevealerInstance;
export class IssueRevealer {
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!issueRevealerInstance || forceNew) {
            issueRevealerInstance = new IssueRevealer();
        }
        return issueRevealerInstance;
    }
    async reveal(issue) {
        if (!(issue instanceof IssuesManager.Issue.Issue)) {
            throw new Error('Internal error: not a issue');
        }
        await UI.ViewManager.ViewManager.instance().showView('issues-pane');
        const view = UI.ViewManager.ViewManager.instance().view('issues-pane');
        if (view) {
            const issuesPane = await view.widget();
            if (issuesPane instanceof IssuesPane) {
                issuesPane.revealByCode(issue.code());
            }
            else {
                throw new Error('Expected issues pane to be an instance of IssuesPane');
            }
        }
    }
}
//# sourceMappingURL=IssueRevealer.js.map