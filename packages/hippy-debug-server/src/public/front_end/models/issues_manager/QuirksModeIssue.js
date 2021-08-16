// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../../core/i18n/i18n.js';
import { Issue, IssueCategory, IssueKind } from './Issue.js';
const UIStrings = {
    /**
    *@description Link title for the Quirks Mode issue in the Issues panel
    */
    documentCompatibilityMode: 'Document compatibility mode',
};
const str_ = i18n.i18n.registerUIStrings('models/issues_manager/QuirksModeIssue.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class QuirksModeIssue extends Issue {
    issueDetails;
    constructor(issueDetails, issuesModel) {
        const mode = issueDetails.isLimitedQuirksMode ? 'LimitedQuirksMode' : 'QuirksMode';
        const umaCode = ["QuirksModeIssue" /* QuirksModeIssue */, mode].join('::');
        super({ code: "QuirksModeIssue" /* QuirksModeIssue */, umaCode }, issuesModel);
        this.issueDetails = issueDetails;
    }
    primaryKey() {
        return `${this.code()}-(${this.issueDetails.documentNodeId})-(${this.issueDetails.url})`;
    }
    getCategory() {
        return IssueCategory.QuirksMode;
    }
    details() {
        return this.issueDetails;
    }
    getDescription() {
        return {
            file: 'CompatibilityModeQuirks.md',
            links: [
                {
                    link: 'https://web.dev/doctype/',
                    linkTitle: i18nString(UIStrings.documentCompatibilityMode),
                },
            ],
        };
    }
    getKind() {
        return IssueKind.Improvement;
    }
    static fromInspectorIssue(issuesModel, inspectorIssue) {
        const quirksModeIssueDetails = inspectorIssue.details.quirksModeIssueDetails;
        if (!quirksModeIssueDetails) {
            console.warn('Quirks Mode issue without details received.');
            return [];
        }
        return [new QuirksModeIssue(quirksModeIssueDetails, issuesModel)];
    }
}
//# sourceMappingURL=QuirksModeIssue.js.map