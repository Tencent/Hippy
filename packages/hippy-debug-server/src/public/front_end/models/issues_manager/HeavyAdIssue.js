// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../../core/i18n/i18n.js';
import { Issue, IssueCategory, IssueKind } from './Issue.js';
const UIStrings = {
    /**
    *@description Title for a learn more link in Heavy Ads issue description
    */
    handlingHeavyAdInterventions: 'Handling Heavy Ad Interventions',
};
const str_ = i18n.i18n.registerUIStrings('models/issues_manager/HeavyAdIssue.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class HeavyAdIssue extends Issue {
    issueDetails;
    constructor(issueDetails, issuesModel) {
        const umaCode = ["HeavyAdIssue" /* HeavyAdIssue */, issueDetails.reason].join('::');
        super({ code: "HeavyAdIssue" /* HeavyAdIssue */, umaCode }, issuesModel);
        this.issueDetails = issueDetails;
    }
    details() {
        return this.issueDetails;
    }
    primaryKey() {
        return `${"HeavyAdIssue" /* HeavyAdIssue */}-${JSON.stringify(this.issueDetails)}`;
    }
    getDescription() {
        return {
            file: 'heavyAd.md',
            links: [
                {
                    link: 'https://developers.google.com/web/updates/2020/05/heavy-ad-interventions',
                    linkTitle: i18nString(UIStrings.handlingHeavyAdInterventions),
                },
            ],
        };
    }
    getCategory() {
        return IssueCategory.HeavyAd;
    }
    getKind() {
        switch (this.issueDetails.resolution) {
            case "HeavyAdBlocked" /* HeavyAdBlocked */:
                return IssueKind.PageError;
            case "HeavyAdWarning" /* HeavyAdWarning */:
                return IssueKind.BreakingChange;
        }
    }
    static fromInspectorIssue(issuesModel, inspectorIssue) {
        const heavyAdIssueDetails = inspectorIssue.details.heavyAdIssueDetails;
        if (!heavyAdIssueDetails) {
            console.warn('Heavy Ad issue without details received.');
            return [];
        }
        return [new HeavyAdIssue(heavyAdIssueDetails, issuesModel)];
    }
}
//# sourceMappingURL=HeavyAdIssue.js.map