import * as Common from '../../core/common/common.js';
import type * as Host from '../../core/host/host.js';
export declare class ZoomManager extends Common.ObjectWrapper.ObjectWrapper {
    _frontendHost: Host.InspectorFrontendHostAPI.InspectorFrontendHostAPI;
    _zoomFactor: number;
    private constructor();
    static instance(opts?: {
        forceNew: boolean | null;
        win: Window | null;
        frontendHost: Host.InspectorFrontendHostAPI.InspectorFrontendHostAPI | null;
    }): ZoomManager;
    static removeInstance(): void;
    zoomFactor(): number;
    cssToDIP(value: number): number;
    dipToCSS(valueDIP: number): number;
    _onWindowResize(): void;
}
export declare const enum Events {
    ZoomChanged = "ZoomChanged"
}
