import * as Common from '../../core/common/common.js';
import type * as SDK from '../../core/sdk/sdk.js';
import type * as Protocol from '../../generated/protocol.js';
import type { MarkdownIssueDescription } from './MarkdownIssueDescription.js';
export declare enum IssueCategory {
    CrossOriginEmbedderPolicy = "CrossOriginEmbedderPolicy",
    MixedContent = "MixedContent",
    SameSiteCookie = "SameSiteCookie",
    HeavyAd = "HeavyAd",
    ContentSecurityPolicy = "ContentSecurityPolicy",
    TrustedWebActivity = "TrustedWebActivity",
    LowTextContrast = "LowTextContrast",
    Cors = "Cors",
    AttributionReporting = "AttributionReporting",
    QuirksMode = "QuirksMode",
    Other = "Other"
}
export declare enum IssueKind {
    BreakingChange = "BreakingChange",
    PageError = "PageError",
    Improvement = "Improvement"
}
/**
 * Union two issue kinds for issue aggregation. The idea is to show the most
 * important kind on aggregated issues that union issues of different kinds.
 */
export declare function unionIssueKind(a: IssueKind, b: IssueKind): IssueKind;
export declare function getShowThirdPartyIssuesSetting(): Common.Settings.Setting<boolean>;
export interface AffectedElement {
    backendNodeId: number;
    nodeName: string;
    target: SDK.Target.Target | null;
}
export declare abstract class Issue<IssueCode extends string = string> extends Common.ObjectWrapper.ObjectWrapper {
    private issueCode;
    private issuesModel;
    constructor(code: IssueCode | {
        code: IssueCode;
        umaCode: string;
    }, issuesModel?: SDK.IssuesModel.IssuesModel | null);
    code(): IssueCode;
    abstract primaryKey(): string;
    abstract getDescription(): MarkdownIssueDescription | null;
    abstract getCategory(): IssueCategory;
    abstract getKind(): IssueKind;
    getBlockedByResponseDetails(): Iterable<Protocol.Audits.BlockedByResponseIssueDetails>;
    cookies(): Iterable<Protocol.Audits.AffectedCookie>;
    elements(): Iterable<AffectedElement>;
    requests(): Iterable<Protocol.Audits.AffectedRequest>;
    sources(): Iterable<Protocol.Audits.SourceCodeLocation>;
    isAssociatedWithRequestId(requestId: string): boolean;
    /**
     * The model might be unavailable or belong to a target that has already been disposed.
     */
    model(): SDK.IssuesModel.IssuesModel | null;
    isCausedByThirdParty(): boolean;
}
export declare function toZeroBasedLocation(location: Protocol.Audits.SourceCodeLocation | undefined): {
    url: string;
    scriptId: string | undefined;
    lineNumber: number;
    columnNumber: number | undefined;
} | undefined;
