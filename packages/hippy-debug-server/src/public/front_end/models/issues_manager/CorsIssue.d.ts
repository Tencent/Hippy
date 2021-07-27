import type * as SDK from '../../core/sdk/sdk.js';
import * as Protocol from '../../generated/protocol.js';
import { Issue, IssueCategory, IssueKind } from './Issue.js';
import type { MarkdownIssueDescription } from './MarkdownIssueDescription.js';
export declare enum IssueCode {
    InsecurePrivateNetwork = "CorsIssue::InsecurePrivateNetwork",
    InsecurePrivateNetworkPreflight = "CorsIssue::InsecurePrivateNetworkPreflight",
    InvalidHeaderValues = "CorsIssue::InvalidHeaders",
    WildcardOriginNotAllowed = "CorsIssue::WildcardOriginWithCredentials",
    PreflightResponseInvalid = "CorsIssue::PreflightResponseInvalid",
    OriginMismatch = "CorsIssue::OriginMismatch",
    AllowCredentialsRequired = "CorsIssue::AllowCredentialsRequired",
    MethodDisallowedByPreflightResponse = "CorsIssue::MethodDisallowedByPreflightResponse",
    HeaderDisallowedByPreflightResponse = "CorsIssue::HeaderDisallowedByPreflightResponse",
    RedirectContainsCredentials = "CorsIssue::RedirectContainsCredentials",
    DisallowedByMode = "CorsIssue::DisallowedByMode",
    CorsDisabledScheme = "CorsIssue::CorsDisabledScheme",
    PreflightMissingAllowExternal = "CorsIssue::PreflightMissingAllowExternal",
    PreflightInvalidAllowExternal = "CorsIssue::PreflightInvalidAllowExternal",
    InvalidResponse = "CorsIssue::InvalidResponse",
    NoCorsRedirectModeNotFollow = "CorsIssue::NoCorsRedirectModeNotFollow"
}
export declare class CorsIssue extends Issue<IssueCode> {
    private issueDetails;
    constructor(issueDetails: Protocol.Audits.CorsIssueDetails, issuesModel: SDK.IssuesModel.IssuesModel);
    getCategory(): IssueCategory;
    details(): Protocol.Audits.CorsIssueDetails;
    getDescription(): MarkdownIssueDescription | null;
    primaryKey(): string;
    getKind(): IssueKind;
    static fromInspectorIssue(issuesModel: SDK.IssuesModel.IssuesModel, inspectorIssue: Protocol.Audits.InspectorIssue): CorsIssue[];
}
