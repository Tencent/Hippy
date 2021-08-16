import * as Common from '../../core/common/common.js';
import * as UI from '../../ui/legacy/legacy.js';
import { DeviceModeWrapper } from './DeviceModeWrapper.js';
import { InspectedPagePlaceholder } from './InspectedPagePlaceholder.js';
interface Event {
    data: {
        to: string;
        from: string;
        x: number;
        y: number;
        width: number;
        height: number;
    };
}
export declare class AdvancedApp implements Common.App.App {
    _rootSplitWidget: UI.SplitWidget.SplitWidget;
    _deviceModeView: DeviceModeWrapper;
    _inspectedPagePlaceholder: InspectedPagePlaceholder;
    _toolboxWindow?: Window | null;
    _toolboxRootView?: UI.RootView.RootView;
    _changingDockSide?: boolean;
    constructor();
    /**
     * Note: it's used by toolbox.ts without real type checks.
     */
    static _instance(): AdvancedApp;
    presentUI(document: Document): void;
    _openToolboxWindow(event: Event): void;
    toolboxLoaded(toolboxDocument: Document): void;
    _updateDeviceModeView(): void;
    _onBeforeDockSideChange(event: Event): void;
    _onDockSideChange(event?: Event): void;
    _onAfterDockSideChange(event: Event): void;
    _updateForDocked(dockSide: string): void;
    _updateForUndocked(): void;
    _isDocked(): boolean;
    _onSetInspectedPageBounds(event: Event): void;
}
export declare class AdvancedAppProvider implements Common.AppProvider.AppProvider {
    static instance(opts?: {
        forceNew: boolean | null;
    }): AdvancedAppProvider;
    createApp(): Common.App.App;
}
export {};
