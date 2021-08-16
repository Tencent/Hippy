// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as FrontendHelpers from '../../../../../test/unittests/front_end/helpers/EnvironmentHelpers.js';
import * as ComponentHelpers from '../../helpers/helpers.js';
await ComponentHelpers.ComponentServerSetup.setup();
await FrontendHelpers.initializeGlobalVars();
const IssueCounter = await import('../../../../ui/components/issue_counter/issue_counter.js');
function appendComponent(data) {
    const component = new IssueCounter.IssueCounter.IssueCounter();
    component.data = data;
    document.getElementById('container')?.appendChild(component);
}
const mockIssueManager = {
    addEventListener() { },
    removeEventListener() { },
    numberOfIssues() {
        return 1;
    },
};
appendComponent({ issuesManager: mockIssueManager });
appendComponent({ issuesManager: mockIssueManager, clickHandler: () => { } });
//# sourceMappingURL=basic.js.map