import * as SDK from '../../core/sdk/sdk.js';
import * as Protocol from '../../generated/protocol.js';
import { Issue, IssueCategory, IssueKind } from './Issue.js';
import type { MarkdownIssueDescription } from './MarkdownIssueDescription.js';
export declare class SameSiteCookieIssue extends Issue {
    private issueDetails;
    constructor(code: string, issueDetails: Protocol.Audits.SameSiteCookieIssueDetails, issuesModel: SDK.IssuesModel.IssuesModel);
    private cookieId;
    primaryKey(): string;
    /**
     * Returns an array of issues from a given SameSiteCookieIssueDetails.
     */
    static createIssuesFromSameSiteDetails(sameSiteDetails: Protocol.Audits.SameSiteCookieIssueDetails, issuesModel: SDK.IssuesModel.IssuesModel): SameSiteCookieIssue[];
    /**
     * Calculates an issue code from a reason, an operation, and an array of warningReasons. All these together
     * can uniquely identify a specific SameSite cookie issue.
     * warningReasons is only needed for some SameSiteCookieExclusionReason in order to determine if an issue should be raised.
     * It is not required if reason is a SameSiteCookieWarningReason.
     */
    static codeForSameSiteDetails(reason: Protocol.Audits.SameSiteCookieExclusionReason | Protocol.Audits.SameSiteCookieWarningReason, warningReasons: Protocol.Audits.SameSiteCookieWarningReason[], operation: Protocol.Audits.SameSiteCookieOperation, cookieUrl?: string): string | null;
    cookies(): Iterable<Protocol.Audits.AffectedCookie>;
    requests(): Iterable<Protocol.Audits.AffectedRequest>;
    getCategory(): IssueCategory;
    getDescription(): MarkdownIssueDescription | null;
    isCausedByThirdParty(): boolean;
    getKind(): IssueKind;
    static fromInspectorIssue(issuesModel: SDK.IssuesModel.IssuesModel, inspectorIssue: Protocol.Audits.InspectorIssue): SameSiteCookieIssue[];
}
/**
 * Exported for unit test.
 */
export declare function isCausedByThirdParty(topFrame: SDK.ResourceTreeModel.ResourceTreeFrame | null, cookieUrl?: string): boolean;
