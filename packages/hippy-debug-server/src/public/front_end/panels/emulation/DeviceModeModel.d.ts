import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Protocol from '../../generated/protocol.js';
import * as UI from '../../ui/legacy/legacy.js';
import type { EmulatedDevice, Mode } from './EmulatedDevices.js';
export declare class DeviceModeModel extends Common.ObjectWrapper.ObjectWrapper implements SDK.TargetManager.SDKModelObserver<SDK.EmulationModel.EmulationModel> {
    _screenRect: UI.Geometry.Rect;
    _visiblePageRect: UI.Geometry.Rect;
    _availableSize: UI.Geometry.Size;
    _preferredSize: UI.Geometry.Size;
    _initialized: boolean;
    _appliedDeviceSize: UI.Geometry.Size;
    _appliedDeviceScaleFactor: number;
    _appliedUserAgentType: UA;
    _experimentDualScreenSupport: boolean;
    _webPlatformExperimentalFeaturesEnabled: boolean;
    _scaleSetting: Common.Settings.Setting<number>;
    _scale: number;
    _widthSetting: Common.Settings.Setting<number>;
    _heightSetting: Common.Settings.Setting<number>;
    _uaSetting: Common.Settings.Setting<UA>;
    _deviceScaleFactorSetting: Common.Settings.Setting<number>;
    _deviceOutlineSetting: Common.Settings.Setting<boolean>;
    _toolbarControlsEnabledSetting: Common.Settings.Setting<boolean>;
    _type: Type;
    _device: EmulatedDevice | null;
    _mode: Mode | null;
    _fitScale: number;
    _touchEnabled: boolean;
    _touchMobile: boolean;
    _emulationModel: SDK.EmulationModel.EmulationModel | null;
    _onModelAvailable: (() => void) | null;
    _emulatedPageSize?: UI.Geometry.Size;
    _outlineRect?: UI.Geometry.Rect;
    private constructor();
    static instance(opts?: {
        forceNew: null;
    }): DeviceModeModel;
    static widthValidator(value: string): {
        valid: boolean;
        errorMessage: (string | undefined);
    };
    static heightValidator(value: string): {
        valid: boolean;
        errorMessage: (string | undefined);
    };
    static scaleValidator(value: string): {
        valid: boolean;
        errorMessage: (string | undefined);
    };
    setAvailableSize(availableSize: UI.Geometry.Size, preferredSize: UI.Geometry.Size): void;
    emulate(type: Type, device: EmulatedDevice | null, mode: Mode | null, scale?: number): void;
    setWidth(width: number): void;
    setWidthAndScaleToFit(width: number): void;
    setHeight(height: number): void;
    setHeightAndScaleToFit(height: number): void;
    setScale(scale: number): void;
    device(): EmulatedDevice | null;
    mode(): Mode | null;
    type(): Type;
    screenImage(): string;
    outlineImage(): string;
    outlineRect(): UI.Geometry.Rect | null;
    screenRect(): UI.Geometry.Rect;
    visiblePageRect(): UI.Geometry.Rect;
    scale(): number;
    fitScale(): number;
    appliedDeviceSize(): UI.Geometry.Size;
    appliedDeviceScaleFactor(): number;
    appliedUserAgentType(): UA;
    isFullHeight(): boolean;
    _isMobile(): boolean;
    enabledSetting(): Common.Settings.Setting<boolean>;
    scaleSetting(): Common.Settings.Setting<number>;
    uaSetting(): Common.Settings.Setting<UA>;
    deviceScaleFactorSetting(): Common.Settings.Setting<number>;
    deviceOutlineSetting(): Common.Settings.Setting<boolean>;
    toolbarControlsEnabledSetting(): Common.Settings.Setting<boolean>;
    reset(): void;
    modelAdded(emulationModel: SDK.EmulationModel.EmulationModel): void;
    modelRemoved(emulationModel: SDK.EmulationModel.EmulationModel): void;
    inspectedURL(): string | null;
    _onFrameChange(): void;
    _scaleSettingChanged(): void;
    _widthSettingChanged(): void;
    _heightSettingChanged(): void;
    _uaSettingChanged(): void;
    _deviceScaleFactorSettingChanged(): void;
    _deviceOutlineSettingChanged(): void;
    _preferredScaledWidth(): number;
    _preferredScaledHeight(): number;
    _currentOutline(): UI.Geometry.Insets;
    _currentInsets(): UI.Geometry.Insets;
    _getScreenOrientationType(): Protocol.Emulation.ScreenOrientationType;
    _calculateAndEmulate(resetPageScaleFactor: boolean): void;
    _calculateFitScale(screenWidth: number, screenHeight: number, outline?: UI.Geometry.Insets, insets?: UI.Geometry.Insets): number;
    setSizeAndScaleToFit(width: number, height: number): void;
    _applyUserAgent(userAgent: string, userAgentMetadata: Protocol.Emulation.UserAgentMetadata | null): void;
    _applyDeviceMetrics(screenSize: UI.Geometry.Size, insets: UI.Geometry.Insets, outline: UI.Geometry.Insets, scale: number, deviceScaleFactor: number, mobile: boolean, screenOrientation: Protocol.Emulation.ScreenOrientationType | null, resetPageScaleFactor: boolean, forceMetricsOverride?: boolean | undefined): void;
    exitHingeMode(): void;
    webPlatformExperimentalFeaturesEnabled(): boolean;
    shouldReportDisplayFeature(): boolean;
    captureScreenshot(fullSize: boolean, clip?: Protocol.Page.Viewport): Promise<string | null>;
    _applyTouch(touchEnabled: boolean, mobile: boolean): void;
    _showHingeIfApplicable(overlayModel: SDK.OverlayModel.OverlayModel): void;
    _getDisplayFeatureOrientation(): Protocol.Emulation.DisplayFeatureOrientation;
    _getDisplayFeature(): Protocol.Emulation.DisplayFeature | null;
}
export declare const enum Events {
    Updated = "Updated"
}
export declare enum Type {
    None = "None",
    Responsive = "Responsive",
    Device = "Device"
}
export declare enum UA {
    Mobile = "Mobile",
    MobileNoTouch = "Mobile (no touch)",
    Desktop = "Desktop",
    DesktopTouch = "Desktop (touch)"
}
export declare const MinDeviceSize = 50;
export declare const MaxDeviceSize = 9999;
export declare const MinDeviceScaleFactor = 0;
export declare const MaxDeviceScaleFactor = 10;
export declare const MaxDeviceNameLength = 50;
export declare const _defaultMobileUserAgent: string;
export declare const _defaultMobileUserAgentMetadata: {
    platform: string;
    platformVersion: string;
    architecture: string;
    model: string;
    mobile: boolean;
};
export declare const defaultMobileScaleFactor = 2;
