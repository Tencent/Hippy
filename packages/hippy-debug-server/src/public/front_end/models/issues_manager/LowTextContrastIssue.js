// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../../core/i18n/i18n.js';
import { Issue, IssueCategory, IssueKind } from './Issue.js';
const UIStrings = {
    /**
    *@description Link title for the Low Text Contrast issue in the Issues panel
    */
    colorAndContrastAccessibility: 'Color and contrast accessibility',
};
const str_ = i18n.i18n.registerUIStrings('models/issues_manager/LowTextContrastIssue.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class LowTextContrastIssue extends Issue {
    issueDetails;
    constructor(issueDetails) {
        super('LowTextContrastIssue');
        this.issueDetails = issueDetails;
    }
    primaryKey() {
        // We intend to keep only one issue per element so other issues for the element will be discarded even
        // if the issue content is slightly different.
        return `${this.code()}-(${this.issueDetails.violatingNodeId})`;
    }
    getCategory() {
        return IssueCategory.LowTextContrast;
    }
    details() {
        return this.issueDetails;
    }
    getDescription() {
        return {
            file: 'LowTextContrast.md',
            links: [
                {
                    link: 'https://web.dev/color-and-contrast-accessibility/',
                    linkTitle: i18nString(UIStrings.colorAndContrastAccessibility),
                },
            ],
        };
    }
    getKind() {
        return IssueKind.Improvement;
    }
    static fromInspectorIssue(_issuesModel, inspectorIssue) {
        const lowTextContrastIssueDetails = inspectorIssue.details.lowTextContrastIssueDetails;
        if (!lowTextContrastIssueDetails) {
            console.warn('LowTextContrast issue without details received.');
            return [];
        }
        return [new LowTextContrastIssue(lowTextContrastIssueDetails)];
    }
}
//# sourceMappingURL=LowTextContrastIssue.js.map