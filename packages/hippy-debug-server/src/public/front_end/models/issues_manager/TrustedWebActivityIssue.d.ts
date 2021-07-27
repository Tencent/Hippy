import type * as SDK from '../../core/sdk/sdk.js';
import * as Protocol from '../../generated/protocol.js';
import { Issue, IssueCategory, IssueKind } from './Issue.js';
import type { MarkdownIssueDescription } from './MarkdownIssueDescription.js';
export declare class TrustedWebActivityIssue extends Issue {
    private issueDetails;
    constructor(issueDetails: Protocol.Audits.TrustedWebActivityIssueDetails);
    details(): Protocol.Audits.TrustedWebActivityIssueDetails;
    getDescription(): MarkdownIssueDescription | null;
    getCategory(): IssueCategory;
    primaryKey(): string;
    getKind(): IssueKind;
    static fromInspectorIssue(issuesModel: SDK.IssuesModel.IssuesModel, inspectorIssue: Protocol.Audits.InspectorIssue): TrustedWebActivityIssue[];
}
export declare const httpViolationCode: string;
export declare const offlineViolationCode: string;
export declare const assetlinkViolationCode: string;
