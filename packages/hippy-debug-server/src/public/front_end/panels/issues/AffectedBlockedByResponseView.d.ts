import type * as Platform from '../../core/platform/platform.js';
import type * as IssuesManager from '../../models/issues_manager/issues_manager.js';
import { AffectedResourcesView } from './AffectedResourcesView.js';
import type { IssueView } from './IssueView.js';
export declare class AffectedBlockedByResponseView extends AffectedResourcesView {
    private issue;
    constructor(parent: IssueView, issue: IssuesManager.Issue.Issue);
    private appendDetails;
    protected getResourceNameWithCount(count: number): Platform.UIString.LocalizedString;
    private appendDetail;
    update(): void;
}
