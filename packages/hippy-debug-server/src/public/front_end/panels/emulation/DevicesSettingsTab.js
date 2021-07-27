// Copyright 2015 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as i18n from '../../core/i18n/i18n.js';
import * as UI from '../../ui/legacy/legacy.js';
import { DeviceModeModel, MaxDeviceNameLength, UA } from './DeviceModeModel.js';
import { Capability, EmulatedDevice, EmulatedDevicesList, Horizontal, Vertical } from './EmulatedDevices.js';
import { parseBrandsList, serializeBrandsList, validateAsStructuredHeadersString } from './UserAgentMetadata.js';
let devicesSettingsTabInstance;
const UIStrings = {
    /**
    *@description Title for a section of the UI that shows all of the devices the user can emulate, in the Device Toolbar.
    */
    emulatedDevices: 'Emulated Devices',
    /**
    *@description Button to add a custom device (e.g. phone, tablet) the Device Toolbar.
    */
    addCustomDevice: 'Add custom device...',
    /**
    *@description Label/title for UI to add a new custom device type. Device means mobile/tablet etc.
    */
    device: 'Device',
    /**
    *@description Placeholder for text input for the name of a custom device.
    */
    deviceName: 'Device Name',
    /**
    *@description Placeholder text for text input for the width of a custom device in pixels.
    */
    width: 'Width',
    /**
    *@description Placeholder text for text input for the height of a custom device in pixels.
    */
    height: 'Height',
    /**
    *@description Placeholder text for text input for the height/width ratio of a custom device in pixels.
    */
    devicePixelRatio: 'Device pixel ratio',
    /**
    * @description Field in Devices pane letting users customize which browser names and major versions
    * edited device presents via User Agent Client Hints. Placeholder is locked text.
    */
    UABrands: 'UA brands list (e.g. `"Chromium";v="87"`)',
    /**
    *@description Title of foldable group of options in Devices pane letting users customize what
    *information is sent about the browser and device via user agent client hints functionality. 'user
    *agent' refers to the browser/unique ID the user is using. 'hints' is a noun.
    */
    userAgentClient: 'User agent client hints',
    /**
    *@description Tooltip text for the foldable 'User agent client hints' section's help button
    */
    userAgentClientHintsAre: 'User agent client hints are an alternative to the user agent string that identify the browser and the device in a more structured way with better privacy accounting. Click the button to learn more.',
    /**
    *@description Label in the Devices settings pane for the user agent string input of a custom device
    */
    userAgentString: 'User agent string',
    /**
    *@description Tooltip text for a drop-down in the Devices settings pane, for the 'user agent type' input of a custom device.
    * 'Type' refers to different options e.g. mobile or desktop.
    */
    userAgentType: 'User agent type',
    /**
    *@description Error message in the Devices settings pane that declares the maximum length of the device name input
    *@example {50} PH1
    */
    deviceNameMustBeLessThanS: 'Device name must be less than {PH1} characters.',
    /**
    *@description Error message in the Devices settings pane that declares that the device name input must not be empty
    */
    deviceNameCannotBeEmpty: 'Device name cannot be empty.',
    /**
    *@description Field in the Devices pane letting customize precise browser version the edited device presents via User Agent Client Hints.
    */
    fullBrowserVersion: 'Full browser version (e.g. 87.0.4280.88)',
    /**
    *@description Field in Devices pane letting customize which operating system the edited device presents via User Agent Client Hints. Example should be kept exactly.
    */
    platform: 'Platform (e.g. Android)',
    /**
    *@description Field in Devices pane letting customize which operating system version the edited device presents via User Agent Client Hints
    */
    platformVersion: 'Platform version',
    /**
    *@description Field in Devices pane letting customize which CPU architecture the edited device presents via User Agent Client Hints. Example should be kept exactly.
    */
    architecture: 'Architecture (e.g. x86)',
    /**
    *@description Field Field in the Devices pane letting customize the name the edited device presents via User Agent Client Hints
    */
    deviceModel: 'Device model',
    /**
    *@description Field Error message in the Device settings pane that shows that the entered value has characters that can't be represented in the corresponding User Agent Client Hints
    */
    notRepresentable: 'Not representable as structured headers string.',
    /**
    *@description Field Error message in the Device settings pane that shows that the entered brands list has wrong syntax
    */
    brandsList: 'Brands list is not a valid structured fields list.',
    /**
    *@description Field Error message in the Device settings pane that shows that the entered brands list includes the wrong information
    */
    brandsListMust: 'Brands list must consist of strings, each with a v parameter with a string value.',
};
const str_ = i18n.i18n.registerUIStrings('panels/emulation/DevicesSettingsTab.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class DevicesSettingsTab extends UI.Widget.VBox {
    containerElement;
    _addCustomButton;
    _list;
    _muteUpdate;
    _emulatedDevicesList;
    _editor;
    constructor() {
        super();
        this.element.classList.add('settings-tab-container');
        this.element.classList.add('devices-settings-tab');
        this.registerRequiredCSS('panels/emulation/devicesSettingsTab.css', { enableLegacyPatching: false });
        const header = this.element.createChild('header');
        UI.UIUtils.createTextChild(header.createChild('h1'), i18nString(UIStrings.emulatedDevices));
        this.containerElement = this.element.createChild('div', 'settings-container-wrapper')
            .createChild('div', 'settings-tab settings-content settings-container');
        const buttonsRow = this.containerElement.createChild('div', 'devices-button-row');
        this._addCustomButton =
            UI.UIUtils.createTextButton(i18nString(UIStrings.addCustomDevice), this._addCustomDevice.bind(this));
        this._addCustomButton.id = 'custom-device-add-button';
        buttonsRow.appendChild(this._addCustomButton);
        this._list = new UI.ListWidget.ListWidget(this, false /* delegatesFocus */);
        this._list.registerRequiredCSS('panels/emulation/devicesSettingsTab.css', { enableLegacyPatching: false });
        this._list.element.classList.add('devices-list');
        this._list.show(this.containerElement);
        this._muteUpdate = false;
        this._emulatedDevicesList = EmulatedDevicesList.instance();
        this._emulatedDevicesList.addEventListener("CustomDevicesUpdated" /* CustomDevicesUpdated */, this._devicesUpdated, this);
        this._emulatedDevicesList.addEventListener("StandardDevicesUpdated" /* StandardDevicesUpdated */, this._devicesUpdated, this);
        this.setDefaultFocusedElement(this._addCustomButton);
    }
    static instance() {
        if (!devicesSettingsTabInstance) {
            devicesSettingsTabInstance = new DevicesSettingsTab();
        }
        return devicesSettingsTabInstance;
    }
    wasShown() {
        super.wasShown();
        this._devicesUpdated();
    }
    _devicesUpdated() {
        if (this._muteUpdate) {
            return;
        }
        this._list.clear();
        let devices = this._emulatedDevicesList.custom().slice();
        for (let i = 0; i < devices.length; ++i) {
            this._list.appendItem(devices[i], true);
        }
        this._list.appendSeparator();
        devices = this._emulatedDevicesList.standard().slice();
        devices.sort(EmulatedDevice.deviceComparator);
        for (let i = 0; i < devices.length; ++i) {
            this._list.appendItem(devices[i], false);
        }
    }
    _muteAndSaveDeviceList(custom) {
        this._muteUpdate = true;
        if (custom) {
            this._emulatedDevicesList.saveCustomDevices();
        }
        else {
            this._emulatedDevicesList.saveStandardDevices();
        }
        this._muteUpdate = false;
    }
    _addCustomDevice() {
        const device = new EmulatedDevice();
        device.deviceScaleFactor = 0;
        device.horizontal.width = 700;
        device.horizontal.height = 400;
        device.vertical.width = 400;
        device.vertical.height = 700;
        this._list.addNewItem(this._emulatedDevicesList.custom().length, device);
    }
    _toNumericInputValue(value) {
        return value ? String(value) : '';
    }
    renderItem(device, editable) {
        const label = document.createElement('label');
        label.classList.add('devices-list-item');
        const checkbox = label.createChild('input', 'devices-list-checkbox');
        checkbox.type = 'checkbox';
        checkbox.checked = device.show();
        checkbox.addEventListener('click', onItemClicked.bind(this), false);
        const span = document.createElement('span');
        span.classList.add('device-name');
        span.appendChild(document.createTextNode(device.title));
        label.appendChild(span);
        return label;
        function onItemClicked(event) {
            const show = checkbox.checked;
            device.setShow(show);
            this._muteAndSaveDeviceList(editable);
            event.consume();
        }
    }
    removeItemRequested(item) {
        this._emulatedDevicesList.removeCustomDevice(item);
    }
    commitEdit(device, editor, isNew) {
        device.title = editor.control('title').value.trim();
        device.vertical.width = editor.control('width').value ? parseInt(editor.control('width').value, 10) : 0;
        device.vertical.height = editor.control('height').value ? parseInt(editor.control('height').value, 10) : 0;
        device.horizontal.width = device.vertical.height;
        device.horizontal.height = device.vertical.width;
        device.deviceScaleFactor = editor.control('scale').value ? parseFloat(editor.control('scale').value) : 0;
        device.userAgent = editor.control('user-agent').value;
        device.modes = [];
        device.modes.push({ title: '', orientation: Vertical, insets: new UI.Geometry.Insets(0, 0, 0, 0), image: null });
        device.modes.push({ title: '', orientation: Horizontal, insets: new UI.Geometry.Insets(0, 0, 0, 0), image: null });
        device.capabilities = [];
        const uaType = editor.control('ua-type').value;
        if (uaType === UA.Mobile || uaType === UA.MobileNoTouch) {
            device.capabilities.push(Capability.Mobile);
        }
        if (uaType === UA.Mobile || uaType === UA.DesktopTouch) {
            device.capabilities.push(Capability.Touch);
        }
        const brandsOrError = parseBrandsList(editor.control('brands').value.trim(), 'unused_err1', 'unused_err2');
        device.userAgentMetadata = {
            brands: (typeof brandsOrError === 'string' ? [] : brandsOrError),
            fullVersion: editor.control('full-version').value.trim(),
            platform: editor.control('platform').value.trim(),
            platformVersion: editor.control('platform-version').value.trim(),
            architecture: editor.control('arch').value.trim(),
            model: editor.control('model').value.trim(),
            mobile: (uaType === UA.Mobile || uaType === UA.MobileNoTouch),
        };
        if (isNew) {
            this._emulatedDevicesList.addCustomDevice(device);
        }
        else {
            this._emulatedDevicesList.saveCustomDevices();
        }
        this._addCustomButton.scrollIntoViewIfNeeded();
        this._addCustomButton.focus();
    }
    beginEdit(device) {
        const editor = this._createEditor();
        editor.control('title').value = device.title;
        editor.control('width').value = this._toNumericInputValue(device.vertical.width);
        editor.control('height').value = this._toNumericInputValue(device.vertical.height);
        editor.control('scale').value = this._toNumericInputValue(device.deviceScaleFactor);
        editor.control('user-agent').value = device.userAgent;
        let uaType;
        if (device.mobile()) {
            uaType = device.touch() ? UA.Mobile : UA.MobileNoTouch;
        }
        else {
            uaType = device.touch() ? UA.DesktopTouch : UA.Desktop;
        }
        editor.control('ua-type').value = uaType;
        if (device.userAgentMetadata) {
            editor.control('brands').value = serializeBrandsList(device.userAgentMetadata.brands || []);
            editor.control('full-version').value = device.userAgentMetadata.fullVersion || '';
            editor.control('platform').value = device.userAgentMetadata.platform;
            editor.control('platform-version').value = device.userAgentMetadata.platformVersion;
            editor.control('arch').value = device.userAgentMetadata.architecture;
            editor.control('model').value = device.userAgentMetadata.model;
        }
        return editor;
    }
    _createEditor() {
        if (this._editor) {
            return this._editor;
        }
        const editor = new UI.ListWidget.Editor();
        this._editor = editor;
        const content = editor.contentElement();
        const deviceFields = content.createChild('div', 'devices-edit-fields');
        UI.UIUtils.createTextChild(deviceFields.createChild('b'), i18nString(UIStrings.device));
        const deviceNameField = editor.createInput('title', 'text', i18nString(UIStrings.deviceName), titleValidator);
        deviceFields.createChild('div', 'hbox').appendChild(deviceNameField);
        deviceNameField.id = 'custom-device-name-field';
        const screen = deviceFields.createChild('div', 'hbox');
        screen.appendChild(editor.createInput('width', 'text', i18nString(UIStrings.width), widthValidator));
        screen.appendChild(editor.createInput('height', 'text', i18nString(UIStrings.height), heightValidator));
        const dpr = editor.createInput('scale', 'text', i18nString(UIStrings.devicePixelRatio), scaleValidator);
        dpr.classList.add('device-edit-fixed');
        screen.appendChild(dpr);
        const uaStringFields = content.createChild('div', 'devices-edit-fields');
        UI.UIUtils.createTextChild(uaStringFields.createChild('b'), i18nString(UIStrings.userAgentString));
        const ua = uaStringFields.createChild('div', 'hbox');
        ua.appendChild(editor.createInput('user-agent', 'text', i18nString(UIStrings.userAgentString), () => {
            return { valid: true, errorMessage: undefined };
        }));
        const uaTypeOptions = [UA.Mobile, UA.MobileNoTouch, UA.Desktop, UA.DesktopTouch];
        const uaType = editor.createSelect('ua-type', uaTypeOptions, () => {
            return { valid: true, errorMessage: undefined };
        }, i18nString(UIStrings.userAgentType));
        uaType.classList.add('device-edit-fixed');
        ua.appendChild(uaType);
        const uaChFields = content.createChild('div', 'devices-edit-client-hints-heading');
        UI.UIUtils.createTextChild(uaChFields.createChild('b'), i18nString(UIStrings.userAgentClient));
        const helpIconWrapper = document.createElement('a');
        helpIconWrapper.href = 'https://web.dev/user-agent-client-hints/';
        helpIconWrapper.target = '_blank';
        const icon = UI.Icon.Icon.create('mediumicon-info', 'help-icon');
        helpIconWrapper.appendChild(icon);
        helpIconWrapper.title = i18nString(UIStrings.userAgentClientHintsAre);
        // Prevent the editor grabbing the enter key, letting the default behavior happen.
        helpIconWrapper.addEventListener('keydown', event => {
            if (event.key === 'Enter') {
                event.stopPropagation();
            }
        });
        uaChFields.appendChild(helpIconWrapper);
        const tree = new UI.TreeOutline.TreeOutlineInShadow();
        tree.registerRequiredCSS('panels/emulation/devicesSettingsTab.css', { enableLegacyPatching: false });
        tree.setShowSelectionOnKeyboardFocus(true, false);
        const treeRoot = new UI.TreeOutline.TreeElement(uaChFields, true);
        tree.appendChild(treeRoot);
        // Select the folder to make left/right arrows work as expected; don't change focus, however, since it should start with the device name field.
        treeRoot.select(true, false);
        content.appendChild(tree.element);
        function addToTree(input) {
            const treeNode = new UI.TreeOutline.TreeElement(input, false);
            // The inputs themselves are selectable, no need for the tree nodes to be.
            treeNode.selectable = false;
            treeNode.listItemElement.classList.add('devices-edit-client-hints-field');
            treeRoot.appendChild(treeNode);
        }
        const brands = editor.createInput('brands', 'text', i18nString(UIStrings.UABrands), brandListValidator);
        addToTree(brands);
        const fullVersion = editor.createInput('full-version', 'text', i18nString(UIStrings.fullBrowserVersion), chStringValidator);
        addToTree(fullVersion);
        const platform = editor.createInput('platform', 'text', i18nString(UIStrings.platform), chStringValidator);
        addToTree(platform);
        const platformVersion = editor.createInput('platform-version', 'text', i18nString(UIStrings.platformVersion), chStringValidator);
        addToTree(platformVersion);
        const arch = editor.createInput('arch', 'text', i18nString(UIStrings.architecture), chStringValidator);
        addToTree(arch);
        const model = editor.createInput('model', 'text', i18nString(UIStrings.deviceModel), chStringValidator);
        addToTree(model);
        return editor;
        function chStringValidator(item, index, input) {
            return validateAsStructuredHeadersString(input.value, i18nString(UIStrings.notRepresentable));
        }
        function brandListValidator(item, index, input) {
            const syntaxError = i18nString(UIStrings.brandsList);
            const structError = i18nString(UIStrings.brandsListMust);
            const errorOrResult = parseBrandsList(input.value, syntaxError, structError);
            if (typeof errorOrResult === 'string') {
                return { valid: false, errorMessage: errorOrResult };
            }
            return { valid: true, errorMessage: undefined };
        }
        function titleValidator(item, index, input) {
            let valid = false;
            let errorMessage;
            const value = input.value.trim();
            if (value.length >= MaxDeviceNameLength) {
                errorMessage = i18nString(UIStrings.deviceNameMustBeLessThanS, { PH1: MaxDeviceNameLength });
            }
            else if (value.length === 0) {
                errorMessage = i18nString(UIStrings.deviceNameCannotBeEmpty);
            }
            else {
                valid = true;
            }
            return { valid, errorMessage };
        }
        function widthValidator(item, index, input) {
            return DeviceModeModel.widthValidator(input.value);
        }
        function heightValidator(item, index, input) {
            return DeviceModeModel.heightValidator(input.value);
        }
        function scaleValidator(item, index, input) {
            return DeviceModeModel.scaleValidator(input.value);
        }
    }
}
//# sourceMappingURL=DevicesSettingsTab.js.map