// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../../core/i18n/i18n.js';
import { Issue, IssueCategory, IssueKind } from './Issue.js';
const UIStrings = {
    /**
    *@description Label for the link for Mixed Content Issues
    */
    preventingMixedContent: 'Preventing mixed content',
};
const str_ = i18n.i18n.registerUIStrings('models/issues_manager/MixedContentIssue.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class MixedContentIssue extends Issue {
    issueDetails;
    constructor(issueDetails, issuesModel) {
        super("MixedContentIssue" /* MixedContentIssue */, issuesModel);
        this.issueDetails = issueDetails;
    }
    requests() {
        if (this.issueDetails.request) {
            return [this.issueDetails.request];
        }
        return [];
    }
    getDetails() {
        return this.issueDetails;
    }
    getCategory() {
        return IssueCategory.MixedContent;
    }
    getDescription() {
        return {
            file: 'mixedContent.md',
            links: [{ link: 'https://web.dev/what-is-mixed-content/', linkTitle: i18nString(UIStrings.preventingMixedContent) }],
        };
    }
    primaryKey() {
        return JSON.stringify(this.issueDetails);
    }
    getKind() {
        switch (this.issueDetails.resolutionStatus) {
            case "MixedContentAutomaticallyUpgraded" /* MixedContentAutomaticallyUpgraded */:
                return IssueKind.Improvement;
            case "MixedContentBlocked" /* MixedContentBlocked */:
                return IssueKind.PageError;
            case "MixedContentWarning" /* MixedContentWarning */:
                return IssueKind.Improvement;
        }
    }
    static fromInspectorIssue(issuesModel, inspectorIssue) {
        const mixedContentDetails = inspectorIssue.details.mixedContentIssueDetails;
        if (!mixedContentDetails) {
            console.warn('Mixed content issue without details received.');
            return [];
        }
        return [new MixedContentIssue(mixedContentDetails, issuesModel)];
    }
}
//# sourceMappingURL=MixedContentIssue.js.map