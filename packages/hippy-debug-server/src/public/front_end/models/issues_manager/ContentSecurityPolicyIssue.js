// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../../core/i18n/i18n.js';
import { Issue, IssueCategory, IssueKind } from './Issue.js';
import { resolveLazyDescription } from './MarkdownIssueDescription.js';
const UIStrings = {
    /**
    *@description Title for CSP url link
    */
    contentSecurityPolicySource: 'Content Security Policy - Source Allowlists',
    /**
    *@description Title for CSP inline issue link
    */
    contentSecurityPolicyInlineCode: 'Content Security Policy - Inline Code',
    /**
    *@description Title for the CSP eval link
    */
    contentSecurityPolicyEval: 'Content Security Policy - Eval',
    /**
    *@description Title for Trusted Types policy violation issue link. https://developer.mozilla.org/en-US/docs/Web/API/Trusted_Types_API
    */
    trustedTypesFixViolations: 'Trusted Types - Fix violations',
    /**
    *@description Title for Trusted Types policy violation issue link. https://developer.mozilla.org/en-US/docs/Web/API/Trusted_Types_API
    */
    trustedTypesPolicyViolation: 'Trusted Types - Policy violation',
};
const str_ = i18n.i18n.registerUIStrings('models/issues_manager/ContentSecurityPolicyIssue.ts', UIStrings);
const i18nLazyString = i18n.i18n.getLazilyComputedLocalizedString.bind(undefined, str_);
export class ContentSecurityPolicyIssue extends Issue {
    issueDetails;
    constructor(issueDetails, issuesModel) {
        const issueCode = [
            "ContentSecurityPolicyIssue" /* ContentSecurityPolicyIssue */,
            issueDetails.contentSecurityPolicyViolationType,
        ].join('::');
        super(issueCode, issuesModel);
        this.issueDetails = issueDetails;
    }
    getCategory() {
        return IssueCategory.ContentSecurityPolicy;
    }
    primaryKey() {
        return JSON.stringify(this.issueDetails, [
            'blockedURL',
            'contentSecurityPolicyViolationType',
            'violatedDirective',
            'isReportOnly',
            'sourceCodeLocation',
            'url',
            'lineNumber',
            'columnNumber',
            'violatingNodeId',
        ]);
    }
    getDescription() {
        const description = issueDescriptions.get(this.issueDetails.contentSecurityPolicyViolationType);
        if (!description) {
            return null;
        }
        return resolveLazyDescription(description);
    }
    details() {
        return this.issueDetails;
    }
    getKind() {
        if (this.issueDetails.isReportOnly) {
            return IssueKind.Improvement;
        }
        return IssueKind.PageError;
    }
    static fromInspectorIssue(issuesModel, inspectorIssue) {
        const cspDetails = inspectorIssue.details.contentSecurityPolicyIssueDetails;
        if (!cspDetails) {
            console.warn('Content security policy issue without details received.');
            return [];
        }
        return [new ContentSecurityPolicyIssue(cspDetails, issuesModel)];
    }
}
const cspURLViolation = {
    file: 'cspURLViolation.md',
    links: [{
            link: 'https://developers.google.com/web/fundamentals/security/csp#source_allowlists',
            linkTitle: i18nLazyString(UIStrings.contentSecurityPolicySource),
        }],
};
const cspInlineViolation = {
    file: 'cspInlineViolation.md',
    links: [{
            link: 'https://developers.google.com/web/fundamentals/security/csp#inline_code_is_considered_harmful',
            linkTitle: i18nLazyString(UIStrings.contentSecurityPolicyInlineCode),
        }],
};
const cspEvalViolation = {
    file: 'cspEvalViolation.md',
    links: [{
            link: 'https://developers.google.com/web/fundamentals/security/csp#eval_too',
            linkTitle: i18nLazyString(UIStrings.contentSecurityPolicyEval),
        }],
};
const cspTrustedTypesSinkViolation = {
    file: 'cspTrustedTypesSinkViolation.md',
    links: [{
            link: 'https://web.dev/trusted-types/#fix-the-violations',
            linkTitle: i18nLazyString(UIStrings.trustedTypesFixViolations),
        }],
};
const cspTrustedTypesPolicyViolation = {
    file: 'cspTrustedTypesPolicyViolation.md',
    links: [{ link: 'https://web.dev/trusted-types/', linkTitle: i18nLazyString(UIStrings.trustedTypesPolicyViolation) }],
};
export const urlViolationCode = [
    "ContentSecurityPolicyIssue" /* ContentSecurityPolicyIssue */,
    "kURLViolation" /* KURLViolation */,
].join('::');
export const inlineViolationCode = [
    "ContentSecurityPolicyIssue" /* ContentSecurityPolicyIssue */,
    "kInlineViolation" /* KInlineViolation */,
].join('::');
export const evalViolationCode = [
    "ContentSecurityPolicyIssue" /* ContentSecurityPolicyIssue */,
    "kEvalViolation" /* KEvalViolation */,
].join('::');
export const trustedTypesSinkViolationCode = [
    "ContentSecurityPolicyIssue" /* ContentSecurityPolicyIssue */,
    "kTrustedTypesSinkViolation" /* KTrustedTypesSinkViolation */,
].join('::');
export const trustedTypesPolicyViolationCode = [
    "ContentSecurityPolicyIssue" /* ContentSecurityPolicyIssue */,
    "kTrustedTypesPolicyViolation" /* KTrustedTypesPolicyViolation */,
].join('::');
const issueDescriptions = new Map([
    ["kURLViolation" /* KURLViolation */, cspURLViolation],
    ["kInlineViolation" /* KInlineViolation */, cspInlineViolation],
    ["kEvalViolation" /* KEvalViolation */, cspEvalViolation],
    ["kTrustedTypesSinkViolation" /* KTrustedTypesSinkViolation */, cspTrustedTypesSinkViolation],
    ["kTrustedTypesPolicyViolation" /* KTrustedTypesPolicyViolation */, cspTrustedTypesPolicyViolation],
]);
//# sourceMappingURL=ContentSecurityPolicyIssue.js.map