import * as Common from '../../core/common/common.js';
import * as UI from '../../ui/legacy/legacy.js';
export declare class MainImpl {
    _lateInitDonePromise: Promise<void>;
    constructor();
    static time(label: string): void;
    static timeEnd(label: string): void;
    _loaded(): Promise<void>;
    requestAndRegisterLocaleData(): Promise<void>;
    _createSettings(prefs: {
        [x: string]: string;
    }): void;
    _initializeExperiments(): void;
    _createAppUI(): Promise<void>;
    _showAppUI(appProvider: Object): Promise<void>;
    _initializeTarget(): Promise<void>;
    _lateInitialization(): void;
    lateInitDonePromiseForTest(): Promise<void> | null;
    _registerMessageSinkListener(): void;
    _revealSourceLine(event: Common.EventTarget.EventTargetEvent): void;
    _postDocumentKeyDown(event: Event): void;
    _redispatchClipboardEvent(event: Event): void;
    _contextMenuEventFired(event: Event): void;
    _addMainEventListeners(document: Document): void;
    _onSuspendStateChanged(): void;
    static _instanceForTest: MainImpl | null;
}
export declare class ZoomActionDelegate implements UI.ActionRegistration.ActionDelegate {
    static instance(opts?: {
        forceNew: boolean | null;
    }): ZoomActionDelegate;
    handleAction(context: UI.Context.Context, actionId: string): boolean;
}
export declare class SearchActionDelegate implements UI.ActionRegistration.ActionDelegate {
    static instance(opts?: {
        forceNew: boolean | null;
    }): SearchActionDelegate;
    handleAction(context: UI.Context.Context, actionId: string): boolean;
}
export declare class MainMenuItem implements UI.Toolbar.Provider {
    _item: UI.Toolbar.ToolbarMenuButton;
    constructor();
    static instance(opts?: {
        forceNew: boolean | null;
    }): MainMenuItem;
    item(): UI.Toolbar.ToolbarItem | null;
    _handleContextMenu(contextMenu: UI.ContextMenu.ContextMenu): void;
}
export declare class SettingsButtonProvider implements UI.Toolbar.Provider {
    _settingsButton: UI.Toolbar.ToolbarButton;
    private constructor();
    static instance(opts?: {
        forceNew: boolean | null;
    }): SettingsButtonProvider;
    item(): UI.Toolbar.ToolbarItem | null;
}
export declare class PauseListener {
    constructor();
    _debuggerPaused(event: Common.EventTarget.EventTargetEvent): void;
}
export declare function sendOverProtocol(method: string, params: Object | null): Promise<any[] | null>;
export declare class ReloadActionDelegate implements UI.ActionRegistration.ActionDelegate {
    static instance(opts?: {
        forceNew: boolean | null;
    }): ReloadActionDelegate;
    handleAction(context: UI.Context.Context, actionId: string): boolean;
}
