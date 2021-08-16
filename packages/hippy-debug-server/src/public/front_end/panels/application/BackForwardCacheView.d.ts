import * as UI from '../../ui/legacy/legacy.js';
export declare class BackForwardCacheView extends UI.ThrottledWidget.ThrottledWidget {
    constructor();
    private onBackForwardCacheUpdate;
    doUpdate(): Promise<void>;
    private getMainResourceTreeModel;
    private getMainFrame;
    private renderMainFrameInformation;
    private renderBackForwardCacheStatus;
}
