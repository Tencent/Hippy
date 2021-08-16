import type * as Platform from '../../core/platform/platform.js';
import { AffectedResourcesView } from './AffectedResourcesView.js';
import type { AggregatedIssue } from './IssueAggregator.js';
import type { IssueView } from './IssueView.js';
export declare class AffectedCookiesView extends AffectedResourcesView {
    private issue;
    constructor(parent: IssueView, issue: AggregatedIssue);
    protected getResourceNameWithCount(count: number): Platform.UIString.LocalizedString;
    private appendAffectedCookies;
    private appendAffectedCookie;
    update(): void;
}
