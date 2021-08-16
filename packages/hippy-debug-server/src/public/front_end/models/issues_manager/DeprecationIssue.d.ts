import * as SDK from '../../core/sdk/sdk.js';
import type * as Protocol from '../../generated/protocol.js';
import { Issue, IssueCategory, IssueKind } from './Issue.js';
import type { MarkdownIssueDescription } from './MarkdownIssueDescription.js';
export declare enum IssueCode {
    NavigatorUserAgentIssue = "DeprecationIssue::NavigatorUserAgentIssue"
}
export declare class DeprecationIssue extends Issue<IssueCode> {
    private issueDetails;
    constructor(issueDetails: Protocol.Audits.NavigatorUserAgentIssueDetails, issuesModel: SDK.IssuesModel.IssuesModel);
    getCategory(): IssueCategory;
    details(): Protocol.Audits.NavigatorUserAgentIssueDetails;
    getDescription(): MarkdownIssueDescription | null;
    sources(): Iterable<Protocol.Audits.SourceCodeLocation>;
    primaryKey(): string;
    getKind(): IssueKind;
    isCausedByThirdParty(): boolean;
    static fromInspectorIssue(issuesModel: SDK.IssuesModel.IssuesModel, inspectorIssue: Protocol.Audits.InspectorIssue): DeprecationIssue[];
}
