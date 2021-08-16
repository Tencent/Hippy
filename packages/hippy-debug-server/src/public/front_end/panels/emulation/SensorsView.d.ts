import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
export declare class SensorsView extends UI.Widget.VBox {
    _LocationSetting: Common.Settings.Setting<string>;
    _Location: SDK.EmulationModel.Location;
    _LocationOverrideEnabled: boolean;
    _fieldsetElement: HTMLFieldSetElement;
    _timezoneError: HTMLElement;
    _locationSelectElement: HTMLSelectElement;
    _latitudeInput: HTMLInputElement;
    _longitudeInput: HTMLInputElement;
    _timezoneInput: HTMLInputElement;
    _localeInput: HTMLInputElement;
    _latitudeSetter: (arg0: string) => void;
    _longitudeSetter: (arg0: string) => void;
    _timezoneSetter: (arg0: string) => void;
    _localeSetter: (arg0: string) => void;
    _localeError: HTMLElement;
    _customLocationsGroup: HTMLOptGroupElement;
    _deviceOrientationSetting: Common.Settings.Setting<string>;
    _deviceOrientation: SDK.EmulationModel.DeviceOrientation;
    _deviceOrientationOverrideEnabled: boolean;
    _deviceOrientationFieldset: HTMLFieldSetElement;
    _stageElement: HTMLElement;
    _orientationSelectElement: HTMLSelectElement;
    _alphaElement: HTMLInputElement;
    _betaElement: HTMLInputElement;
    _gammaElement: HTMLInputElement;
    _alphaSetter: (arg0: string) => void;
    _betaSetter: (arg0: string) => void;
    _gammaSetter: (arg0: string) => void;
    _orientationLayer: HTMLDivElement;
    _boxElement?: HTMLElement;
    _boxMatrix?: DOMMatrix;
    _mouseDownVector?: UI.Geometry.Vector | null;
    _originalBoxMatrix?: DOMMatrix;
    constructor();
    static instance(): SensorsView;
    _createLocationSection(location: SDK.EmulationModel.Location): void;
    _LocationSelectChanged(): void;
    _applyLocationUserInput(): void;
    _applyLocation(): void;
    _clearFieldsetElementInputs(): void;
    _createDeviceOrientationSection(): void;
    _enableOrientationFields(disable: boolean | null): void;
    _orientationSelectChanged(): void;
    _applyDeviceOrientation(): void;
    _setSelectElementLabel(selectElement: HTMLSelectElement, labelValue: string): void;
    _applyDeviceOrientationUserInput(): void;
    _resetDeviceOrientation(): void;
    _setDeviceOrientation(deviceOrientation: SDK.EmulationModel.DeviceOrientation | null, modificationSource: DeviceOrientationModificationSource): void;
    _createAxisInput(parentElement: Element, input: HTMLInputElement, label: string, validator: (arg0: string) => {
        valid: boolean;
        errorMessage: (string | undefined);
    }): (arg0: string) => void;
    _createDeviceOrientationOverrideElement(deviceOrientation: SDK.EmulationModel.DeviceOrientation): HTMLFieldSetElement;
    _setBoxOrientation(deviceOrientation: SDK.EmulationModel.DeviceOrientation, animate: boolean): void;
    _onBoxDrag(event: MouseEvent): boolean;
    _onBoxDragStart(event: MouseEvent): boolean;
    _calculateRadiusVector(x: number, y: number): UI.Geometry.Vector | null;
    _appendTouchControl(): void;
    _appendIdleEmulator(): void;
}
export declare const enum DeviceOrientationModificationSource {
    UserInput = "userInput",
    UserDrag = "userDrag",
    ResetButton = "resetButton",
    SelectPreset = "selectPreset"
}
/** {string} */
export declare const NonPresetOptions: {
    NoOverride: string;
    Custom: string;
    Unavailable: string;
};
export declare class PresetOrientations {
    static get Orientations(): {
        title: string;
        value: {
            title: string;
            orientation: string;
        }[];
    }[];
}
export declare class ShowActionDelegate implements UI.ActionRegistration.ActionDelegate {
    handleAction(_context: UI.Context.Context, _actionId: string): boolean;
    static instance(opts?: {
        forceNew: boolean | null;
    }): ShowActionDelegate;
}
export declare const ShiftDragOrientationSpeed = 16;
