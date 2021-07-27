// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../common/common.js';
import * as i18n from '../i18n/i18n.js';
const UIStrings = {
    /**
    *@description Title of a setting under the Console category that can be invoked through the Command Menu
    */
    preserveLogUponNavigation: 'Preserve log upon navigation',
    /**
    *@description Title of a setting under the Console category that can be invoked through the Command Menu
    */
    doNotPreserveLogUponNavigation: 'Do not preserve log upon navigation',
    /**
    *@description Text for pausing the debugger on exceptions
    */
    pauseOnExceptions: 'Pause on exceptions',
    /**
    *@description Title of a setting under the Debugger category that can be invoked through the Command Menu
    */
    doNotPauseOnExceptions: 'Do not pause on exceptions',
    /**
    *@description Title of a setting under the Debugger category that can be invoked through the Command Menu
    */
    disableJavascript: 'Disable JavaScript',
    /**
    *@description Title of a setting under the Debugger category that can be invoked through the Command Menu
    */
    enableJavascript: 'Enable JavaScript',
    /**
    *@description Title of a setting under the Debugger category in Settings
    */
    disableAsyncStackTraces: 'Disable async stack traces',
    /**
    *@description Title of a setting under the Debugger category that can be invoked through the Command Menu
    */
    doNotCaptureAsyncStackTraces: 'Do not capture async stack traces',
    /**
    *@description Title of a setting under the Debugger category that can be invoked through the Command Menu
    */
    captureAsyncStackTraces: 'Capture async stack traces',
    /**
    *@description Text to show the measuring rulers on the target
    */
    showRulers: 'Show rulers',
    /**
    *@description Title of a setting that turns on grid area name labels
    */
    showAreaNames: 'Show area names',
    /**
    *@description Title of a setting under the Grid category that turns CSS Grid Area highlighting on
    */
    showGridNamedAreas: 'Show grid named areas',
    /**
    *@description Title of a setting under the Grid category that turns CSS Grid Area highlighting off
    */
    doNotShowGridNamedAreas: 'Do not show grid named areas',
    /**
    *@description Title of a setting that turns on grid track size labels
    */
    showTrackSizes: 'Show track sizes',
    /**
    *@description Title for CSS Grid tooling option
    */
    showGridTrackSizes: 'Show grid track sizes',
    /**
    *@description Title for CSS Grid tooling option
    */
    doNotShowGridTrackSizes: 'Do not show grid track sizes',
    /**
    *@description Title of a setting that turns on grid extension lines
    */
    extendGridLines: 'Extend grid lines',
    /**
    *@description Title of a setting that turns off the grid extension lines
    */
    doNotExtendGridLines: 'Do not extend grid lines',
    /**
    *@description Title of a setting that turns on grid line labels
    */
    showLineLabels: 'Show line labels',
    /**
    *@description Title of a setting that turns off the grid line labels
    */
    hideLineLabels: 'Hide line labels',
    /**
    *@description Title of a setting that turns on grid line number labels
    */
    showLineNumbers: 'Show line numbers',
    /**
    *@description Title of a setting that turns on grid line name labels
    */
    showLineNames: 'Show line names',
    /**
    *@description Title of a setting under the Rendering category that can be invoked through the Command Menu
    */
    showPaintFlashingRectangles: 'Show paint flashing rectangles',
    /**
    *@description Title of a setting under the Rendering category that can be invoked through the Command Menu
    */
    hidePaintFlashingRectangles: 'Hide paint flashing rectangles',
    /**
    *@description Title of a setting under the Rendering category that can be invoked through the Command Menu
    */
    showLayoutShiftRegions: 'Show layout shift regions',
    /**
    *@description Title of a setting under the Rendering category that can be invoked through the Command Menu
    */
    hideLayoutShiftRegions: 'Hide layout shift regions',
    /**
    *@description Text to highlight the rendering frames for ads
    */
    highlightAdFrames: 'Highlight ad frames',
    /**
    *@description Title of a setting under the Rendering category that can be invoked through the Command Menu
    */
    doNotHighlightAdFrames: 'Do not highlight ad frames',
    /**
    *@description Title of a setting under the Rendering category that can be invoked through the Command Menu
    */
    showLayerBorders: 'Show layer borders',
    /**
    *@description Title of a setting under the Rendering category that can be invoked through the Command Menu
    */
    hideLayerBorders: 'Hide layer borders',
    /**
    *@description Title of a setting under the Rendering drawer that can be invoked through the Command Menu
    */
    showCoreWebVitalsOverlay: 'Show Core Web Vitals overlay',
    /**
    *@description Title of a setting under the Rendering drawer that can be invoked through the Command Menu
    */
    hideCoreWebVitalsOverlay: 'Hide Core Web Vitals overlay',
    /**
    *@description Title of a setting under the Rendering category that can be invoked through the Command Menu
    */
    showFramesPerSecondFpsMeter: 'Show frames per second (FPS) meter',
    /**
    *@description Title of a setting under the Rendering category that can be invoked through the Command Menu
    */
    hideFramesPerSecondFpsMeter: 'Hide frames per second (FPS) meter',
    /**
    *@description Title of a setting under the Rendering category that can be invoked through the Command Menu
    */
    showScrollPerformanceBottlenecks: 'Show scroll performance bottlenecks',
    /**
    *@description Title of a setting under the Rendering category that can be invoked through the Command Menu
    */
    hideScrollPerformanceBottlenecks: 'Hide scroll performance bottlenecks',
    /**
    *@description Title of a setting under the Rendering category that can be invoked through the Command Menu
    */
    showHittestBorders: 'Show hit-test borders',
    /**
    *@description Title of a setting under the Rendering category that can be invoked through the Command Menu
    */
    hideHittestBorders: 'Hide hit-test borders',
    /**
    *@description Title of a Rendering setting that can be invoked through the Command Menu
    */
    emulateAFocusedPage: 'Emulate a focused page',
    /**
    *@description Title of a Rendering setting that can be invoked through the Command Menu
    */
    doNotEmulateAFocusedPage: 'Do not emulate a focused page',
    /**
    *@description Title of a setting under the Rendering category that can be invoked through the Command Menu
    */
    doNotEmulateCssMediaType: 'Do not emulate CSS media type',
    /**
    *@description A drop-down menu option to do not emulate css media type
    */
    noEmulation: 'No emulation',
    /**
    *@description Title of a setting under the Rendering category that can be invoked through the Command Menu
    */
    emulateCssPrintMediaType: 'Emulate CSS print media type',
    /**
    *@description A drop-down menu option to emulate css print media type
    */
    print: 'print',
    /**
    *@description Title of a setting under the Rendering category that can be invoked through the Command Menu
    */
    emulateCssScreenMediaType: 'Emulate CSS screen media type',
    /**
    *@description A drop-down menu option to emulate css screen media type
    */
    screen: 'screen',
    /**
    *@description A tag of Emulate CSS screen media type setting that can be searched in the command menu
    */
    query: 'query',
    /**
    *@description Title of a setting under the Rendering drawer
    */
    emulateCssMediaType: 'Emulate CSS media type',
    /**
    *@description Title of a setting under the Rendering drawer that can be invoked through the Command Menu
    *@example {prefers-color-scheme} PH1
    */
    doNotEmulateCss: 'Do not emulate CSS {PH1}',
    /**
    *@description Title of a setting under the Rendering drawer that can be invoked through the Command Menu
    *@example {prefers-color-scheme: light} PH1
    */
    emulateCss: 'Emulate CSS {PH1}',
    /**
    *@description Title of a setting under the Rendering drawer that can be invoked through the Command Menu
    *@example {prefers-color-scheme} PH1
    */
    emulateCssMediaFeature: 'Emulate CSS media feature {PH1}',
    /**
    *@description Title of a setting under the Rendering drawer that can be invoked through the Command Menu
    */
    doNotEmulateAnyVisionDeficiency: 'Do not emulate any vision deficiency',
    /**
    *@description Title of a setting under the Rendering drawer that can be invoked through the Command Menu
    */
    emulateBlurredVision: 'Emulate blurred vision',
    /**
    *@description Name of a vision deficiency that can be emulated via the Rendering drawer
    */
    blurredVision: 'Blurred vision',
    /**
    *@description Title of a setting under the Rendering drawer that can be invoked through the Command Menu
    */
    emulateProtanopia: 'Emulate protanopia',
    /**
    *@description Name of a color vision deficiency that can be emulated via the Rendering drawer
    */
    protanopia: 'Protanopia',
    /**
    *@description Title of a setting under the Rendering drawer that can be invoked through the Command Menu
    */
    emulateDeuteranopia: 'Emulate deuteranopia',
    /**
    *@description Name of a color vision deficiency that can be emulated via the Rendering drawer
    */
    deuteranopia: 'Deuteranopia',
    /**
    *@description Title of a setting under the Rendering drawer that can be invoked through the Command Menu
    */
    emulateTritanopia: 'Emulate tritanopia',
    /**
    *@description Name of a color vision deficiency that can be emulated via the Rendering drawer
    */
    tritanopia: 'Tritanopia',
    /**
    *@description Title of a setting under the Rendering drawer that can be invoked through the Command Menu
    */
    emulateAchromatopsia: 'Emulate achromatopsia',
    /**
    *@description Name of a color vision deficiency that can be emulated via the Rendering drawer
    */
    achromatopsia: 'Achromatopsia',
    /**
    *@description Title of a setting under the Rendering drawer
    */
    emulateVisionDeficiencies: 'Emulate vision deficiencies',
    /**
    *@description Text that refers to disabling local fonts
    */
    disableLocalFonts: 'Disable local fonts',
    /**
    *@description Text that refers to enabling local fonts
    */
    enableLocalFonts: 'Enable local fonts',
    /**
    *@description Title of a setting that disables AVIF format
    */
    disableAvifFormat: 'Disable `AVIF` format',
    /**
    *@description Title of a setting that enables AVIF format
    */
    enableAvifFormat: 'Enable `AVIF` format',
    /**
    *@description Title of a setting that disables JPEG XL format
    */
    disableJpegXlFormat: 'Disable `JPEG XL` format',
    /**
    *@description Title of a setting that enables JPEG XL format
    */
    enableJpegXlFormat: 'Enable `JPEG XL` format',
    /**
    *@description Title of a setting that disables WebP format
    */
    disableWebpFormat: 'Disable `WebP` format',
    /**
    *@description Title of a setting that enables WebP format
    */
    enableWebpFormat: 'Enable `WebP` format',
    /**
    *@description Title of a setting under the Console category in Settings
    */
    enableCustomFormatters: 'Enable custom formatters',
    /**
    *@description Text to enable blocking of network requests
    */
    enableNetworkRequestBlocking: 'Enable network request blocking',
    /**
    *@description Title of a setting under the Network category that can be invoked through the Command Menu
    */
    disableNetworkRequestBlocking: 'Disable network request blocking',
    /**
    *@description Title of a setting under the Network category that can be invoked through the Command Menu
    */
    enableCache: 'Enable cache',
};
const str_ = i18n.i18n.registerUIStrings('core/sdk/sdk-meta.ts', UIStrings);
const i18nLazyString = i18n.i18n.getLazilyComputedLocalizedString.bind(undefined, str_);
Common.Settings.registerSettingExtension({
    settingName: 'skipStackFramesPattern',
    settingType: Common.Settings.SettingType.REGEX,
    defaultValue: '',
});
Common.Settings.registerSettingExtension({
    settingName: 'skipContentScripts',
    settingType: Common.Settings.SettingType.BOOLEAN,
    defaultValue: false,
});
Common.Settings.registerSettingExtension({
    category: Common.Settings.SettingCategory.CONSOLE,
    title: i18nLazyString(UIStrings.preserveLogUponNavigation),
    settingName: 'preserveConsoleLog',
    settingType: Common.Settings.SettingType.BOOLEAN,
    defaultValue: false,
    options: [
        {
            value: true,
            title: i18nLazyString(UIStrings.preserveLogUponNavigation),
        },
        {
            value: false,
            title: i18nLazyString(UIStrings.doNotPreserveLogUponNavigation),
        },
    ],
});
Common.Settings.registerSettingExtension({
    category: Common.Settings.SettingCategory.DEBUGGER,
    settingName: 'pauseOnExceptionEnabled',
    settingType: Common.Settings.SettingType.BOOLEAN,
    defaultValue: false,
    options: [
        {
            value: true,
            title: i18nLazyString(UIStrings.pauseOnExceptions),
        },
        {
            value: false,
            title: i18nLazyString(UIStrings.doNotPauseOnExceptions),
        },
    ],
});
Common.Settings.registerSettingExtension({
    settingName: 'pauseOnCaughtException',
    settingType: Common.Settings.SettingType.BOOLEAN,
    defaultValue: false,
});
Common.Settings.registerSettingExtension({
    category: Common.Settings.SettingCategory.DEBUGGER,
    title: i18nLazyString(UIStrings.disableJavascript),
    settingName: 'javaScriptDisabled',
    settingType: Common.Settings.SettingType.BOOLEAN,
    storageType: Common.Settings.SettingStorageType.Session,
    order: 1,
    defaultValue: false,
    options: [
        {
            value: true,
            title: i18nLazyString(UIStrings.disableJavascript),
        },
        {
            value: false,
            title: i18nLazyString(UIStrings.enableJavascript),
        },
    ],
});
Common.Settings.registerSettingExtension({
    category: Common.Settings.SettingCategory.DEBUGGER,
    title: i18nLazyString(UIStrings.disableAsyncStackTraces),
    settingName: 'disableAsyncStackTraces',
    settingType: Common.Settings.SettingType.BOOLEAN,
    defaultValue: false,
    order: 2,
    options: [
        {
            value: true,
            title: i18nLazyString(UIStrings.doNotCaptureAsyncStackTraces),
        },
        {
            value: false,
            title: i18nLazyString(UIStrings.captureAsyncStackTraces),
        },
    ],
});
Common.Settings.registerSettingExtension({
    category: Common.Settings.SettingCategory.DEBUGGER,
    settingName: 'breakpointsActive',
    settingType: Common.Settings.SettingType.BOOLEAN,
    storageType: Common.Settings.SettingStorageType.Session,
    defaultValue: true,
});
Common.Settings.registerSettingExtension({
    category: Common.Settings.SettingCategory.ELEMENTS,
    title: i18nLazyString(UIStrings.showRulers),
    settingName: 'showMetricsRulers',
    settingType: Common.Settings.SettingType.BOOLEAN,
    defaultValue: false,
});
Common.Settings.registerSettingExtension({
    category: Common.Settings.SettingCategory.GRID,
    title: i18nLazyString(UIStrings.showAreaNames),
    settingName: 'showGridAreas',
    settingType: Common.Settings.SettingType.BOOLEAN,
    options: [
        {
            value: true,
            title: i18nLazyString(UIStrings.showGridNamedAreas),
        },
        {
            value: false,
            title: i18nLazyString(UIStrings.doNotShowGridNamedAreas),
        },
    ],
    defaultValue: false,
});
Common.Settings.registerSettingExtension({
    category: Common.Settings.SettingCategory.GRID,
    title: i18nLazyString(UIStrings.showTrackSizes),
    settingName: 'showGridTrackSizes',
    settingType: Common.Settings.SettingType.BOOLEAN,
    options: [
        {
            value: true,
            title: i18nLazyString(UIStrings.showGridTrackSizes),
        },
        {
            value: false,
            title: i18nLazyString(UIStrings.doNotShowGridTrackSizes),
        },
    ],
    defaultValue: false,
});
Common.Settings.registerSettingExtension({
    category: Common.Settings.SettingCategory.GRID,
    title: i18nLazyString(UIStrings.extendGridLines),
    settingName: 'extendGridLines',
    settingType: Common.Settings.SettingType.BOOLEAN,
    options: [
        {
            value: true,
            title: i18nLazyString(UIStrings.extendGridLines),
        },
        {
            value: false,
            title: i18nLazyString(UIStrings.doNotExtendGridLines),
        },
    ],
    defaultValue: false,
});
Common.Settings.registerSettingExtension({
    category: Common.Settings.SettingCategory.GRID,
    title: i18nLazyString(UIStrings.showLineLabels),
    settingName: 'showGridLineLabels',
    settingType: Common.Settings.SettingType.ENUM,
    options: [
        {
            title: i18nLazyString(UIStrings.hideLineLabels),
            text: i18nLazyString(UIStrings.hideLineLabels),
            value: 'none',
        },
        {
            title: i18nLazyString(UIStrings.showLineNumbers),
            text: i18nLazyString(UIStrings.showLineNumbers),
            value: 'lineNumbers',
        },
        {
            title: i18nLazyString(UIStrings.showLineNames),
            text: i18nLazyString(UIStrings.showLineNames),
            value: 'lineNames',
        },
    ],
    defaultValue: 'lineNumbers',
});
Common.Settings.registerSettingExtension({
    category: Common.Settings.SettingCategory.RENDERING,
    settingName: 'showPaintRects',
    settingType: Common.Settings.SettingType.BOOLEAN,
    storageType: Common.Settings.SettingStorageType.Session,
    options: [
        {
            value: true,
            title: i18nLazyString(UIStrings.showPaintFlashingRectangles),
        },
        {
            value: false,
            title: i18nLazyString(UIStrings.hidePaintFlashingRectangles),
        },
    ],
    defaultValue: false,
});
Common.Settings.registerSettingExtension({
    category: Common.Settings.SettingCategory.RENDERING,
    settingName: 'showLayoutShiftRegions',
    settingType: Common.Settings.SettingType.BOOLEAN,
    storageType: Common.Settings.SettingStorageType.Session,
    options: [
        {
            value: true,
            title: i18nLazyString(UIStrings.showLayoutShiftRegions),
        },
        {
            value: false,
            title: i18nLazyString(UIStrings.hideLayoutShiftRegions),
        },
    ],
    defaultValue: false,
});
Common.Settings.registerSettingExtension({
    category: Common.Settings.SettingCategory.RENDERING,
    settingName: 'showAdHighlights',
    settingType: Common.Settings.SettingType.BOOLEAN,
    storageType: Common.Settings.SettingStorageType.Session,
    options: [
        {
            value: true,
            title: i18nLazyString(UIStrings.highlightAdFrames),
        },
        {
            value: false,
            title: i18nLazyString(UIStrings.doNotHighlightAdFrames),
        },
    ],
    defaultValue: false,
});
Common.Settings.registerSettingExtension({
    category: Common.Settings.SettingCategory.RENDERING,
    settingName: 'showDebugBorders',
    settingType: Common.Settings.SettingType.BOOLEAN,
    storageType: Common.Settings.SettingStorageType.Session,
    options: [
        {
            value: true,
            title: i18nLazyString(UIStrings.showLayerBorders),
        },
        {
            value: false,
            title: i18nLazyString(UIStrings.hideLayerBorders),
        },
    ],
    defaultValue: false,
});
Common.Settings.registerSettingExtension({
    category: Common.Settings.SettingCategory.RENDERING,
    settingName: 'showWebVitals',
    settingType: Common.Settings.SettingType.BOOLEAN,
    storageType: Common.Settings.SettingStorageType.Session,
    options: [
        {
            value: true,
            title: i18nLazyString(UIStrings.showCoreWebVitalsOverlay),
        },
        {
            value: false,
            title: i18nLazyString(UIStrings.hideCoreWebVitalsOverlay),
        },
    ],
    defaultValue: false,
});
Common.Settings.registerSettingExtension({
    category: Common.Settings.SettingCategory.RENDERING,
    settingName: 'showFPSCounter',
    settingType: Common.Settings.SettingType.BOOLEAN,
    storageType: Common.Settings.SettingStorageType.Session,
    options: [
        {
            value: true,
            title: i18nLazyString(UIStrings.showFramesPerSecondFpsMeter),
        },
        {
            value: false,
            title: i18nLazyString(UIStrings.hideFramesPerSecondFpsMeter),
        },
    ],
    defaultValue: false,
});
Common.Settings.registerSettingExtension({
    category: Common.Settings.SettingCategory.RENDERING,
    settingName: 'showScrollBottleneckRects',
    settingType: Common.Settings.SettingType.BOOLEAN,
    storageType: Common.Settings.SettingStorageType.Session,
    options: [
        {
            value: true,
            title: i18nLazyString(UIStrings.showScrollPerformanceBottlenecks),
        },
        {
            value: false,
            title: i18nLazyString(UIStrings.hideScrollPerformanceBottlenecks),
        },
    ],
    defaultValue: false,
});
Common.Settings.registerSettingExtension({
    category: Common.Settings.SettingCategory.RENDERING,
    settingName: 'showHitTestBorders',
    settingType: Common.Settings.SettingType.BOOLEAN,
    storageType: Common.Settings.SettingStorageType.Session,
    options: [
        {
            value: true,
            title: i18nLazyString(UIStrings.showHittestBorders),
        },
        {
            value: false,
            title: i18nLazyString(UIStrings.hideHittestBorders),
        },
    ],
    defaultValue: false,
});
Common.Settings.registerSettingExtension({
    category: Common.Settings.SettingCategory.RENDERING,
    title: i18nLazyString(UIStrings.emulateAFocusedPage),
    settingName: 'emulatePageFocus',
    settingType: Common.Settings.SettingType.BOOLEAN,
    storageType: Common.Settings.SettingStorageType.Session,
    defaultValue: false,
    options: [
        {
            value: true,
            title: i18nLazyString(UIStrings.emulateAFocusedPage),
        },
        {
            value: false,
            title: i18nLazyString(UIStrings.doNotEmulateAFocusedPage),
        },
    ],
});
Common.Settings.registerSettingExtension({
    category: Common.Settings.SettingCategory.RENDERING,
    settingName: 'emulatedCSSMedia',
    settingType: Common.Settings.SettingType.ENUM,
    storageType: Common.Settings.SettingStorageType.Session,
    defaultValue: '',
    options: [
        {
            title: i18nLazyString(UIStrings.doNotEmulateCssMediaType),
            text: i18nLazyString(UIStrings.noEmulation),
            value: '',
        },
        {
            title: i18nLazyString(UIStrings.emulateCssPrintMediaType),
            text: i18nLazyString(UIStrings.print),
            value: 'print',
        },
        {
            title: i18nLazyString(UIStrings.emulateCssScreenMediaType),
            text: i18nLazyString(UIStrings.screen),
            value: 'screen',
        },
    ],
    tags: [
        i18nLazyString(UIStrings.query),
    ],
    title: i18nLazyString(UIStrings.emulateCssMediaType),
});
Common.Settings.registerSettingExtension({
    category: Common.Settings.SettingCategory.RENDERING,
    settingName: 'emulatedCSSMediaFeaturePrefersColorScheme',
    settingType: Common.Settings.SettingType.ENUM,
    storageType: Common.Settings.SettingStorageType.Session,
    defaultValue: '',
    options: [
        {
            title: i18nLazyString(UIStrings.doNotEmulateCss, { PH1: 'prefers-color-scheme' }),
            text: i18nLazyString(UIStrings.noEmulation),
            value: '',
        },
        {
            title: i18nLazyString(UIStrings.emulateCss, { PH1: 'prefers-color-scheme: light' }),
            text: i18n.i18n.lockedLazyString('prefers-color-scheme: light'),
            value: 'light',
        },
        {
            title: i18nLazyString(UIStrings.emulateCss, { PH1: 'prefers-color-scheme: dark' }),
            text: i18n.i18n.lockedLazyString('prefers-color-scheme: dark'),
            value: 'dark',
        },
    ],
    tags: [
        i18nLazyString(UIStrings.query),
    ],
    title: i18nLazyString(UIStrings.emulateCssMediaFeature, { PH1: 'prefers-color-scheme' }),
});
Common.Settings.registerSettingExtension({
    category: Common.Settings.SettingCategory.RENDERING,
    settingName: 'emulatedCSSMediaFeaturePrefersReducedMotion',
    settingType: Common.Settings.SettingType.ENUM,
    storageType: Common.Settings.SettingStorageType.Session,
    defaultValue: '',
    options: [
        {
            title: i18nLazyString(UIStrings.doNotEmulateCss, { PH1: 'prefers-reduced-motion' }),
            text: i18nLazyString(UIStrings.noEmulation),
            value: '',
        },
        {
            title: i18nLazyString(UIStrings.emulateCss, { PH1: 'prefers-reduced-motion: reduce' }),
            text: i18n.i18n.lockedLazyString('prefers-reduced-motion: reduce'),
            value: 'reduce',
        },
    ],
    tags: [
        i18nLazyString(UIStrings.query),
    ],
    title: i18nLazyString(UIStrings.emulateCssMediaFeature, { PH1: 'prefers-reduced-motion' }),
});
Common.Settings.registerSettingExtension({
    settingName: 'emulatedCSSMediaFeaturePrefersReducedData',
    settingType: Common.Settings.SettingType.ENUM,
    storageType: Common.Settings.SettingStorageType.Session,
    defaultValue: '',
    options: [
        {
            title: i18nLazyString(UIStrings.doNotEmulateCss, { PH1: 'prefers-reduced-data' }),
            text: i18nLazyString(UIStrings.noEmulation),
            value: '',
        },
        {
            title: i18nLazyString(UIStrings.emulateCss, { PH1: 'prefers-reduced-data: reduce' }),
            text: i18n.i18n.lockedLazyString('prefers-reduced-data: reduce'),
            value: 'reduce',
        },
    ],
    title: i18nLazyString(UIStrings.emulateCssMediaFeature, { PH1: 'prefers-reduced-data' }),
});
Common.Settings.registerSettingExtension({
    settingName: 'emulatedCSSMediaFeatureColorGamut',
    settingType: Common.Settings.SettingType.ENUM,
    storageType: Common.Settings.SettingStorageType.Session,
    defaultValue: '',
    options: [
        {
            title: i18nLazyString(UIStrings.doNotEmulateCss, { PH1: 'color-gamut' }),
            text: i18nLazyString(UIStrings.noEmulation),
            value: '',
        },
        {
            title: i18nLazyString(UIStrings.emulateCss, { PH1: 'color-gamut: srgb' }),
            text: i18n.i18n.lockedLazyString('color-gamut: srgb'),
            value: 'srgb',
        },
        {
            title: i18nLazyString(UIStrings.emulateCss, { PH1: 'color-gamut: p3' }),
            text: i18n.i18n.lockedLazyString('color-gamut: p3'),
            value: 'p3',
        },
        {
            title: i18nLazyString(UIStrings.emulateCss, { PH1: 'color-gamut: rec2020' }),
            text: i18n.i18n.lockedLazyString('color-gamut: rec2020'),
            value: 'rec2020',
        },
    ],
    title: i18nLazyString(UIStrings.emulateCssMediaFeature, { PH1: 'color-gamut' }),
});
Common.Settings.registerSettingExtension({
    category: Common.Settings.SettingCategory.RENDERING,
    settingName: 'emulatedVisionDeficiency',
    settingType: Common.Settings.SettingType.ENUM,
    storageType: Common.Settings.SettingStorageType.Session,
    defaultValue: 'none',
    options: [
        {
            title: i18nLazyString(UIStrings.doNotEmulateAnyVisionDeficiency),
            text: i18nLazyString(UIStrings.noEmulation),
            value: 'none',
        },
        {
            title: i18nLazyString(UIStrings.emulateBlurredVision),
            text: i18nLazyString(UIStrings.blurredVision),
            value: 'blurredVision',
        },
        {
            title: i18nLazyString(UIStrings.emulateProtanopia),
            text: i18nLazyString(UIStrings.protanopia),
            value: 'protanopia',
        },
        {
            title: i18nLazyString(UIStrings.emulateDeuteranopia),
            text: i18nLazyString(UIStrings.deuteranopia),
            value: 'deuteranopia',
        },
        {
            title: i18nLazyString(UIStrings.emulateTritanopia),
            text: i18nLazyString(UIStrings.tritanopia),
            value: 'tritanopia',
        },
        {
            title: i18nLazyString(UIStrings.emulateAchromatopsia),
            text: i18nLazyString(UIStrings.achromatopsia),
            value: 'achromatopsia',
        },
    ],
    tags: [
        i18nLazyString(UIStrings.query),
    ],
    title: i18nLazyString(UIStrings.emulateVisionDeficiencies),
});
Common.Settings.registerSettingExtension({
    category: Common.Settings.SettingCategory.RENDERING,
    settingName: 'localFontsDisabled',
    settingType: Common.Settings.SettingType.BOOLEAN,
    storageType: Common.Settings.SettingStorageType.Session,
    options: [
        {
            value: true,
            title: i18nLazyString(UIStrings.disableLocalFonts),
        },
        {
            value: false,
            title: i18nLazyString(UIStrings.enableLocalFonts),
        },
    ],
    defaultValue: false,
});
Common.Settings.registerSettingExtension({
    category: Common.Settings.SettingCategory.RENDERING,
    settingName: 'avifFormatDisabled',
    settingType: Common.Settings.SettingType.BOOLEAN,
    storageType: Common.Settings.SettingStorageType.Session,
    options: [
        {
            value: true,
            title: i18nLazyString(UIStrings.disableAvifFormat),
        },
        {
            value: false,
            title: i18nLazyString(UIStrings.enableAvifFormat),
        },
    ],
    defaultValue: false,
});
Common.Settings.registerSettingExtension({
    category: Common.Settings.SettingCategory.RENDERING,
    settingName: 'jpegXlFormatDisabled',
    settingType: Common.Settings.SettingType.BOOLEAN,
    storageType: Common.Settings.SettingStorageType.Session,
    options: [
        {
            value: true,
            title: i18nLazyString(UIStrings.disableJpegXlFormat),
        },
        {
            value: false,
            title: i18nLazyString(UIStrings.enableJpegXlFormat),
        },
    ],
    defaultValue: false,
});
Common.Settings.registerSettingExtension({
    category: Common.Settings.SettingCategory.RENDERING,
    settingName: 'webpFormatDisabled',
    settingType: Common.Settings.SettingType.BOOLEAN,
    storageType: Common.Settings.SettingStorageType.Session,
    options: [
        {
            value: true,
            title: i18nLazyString(UIStrings.disableWebpFormat),
        },
        {
            value: false,
            title: i18nLazyString(UIStrings.enableWebpFormat),
        },
    ],
    defaultValue: false,
});
Common.Settings.registerSettingExtension({
    category: Common.Settings.SettingCategory.CONSOLE,
    title: i18nLazyString(UIStrings.enableCustomFormatters),
    settingName: 'customFormatters',
    settingType: Common.Settings.SettingType.BOOLEAN,
    defaultValue: false,
});
Common.Settings.registerSettingExtension({
    category: Common.Settings.SettingCategory.NETWORK,
    title: i18nLazyString(UIStrings.enableNetworkRequestBlocking),
    settingName: 'requestBlockingEnabled',
    settingType: Common.Settings.SettingType.BOOLEAN,
    storageType: Common.Settings.SettingStorageType.Session,
    defaultValue: false,
    options: [
        {
            value: true,
            title: i18nLazyString(UIStrings.enableNetworkRequestBlocking),
        },
        {
            value: false,
            title: i18nLazyString(UIStrings.disableNetworkRequestBlocking),
        },
    ],
});
Common.Settings.registerSettingExtension({
    category: Common.Settings.SettingCategory.NETWORK,
    title: i18nLazyString('Disable cache (while DevTools is open)'),
    settingName: 'cacheDisabled',
    settingType: Common.Settings.SettingType.BOOLEAN,
    order: 0,
    defaultValue: false,
    userActionCondition: 'hasOtherClients',
    options: [
        {
            value: true,
            title: i18nLazyString('Disable cache (while DevTools is open)'),
        },
        {
            value: false,
            title: i18nLazyString(UIStrings.enableCache),
        },
    ],
});
//# sourceMappingURL=sdk-meta.js.map