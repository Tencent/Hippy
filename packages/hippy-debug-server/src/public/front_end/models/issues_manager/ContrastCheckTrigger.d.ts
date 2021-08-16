import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
export declare class ContrastCheckTrigger extends Common.ObjectWrapper.ObjectWrapper {
    private pageLoadListeners;
    private frameAddedListeners;
    constructor();
    static instance({ forceNew }?: {
        forceNew: boolean;
    }): ContrastCheckTrigger;
    modelAdded(resourceTreeModel: SDK.ResourceTreeModel.ResourceTreeModel): Promise<void>;
    modelRemoved(resourceTreeModel: SDK.ResourceTreeModel.ResourceTreeModel): void;
    private checkContrast;
    private pageLoaded;
    private frameAdded;
}
