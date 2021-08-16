import * as SDK from '../../core/sdk/sdk.js';
export declare class ServiceWorkerUpdateCycleView {
    private registration;
    private rows;
    private selectedRowIndex;
    tableElement: HTMLElement;
    constructor(registration: SDK.ServiceWorkerManager.ServiceWorkerRegistration);
    calculateServiceWorkerUpdateRanges(): Array<ServiceWorkerUpdateRange>;
    private createTimingTable;
    private createTimingTableHead;
    private removeRows;
    private updateTimingTable;
    /**
     * Detailed information about an update phase. Currently starting and ending time.
     */
    private constructUpdateDetails;
    private toggle;
    private onFocus;
    private onKeydown;
    private focusRow;
    private blurRow;
    private selectFirstRow;
    private selectLastRow;
    private selectNextRow;
    private selectPreviousRow;
    private onClick;
    refresh(): void;
}
export declare const enum ServiceWorkerUpdateNames {
    Install = "Install",
    Wait = "Wait",
    Activate = "Activate"
}
export interface ServiceWorkerUpdateRange {
    id: string;
    phase: ServiceWorkerUpdateNames;
    start: number;
    end: number;
}
