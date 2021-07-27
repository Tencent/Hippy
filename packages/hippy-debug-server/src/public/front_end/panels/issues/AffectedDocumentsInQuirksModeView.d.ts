import type * as Platform from '../../core/platform/platform.js';
import { AffectedElementsView } from './AffectedElementsView.js';
import type { AggregatedIssue } from './IssueAggregator.js';
import type { IssueView } from './IssueView.js';
export declare class AffectedDocumentsInQuirksModeView extends AffectedElementsView {
    private aggregateIssue;
    private runningUpdatePromise;
    constructor(parent: IssueView, issue: AggregatedIssue);
    update(): void;
    protected getResourceName(count: number): Platform.UIString.LocalizedString;
    private doUpdate;
    private appendQuirksModeDocument;
    private appendQuirksModeDocuments;
}
