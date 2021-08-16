import type * as Common from '../../core/common/common.js';
import * as UI from '../../ui/legacy/legacy.js';
import { ConsoleView } from './ConsoleView.js';
export declare class ConsolePanel extends UI.Panel.Panel {
    _view: ConsoleView;
    constructor();
    static instance(opts?: {
        forceNew: boolean | null;
    }): ConsolePanel;
    static _updateContextFlavor(): void;
    wasShown(): void;
    willHide(): void;
    searchableView(): UI.SearchableView.SearchableView | null;
}
export declare class WrapperView extends UI.Widget.VBox {
    _view: ConsoleView;
    private constructor();
    static instance(): WrapperView;
    wasShown(): void;
    willHide(): void;
    _showViewInWrapper(): void;
}
export declare class ConsoleRevealer implements Common.Revealer.Revealer {
    static instance(opts?: {
        forceNew: boolean | null;
    }): ConsoleRevealer;
    reveal(_object: Object): Promise<void>;
}
