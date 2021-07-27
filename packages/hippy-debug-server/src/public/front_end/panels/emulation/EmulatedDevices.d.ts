import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
import type * as Protocol from '../../generated/protocol.js';
export declare class EmulatedDevice {
    title: string;
    type: string;
    order: number;
    vertical: Orientation;
    horizontal: Orientation;
    deviceScaleFactor: number;
    capabilities: string[];
    userAgent: string;
    userAgentMetadata: Protocol.Emulation.UserAgentMetadata | null;
    modes: Mode[];
    isDualScreen: boolean;
    verticalSpanned: Orientation;
    horizontalSpanned: Orientation;
    _show: string;
    _showByDefault: boolean;
    constructor();
    static fromJSONV1(json: any): EmulatedDevice | null;
    static deviceComparator(device1: EmulatedDevice, device2: EmulatedDevice): number;
    modesForOrientation(orientation: string): Mode[];
    getSpanPartner(mode: Mode): Mode | undefined;
    getRotationPartner(mode: Mode): Mode | null;
    _toJSON(): any;
    _orientationToJSON(orientation: Orientation): any;
    modeImage(mode: Mode): string;
    outlineImage(mode: Mode): string;
    orientationByName(name: string): Orientation;
    show(): boolean;
    setShow(show: boolean): void;
    copyShowFrom(other: EmulatedDevice): void;
    touch(): boolean;
    mobile(): boolean;
}
export declare const Horizontal = "horizontal";
export declare const Vertical = "vertical";
export declare const HorizontalSpanned = "horizontal-spanned";
export declare const VerticalSpanned = "vertical-spanned";
export declare const Type: {
    Phone: string;
    Tablet: string;
    Notebook: string;
    Desktop: string;
    Unknown: string;
};
export declare const Capability: {
    Touch: string;
    Mobile: string;
};
export declare const _Show: {
    Always: string;
    Default: string;
    Never: string;
};
export declare class EmulatedDevicesList extends Common.ObjectWrapper.ObjectWrapper {
    _standardSetting: Common.Settings.Setting<any[]>;
    _standard: Set<EmulatedDevice>;
    _customSetting: Common.Settings.Setting<any[]>;
    _custom: Set<EmulatedDevice>;
    constructor();
    static instance(): EmulatedDevicesList;
    _updateStandardDevices(): void;
    _listFromJSONV1(jsonArray: any[], result: Set<EmulatedDevice>): boolean;
    standard(): EmulatedDevice[];
    custom(): EmulatedDevice[];
    revealCustomSetting(): void;
    addCustomDevice(device: EmulatedDevice): void;
    removeCustomDevice(device: EmulatedDevice): void;
    saveCustomDevices(): void;
    saveStandardDevices(): void;
    _copyShowValues(from: Set<EmulatedDevice>, to: Set<EmulatedDevice>): void;
}
export declare const enum Events {
    CustomDevicesUpdated = "CustomDevicesUpdated",
    StandardDevicesUpdated = "StandardDevicesUpdated"
}
export interface Mode {
    title: string;
    orientation: string;
    insets: UI.Geometry.Insets;
    image: string | null;
}
export interface Orientation {
    width: number;
    height: number;
    outlineInsets: UI.Geometry.Insets | null;
    outlineImage: string | null;
    hinge: SDK.OverlayModel.Hinge | null;
}
export interface JSONMode {
    title: string;
    orientation: string;
    image?: string;
    insets: {
        left: number;
        right: number;
        top: number;
        bottom: number;
    };
}
