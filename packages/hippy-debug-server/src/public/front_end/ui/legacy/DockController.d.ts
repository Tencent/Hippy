import * as Common from '../../core/common/common.js';
import type { ActionDelegate } from './ActionRegistration.js';
import type { Context } from './Context.js';
import type { Provider, ToolbarItem } from './Toolbar.js';
import { ToolbarButton } from './Toolbar.js';
export declare class DockController extends Common.ObjectWrapper.ObjectWrapper {
    _canDock: boolean;
    _closeButton: ToolbarButton;
    _currentDockStateSetting: Common.Settings.Setting<string>;
    _lastDockStateSetting: Common.Settings.Setting<string>;
    _dockSide: string;
    _titles?: Common.UIString.LocalizedString[];
    _savedFocus?: Element | null;
    constructor(canDock: boolean);
    static instance(opts?: {
        forceNew: boolean | null;
        canDock: boolean;
    }): DockController;
    initialize(): void;
    _dockSideChanged(): void;
    dockSide(): string;
    canDock(): boolean;
    isVertical(): boolean;
    setDockSide(dockSide: string): void;
    _setIsDockedResponse(eventData: {
        from: string;
        to: string;
    }): void;
    _toggleDockSide(): void;
}
export declare const State: {
    DockedToBottom: string;
    DockedToRight: string;
    DockedToLeft: string;
    Undocked: string;
};
export declare const enum Events {
    BeforeDockSideChanged = "BeforeDockSideChanged",
    DockSideChanged = "DockSideChanged",
    AfterDockSideChanged = "AfterDockSideChanged"
}
export declare class ToggleDockActionDelegate implements ActionDelegate {
    static instance(opts?: {
        forceNew: boolean | null;
    }): ToggleDockActionDelegate;
    handleAction(_context: Context, _actionId: string): boolean;
}
export declare class CloseButtonProvider implements Provider {
    static instance(opts?: {
        forceNew: boolean | null;
    }): CloseButtonProvider;
    item(): ToolbarItem | null;
}
