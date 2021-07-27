// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../../core/i18n/i18n.js';
import * as SDK from '../../core/sdk/sdk.js';
import { Issue, IssueCategory, IssueKind } from './Issue.js';
import { isCausedByThirdParty } from './SameSiteCookieIssue.js';
const UIStrings = {
    /**
     * @description Label for the link for User-Agent String reduction issues, that is, issues that are related to an
     * upcoming reduction of information content in the user-agent string.
     */
    userAgentReduction: 'User-Agent String Reduction',
};
const str_ = i18n.i18n.registerUIStrings('models/issues_manager/DeprecationIssue.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var IssueCode;
(function (IssueCode) {
    IssueCode["NavigatorUserAgentIssue"] = "DeprecationIssue::NavigatorUserAgentIssue";
})(IssueCode || (IssueCode = {}));
export class DeprecationIssue extends Issue {
    issueDetails;
    constructor(issueDetails, issuesModel) {
        super(IssueCode.NavigatorUserAgentIssue, issuesModel);
        this.issueDetails = issueDetails;
    }
    getCategory() {
        return IssueCategory.Other;
    }
    details() {
        return this.issueDetails;
    }
    getDescription() {
        return {
            file: 'deprecationNavigatorUserAgent.md',
            links: [{
                    link: 'https://blog.chromium.org/2021/05/update-on-user-agent-string-reduction.html',
                    linkTitle: i18nString(UIStrings.userAgentReduction),
                }],
        };
    }
    sources() {
        if (this.issueDetails.location) {
            return [this.issueDetails.location];
        }
        return [];
    }
    primaryKey() {
        return JSON.stringify(this.issueDetails);
    }
    getKind() {
        return IssueKind.Improvement;
    }
    isCausedByThirdParty() {
        const topFrame = SDK.FrameManager.FrameManager.instance().getTopFrame();
        return isCausedByThirdParty(topFrame, this.issueDetails.url);
    }
    static fromInspectorIssue(issuesModel, inspectorIssue) {
        const details = inspectorIssue.details.navigatorUserAgentIssueDetails;
        if (!details) {
            console.warn('NavigatorUserAgent issue without details received.');
            return [];
        }
        return [new DeprecationIssue(details, issuesModel)];
    }
}
//# sourceMappingURL=DeprecationIssue.js.map