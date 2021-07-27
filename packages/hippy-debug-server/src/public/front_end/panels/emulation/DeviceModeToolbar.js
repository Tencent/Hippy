// Copyright 2016 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as Host from '../../core/host/host.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as Root from '../../core/root/root.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as MobileThrottling from '../mobile_throttling/mobile_throttling.js';
import { defaultMobileScaleFactor, DeviceModeModel, Type, UA } from './DeviceModeModel.js';
import { EmulatedDevice, EmulatedDevicesList, Horizontal, Vertical } from './EmulatedDevices.js'; // eslint-disable-line no-unused-vars
const UIStrings = {
    /**
    * @description Title of the width input textbox in the Device Mode Toolbar, for the width of the
    * webpage in pixels.
    */
    width: 'Width',
    /**
    * @description Title of the height input textbox in the Device Mode Toolbar, for the height of the
    * webpage in pixels. 'leave empty for full' is an instruction to the user - the webpage will be
    * full-height if this textbox is left empty.
    */
    heightLeaveEmptyForFull: 'Height (leave empty for full)',
    /**
    * @description Tooltip text for a drop-down menu where the user can select the zoom percentage of
    * the webpage preview.
    */
    zoom: 'Zoom',
    /**
    * @description Tooltip tip for a drop-down menu where the user can select the device pixel ratio
    * (the ratio between the physical pixels on a screen and CSS logical pixels) of the webpage
    * preview.
    */
    devicePixelRatio: 'Device pixel ratio',
    /**
    * @description Tooltip tip for a drop-down menu where the user can select the device type e.g.
    * Mobile, Desktop.
    */
    deviceType: 'Device type',
    /**
    * @description Tooltip text for a button to disable Experimental Web Platform Features when they are enabled.
    */
    experimentalWebPlatformFeature: '"`Experimental Web Platform Feature`" flag is enabled. Click to disable it.',
    /**
    * @description Tooltip text for a button to enable Experimental Web Platform Features when they are disabled.
    */
    experimentalWebPlatformFeatureFlag: '"`Experimental Web Platform Feature`" flag is disabled. Click to enable it.',
    /**
    * @description Tooltip text for a 'three dots' style menu button which shows an expanded set of options.
    */
    moreOptions: 'More options',
    /**
    * @description A context menu item in the Device Mode Toolbar. This is a command to resize the
    * webpage preview to fit the current window. The placholder is the percentage of full-size that
    * will be displayed after fitting.
    * @example {30.0} PH1
    */
    fitToWindowF: 'Fit to window ({PH1}%)',
    /**
    * @description A checkbox setting that appears in the context menu for the zoom level, in the
    * Device Mode Toolbar.
    */
    autoadjustZoom: 'Auto-adjust zoom',
    /**
    * @description A menu item in the drop-down box that allows the user to select the device pixel
    * ratio. Labels the default value which varies between device types, represented by the
    * placeholder, which is a number. In the Device Mode Toolbar.
    * @example {4.3} PH1
    */
    defaultF: 'Default: {PH1}',
    /**
    * @description Command to hide the frame (like a picture frame) around the mobile device screen.
    */
    hideDeviceFrame: 'Hide device frame',
    /**
    * @description Command to show the frame (like a picture frame) around the mobile device screen.
    */
    showDeviceFrame: 'Show device frame',
    /**
    * @description Command to hide a display in the Device Mode Toolbar that shows the different media
    * queries for the device, above the device screen.
    * https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries/Using_media_queries
    */
    hideMediaQueries: 'Hide media queries',
    /**
    * @description Command to show a display in the Device Mode Toolbar that shows the different media
    * queries for the device, above the device screen.
    * https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries/Using_media_queries
    */
    showMediaQueries: 'Show media queries',
    /**
    * @description Command in the Device Mode Toolbar to hide a virtual ruler (for measuring),
    * displayed above and next to the device screen.
    */
    hideRulers: 'Hide rulers',
    /**
    * @description Command in the Device Mode Toolbar to show a virtual ruler (for measuring),
    * displayed above and next to the device screen.
    */
    showRulers: 'Show rulers',
    /**
    * @description Command in the Device Mode Toolbar to remove the drop-down menu from the toolbar
    * that lets the user override the device pixel ratio of the emulated device.
    */
    removeDevicePixelRatio: 'Remove device pixel ratio',
    /**
    * @description Command in the Device Mode Toolbar to add the drop-down menu to the toolbar
    * that lets the user override the device pixel ratio of the emulated device.
    */
    addDevicePixelRatio: 'Add device pixel ratio',
    /**
    * @description Command in the Device Mode Toolbar to add the drop-down menu to the toolbar
    * that lets the user set the device type (e.g. Desktop or Mobile).
    */
    removeDeviceType: 'Remove device type',
    /**
    * @description Command in the Device Mode Toolbar to add the drop-down menu to the toolbar
    * that lets the user add the device type (e.g. Desktop or Mobile).
    */
    addDeviceType: 'Add device type',
    /**
    * @description A context menu item in the Device Mode Toolbar that resets all settings back to
    * their default values.
    */
    resetToDefaults: 'Reset to defaults',
    /**
    * @description A menu command in the Device Mode Toolbar that closes DevTools.
    */
    closeDevtools: 'Close DevTools',
    /**
    * @description Title of the device selected in the Device Mode Toolbar. The 'response' device is
    * not a specific phone/tablet model but a virtual device that can change its height and width
    * dynamically by clicking and dragging the sides. 'Response' refers to response design:
    * https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design
    */
    responsive: 'Responsive',
    /**
    * @description A context menu item in the Device Mode Toolbar that takes the user to a new screen
    * where they can add/edit/remove custom devices.
    */
    edit: 'Edit…',
    /**
    * @description Text describing the current orientation of the phone/device (vs. landscape).
    */
    portrait: 'Portrait',
    /**
    * @description Text describing the current orientation of the phone/device (vs. portrait).
    */
    landscape: 'Landscape',
    /**
    * @description Title of button in the Device Mode Toolbar which rotates the device 90 degrees.
    */
    rotate: 'Rotate',
    /**
    * @description Fallback/default text used for the name of a custom device when no name has been
    * provided by the user.
    */
    none: 'None',
    /**
    * @description Tooltip of the rotate/screen orientation button.
    */
    screenOrientationOptions: 'Screen orientation options',
    /**
    * @description Tooltip for a button which turns on/off dual-screen mode, which emulates devices
    * like tablets which have two screens.
    */
    toggleDualscreenMode: 'Toggle dual-screen mode',
};
const str_ = i18n.i18n.registerUIStrings('panels/emulation/DeviceModeToolbar.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
/**
 * Even though the emulation panel uses all UI elements, the tooltips are not supported.
 * That's because the emulation elements are rendered around the page context, rather
 * than in the DevTools panel itself. Therefore, we need to fall back to using the
 * built-in tooltip by setting the title attribute on the button's element.
 */
function setTitleForButton(button, title) {
    button.setTitle(title);
    button.element.title = title;
}
export class DeviceModeToolbar {
    _model;
    _showMediaInspectorSetting;
    _showRulersSetting;
    _experimentDualScreenSupport;
    _deviceOutlineSetting;
    _showDeviceScaleFactorSetting;
    _showUserAgentTypeSetting;
    _autoAdjustScaleSetting;
    _lastMode;
    _element;
    _emulatedDevicesList;
    _persistenceSetting;
    _spanButton;
    _modeButton;
    _widthInput;
    _heightInput;
    _deviceScaleItem;
    _deviceSelectItem;
    _scaleItem;
    _uaItem;
    _experimentalButton;
    _cachedDeviceScale;
    _cachedUaType;
    _updateWidthInput;
    _widthItem;
    _xItem;
    _updateHeightInput;
    _heightItem;
    _throttlingConditionsItem;
    _cachedModelType;
    _cachedScale;
    _cachedModelDevice;
    _cachedModelMode;
    constructor(model, showMediaInspectorSetting, showRulersSetting) {
        this._model = model;
        const device = model.device();
        if (device) {
            this._recordDeviceChange(device, null);
        }
        this._showMediaInspectorSetting = showMediaInspectorSetting;
        this._showRulersSetting = showRulersSetting;
        this._experimentDualScreenSupport = Root.Runtime.experiments.isEnabled('dualScreenSupport');
        this._deviceOutlineSetting = this._model.deviceOutlineSetting();
        this._showDeviceScaleFactorSetting =
            Common.Settings.Settings.instance().createSetting('emulation.showDeviceScaleFactor', false);
        this._showDeviceScaleFactorSetting.addChangeListener(this._updateDeviceScaleFactorVisibility, this);
        this._showUserAgentTypeSetting =
            Common.Settings.Settings.instance().createSetting('emulation.showUserAgentType', false);
        this._showUserAgentTypeSetting.addChangeListener(this._updateUserAgentTypeVisibility, this);
        this._autoAdjustScaleSetting = Common.Settings.Settings.instance().createSetting('emulation.autoAdjustScale', true);
        this._lastMode = new Map();
        this._element = document.createElement('div');
        this._element.classList.add('device-mode-toolbar');
        const leftContainer = this._element.createChild('div', 'device-mode-toolbar-spacer');
        leftContainer.createChild('div', 'device-mode-toolbar-spacer');
        const leftToolbar = new UI.Toolbar.Toolbar('', leftContainer);
        this._fillLeftToolbar(leftToolbar);
        const mainToolbar = new UI.Toolbar.Toolbar('', this._element);
        mainToolbar.makeWrappable();
        this._fillMainToolbar(mainToolbar);
        const rightContainer = this._element.createChild('div', 'device-mode-toolbar-spacer');
        const rightToolbar = new UI.Toolbar.Toolbar('device-mode-toolbar-fixed-size', rightContainer);
        rightToolbar.makeWrappable();
        this._fillRightToolbar(rightToolbar);
        const modeToolbar = new UI.Toolbar.Toolbar('device-mode-toolbar-fixed-size', rightContainer);
        modeToolbar.makeWrappable();
        this._fillModeToolbar(modeToolbar);
        rightContainer.createChild('div', 'device-mode-toolbar-spacer');
        const optionsToolbar = new UI.Toolbar.Toolbar('device-mode-toolbar-options', rightContainer);
        optionsToolbar.makeWrappable();
        this._fillOptionsToolbar(optionsToolbar);
        this._emulatedDevicesList = EmulatedDevicesList.instance();
        this._emulatedDevicesList.addEventListener("CustomDevicesUpdated" /* CustomDevicesUpdated */, this._deviceListChanged, this);
        this._emulatedDevicesList.addEventListener("StandardDevicesUpdated" /* StandardDevicesUpdated */, this._deviceListChanged, this);
        this._persistenceSetting = Common.Settings.Settings.instance().createSetting('emulation.deviceModeValue', { device: '', orientation: '', mode: '' });
        this._model.toolbarControlsEnabledSetting().addChangeListener(updateToolbarsEnabled);
        updateToolbarsEnabled();
        function updateToolbarsEnabled() {
            const enabled = model.toolbarControlsEnabledSetting().get();
            leftToolbar.setEnabled(enabled);
            mainToolbar.setEnabled(enabled);
            rightToolbar.setEnabled(enabled);
            modeToolbar.setEnabled(enabled);
            optionsToolbar.setEnabled(enabled);
        }
    }
    _recordDeviceChange(device, oldDevice) {
        if (device !== oldDevice && device && device.isDualScreen) {
            // When we start emulating a device, whether we start a new emulation session, or switch to
            // a new device, if the device is dual screen, we count this once.
            Host.userMetrics.dualScreenDeviceEmulated(Host.UserMetrics.DualScreenDeviceEmulated.DualScreenDeviceSelected);
        }
    }
    _createEmptyToolbarElement() {
        const element = document.createElement('div');
        element.classList.add('device-mode-empty-toolbar-element');
        return element;
    }
    _fillLeftToolbar(toolbar) {
        toolbar.appendToolbarItem(this._wrapToolbarItem(this._createEmptyToolbarElement()));
        this._deviceSelectItem = new UI.Toolbar.ToolbarMenuButton(this._appendDeviceMenuItems.bind(this));
        this._deviceSelectItem.setGlyph('');
        this._deviceSelectItem.turnIntoSelect(true);
        this._deviceSelectItem.setDarkText();
        toolbar.appendToolbarItem(this._deviceSelectItem);
    }
    _fillMainToolbar(toolbar) {
        const widthInput = UI.UIUtils.createInput('device-mode-size-input', 'text');
        widthInput.maxLength = 4;
        widthInput.title = i18nString(UIStrings.width);
        this._updateWidthInput =
            UI.UIUtils.bindInput(widthInput, this._applyWidth.bind(this), DeviceModeModel.widthValidator, true);
        this._widthInput = widthInput;
        this._widthItem = this._wrapToolbarItem(widthInput);
        toolbar.appendToolbarItem(this._widthItem);
        const xElement = document.createElement('div');
        xElement.classList.add('device-mode-x');
        xElement.textContent = '×';
        this._xItem = this._wrapToolbarItem(xElement);
        toolbar.appendToolbarItem(this._xItem);
        const heightInput = UI.UIUtils.createInput('device-mode-size-input', 'text');
        heightInput.maxLength = 4;
        heightInput.title = i18nString(UIStrings.heightLeaveEmptyForFull);
        this._updateHeightInput = UI.UIUtils.bindInput(heightInput, this._applyHeight.bind(this), validateHeight, true);
        this._heightInput = heightInput;
        this._heightItem = this._wrapToolbarItem(heightInput);
        toolbar.appendToolbarItem(this._heightItem);
        function validateHeight(value) {
            if (!value) {
                return { valid: true, errorMessage: undefined };
            }
            return DeviceModeModel.heightValidator(value);
        }
    }
    _applyWidth(value) {
        const width = value ? Number(value) : 0;
        this._model.setWidthAndScaleToFit(width);
    }
    _applyHeight(value) {
        const height = value ? Number(value) : 0;
        this._model.setHeightAndScaleToFit(height);
    }
    _fillRightToolbar(toolbar) {
        toolbar.appendToolbarItem(this._wrapToolbarItem(this._createEmptyToolbarElement()));
        this._scaleItem = new UI.Toolbar.ToolbarMenuButton(this._appendScaleMenuItems.bind(this));
        setTitleForButton(this._scaleItem, i18nString(UIStrings.zoom));
        this._scaleItem.setGlyph('');
        this._scaleItem.turnIntoSelect();
        this._scaleItem.setDarkText();
        toolbar.appendToolbarItem(this._scaleItem);
        toolbar.appendToolbarItem(this._wrapToolbarItem(this._createEmptyToolbarElement()));
        this._deviceScaleItem = new UI.Toolbar.ToolbarMenuButton(this._appendDeviceScaleMenuItems.bind(this));
        this._deviceScaleItem.setVisible(this._showDeviceScaleFactorSetting.get());
        setTitleForButton(this._deviceScaleItem, i18nString(UIStrings.devicePixelRatio));
        this._deviceScaleItem.setGlyph('');
        this._deviceScaleItem.turnIntoSelect();
        this._deviceScaleItem.setDarkText();
        toolbar.appendToolbarItem(this._deviceScaleItem);
        toolbar.appendToolbarItem(this._wrapToolbarItem(this._createEmptyToolbarElement()));
        this._uaItem = new UI.Toolbar.ToolbarMenuButton(this._appendUserAgentMenuItems.bind(this));
        this._uaItem.setVisible(this._showUserAgentTypeSetting.get());
        setTitleForButton(this._uaItem, i18nString(UIStrings.deviceType));
        this._uaItem.setGlyph('');
        this._uaItem.turnIntoSelect();
        this._uaItem.setDarkText();
        toolbar.appendToolbarItem(this._uaItem);
        this._throttlingConditionsItem =
            MobileThrottling.ThrottlingManager.throttlingManager().createMobileThrottlingButton();
        toolbar.appendToolbarItem(this._throttlingConditionsItem);
    }
    _fillModeToolbar(toolbar) {
        toolbar.appendToolbarItem(this._wrapToolbarItem(this._createEmptyToolbarElement()));
        this._modeButton = new UI.Toolbar.ToolbarButton('', 'largeicon-rotate-screen');
        this._modeButton.addEventListener(UI.Toolbar.ToolbarButton.Events.Click, this._modeMenuClicked, this);
        toolbar.appendToolbarItem(this._modeButton);
        if (this._experimentDualScreenSupport) {
            this._spanButton = new UI.Toolbar.ToolbarButton('', 'largeicon-dual-screen');
            this._spanButton.addEventListener(UI.Toolbar.ToolbarButton.Events.Click, this._spanClicked, this);
            toolbar.appendToolbarItem(this._spanButton);
            this._createExperimentalButton(toolbar);
        }
    }
    _createExperimentalButton(toolbar) {
        toolbar.appendToolbarItem(new UI.Toolbar.ToolbarSeparator(true));
        const title = (this._model.webPlatformExperimentalFeaturesEnabled()) ?
            i18nString(UIStrings.experimentalWebPlatformFeature) :
            i18nString(UIStrings.experimentalWebPlatformFeatureFlag);
        this._experimentalButton = new UI.Toolbar.ToolbarToggle(title, 'largeicon-experimental-api');
        this._experimentalButton.setToggled(this._model.webPlatformExperimentalFeaturesEnabled());
        this._experimentalButton.setEnabled(true);
        this._experimentalButton.addEventListener(UI.Toolbar.ToolbarButton.Events.Click, this._experimentalClicked, this);
        toolbar.appendToolbarItem(this._experimentalButton);
    }
    _experimentalClicked() {
        Host.InspectorFrontendHost.InspectorFrontendHostInstance.openInNewTab('chrome://flags/#enable-experimental-web-platform-features');
    }
    _fillOptionsToolbar(toolbar) {
        toolbar.appendToolbarItem(this._wrapToolbarItem(this._createEmptyToolbarElement()));
        const moreOptionsButton = new UI.Toolbar.ToolbarMenuButton(this._appendOptionsMenuItems.bind(this));
        setTitleForButton(moreOptionsButton, i18nString(UIStrings.moreOptions));
        toolbar.appendToolbarItem(moreOptionsButton);
    }
    _appendScaleMenuItems(contextMenu) {
        if (this._model.type() === Type.Device) {
            contextMenu.footerSection().appendItem(i18nString(UIStrings.fitToWindowF, { PH1: this._model.fitScale() * 100 }), this._onScaleMenuChanged.bind(this, this._model.fitScale()), false);
        }
        contextMenu.footerSection().appendCheckboxItem(i18nString(UIStrings.autoadjustZoom), this._onAutoAdjustScaleChanged.bind(this), this._autoAdjustScaleSetting.get());
        const boundAppendScaleItem = appendScaleItem.bind(this);
        boundAppendScaleItem('50%', 0.5);
        boundAppendScaleItem('75%', 0.75);
        boundAppendScaleItem('100%', 1);
        boundAppendScaleItem('125%', 1.25);
        boundAppendScaleItem('150%', 1.5);
        function appendScaleItem(title, value) {
            contextMenu.defaultSection().appendCheckboxItem(title, this._onScaleMenuChanged.bind(this, value), this._model.scaleSetting().get() === value, false);
        }
    }
    _onScaleMenuChanged(value) {
        this._model.scaleSetting().set(value);
    }
    _onAutoAdjustScaleChanged() {
        this._autoAdjustScaleSetting.set(!this._autoAdjustScaleSetting.get());
    }
    _appendDeviceScaleMenuItems(contextMenu) {
        const deviceScaleFactorSetting = this._model.deviceScaleFactorSetting();
        const defaultValue = this._model.uaSetting().get() === UA.Mobile || this._model.uaSetting().get() === UA.MobileNoTouch ?
            defaultMobileScaleFactor :
            window.devicePixelRatio;
        appendDeviceScaleFactorItem(contextMenu.headerSection(), i18nString(UIStrings.defaultF, { PH1: defaultValue }), 0);
        appendDeviceScaleFactorItem(contextMenu.defaultSection(), '1', 1);
        appendDeviceScaleFactorItem(contextMenu.defaultSection(), '2', 2);
        appendDeviceScaleFactorItem(contextMenu.defaultSection(), '3', 3);
        function appendDeviceScaleFactorItem(section, title, value) {
            section.appendCheckboxItem(title, deviceScaleFactorSetting.set.bind(deviceScaleFactorSetting, value), deviceScaleFactorSetting.get() === value);
        }
    }
    _appendUserAgentMenuItems(contextMenu) {
        const uaSetting = this._model.uaSetting();
        appendUAItem(UA.Mobile, UA.Mobile);
        appendUAItem(UA.MobileNoTouch, UA.MobileNoTouch);
        appendUAItem(UA.Desktop, UA.Desktop);
        appendUAItem(UA.DesktopTouch, UA.DesktopTouch);
        function appendUAItem(title, value) {
            contextMenu.defaultSection().appendCheckboxItem(title, uaSetting.set.bind(uaSetting, value), uaSetting.get() === value);
        }
    }
    _appendOptionsMenuItems(contextMenu) {
        const model = this._model;
        appendToggleItem(contextMenu.headerSection(), this._deviceOutlineSetting, i18nString(UIStrings.hideDeviceFrame), i18nString(UIStrings.showDeviceFrame), model.type() !== Type.Device);
        appendToggleItem(contextMenu.headerSection(), this._showMediaInspectorSetting, i18nString(UIStrings.hideMediaQueries), i18nString(UIStrings.showMediaQueries));
        appendToggleItem(contextMenu.headerSection(), this._showRulersSetting, i18nString(UIStrings.hideRulers), i18nString(UIStrings.showRulers));
        appendToggleItem(contextMenu.defaultSection(), this._showDeviceScaleFactorSetting, i18nString(UIStrings.removeDevicePixelRatio), i18nString(UIStrings.addDevicePixelRatio));
        appendToggleItem(contextMenu.defaultSection(), this._showUserAgentTypeSetting, i18nString(UIStrings.removeDeviceType), i18nString(UIStrings.addDeviceType));
        contextMenu.appendItemsAtLocation('deviceModeMenu');
        contextMenu.footerSection().appendItem(i18nString(UIStrings.resetToDefaults), this._reset.bind(this));
        contextMenu.footerSection().appendItem(i18nString(UIStrings.closeDevtools), Host.InspectorFrontendHost.InspectorFrontendHostInstance.closeWindow.bind(Host.InspectorFrontendHost.InspectorFrontendHostInstance));
        function appendToggleItem(section, setting, title1, title2, disabled) {
            if (typeof disabled === 'undefined') {
                disabled = model.type() === Type.None;
            }
            section.appendItem(setting.get() ? title1 : title2, setting.set.bind(setting, !setting.get()), disabled);
        }
    }
    _reset() {
        this._deviceOutlineSetting.set(false);
        this._showDeviceScaleFactorSetting.set(false);
        this._showUserAgentTypeSetting.set(false);
        this._showMediaInspectorSetting.set(false);
        this._showRulersSetting.set(false);
        this._model.reset();
    }
    _wrapToolbarItem(element) {
        const container = document.createElement('div');
        const shadowRoot = UI.Utils.createShadowRootWithCoreStyles(container, { cssFile: 'panels/emulation/deviceModeToolbar.css', enableLegacyPatching: false, delegatesFocus: undefined });
        shadowRoot.appendChild(element);
        return new UI.Toolbar.ToolbarItem(container);
    }
    _emulateDevice(device) {
        const scale = this._autoAdjustScaleSetting.get() ? undefined : this._model.scaleSetting().get();
        this._recordDeviceChange(device, this._model.device());
        this._model.emulate(Type.Device, device, this._lastMode.get(device) || device.modes[0], scale);
    }
    _switchToResponsive() {
        this._model.emulate(Type.Responsive, null, null);
    }
    _filterDevices(devices) {
        devices = devices.filter(function (d) {
            return d.show();
        });
        devices.sort(EmulatedDevice.deviceComparator);
        return devices;
    }
    _standardDevices() {
        return this._filterDevices(this._emulatedDevicesList.standard());
    }
    _customDevices() {
        return this._filterDevices(this._emulatedDevicesList.custom());
    }
    _allDevices() {
        return this._standardDevices().concat(this._customDevices());
    }
    _appendDeviceMenuItems(contextMenu) {
        contextMenu.headerSection().appendCheckboxItem(i18nString(UIStrings.responsive), this._switchToResponsive.bind(this), this._model.type() === Type.Responsive, false);
        appendGroup.call(this, this._standardDevices());
        appendGroup.call(this, this._customDevices());
        contextMenu.footerSection().appendItem(i18nString(UIStrings.edit), this._emulatedDevicesList.revealCustomSetting.bind(this._emulatedDevicesList), false);
        function appendGroup(devices) {
            if (!devices.length) {
                return;
            }
            const section = contextMenu.section();
            for (const device of devices) {
                section.appendCheckboxItem(device.title, this._emulateDevice.bind(this, device), this._model.device() === device, false);
            }
        }
    }
    _deviceListChanged() {
        const device = this._model.device();
        if (!device) {
            return;
        }
        const devices = this._allDevices();
        if (devices.indexOf(device) === -1) {
            if (devices.length) {
                this._emulateDevice(devices[0]);
            }
            else {
                this._model.emulate(Type.Responsive, null, null);
            }
        }
        else {
            this._emulateDevice(device);
        }
    }
    _updateDeviceScaleFactorVisibility() {
        if (this._deviceScaleItem) {
            this._deviceScaleItem.setVisible(this._showDeviceScaleFactorSetting.get());
        }
    }
    _updateUserAgentTypeVisibility() {
        if (this._uaItem) {
            this._uaItem.setVisible(this._showUserAgentTypeSetting.get());
        }
    }
    _spanClicked() {
        const device = this._model.device();
        if (!device || !device.isDualScreen) {
            return;
        }
        Host.userMetrics.dualScreenDeviceEmulated(Host.UserMetrics.DualScreenDeviceEmulated.SpanButtonClicked);
        const scale = this._autoAdjustScaleSetting.get() ? undefined : this._model.scaleSetting().get();
        const mode = this._model.mode();
        if (!mode) {
            return;
        }
        const newMode = device.getSpanPartner(mode);
        if (!newMode) {
            return;
        }
        this._model.emulate(this._model.type(), device, newMode, scale);
        return;
    }
    _modeMenuClicked(event) {
        const device = this._model.device();
        const model = this._model;
        const autoAdjustScaleSetting = this._autoAdjustScaleSetting;
        if (model.type() === Type.Responsive) {
            const appliedSize = model.appliedDeviceSize();
            if (autoAdjustScaleSetting.get()) {
                model.setSizeAndScaleToFit(appliedSize.height, appliedSize.width);
            }
            else {
                model.setWidth(appliedSize.height);
                model.setHeight(appliedSize.width);
            }
            return;
        }
        if (!device) {
            return;
        }
        if ((device.isDualScreen || device.modes.length === 2) &&
            device.modes[0].orientation !== device.modes[1].orientation) {
            const scale = autoAdjustScaleSetting.get() ? undefined : model.scaleSetting().get();
            const mode = model.mode();
            if (!mode) {
                return;
            }
            const rotationPartner = device.getRotationPartner(mode);
            if (!rotationPartner) {
                return;
            }
            model.emulate(model.type(), model.device(), rotationPartner, scale);
            return;
        }
        if (!this._modeButton) {
            return;
        }
        const contextMenu = new UI.ContextMenu.ContextMenu(event.data, false, this._modeButton.element.totalOffsetLeft(), this._modeButton.element.totalOffsetTop() + this._modeButton.element.offsetHeight);
        addOrientation(Vertical, i18nString(UIStrings.portrait));
        addOrientation(Horizontal, i18nString(UIStrings.landscape));
        contextMenu.show();
        function addOrientation(orientation, title) {
            if (!device) {
                return;
            }
            const modes = device.modesForOrientation(orientation);
            if (!modes.length) {
                return;
            }
            if (modes.length === 1) {
                addMode(modes[0], title);
            }
            else {
                for (let index = 0; index < modes.length; index++) {
                    addMode(modes[index], title + ' \u2013 ' + modes[index].title);
                }
            }
        }
        function addMode(mode, title) {
            contextMenu.defaultSection().appendCheckboxItem(title, applyMode.bind(null, mode), model.mode() === mode, false);
        }
        function applyMode(mode) {
            const scale = autoAdjustScaleSetting.get() ? undefined : model.scaleSetting().get();
            model.emulate(model.type(), model.device(), mode, scale);
        }
    }
    element() {
        return this._element;
    }
    update() {
        if (this._model.type() !== this._cachedModelType) {
            this._cachedModelType = this._model.type();
            this._widthInput.disabled = this._model.type() !== Type.Responsive;
            this._heightInput.disabled = this._model.type() !== Type.Responsive;
            this._deviceScaleItem.setEnabled(this._model.type() === Type.Responsive);
            this._uaItem.setEnabled(this._model.type() === Type.Responsive);
            if (this._model.type() === Type.Responsive) {
                this._modeButton.setEnabled(true);
                setTitleForButton(this._modeButton, i18nString(UIStrings.rotate));
            }
            else {
                this._modeButton.setEnabled(false);
            }
        }
        const size = this._model.appliedDeviceSize();
        if (this._updateHeightInput) {
            this._updateHeightInput(this._model.type() === Type.Responsive && this._model.isFullHeight() ? '' : String(size.height));
        }
        this._updateWidthInput(String(size.width));
        this._heightInput.placeholder = String(size.height);
        if (this._model.scale() !== this._cachedScale) {
            this._scaleItem.setText(`${(this._model.scale() * 100).toFixed(0)}%`);
            this._cachedScale = this._model.scale();
        }
        const deviceScale = this._model.appliedDeviceScaleFactor();
        if (deviceScale !== this._cachedDeviceScale) {
            this._deviceScaleItem.setText(`DPR: ${deviceScale.toFixed(1)}`);
            this._cachedDeviceScale = deviceScale;
        }
        const uaType = this._model.appliedUserAgentType();
        if (uaType !== this._cachedUaType) {
            this._uaItem.setText(uaType);
            this._cachedUaType = uaType;
        }
        let deviceItemTitle = i18nString(UIStrings.none);
        if (this._model.type() === Type.Responsive) {
            deviceItemTitle = i18nString(UIStrings.responsive);
        }
        const device = this._model.device();
        if (this._model.type() === Type.Device && device) {
            deviceItemTitle = device.title;
        }
        this._deviceSelectItem.setText(deviceItemTitle);
        if (this._model.device() !== this._cachedModelDevice) {
            const device = this._model.device();
            if (device) {
                const modeCount = device ? device.modes.length : 0;
                this._modeButton.setEnabled(modeCount >= 2);
                setTitleForButton(this._modeButton, modeCount === 2 ? i18nString(UIStrings.rotate) : i18nString(UIStrings.screenOrientationOptions));
            }
            this._cachedModelDevice = device;
        }
        if (this._experimentDualScreenSupport && this._experimentalButton) {
            const device = this._model.device();
            if (device && device.isDualScreen) {
                this._spanButton.setVisible(true);
                this._experimentalButton.setVisible(true);
            }
            else {
                this._spanButton.setVisible(false);
                this._experimentalButton.setVisible(false);
            }
            setTitleForButton(this._spanButton, i18nString(UIStrings.toggleDualscreenMode));
        }
        if (this._model.type() === Type.Device) {
            this._lastMode.set(this._model.device(), this._model.mode());
        }
        if (this._model.mode() !== this._cachedModelMode && this._model.type() !== Type.None) {
            this._cachedModelMode = this._model.mode();
            const value = this._persistenceSetting.get();
            const device = this._model.device();
            if (device) {
                value.device = device.title;
                const mode = this._model.mode();
                value.orientation = mode ? mode.orientation : '';
                value.mode = mode ? mode.title : '';
            }
            else {
                value.device = '';
                value.orientation = '';
                value.mode = '';
            }
            this._persistenceSetting.set(value);
        }
    }
    restore() {
        for (const device of this._allDevices()) {
            if (device.title === this._persistenceSetting.get().device) {
                for (const mode of device.modes) {
                    if (mode.orientation === this._persistenceSetting.get().orientation &&
                        mode.title === this._persistenceSetting.get().mode) {
                        this._lastMode.set(device, mode);
                        this._emulateDevice(device);
                        return;
                    }
                }
            }
        }
        this._model.emulate(Type.Responsive, null, null);
    }
}
//# sourceMappingURL=DeviceModeToolbar.js.map