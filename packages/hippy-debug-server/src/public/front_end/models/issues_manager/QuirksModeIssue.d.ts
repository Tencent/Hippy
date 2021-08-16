import type * as SDK from '../../core/sdk/sdk.js';
import * as Protocol from '../../generated/protocol.js';
import { Issue, IssueCategory, IssueKind } from './Issue.js';
import type { MarkdownIssueDescription } from './MarkdownIssueDescription.js';
export declare class QuirksModeIssue extends Issue {
    private issueDetails;
    constructor(issueDetails: Protocol.Audits.QuirksModeIssueDetails, issuesModel: SDK.IssuesModel.IssuesModel);
    primaryKey(): string;
    getCategory(): IssueCategory;
    details(): Protocol.Audits.QuirksModeIssueDetails;
    getDescription(): MarkdownIssueDescription;
    getKind(): IssueKind;
    static fromInspectorIssue(issuesModel: SDK.IssuesModel.IssuesModel, inspectorIssue: Protocol.Audits.InspectorIssue): QuirksModeIssue[];
}
