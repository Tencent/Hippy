import * as Protocol from '../../generated/protocol.js';
import type { MarkdownIssueDescription } from './MarkdownIssueDescription.js';
import { Issue, IssueKind, IssueCategory } from './Issue.js';
import type * as SDK from '../../core/sdk/sdk.js';
export declare class SharedArrayBufferIssue extends Issue {
    private issueDetails;
    constructor(issueDetails: Protocol.Audits.SharedArrayBufferIssueDetails, issuesModel: SDK.IssuesModel.IssuesModel);
    getCategory(): IssueCategory;
    details(): Protocol.Audits.SharedArrayBufferIssueDetails;
    getDescription(): MarkdownIssueDescription;
    primaryKey(): string;
    getKind(): IssueKind;
    static fromInspectorIssue(issuesModel: SDK.IssuesModel.IssuesModel, inspectorIssue: Protocol.Audits.InspectorIssue): SharedArrayBufferIssue[];
}
