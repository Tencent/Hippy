// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as FrontendHelpers from '../../../../../test/unittests/front_end/helpers/EnvironmentHelpers.js';
import * as ComponentHelpers from '../../helpers/helpers.js';
import * as IconButton from '../../icon_button/icon_button.js';
await ComponentHelpers.ComponentServerSetup.setup();
await FrontendHelpers.initializeGlobalVars();
function appendComponent(data) {
    const component = new IconButton.IconButton.IconButton();
    component.data = data;
    document.getElementById('container')?.appendChild(component);
}
appendComponent({
    clickHandler: () => { },
    groups: [{ iconName: 'feedback_thin_16x16_icon', iconColor: 'black', text: '1 item' }],
});
appendComponent({
    clickHandler: () => { },
    groups: [{ iconName: 'feedback_thin_16x16_icon', iconColor: 'black', text: '1 item' }],
});
appendComponent({
    clickHandler: () => { },
    groups: [
        { iconName: 'feedback_thin_16x16_icon', iconColor: 'blue', text: 'Test' },
        { iconName: 'warning_icon', iconColor: '', text: '1' },
    ],
});
appendComponent({
    clickHandler: () => { },
    groups: [
        { iconName: 'issue-exclamation-icon', iconColor: 'yellow', text: '23', iconHeight: '2ex', iconWidth: '2ex' },
        { iconName: 'issue-text-icon', iconColor: 'blue', text: '1' },
    ],
});
appendComponent({
    groups: [
        { iconName: 'issue-exclamation-icon', iconColor: 'yellow', text: '23' },
        { iconName: 'issue-text-icon', iconColor: 'blue', text: '1' },
    ],
});
appendComponent({
    clickHandler: () => { },
    groups: [
        { iconName: 'issue-exclamation-icon', iconColor: 'yellow', text: '23' },
        { iconName: 'issue-text-icon', iconColor: 'blue', text: '1' },
    ],
    trailingText: 'Issues',
});
appendComponent({
    clickHandler: () => { },
    groups: [
        { iconName: 'issue-exclamation-icon', iconColor: 'yellow', text: '23' },
        { iconName: 'issue-text-icon', iconColor: 'blue', text: '1' },
    ],
    leadingText: 'Issues:',
});
//# sourceMappingURL=basic.js.map