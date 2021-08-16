import type * as Platform from '../../core/platform/platform.js';
import { AffectedResourcesView } from './AffectedResourcesView.js';
import type { AggregatedIssue } from './IssueAggregator.js';
import type { IssueView } from './IssueView.js';
export declare class AffectedSharedArrayBufferIssueDetailsView extends AffectedResourcesView {
    private issue;
    constructor(parentView: IssueView, issue: AggregatedIssue);
    protected getResourceNameWithCount(count: number): Platform.UIString.LocalizedString;
    private appendStatus;
    private appendType;
    private appendDetails;
    private appendDetail;
    update(): void;
}
