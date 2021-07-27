import type * as ProtocolProxyApi from '../../generated/protocol-proxy-api.js';
import * as Protocol from '../../generated/protocol.js';
import { CSSModel } from './CSSModel.js';
import { OverlayModel } from './OverlayModel.js';
import type { Target } from './Target.js';
import { SDKModel } from './SDKModel.js';
export declare class EmulationModel extends SDKModel {
    _emulationAgent: ProtocolProxyApi.EmulationApi;
    _pageAgent: ProtocolProxyApi.PageApi;
    _deviceOrientationAgent: ProtocolProxyApi.DeviceOrientationApi;
    _cssModel: CSSModel | null;
    _overlayModel: OverlayModel | null;
    _mediaConfiguration: Map<string, any>;
    _touchEnabled: boolean;
    _touchMobile: boolean;
    _customTouchEnabled: boolean;
    _touchConfiguration: {
        enabled: boolean;
        configuration: Protocol.Emulation.SetEmitTouchEventsForMouseRequestConfiguration;
    };
    constructor(target: Target);
    supportsDeviceEmulation(): boolean;
    resetPageScaleFactor(): Promise<void>;
    emulateDevice(metrics: Protocol.Page.SetDeviceMetricsOverrideRequest | null): Promise<any>;
    overlayModel(): OverlayModel | null;
    emulateLocation(location: Location | null): Promise<void>;
    emulateDeviceOrientation(deviceOrientation: DeviceOrientation | null): Promise<void>;
    setIdleOverride(emulationParams: {
        isUserActive: boolean;
        isScreenUnlocked: boolean;
    }): Promise<void>;
    clearIdleOverride(): Promise<void>;
    _emulateCSSMedia(type: string, features: {
        name: string;
        value: string;
    }[]): Promise<void>;
    _emulateVisionDeficiency(type: Protocol.Emulation.SetEmulatedVisionDeficiencyRequestType): Promise<void>;
    _setLocalFontsDisabled(disabled: boolean): void;
    _setDisabledImageTypes(imageTypes: Protocol.Emulation.DisabledImageType[]): void;
    setCPUThrottlingRate(rate: number): Promise<void>;
    emulateTouch(enabled: boolean, mobile: boolean): Promise<void>;
    overrideEmulateTouch(enabled: boolean): Promise<void>;
    _updateTouch(): Promise<void>;
    _updateCssMedia(): void;
}
export declare class Location {
    latitude: number;
    longitude: number;
    timezoneId: string;
    locale: string;
    error: boolean;
    constructor(latitude: number, longitude: number, timezoneId: string, locale: string, error: boolean);
    static parseSetting(value: string): Location;
    static parseUserInput(latitudeString: string, longitudeString: string, timezoneId: string, locale: string): Location | null;
    static latitudeValidator(value: string): {
        valid: boolean;
        errorMessage: (string | undefined);
    };
    static longitudeValidator(value: string): {
        valid: boolean;
        errorMessage: (string | undefined);
    };
    static timezoneIdValidator(value: string): {
        valid: boolean;
        errorMessage: (string | undefined);
    };
    static localeValidator(value: string): {
        valid: boolean;
        errorMessage: (string | undefined);
    };
    toSetting(): string;
    static DefaultGeoMockAccuracy: number;
}
export declare class DeviceOrientation {
    alpha: number;
    beta: number;
    gamma: number;
    constructor(alpha: number, beta: number, gamma: number);
    static parseSetting(value: string): DeviceOrientation;
    static parseUserInput(alphaString: string, betaString: string, gammaString: string): DeviceOrientation | null;
    static angleRangeValidator(value: string, interval: {
        minimum: number;
        maximum: number;
    }): {
        valid: boolean;
        errorMessage: undefined;
    };
    static alphaAngleValidator(value: string): {
        valid: boolean;
        errorMessage: (string | undefined);
    };
    static betaAngleValidator(value: string): {
        valid: boolean;
        errorMessage: (string | undefined);
    };
    static gammaAngleValidator(value: string): {
        valid: boolean;
        errorMessage: (string | undefined);
    };
    toSetting(): string;
}
