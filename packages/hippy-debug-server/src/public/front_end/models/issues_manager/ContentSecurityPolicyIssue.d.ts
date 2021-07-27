import type * as SDK from '../../core/sdk/sdk.js';
import * as Protocol from '../../generated/protocol.js';
import { Issue, IssueCategory, IssueKind } from './Issue.js';
import type { MarkdownIssueDescription } from './MarkdownIssueDescription.js';
export declare class ContentSecurityPolicyIssue extends Issue {
    private issueDetails;
    constructor(issueDetails: Protocol.Audits.ContentSecurityPolicyIssueDetails, issuesModel: SDK.IssuesModel.IssuesModel);
    getCategory(): IssueCategory;
    primaryKey(): string;
    getDescription(): MarkdownIssueDescription | null;
    details(): Protocol.Audits.ContentSecurityPolicyIssueDetails;
    getKind(): IssueKind;
    static fromInspectorIssue(issuesModel: SDK.IssuesModel.IssuesModel, inspectorIssue: Protocol.Audits.InspectorIssue): ContentSecurityPolicyIssue[];
}
export declare const urlViolationCode: string;
export declare const inlineViolationCode: string;
export declare const evalViolationCode: string;
export declare const trustedTypesSinkViolationCode: string;
export declare const trustedTypesPolicyViolationCode: string;
