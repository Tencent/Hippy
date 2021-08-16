import type * as Platform from '../../core/platform/platform.js';
import { AffectedResourcesView } from './AffectedResourcesView.js';
import type { AggregatedIssue } from './IssueAggregator.js';
import type { IssueView } from './IssueView.js';
export declare class AffectedTrustedWebActivityIssueDetailsView extends AffectedResourcesView {
    private issue;
    constructor(parentView: IssueView, issue: AggregatedIssue);
    protected getResourceNameWithCount(count: number): Platform.UIString.LocalizedString;
    private appendDetail;
    private appendDetails;
    update(): void;
}
