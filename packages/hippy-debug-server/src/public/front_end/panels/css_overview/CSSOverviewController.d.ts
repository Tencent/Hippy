import * as Common from '../../core/common/common.js';
export declare class OverviewController extends Common.ObjectWrapper.ObjectWrapper {
    currentUrl: string;
    constructor();
    _checkUrlAndResetIfChanged(): void;
}
export declare const Events: {
    RequestOverviewStart: symbol;
    RequestNodeHighlight: symbol;
    PopulateNodes: symbol;
    RequestOverviewCancel: symbol;
    OverviewCompleted: symbol;
    Reset: symbol;
};
