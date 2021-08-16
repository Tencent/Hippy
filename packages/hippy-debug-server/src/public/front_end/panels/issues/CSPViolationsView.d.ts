import * as UI from '../../ui/legacy/legacy.js';
export declare class CSPViolationsView extends UI.Widget.VBox {
    private listView;
    private issuesManager;
    /**
     * @private
     */
    constructor();
    static instance(opts?: {
        forceNew: null;
    }): CSPViolationsView;
    private onIssueAdded;
    private onFullUpdateRequired;
    private addAllIssues;
}
