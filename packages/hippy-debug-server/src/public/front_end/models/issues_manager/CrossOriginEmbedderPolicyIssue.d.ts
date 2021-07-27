import type * as SDK from '../../core/sdk/sdk.js';
import * as Protocol from '../../generated/protocol.js';
import { Issue, IssueCategory, IssueKind } from './Issue.js';
import type { MarkdownIssueDescription } from './MarkdownIssueDescription.js';
export declare function isCrossOriginEmbedderPolicyIssue(reason: Protocol.Audits.BlockedByResponseReason): boolean;
export declare class CrossOriginEmbedderPolicyIssue extends Issue {
    private issueDetails;
    constructor(issueDetails: Protocol.Audits.BlockedByResponseIssueDetails, issuesModel: SDK.IssuesModel.IssuesModel);
    primaryKey(): string;
    getBlockedByResponseDetails(): Iterable<Protocol.Audits.BlockedByResponseIssueDetails>;
    requests(): Iterable<Protocol.Audits.AffectedRequest>;
    getCategory(): IssueCategory;
    getDescription(): MarkdownIssueDescription | null;
    getKind(): IssueKind;
}
