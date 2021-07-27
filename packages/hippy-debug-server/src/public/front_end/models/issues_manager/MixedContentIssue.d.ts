import type * as SDK from '../../core/sdk/sdk.js';
import * as Protocol from '../../generated/protocol.js';
import { Issue, IssueCategory, IssueKind } from './Issue.js';
import type { MarkdownIssueDescription } from './MarkdownIssueDescription.js';
export declare class MixedContentIssue extends Issue {
    private issueDetails;
    constructor(issueDetails: Protocol.Audits.MixedContentIssueDetails, issuesModel: SDK.IssuesModel.IssuesModel);
    requests(): Iterable<Protocol.Audits.AffectedRequest>;
    getDetails(): Protocol.Audits.MixedContentIssueDetails;
    getCategory(): IssueCategory;
    getDescription(): MarkdownIssueDescription;
    primaryKey(): string;
    getKind(): IssueKind;
    static fromInspectorIssue(issuesModel: SDK.IssuesModel.IssuesModel, inspectorIssue: Protocol.Audits.InspectorIssue): MixedContentIssue[];
}
