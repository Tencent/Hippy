import * as Common from '../../core/common/common.js';
import * as UI from '../../ui/legacy/legacy.js';
export declare function getGroupIssuesByCategorySetting(): Common.Settings.Setting<boolean>;
export declare class IssuesPane extends UI.Widget.VBox {
    private categoryViews;
    private issueViews;
    private showThirdPartyCheckbox;
    private issuesTree;
    private noIssuesMessageDiv;
    private issuesManager;
    private aggregator;
    private issueViewUpdatePromise;
    private constructor();
    static instance(opts?: {
        forceNew: boolean | null;
    }): IssuesPane;
    elementsToRestoreScrollPositionsFor(): Element[];
    private createToolbars;
    private issueUpdated;
    private scheduleIssueViewUpdate;
    /** Don't call directly. Use `scheduleIssueViewUpdate` instead. */
    private updateIssueView;
    private getIssueViewParent;
    private clearViews;
    private fullUpdate;
    private updateCounts;
    private showIssuesTreeOrNoIssuesDetectedMessage;
    revealByCode(code: string): void;
}
