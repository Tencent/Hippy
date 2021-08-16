// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../../core/common/common.js';
import * as Root from '../../core/root/root.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as i18n from '../../core/i18n/i18n.js';
const UIStrings = {
    /**
    *@description Title of an action in the emulation tool to toggle device mode
    */
    toggleDeviceToolbar: 'Toggle device toolbar',
    /**
    *@description Title of an action in the emulation tool to capture screenshot
    */
    captureScreenshot: 'Capture screenshot',
    /**
    * @description Title of an action in the emulation tool to capture full height screenshot. This
    * action captures a screenshot of the entire website, not just the visible portion.
    */
    captureFullSizeScreenshot: 'Capture full size screenshot',
    /**
    * @description Title of an action in the emulation tool to capture a screenshot of just this node.
    * Node refers to a HTML element/node.
    */
    captureNodeScreenshot: 'Capture node screenshot',
    /**
    * @description Command in the Device Mode Toolbar, to show media query boundaries in the UI.
    * https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries/Using_media_queries
    */
    showMediaQueries: 'Show media queries',
    /**
    *@description Command in the Device Mode Toolbar, to hide media query boundaries in the UI.
    * https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries/Using_media_queries
    */
    hideMediaQueries: 'Hide media queries',
    /**
    * @description A tag of Mobile related settings that can be searched in the command menu if the
    * user doesn't know the exact name of the tool. Device refers to e.g. phone/tablet.
    */
    device: 'device',
    /**
    *@description Command that shows measuring rulers next to the emulated device.
    */
    showRulers: 'Show rulers',
    /**
    *@description Command that hides measuring rulers next to the emulated device.
    */
    hideRulers: 'Hide rulers',
    /**
    *@description Command that shows a frame (like a picture frame) around the emulated device.
    */
    showDeviceFrame: 'Show device frame',
    /**
    *@description Command that hides a frame (like a picture frame) around the emulated device.
    */
    hideDeviceFrame: 'Hide device frame',
    /**
    *@description Title of the Devices tab/tool. Devices refers to e.g. phones/tablets.
    */
    devices: 'Devices',
    /**
    * @description Title of the Sensors tool. The sensors tool contains GPS, orientation sensors, touch
    * settings, etc.
    */
    sensors: 'Sensors',
    /**
    *@description A tag of Sensors tool that can be searched in the command menu
    */
    geolocation: 'geolocation',
    /**
    *@description A tag of Sensors tool that can be searched in the command menu
    */
    timezones: 'timezones',
    /**
    *@description Text in Sensors View of the Device Toolbar
    */
    locale: 'locale',
    /**
    *@description A tag of Sensors tool that can be searched in the command menu
    */
    locales: 'locales',
    /**
    *@description A tag of Sensors tool that can be searched in the command menu
    */
    accelerometer: 'accelerometer',
    /**
    * @description A tag of Sensors tool that can be searched in the command menu. Refers to the
    * orientation of a device (e.g. phone) in 3D space, e.g. tilted right/left.
    */
    deviceOrientation: 'device orientation',
    /**
    *@description Title of Locations settings. Refers to geographic locations for GPS.
    */
    locations: 'Locations',
    /**
    * @description Text for the touch type to simulate on a device. Refers to touch input as opposed to
    * mouse input.
    */
    touch: 'Touch',
    /**
    *@description Text in Sensors View of the Device Toolbar. Refers to device-based touch input,
    *which means the input type will be 'touch' only if the device normally has touch input e.g. a
    *phone or tablet.
    */
    devicebased: 'Device-based',
    /**
    *@description Text in Sensors View of the Device Toolbar. Means that touch input will be forced
    *on, even if the device type e.g. desktop computer does not normally have touch input.
    */
    forceEnabled: 'Force enabled',
    /**
    *@description Title of a section option in Sensors tab for idle emulation. This is a command, to
    *emulate the state of the 'Idle Detector'.
    */
    emulateIdleDetectorState: 'Emulate Idle Detector state',
    /**
    *@description Title of an option in Sensors tab idle emulation drop-down. Turns off emulation of idle state.
    */
    noIdleEmulation: 'No idle emulation',
    /**
    *@description Title of an option in Sensors tab idle emulation drop-down.
    */
    userActiveScreenUnlocked: 'User active, screen unlocked',
    /**
    *@description Title of an option in Sensors tab idle emulation drop-down.
    */
    userActiveScreenLocked: 'User active, screen locked',
    /**
    *@description Title of an option in Sensors tab idle emulation drop-down.
    */
    userIdleScreenUnlocked: 'User idle, screen unlocked',
    /**
    *@description Title of an option in Sensors tab idle emulation drop-down.
    */
    userIdleScreenLocked: 'User idle, screen locked',
    /**
    *@description Command that opens the device emulation view.
    */
    showDevices: 'Show Devices',
    /**
    * @description Command that opens the Sensors view/tool. The sensors tool contains GPS,
    * orientation sensors, touch settings, etc.
    */
    showSensors: 'Show Sensors',
    /**
    *@description Command that shows geographic locations.
    */
    showLocations: 'Show Locations',
};
const str_ = i18n.i18n.registerUIStrings('panels/emulation/emulation-meta.ts', UIStrings);
const i18nLazyString = i18n.i18n.getLazilyComputedLocalizedString.bind(undefined, str_);
let loadedEmulationModule;
async function loadEmulationModule() {
    if (!loadedEmulationModule) {
        // Side-effect import resources in module.json
        await Root.Runtime.Runtime.instance().loadModulePromise('panels/emulation');
        loadedEmulationModule = await import('./emulation.js');
    }
    return loadedEmulationModule;
}
UI.ViewManager.registerViewExtension({
    location: "settings-view" /* SETTINGS_VIEW */,
    commandPrompt: i18nLazyString(UIStrings.showDevices),
    title: i18nLazyString(UIStrings.devices),
    order: 30,
    async loadView() {
        const Emulation = await loadEmulationModule();
        return Emulation.DevicesSettingsTab.DevicesSettingsTab.instance();
    },
    id: 'devices',
    settings: [
        'standardEmulatedDeviceList',
        'customEmulatedDeviceList',
    ],
});
UI.ViewManager.registerViewExtension({
    location: "drawer-view" /* DRAWER_VIEW */,
    commandPrompt: i18nLazyString(UIStrings.showSensors),
    title: i18nLazyString(UIStrings.sensors),
    id: 'sensors',
    persistence: "closeable" /* CLOSEABLE */,
    order: 100,
    async loadView() {
        const Emulation = await loadEmulationModule();
        return Emulation.SensorsView.SensorsView.instance();
    },
    tags: [
        i18nLazyString(UIStrings.geolocation),
        i18nLazyString(UIStrings.timezones),
        i18nLazyString(UIStrings.locale),
        i18nLazyString(UIStrings.locales),
        i18nLazyString(UIStrings.accelerometer),
        i18nLazyString(UIStrings.deviceOrientation),
    ],
});
UI.ViewManager.registerViewExtension({
    location: "settings-view" /* SETTINGS_VIEW */,
    id: 'emulation-locations',
    commandPrompt: i18nLazyString(UIStrings.showLocations),
    title: i18nLazyString(UIStrings.locations),
    order: 40,
    async loadView() {
        const Emulation = await loadEmulationModule();
        return Emulation.LocationsSettingsTab.LocationsSettingsTab.instance();
    },
    settings: [
        'emulation.locations',
    ],
});
UI.ActionRegistration.registerActionExtension({
    category: UI.ActionRegistration.ActionCategory.MOBILE,
    actionId: 'emulation.toggle-device-mode',
    toggleable: true,
    async loadActionDelegate() {
        const Emulation = await loadEmulationModule();
        return Emulation.DeviceModeWrapper.ActionDelegate.instance();
    },
    condition: Root.Runtime.ConditionName.CAN_DOCK,
    title: i18nLazyString(UIStrings.toggleDeviceToolbar),
    iconClass: "largeicon-phone" /* LARGEICON_PHONE */,
    bindings: [
        {
            platform: "windows,linux" /* WindowsLinux */,
            shortcut: 'Shift+Ctrl+M',
        },
        {
            platform: "mac" /* Mac */,
            shortcut: 'Shift+Meta+M',
        },
    ],
});
UI.ActionRegistration.registerActionExtension({
    actionId: 'emulation.capture-screenshot',
    category: UI.ActionRegistration.ActionCategory.SCREENSHOT,
    async loadActionDelegate() {
        const Emulation = await loadEmulationModule();
        return Emulation.DeviceModeWrapper.ActionDelegate.instance();
    },
    condition: Root.Runtime.ConditionName.CAN_DOCK,
    title: i18nLazyString(UIStrings.captureScreenshot),
});
UI.ActionRegistration.registerActionExtension({
    actionId: 'emulation.capture-full-height-screenshot',
    category: UI.ActionRegistration.ActionCategory.SCREENSHOT,
    async loadActionDelegate() {
        const Emulation = await loadEmulationModule();
        return Emulation.DeviceModeWrapper.ActionDelegate.instance();
    },
    condition: Root.Runtime.ConditionName.CAN_DOCK,
    title: i18nLazyString(UIStrings.captureFullSizeScreenshot),
});
UI.ActionRegistration.registerActionExtension({
    actionId: 'emulation.capture-node-screenshot',
    category: UI.ActionRegistration.ActionCategory.SCREENSHOT,
    async loadActionDelegate() {
        const Emulation = await loadEmulationModule();
        return Emulation.DeviceModeWrapper.ActionDelegate.instance();
    },
    condition: Root.Runtime.ConditionName.CAN_DOCK,
    title: i18nLazyString(UIStrings.captureNodeScreenshot),
});
UI.ActionRegistration.registerActionExtension({
    actionId: 'emulation.show-sensors',
    category: UI.ActionRegistration.ActionCategory.SENSORS,
    async loadActionDelegate() {
        const Emulation = await loadEmulationModule();
        return Emulation.SensorsView.ShowActionDelegate.instance();
    },
    title: i18nLazyString(UIStrings.sensors),
});
Common.Settings.registerSettingExtension({
    category: Common.Settings.SettingCategory.MOBILE,
    settingName: 'showMediaQueryInspector',
    settingType: Common.Settings.SettingType.BOOLEAN,
    defaultValue: false,
    options: [
        {
            value: true,
            title: i18nLazyString(UIStrings.showMediaQueries),
        },
        {
            value: false,
            title: i18nLazyString(UIStrings.hideMediaQueries),
        },
    ],
    tags: [i18nLazyString(UIStrings.device)],
});
Common.Settings.registerSettingExtension({
    category: Common.Settings.SettingCategory.MOBILE,
    settingName: 'emulation.showRulers',
    settingType: Common.Settings.SettingType.BOOLEAN,
    defaultValue: false,
    options: [
        {
            value: true,
            title: i18nLazyString(UIStrings.showRulers),
        },
        {
            value: false,
            title: i18nLazyString(UIStrings.hideRulers),
        },
    ],
    tags: [i18nLazyString(UIStrings.device)],
});
Common.Settings.registerSettingExtension({
    category: Common.Settings.SettingCategory.MOBILE,
    settingName: 'emulation.showDeviceOutline',
    settingType: Common.Settings.SettingType.BOOLEAN,
    defaultValue: false,
    options: [
        {
            value: true,
            title: i18nLazyString(UIStrings.showDeviceFrame),
        },
        {
            value: false,
            title: i18nLazyString(UIStrings.hideDeviceFrame),
        },
    ],
    tags: [i18nLazyString(UIStrings.device)],
});
Common.Settings.registerSettingExtension({
    settingName: 'emulation.locations',
    settingType: Common.Settings.SettingType.ARRAY,
    // TODO(crbug.com/1136655): http://crrev.com/c/2666426 regressed localization of city titles.
    // These titles should be localized since they are displayed to users.
    defaultValue: [
        {
            title: 'Berlin',
            lat: 52.520007,
            long: 13.404954,
            timezoneId: 'Europe/Berlin',
            locale: 'de-DE',
        },
        {
            title: 'London',
            lat: 51.507351,
            long: -0.127758,
            timezoneId: 'Europe/London',
            locale: 'en-GB',
        },
        {
            title: 'Moscow',
            lat: 55.755826,
            long: 37.6173,
            timezoneId: 'Europe/Moscow',
            locale: 'ru-RU',
        },
        {
            title: 'Mountain View',
            lat: 37.386052,
            long: -122.083851,
            timezoneId: 'US/Pacific',
            locale: 'en-US',
        },
        {
            title: 'Mumbai',
            lat: 19.075984,
            long: 72.877656,
            timezoneId: 'Asia/Kolkata',
            locale: 'mr-IN',
        },
        {
            title: 'San Francisco',
            lat: 37.774929,
            long: -122.419416,
            timezoneId: 'US/Pacific',
            locale: 'en-US',
        },
        {
            title: 'Shanghai',
            lat: 31.230416,
            long: 121.473701,
            timezoneId: 'Asia/Shanghai',
            locale: 'zh-Hans-CN',
        },
        {
            title: 'São Paulo',
            lat: -23.55052,
            long: -46.633309,
            timezoneId: 'America/Sao_Paulo',
            locale: 'pt-BR',
        },
        {
            title: 'Tokyo',
            lat: 35.689487,
            long: 139.691706,
            timezoneId: 'Asia/Tokyo',
            locale: 'ja-JP',
        },
    ],
});
Common.Settings.registerSettingExtension({
    title: i18nLazyString(UIStrings.touch),
    reloadRequired: true,
    settingName: 'emulation.touch',
    settingType: Common.Settings.SettingType.ENUM,
    defaultValue: 'none',
    options: [
        {
            value: 'none',
            title: i18nLazyString(UIStrings.devicebased),
            text: i18nLazyString(UIStrings.devicebased),
        },
        {
            value: 'force',
            title: i18nLazyString(UIStrings.forceEnabled),
            text: i18nLazyString(UIStrings.forceEnabled),
        },
    ],
});
Common.Settings.registerSettingExtension({
    title: i18nLazyString(UIStrings.emulateIdleDetectorState),
    settingName: 'emulation.idleDetection',
    settingType: Common.Settings.SettingType.ENUM,
    defaultValue: 'none',
    options: [
        {
            value: 'none',
            title: i18nLazyString(UIStrings.noIdleEmulation),
            text: i18nLazyString(UIStrings.noIdleEmulation),
        },
        {
            value: '{\"isUserActive\":true,\"isScreenUnlocked\":true}',
            title: i18nLazyString(UIStrings.userActiveScreenUnlocked),
            text: i18nLazyString(UIStrings.userActiveScreenUnlocked),
        },
        {
            value: '{\"isUserActive\":true,\"isScreenUnlocked\":false}',
            title: i18nLazyString(UIStrings.userActiveScreenLocked),
            text: i18nLazyString(UIStrings.userActiveScreenLocked),
        },
        {
            value: '{\"isUserActive\":false,\"isScreenUnlocked\":true}',
            title: i18nLazyString(UIStrings.userIdleScreenUnlocked),
            text: i18nLazyString(UIStrings.userIdleScreenUnlocked),
        },
        {
            value: '{\"isUserActive\":false,\"isScreenUnlocked\":false}',
            title: i18nLazyString(UIStrings.userIdleScreenLocked),
            text: i18nLazyString(UIStrings.userIdleScreenLocked),
        },
    ],
});
UI.Toolbar.registerToolbarItem({
    actionId: 'emulation.toggle-device-mode',
    condition: Root.Runtime.ConditionName.CAN_DOCK,
    location: UI.Toolbar.ToolbarItemLocation.MAIN_TOOLBAR_LEFT,
    order: 1,
    showLabel: undefined,
    loadItem: undefined,
    separator: undefined,
});
Common.AppProvider.registerAppProvider({
    async loadAppProvider() {
        const Emulation = await loadEmulationModule();
        return Emulation.AdvancedApp.AdvancedAppProvider.instance();
    },
    condition: Root.Runtime.ConditionName.CAN_DOCK,
    order: 0,
});
UI.ContextMenu.registerItem({
    location: UI.ContextMenu.ItemLocation.DEVICE_MODE_MENU_SAVE,
    order: 12,
    actionId: 'emulation.capture-screenshot',
});
UI.ContextMenu.registerItem({
    location: UI.ContextMenu.ItemLocation.DEVICE_MODE_MENU_SAVE,
    order: 13,
    actionId: 'emulation.capture-full-height-screenshot',
});
//# sourceMappingURL=emulation-meta.js.map