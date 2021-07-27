import * as UI from '../../ui/legacy/legacy.js';
export declare class InspectedPagePlaceholder extends UI.Widget.Widget {
    _updateId?: number;
    constructor();
    static instance(opts?: {
        forceNew: null;
    }): InspectedPagePlaceholder;
    onResize(): void;
    restoreMinimumSize(): void;
    clearMinimumSize(): void;
    _dipPageRect(): {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    update(force?: boolean): void;
}
export declare const enum Events {
    Update = "Update"
}
