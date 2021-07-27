// Copyright (c) 2015 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as Host from '../../core/host/host.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
const UIStrings = {
    /**
    *@description Title for a group of cities
    */
    location: 'Location',
    /**
    *@description An option that appears in a drop-down to prevent the GPS location of the user from being overridden.
    */
    noOverride: 'No override',
    /**
    *@description Title of a section that contains overrides for the user's GPS location.
    */
    overrides: 'Overrides',
    /**
    *@description Text of button in Sensors View, takes the user to the custom location setting screen
    *where they can enter/edit custom locations.
    */
    manage: 'Manage',
    /**
    *@description Aria-label for location manage button in Sensors View
    */
    manageTheListOfLocations: 'Manage the list of locations',
    /**
    *@description Option in a drop-down input for selecting the GPS location of the user. As an
    *alternative to selecting a location from the list, the user can select this option and they are
    *prompted to enter the details for a new custom location.
    */
    other: 'Other…',
    /**
    *@description Title of a section in a drop-down input that contains error locations, e.g. to select
    *a location override that says 'the location is not available'. A noun.
    */
    error: 'Error',
    /**
    *@description A type of override where the geographic location of the user is not available.
    */
    locationUnavailable: 'Location unavailable',
    /**
    *@description Tooltip text telling the user how to change the value of a latitude/longitude input
    *text box. several shortcuts are provided for convenience. The placeholder can be different
    *keyboard keys, depending on the user's settings.
    *@example {Ctrl} PH1
    */
    adjustWithMousewheelOrUpdownKeys: 'Adjust with mousewheel or up/down keys. {PH1}: ±10, Shift: ±1, Alt: ±0.01',
    /**
    *@description Label for latitude of a GPS location.
    */
    latitude: 'Latitude',
    /**
    *@description Label for Longitude of a GPS location.
    */
    longitude: 'Longitude',
    /**
    *@description Label for the ID of a timezone for a particular location.
    */
    timezoneId: 'Timezone ID',
    /**
    *@description Label for the locale relevant to a custom location.
    */
    locale: 'Locale',
    /**
    *@description Label the orientation of a user's device e.g. tilt in 3D-space.
    */
    orientation: 'Orientation',
    /**
    *@description Option that when chosen, turns off device orientation override.
    */
    off: 'Off',
    /**
    *@description Option that when chosen, allows the user to enter a custom orientation for the device e.g. tilt in 3D-space.
    */
    customOrientation: 'Custom orientation',
    /**
    *@description Warning to the user they should enable the device orientation override, in order to
    *enable this input which allows them to interactively select orientation by dragging a 3D phone
    *model.
    */
    enableOrientationToRotate: 'Enable orientation to rotate',
    /**
    *@description Text telling the user how to use an input which allows them to interactively select
    *orientation by dragging a 3D phone model.
    */
    shiftdragHorizontallyToRotate: 'Shift+drag horizontally to rotate around the y-axis',
    /**
    *@description Message in the Sensors tool that is alerted (for screen readers) when the device orientation setting is changed
    *@example {180} PH1
    *@example {-90} PH2
    *@example {0} PH3
    */
    deviceOrientationSetToAlphaSBeta: 'Device orientation set to alpha: {PH1}, beta: {PH2}, gamma: {PH3}',
    /**
    *@description Text of orientation reset button in Sensors View of the Device Toolbar
    */
    reset: 'Reset',
    /**
    *@description Aria-label for orientation reset button in Sensors View. Command.
    */
    resetDeviceOrientation: 'Reset device orientation',
    /**
    *@description Description of the Touch select in Sensors tab
    */
    forcesTouchInsteadOfClick: 'Forces touch instead of click',
    /**
    *@description Description of the Emulate Idle State select in Sensors tab
    */
    forcesSelectedIdleStateEmulation: 'Forces selected idle state emulation',
    /**
    *@description Title for a group of configuration options in a drop-down input.
    */
    presets: 'Presets',
    /**
    *@description Drop-down input option for the orientation of a device in 3D space.
    */
    portrait: 'Portrait',
    /**
    *@description Drop-down input option for the orientation of a device in 3D space.
    */
    portraitUpsideDown: 'Portrait upside down',
    /**
    *@description Drop-down input option for the orientation of a device in 3D space.
    */
    landscapeLeft: 'Landscape left',
    /**
    *@description Drop-down input option for the orientation of a device in 3D space.
    */
    landscapeRight: 'Landscape right',
    /**
    *@description Drop-down input option for the orientation of a device in 3D space. Noun indicating
    *the display of the device is pointing up.
    */
    displayUp: 'Display up',
    /**
    *@description Drop-down input option for the orientation of a device in 3D space. Noun indicating
    *the display of the device is pointing down.
    */
    displayDown: 'Display down',
    /**
     *@description Label for one dimension of device orientation that the user can override.
     */
    alpha: '\u03B1 (alpha)',
    /**
     *@description Label for one dimension of device orientation that the user can override.
     */
    beta: '\u03B2 (beta)',
    /**
     *@description Label for one dimension of device orientation that the user can override.
     */
    gamma: '\u03B3 (gamma)',
};
const str_ = i18n.i18n.registerUIStrings('panels/emulation/SensorsView.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
// eslint-disable-next-line @typescript-eslint/naming-convention
let _instanceObject = null;
export class SensorsView extends UI.Widget.VBox {
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/naming-convention
    _LocationSetting;
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/naming-convention
    _Location;
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/naming-convention
    _LocationOverrideEnabled;
    _fieldsetElement;
    _timezoneError;
    _locationSelectElement;
    _latitudeInput;
    _longitudeInput;
    _timezoneInput;
    _localeInput;
    _latitudeSetter;
    _longitudeSetter;
    _timezoneSetter;
    _localeSetter;
    _localeError;
    _customLocationsGroup;
    _deviceOrientationSetting;
    _deviceOrientation;
    _deviceOrientationOverrideEnabled;
    _deviceOrientationFieldset;
    _stageElement;
    _orientationSelectElement;
    _alphaElement;
    _betaElement;
    _gammaElement;
    _alphaSetter;
    _betaSetter;
    _gammaSetter;
    _orientationLayer;
    _boxElement;
    _boxMatrix;
    _mouseDownVector;
    _originalBoxMatrix;
    constructor() {
        super(true);
        this.registerRequiredCSS('panels/emulation/sensors.css', { enableLegacyPatching: false });
        this.contentElement.classList.add('sensors-view');
        this._LocationSetting = Common.Settings.Settings.instance().createSetting('emulation.locationOverride', '');
        this._Location = SDK.EmulationModel.Location.parseSetting(this._LocationSetting.get());
        this._LocationOverrideEnabled = false;
        this._createLocationSection(this._Location);
        this.contentElement.createChild('div').classList.add('panel-section-separator');
        this._deviceOrientationSetting =
            Common.Settings.Settings.instance().createSetting('emulation.deviceOrientationOverride', '');
        this._deviceOrientation = SDK.EmulationModel.DeviceOrientation.parseSetting(this._deviceOrientationSetting.get());
        this._deviceOrientationOverrideEnabled = false;
        this._createDeviceOrientationSection();
        this.contentElement.createChild('div').classList.add('panel-section-separator');
        this._appendTouchControl();
        this.contentElement.createChild('div').classList.add('panel-section-separator');
        this._appendIdleEmulator();
        this.contentElement.createChild('div').classList.add('panel-section-separator');
    }
    static instance() {
        if (!_instanceObject) {
            _instanceObject = new SensorsView();
        }
        return _instanceObject;
    }
    _createLocationSection(location) {
        const geogroup = this.contentElement.createChild('section', 'sensors-group');
        const geogroupTitle = UI.UIUtils.createLabel(i18nString(UIStrings.location), 'sensors-group-title');
        geogroup.appendChild(geogroupTitle);
        const fields = geogroup.createChild('div', 'geo-fields');
        let selectedIndex = 0;
        const noOverrideOption = { title: i18nString(UIStrings.noOverride), location: NonPresetOptions.NoOverride };
        this._locationSelectElement = fields.createChild('select', 'chrome-select');
        UI.ARIAUtils.bindLabelToControl(geogroupTitle, this._locationSelectElement);
        // No override
        this._locationSelectElement.appendChild(new Option(noOverrideOption.title, noOverrideOption.location));
        this._customLocationsGroup = this._locationSelectElement.createChild('optgroup');
        this._customLocationsGroup.label = i18nString(UIStrings.overrides);
        const customLocations = Common.Settings.Settings.instance().moduleSetting('emulation.locations');
        const manageButton = UI.UIUtils.createTextButton(i18nString(UIStrings.manage), () => Common.Revealer.reveal(customLocations));
        UI.ARIAUtils.setAccessibleName(manageButton, i18nString(UIStrings.manageTheListOfLocations));
        fields.appendChild(manageButton);
        const fillCustomSettings = () => {
            if (!this._customLocationsGroup) {
                return;
            }
            this._customLocationsGroup.removeChildren();
            for (const [i, customLocation] of customLocations.get().entries()) {
                this._customLocationsGroup.appendChild(new Option(customLocation.title, JSON.stringify(customLocation)));
                if (location.latitude === customLocation.lat && location.longitude === customLocation.long) {
                    // If the location coming from settings matches the custom location, use its index to select the option
                    selectedIndex = i + 1;
                }
            }
        };
        customLocations.addChangeListener(fillCustomSettings);
        fillCustomSettings();
        // Other location
        const customLocationOption = { title: i18nString(UIStrings.other), location: NonPresetOptions.Custom };
        this._locationSelectElement.appendChild(new Option(customLocationOption.title, customLocationOption.location));
        // Error location.
        const group = this._locationSelectElement.createChild('optgroup');
        group.label = i18nString(UIStrings.error);
        group.appendChild(new Option(i18nString(UIStrings.locationUnavailable), NonPresetOptions.Unavailable));
        this._locationSelectElement.selectedIndex = selectedIndex;
        this._locationSelectElement.addEventListener('change', this._LocationSelectChanged.bind(this));
        this._fieldsetElement = fields.createChild('fieldset');
        this._fieldsetElement.disabled = !this._LocationOverrideEnabled;
        this._fieldsetElement.id = 'location-override-section';
        const latitudeGroup = this._fieldsetElement.createChild('div', 'latlong-group');
        const longitudeGroup = this._fieldsetElement.createChild('div', 'latlong-group');
        const timezoneGroup = this._fieldsetElement.createChild('div', 'latlong-group');
        const localeGroup = this._fieldsetElement.createChild('div', 'latlong-group');
        const cmdOrCtrl = Host.Platform.isMac() ? '\u2318' : 'Ctrl';
        const modifierKeyMessage = i18nString(UIStrings.adjustWithMousewheelOrUpdownKeys, { PH1: cmdOrCtrl });
        this._latitudeInput = UI.UIUtils.createInput('', 'number');
        latitudeGroup.appendChild(this._latitudeInput);
        this._latitudeInput.setAttribute('step', 'any');
        this._latitudeInput.value = '0';
        this._latitudeSetter = UI.UIUtils.bindInput(this._latitudeInput, this._applyLocationUserInput.bind(this), SDK.EmulationModel.Location.latitudeValidator, true, 0.1);
        this._latitudeSetter(String(location.latitude));
        UI.Tooltip.Tooltip.install(this._latitudeInput, modifierKeyMessage);
        latitudeGroup.appendChild(UI.UIUtils.createLabel(i18nString(UIStrings.latitude), 'latlong-title', this._latitudeInput));
        this._longitudeInput = UI.UIUtils.createInput('', 'number');
        longitudeGroup.appendChild(this._longitudeInput);
        this._longitudeInput.setAttribute('step', 'any');
        this._longitudeInput.value = '0';
        this._longitudeSetter = UI.UIUtils.bindInput(this._longitudeInput, this._applyLocationUserInput.bind(this), SDK.EmulationModel.Location.longitudeValidator, true, 0.1);
        this._longitudeSetter(String(location.longitude));
        UI.Tooltip.Tooltip.install(this._longitudeInput, modifierKeyMessage);
        longitudeGroup.appendChild(UI.UIUtils.createLabel(i18nString(UIStrings.longitude), 'latlong-title', this._longitudeInput));
        this._timezoneInput = UI.UIUtils.createInput('', 'text');
        timezoneGroup.appendChild(this._timezoneInput);
        this._timezoneInput.value = 'Europe/Berlin';
        this._timezoneSetter = UI.UIUtils.bindInput(this._timezoneInput, this._applyLocationUserInput.bind(this), SDK.EmulationModel.Location.timezoneIdValidator, false);
        this._timezoneSetter(location.timezoneId);
        timezoneGroup.appendChild(UI.UIUtils.createLabel(i18nString(UIStrings.timezoneId), 'timezone-title', this._timezoneInput));
        this._timezoneError = timezoneGroup.createChild('div', 'timezone-error');
        this._localeInput = UI.UIUtils.createInput('', 'text');
        localeGroup.appendChild(this._localeInput);
        this._localeInput.value = 'en-US';
        this._localeSetter = UI.UIUtils.bindInput(this._localeInput, this._applyLocationUserInput.bind(this), SDK.EmulationModel.Location.localeValidator, false);
        this._localeSetter(location.locale);
        localeGroup.appendChild(UI.UIUtils.createLabel(i18nString(UIStrings.locale), 'locale-title', this._localeInput));
        this._localeError = localeGroup.createChild('div', 'locale-error');
    }
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/naming-convention
    _LocationSelectChanged() {
        this._fieldsetElement.disabled = false;
        this._timezoneError.textContent = '';
        const value = this._locationSelectElement.options[this._locationSelectElement.selectedIndex].value;
        if (value === NonPresetOptions.NoOverride) {
            this._LocationOverrideEnabled = false;
            this._clearFieldsetElementInputs();
            this._fieldsetElement.disabled = true;
        }
        else if (value === NonPresetOptions.Custom) {
            this._LocationOverrideEnabled = true;
            const location = SDK.EmulationModel.Location.parseUserInput(this._latitudeInput.value.trim(), this._longitudeInput.value.trim(), this._timezoneInput.value.trim(), this._localeInput.value.trim());
            if (!location) {
                return;
            }
            this._Location = location;
        }
        else if (value === NonPresetOptions.Unavailable) {
            this._LocationOverrideEnabled = true;
            this._Location = new SDK.EmulationModel.Location(0, 0, '', '', true);
        }
        else {
            this._LocationOverrideEnabled = true;
            const coordinates = JSON.parse(value);
            this._Location = new SDK.EmulationModel.Location(coordinates.lat, coordinates.long, coordinates.timezoneId, coordinates.locale, false);
            this._latitudeSetter(coordinates.lat);
            this._longitudeSetter(coordinates.long);
            this._timezoneSetter(coordinates.timezoneId);
            this._localeSetter(coordinates.locale);
        }
        this._applyLocation();
        if (value === NonPresetOptions.Custom) {
            this._latitudeInput.focus();
        }
    }
    _applyLocationUserInput() {
        const location = SDK.EmulationModel.Location.parseUserInput(this._latitudeInput.value.trim(), this._longitudeInput.value.trim(), this._timezoneInput.value.trim(), this._localeInput.value.trim());
        if (!location) {
            return;
        }
        this._timezoneError.textContent = '';
        this._setSelectElementLabel(this._locationSelectElement, NonPresetOptions.Custom);
        this._Location = location;
        this._applyLocation();
    }
    _applyLocation() {
        if (this._LocationOverrideEnabled) {
            this._LocationSetting.set(this._Location.toSetting());
        }
        else {
            this._LocationSetting.set('');
        }
        for (const emulationModel of SDK.TargetManager.TargetManager.instance().models(SDK.EmulationModel.EmulationModel)) {
            emulationModel.emulateLocation(this._LocationOverrideEnabled ? this._Location : null).catch(err => {
                switch (err.type) {
                    case 'emulation-set-timezone': {
                        this._timezoneError.textContent = err.message;
                        break;
                    }
                    case 'emulation-set-locale': {
                        this._localeError.textContent = err.message;
                        break;
                    }
                }
            });
        }
    }
    _clearFieldsetElementInputs() {
        this._latitudeSetter('0');
        this._longitudeSetter('0');
        this._timezoneSetter('');
        this._localeSetter('');
    }
    _createDeviceOrientationSection() {
        const orientationGroup = this.contentElement.createChild('section', 'sensors-group');
        const orientationTitle = UI.UIUtils.createLabel(i18nString(UIStrings.orientation), 'sensors-group-title');
        orientationGroup.appendChild(orientationTitle);
        const orientationContent = orientationGroup.createChild('div', 'orientation-content');
        const fields = orientationContent.createChild('div', 'orientation-fields');
        const orientationOffOption = { title: i18nString(UIStrings.off), orientation: NonPresetOptions.NoOverride };
        const customOrientationOption = {
            title: i18nString(UIStrings.customOrientation),
            orientation: NonPresetOptions.Custom,
        };
        const orientationGroups = [{
                title: i18nString(UIStrings.presets),
                value: [
                    { title: i18nString(UIStrings.portrait), orientation: '[0, 90, 0]' },
                    { title: i18nString(UIStrings.portraitUpsideDown), orientation: '[180, -90, 0]' },
                    { title: i18nString(UIStrings.landscapeLeft), orientation: '[90, 0, -90]' },
                    { title: i18nString(UIStrings.landscapeRight), orientation: '[90, -180, -90]' },
                    { title: i18nString(UIStrings.displayUp), orientation: '[0, 0, 0]' },
                    { title: i18nString(UIStrings.displayDown), orientation: '[0, -180, 0]' },
                ],
            }];
        this._orientationSelectElement = this.contentElement.createChild('select', 'chrome-select');
        UI.ARIAUtils.bindLabelToControl(orientationTitle, this._orientationSelectElement);
        this._orientationSelectElement.appendChild(new Option(orientationOffOption.title, orientationOffOption.orientation));
        this._orientationSelectElement.appendChild(new Option(customOrientationOption.title, customOrientationOption.orientation));
        for (let i = 0; i < orientationGroups.length; ++i) {
            const groupElement = this._orientationSelectElement.createChild('optgroup');
            groupElement.label = orientationGroups[i].title;
            const group = orientationGroups[i].value;
            for (let j = 0; j < group.length; ++j) {
                groupElement.appendChild(new Option(group[j].title, group[j].orientation));
            }
        }
        this._orientationSelectElement.selectedIndex = 0;
        fields.appendChild(this._orientationSelectElement);
        this._orientationSelectElement.addEventListener('change', this._orientationSelectChanged.bind(this));
        this._deviceOrientationFieldset = this._createDeviceOrientationOverrideElement(this._deviceOrientation);
        this._stageElement = orientationContent.createChild('div', 'orientation-stage');
        this._orientationLayer = this._stageElement.createChild('div', 'orientation-layer');
        this._boxElement = this._orientationLayer.createChild('section', 'orientation-box orientation-element');
        this._boxElement.createChild('section', 'orientation-front orientation-element');
        this._boxElement.createChild('section', 'orientation-top orientation-element');
        this._boxElement.createChild('section', 'orientation-back orientation-element');
        this._boxElement.createChild('section', 'orientation-left orientation-element');
        this._boxElement.createChild('section', 'orientation-right orientation-element');
        this._boxElement.createChild('section', 'orientation-bottom orientation-element');
        UI.UIUtils.installDragHandle(this._stageElement, this._onBoxDragStart.bind(this), event => {
            this._onBoxDrag(event);
        }, null, '-webkit-grabbing', '-webkit-grab');
        fields.appendChild(this._deviceOrientationFieldset);
        this._enableOrientationFields(true);
        this._setBoxOrientation(this._deviceOrientation, false);
    }
    _enableOrientationFields(disable) {
        if (disable) {
            this._deviceOrientationFieldset.disabled = true;
            this._stageElement.classList.add('disabled');
            UI.Tooltip.Tooltip.install(this._stageElement, i18nString(UIStrings.enableOrientationToRotate));
        }
        else {
            this._deviceOrientationFieldset.disabled = false;
            this._stageElement.classList.remove('disabled');
            UI.Tooltip.Tooltip.install(this._stageElement, i18nString(UIStrings.shiftdragHorizontallyToRotate));
        }
    }
    _orientationSelectChanged() {
        const value = this._orientationSelectElement.options[this._orientationSelectElement.selectedIndex].value;
        this._enableOrientationFields(false);
        if (value === NonPresetOptions.NoOverride) {
            this._deviceOrientationOverrideEnabled = false;
            this._enableOrientationFields(true);
        }
        else if (value === NonPresetOptions.Custom) {
            this._deviceOrientationOverrideEnabled = true;
            this._alphaElement.focus();
        }
        else {
            const parsedValue = JSON.parse(value);
            this._deviceOrientationOverrideEnabled = true;
            this._deviceOrientation =
                new SDK.EmulationModel.DeviceOrientation(parsedValue[0], parsedValue[1], parsedValue[2]);
            this._setDeviceOrientation(this._deviceOrientation, "selectPreset" /* SelectPreset */);
        }
    }
    _applyDeviceOrientation() {
        if (this._deviceOrientationOverrideEnabled) {
            this._deviceOrientationSetting.set(this._deviceOrientation.toSetting());
        }
        for (const emulationModel of SDK.TargetManager.TargetManager.instance().models(SDK.EmulationModel.EmulationModel)) {
            emulationModel.emulateDeviceOrientation(this._deviceOrientationOverrideEnabled ? this._deviceOrientation : null);
        }
    }
    _setSelectElementLabel(selectElement, labelValue) {
        const optionValues = Array.prototype.map.call(selectElement.options, x => x.value);
        selectElement.selectedIndex = optionValues.indexOf(labelValue);
    }
    _applyDeviceOrientationUserInput() {
        this._setDeviceOrientation(SDK.EmulationModel.DeviceOrientation.parseUserInput(this._alphaElement.value.trim(), this._betaElement.value.trim(), this._gammaElement.value.trim()), "userInput" /* UserInput */);
        this._setSelectElementLabel(this._orientationSelectElement, NonPresetOptions.Custom);
    }
    _resetDeviceOrientation() {
        this._setDeviceOrientation(new SDK.EmulationModel.DeviceOrientation(0, 90, 0), "resetButton" /* ResetButton */);
        this._setSelectElementLabel(this._orientationSelectElement, '[0, 90, 0]');
    }
    _setDeviceOrientation(deviceOrientation, modificationSource) {
        if (!deviceOrientation) {
            return;
        }
        function roundAngle(angle) {
            return Math.round(angle * 10000) / 10000;
        }
        if (modificationSource !== "userInput" /* UserInput */) {
            // Even though the angles in |deviceOrientation| will not be rounded
            // here, their precision will be rounded by CSS when we change
            // |this._orientationLayer.style| in _setBoxOrientation().
            this._alphaSetter(String(roundAngle(deviceOrientation.alpha)));
            this._betaSetter(String(roundAngle(deviceOrientation.beta)));
            this._gammaSetter(String(roundAngle(deviceOrientation.gamma)));
        }
        const animate = modificationSource !== "userDrag" /* UserDrag */;
        this._setBoxOrientation(deviceOrientation, animate);
        this._deviceOrientation = deviceOrientation;
        this._applyDeviceOrientation();
        UI.ARIAUtils.alert(i18nString(UIStrings.deviceOrientationSetToAlphaSBeta, { PH1: deviceOrientation.alpha, PH2: deviceOrientation.beta, PH3: deviceOrientation.gamma }));
    }
    _createAxisInput(parentElement, input, label, validator) {
        const div = parentElement.createChild('div', 'orientation-axis-input-container');
        div.appendChild(input);
        div.appendChild(UI.UIUtils.createLabel(label, /* className */ '', input));
        return UI.UIUtils.bindInput(input, this._applyDeviceOrientationUserInput.bind(this), validator, true);
    }
    _createDeviceOrientationOverrideElement(deviceOrientation) {
        const fieldsetElement = document.createElement('fieldset');
        fieldsetElement.classList.add('device-orientation-override-section');
        const cellElement = fieldsetElement.createChild('td', 'orientation-inputs-cell');
        this._alphaElement = UI.UIUtils.createInput('', 'number');
        this._alphaElement.setAttribute('step', 'any');
        this._alphaSetter = this._createAxisInput(cellElement, this._alphaElement, i18nString(UIStrings.alpha), SDK.EmulationModel.DeviceOrientation.alphaAngleValidator);
        this._alphaSetter(String(deviceOrientation.alpha));
        this._betaElement = UI.UIUtils.createInput('', 'number');
        this._betaElement.setAttribute('step', 'any');
        this._betaSetter = this._createAxisInput(cellElement, this._betaElement, i18nString(UIStrings.beta), SDK.EmulationModel.DeviceOrientation.betaAngleValidator);
        this._betaSetter(String(deviceOrientation.beta));
        this._gammaElement = UI.UIUtils.createInput('', 'number');
        this._gammaElement.setAttribute('step', 'any');
        this._gammaSetter = this._createAxisInput(cellElement, this._gammaElement, i18nString(UIStrings.gamma), SDK.EmulationModel.DeviceOrientation.gammaAngleValidator);
        this._gammaSetter(String(deviceOrientation.gamma));
        const resetButton = UI.UIUtils.createTextButton(i18nString(UIStrings.reset), this._resetDeviceOrientation.bind(this), 'orientation-reset-button');
        UI.ARIAUtils.setAccessibleName(resetButton, i18nString(UIStrings.resetDeviceOrientation));
        resetButton.setAttribute('type', 'reset');
        cellElement.appendChild(resetButton);
        return fieldsetElement;
    }
    _setBoxOrientation(deviceOrientation, animate) {
        if (animate) {
            this._stageElement.classList.add('is-animating');
        }
        else {
            this._stageElement.classList.remove('is-animating');
        }
        // It is important to explain the multiple conversions happening here. A
        // few notes on coordinate spaces first:
        // 1. The CSS coordinate space is left-handed. X and Y are parallel to the
        //    screen, and Z is perpendicular to the screen. X is positive to the
        //    right, Y is positive downwards and Z increases towards the viewer.
        //    See https://drafts.csswg.org/css-transforms-2/#transform-rendering
        //    for more information.
        // 2. The Device Orientation coordinate space is right-handed. X and Y are
        //    parallel to the screen, and Z is perpenticular to the screen. X is
        //    positive to the right, Y is positive upwards and Z increases towards
        //    the viewer. See
        //    https://w3c.github.io/deviceorientation/#deviceorientation for more
        //    information.
        // 3. Additionally, the phone model we display is rotated +90 degrees in
        //    the X axis in the CSS coordinate space (i.e. when all angles are 0 we
        //    cannot see its screen in DevTools).
        //
        // |this._boxMatrix| is set in the Device Orientation coordinate space
        // because it represents the phone model we show users and also because the
        // calculations in UI.Geometry.EulerAngles assume this coordinate space (so
        // we apply the rotations in the Z-X'-Y'' order).
        // The CSS transforms, on the other hand, are done in the CSS coordinate
        // space, so we need to convert 2) to 1) while keeping 3) in mind. We can
        // cover 3) by swapping the Y and Z axes, and 2) by inverting the X axis.
        const { alpha, beta, gamma } = deviceOrientation;
        this._boxMatrix = new DOMMatrixReadOnly().rotate(0, 0, alpha).rotate(beta, 0, 0).rotate(0, gamma, 0);
        this._orientationLayer.style.transform = `rotateY(${alpha}deg) rotateX(${-beta}deg) rotateZ(${gamma}deg)`;
    }
    _onBoxDrag(event) {
        const mouseMoveVector = this._calculateRadiusVector(event.x, event.y);
        if (!mouseMoveVector) {
            return true;
        }
        if (!this._mouseDownVector) {
            return true;
        }
        event.consume(true);
        let axis, angle;
        if (event.shiftKey) {
            axis = new UI.Geometry.Vector(0, 0, 1);
            angle = (mouseMoveVector.x - this._mouseDownVector.x) * ShiftDragOrientationSpeed;
        }
        else {
            axis = UI.Geometry.crossProduct(this._mouseDownVector, mouseMoveVector);
            angle = UI.Geometry.calculateAngle(this._mouseDownVector, mouseMoveVector);
        }
        // See the comment in _setBoxOrientation() for a longer explanation about
        // the CSS coordinate space, the Device Orientation coordinate space and
        // the conversions we make. |axis| and |angle| are in the CSS coordinate
        // space, while |this._originalBoxMatrix| is rotated and in the Device
        // Orientation coordinate space, which is why we swap Y and Z and invert X.
        const currentMatrix = new DOMMatrixReadOnly().rotateAxisAngle(-axis.x, axis.z, axis.y, angle).multiply(this._originalBoxMatrix);
        const eulerAngles = UI.Geometry.EulerAngles.fromDeviceOrientationRotationMatrix(currentMatrix);
        const newOrientation = new SDK.EmulationModel.DeviceOrientation(eulerAngles.alpha, eulerAngles.beta, eulerAngles.gamma);
        this._setDeviceOrientation(newOrientation, "userDrag" /* UserDrag */);
        this._setSelectElementLabel(this._orientationSelectElement, NonPresetOptions.Custom);
        return false;
    }
    _onBoxDragStart(event) {
        if (!this._deviceOrientationOverrideEnabled) {
            return false;
        }
        this._mouseDownVector = this._calculateRadiusVector(event.x, event.y);
        this._originalBoxMatrix = this._boxMatrix;
        if (!this._mouseDownVector) {
            return false;
        }
        event.consume(true);
        return true;
    }
    _calculateRadiusVector(x, y) {
        const rect = this._stageElement.getBoundingClientRect();
        const radius = Math.max(rect.width, rect.height) / 2;
        const sphereX = (x - rect.left - rect.width / 2) / radius;
        const sphereY = (y - rect.top - rect.height / 2) / radius;
        const sqrSum = sphereX * sphereX + sphereY * sphereY;
        if (sqrSum > 0.5) {
            return new UI.Geometry.Vector(sphereX, sphereY, 0.5 / Math.sqrt(sqrSum));
        }
        return new UI.Geometry.Vector(sphereX, sphereY, Math.sqrt(1 - sqrSum));
    }
    _appendTouchControl() {
        const container = this.contentElement.createChild('div', 'touch-section');
        const control = UI.SettingsUI.createControlForSetting(Common.Settings.Settings.instance().moduleSetting('emulation.touch'), i18nString(UIStrings.forcesTouchInsteadOfClick));
        if (control) {
            container.appendChild(control);
        }
    }
    _appendIdleEmulator() {
        const container = this.contentElement.createChild('div', 'idle-section');
        const control = UI.SettingsUI.createControlForSetting(Common.Settings.Settings.instance().moduleSetting('emulation.idleDetection'), i18nString(UIStrings.forcesSelectedIdleStateEmulation));
        if (control) {
            container.appendChild(control);
        }
    }
}
/** {string} */
export const NonPresetOptions = {
    NoOverride: 'noOverride',
    Custom: 'custom',
    Unavailable: 'unavailable',
};
export class PresetOrientations {
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/naming-convention
    static get Orientations() {
        return [{
                title: i18nString(UIStrings.presets),
                value: [
                    { title: i18nString(UIStrings.portrait), orientation: '[0, 90, 0]' },
                    { title: i18nString(UIStrings.portraitUpsideDown), orientation: '[180, -90, 0]' },
                    { title: i18nString(UIStrings.landscapeLeft), orientation: '[90, 0, -90]' },
                    { title: i18nString(UIStrings.landscapeRight), orientation: '[90, -180, -90]' },
                    { title: i18nString(UIStrings.displayUp), orientation: '[0, 0, 0]' },
                    { title: i18nString(UIStrings.displayDown), orientation: '[0, -180, 0]' },
                ],
            }];
    }
}
let showActionDelegateInstance;
export class ShowActionDelegate {
    handleAction(_context, _actionId) {
        UI.ViewManager.ViewManager.instance().showView('sensors');
        return true;
    }
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!showActionDelegateInstance || forceNew) {
            showActionDelegateInstance = new ShowActionDelegate();
        }
        return showActionDelegateInstance;
    }
}
export const ShiftDragOrientationSpeed = 16;
//# sourceMappingURL=SensorsView.js.map