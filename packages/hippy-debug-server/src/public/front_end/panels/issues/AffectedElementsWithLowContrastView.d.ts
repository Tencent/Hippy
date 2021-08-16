import { AffectedElementsView } from './AffectedElementsView.js';
import type { AggregatedIssue } from './IssueAggregator.js';
import type { IssueView } from './IssueView.js';
export declare class AffectedElementsWithLowContrastView extends AffectedElementsView {
    private aggregateIssue;
    private runningUpdatePromise;
    constructor(parent: IssueView, issue: AggregatedIssue);
    update(): void;
    private doUpdate;
    private appendLowContrastElement;
    private appendLowContrastElements;
}
