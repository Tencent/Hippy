import * as Common from '../../core/common/common.js';
import * as IssuesManager from '../../models/issues_manager/issues_manager.js';
import type * as Protocol from '../../generated/protocol.js';
/**
 * An `AggregatedIssue` representes a number of `IssuesManager.Issue.Issue` objects that are displayed together.
 * Currently only grouping by issue code, is supported. The class provides helpers to support displaying
 * of all resources that are affected by the aggregated issues.
 */
export declare class AggregatedIssue extends IssuesManager.Issue.Issue {
    private affectedCookies;
    private affectedRequests;
    private affectedLocations;
    private heavyAdIssues;
    private blockedByResponseDetails;
    private corsIssues;
    private cspIssues;
    private issueKind;
    private lowContrastIssues;
    private mixedContentIssues;
    private sharedArrayBufferIssues;
    private trustedWebActivityIssues;
    private quirksModeIssues;
    private representative;
    private aggregatedIssuesCount;
    constructor(code: string);
    primaryKey(): string;
    getBlockedByResponseDetails(): Iterable<Protocol.Audits.BlockedByResponseIssueDetails>;
    cookies(): Iterable<Protocol.Audits.AffectedCookie>;
    sources(): Iterable<Protocol.Audits.SourceCodeLocation>;
    cookiesWithRequestIndicator(): Iterable<{
        cookie: Protocol.Audits.AffectedCookie;
        hasRequest: boolean;
    }>;
    getHeavyAdIssues(): Iterable<IssuesManager.HeavyAdIssue.HeavyAdIssue>;
    getMixedContentIssues(): Iterable<IssuesManager.MixedContentIssue.MixedContentIssue>;
    getTrustedWebActivityIssues(): Iterable<IssuesManager.TrustedWebActivityIssue.TrustedWebActivityIssue>;
    getCorsIssues(): Set<IssuesManager.CorsIssue.CorsIssue>;
    getCspIssues(): Iterable<IssuesManager.ContentSecurityPolicyIssue.ContentSecurityPolicyIssue>;
    getLowContrastIssues(): Iterable<IssuesManager.LowTextContrastIssue.LowTextContrastIssue>;
    requests(): Iterable<Protocol.Audits.AffectedRequest>;
    getSharedArrayBufferIssues(): Iterable<IssuesManager.SharedArrayBufferIssue.SharedArrayBufferIssue>;
    getQuirksModeIssues(): Iterable<IssuesManager.QuirksModeIssue.QuirksModeIssue>;
    getDescription(): IssuesManager.MarkdownIssueDescription.MarkdownIssueDescription | null;
    getCategory(): IssuesManager.Issue.IssueCategory;
    getAggregatedIssuesCount(): number;
    /**
     * Produces a primary key for a cookie. Use this instead of `JSON.stringify` in
     * case new fields are added to `AffectedCookie`.
     */
    private keyForCookie;
    addInstance(issue: IssuesManager.Issue.Issue): void;
    getKind(): IssuesManager.Issue.IssueKind;
}
export declare class IssueAggregator extends Common.ObjectWrapper.ObjectWrapper {
    private aggregatedIssuesByCode;
    private issuesManager;
    constructor(issuesManager: IssuesManager.IssuesManager.IssuesManager);
    private onIssueAdded;
    private onFullUpdateRequired;
    private aggregateIssue;
    aggregatedIssues(): Iterable<AggregatedIssue>;
    numberOfAggregatedIssues(): number;
}
export declare const enum Events {
    AggregatedIssueUpdated = "AggregatedIssueUpdated",
    FullUpdateRequired = "FullUpdateRequired"
}
