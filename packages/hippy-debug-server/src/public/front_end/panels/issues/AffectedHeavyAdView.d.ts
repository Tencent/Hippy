import type * as Platform from '../../core/platform/platform.js';
import { AffectedResourcesView } from './AffectedResourcesView.js';
import type { AggregatedIssue } from './IssueAggregator.js';
import type { IssueView } from './IssueView.js';
export declare class AffectedHeavyAdView extends AffectedResourcesView {
    private issue;
    constructor(parent: IssueView, issue: AggregatedIssue);
    private appendAffectedHeavyAds;
    protected getResourceNameWithCount(count: number): Platform.UIString.LocalizedString;
    private statusToString;
    private limitToString;
    private appendAffectedHeavyAd;
    update(): void;
}
