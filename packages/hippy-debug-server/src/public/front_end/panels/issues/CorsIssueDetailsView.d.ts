import * as Platform from '../../core/platform/platform.js';
import { AffectedResourcesView } from './AffectedResourcesView.js';
import type { AggregatedIssue } from './IssueAggregator.js';
import type { IssueView } from './IssueView.js';
export declare class CorsIssueDetailsView extends AffectedResourcesView {
    private issue;
    constructor(parentView: IssueView, issue: AggregatedIssue);
    private appendStatus;
    protected getResourceNameWithCount(count: number): Platform.UIString.LocalizedString;
    private appendDetails;
    private appendSecureContextCell;
    private static getHeaderFromError;
    private static getProblemFromError;
    private appendDetail;
    update(): void;
}
