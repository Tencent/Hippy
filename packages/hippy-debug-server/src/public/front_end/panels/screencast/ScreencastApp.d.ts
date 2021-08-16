import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
import { ScreencastView } from './ScreencastView.js';
export declare class ScreencastApp implements Common.App.App, SDK.TargetManager.SDKModelObserver<SDK.ScreenCaptureModel.ScreenCaptureModel> {
    _enabledSetting: Common.Settings.Setting<boolean>;
    _toggleButton: UI.Toolbar.ToolbarToggle;
    _rootSplitWidget?: UI.SplitWidget.SplitWidget;
    _screenCaptureModel?: SDK.ScreenCaptureModel.ScreenCaptureModel;
    _screencastView?: ScreencastView;
    constructor();
    static _instance(): ScreencastApp;
    presentUI(document: Document): void;
    modelAdded(screenCaptureModel: SDK.ScreenCaptureModel.ScreenCaptureModel): void;
    modelRemoved(screenCaptureModel: SDK.ScreenCaptureModel.ScreenCaptureModel): void;
    _toggleButtonClicked(): void;
    _onScreencastEnabledChanged(): void;
}
export declare class ToolbarButtonProvider implements UI.Toolbar.Provider {
    static instance(opts?: {
        forceNew: boolean;
    }): ToolbarButtonProvider;
    item(): UI.Toolbar.ToolbarItem | null;
}
export declare class ScreencastAppProvider implements Common.AppProvider.AppProvider {
    static instance(opts?: {
        forceNew: boolean;
    }): ScreencastAppProvider;
    createApp(): Common.App.App;
}
