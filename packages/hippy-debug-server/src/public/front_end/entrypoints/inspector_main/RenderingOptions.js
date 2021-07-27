/*
 * Copyright (C) 2013 Google Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js'; // eslint-disable-line no-unused-vars
import * as i18n from '../../core/i18n/i18n.js';
import * as UI from '../../ui/legacy/legacy.js';
const UIStrings = {
    /**
    * @description The name of a checkbox setting in the Rendering tool. This setting highlights areas
    * of the webpage that need to be repainted (re-drawn by the browser).
    */
    paintFlashing: 'Paint flashing',
    /**
    * @description Explanation text for the 'Paint flashing' setting in the Rendering tool.
    */
    highlightsAreasOfThePageGreen: 'Highlights areas of the page (green) that need to be repainted. May not be suitable for people prone to photosensitive epilepsy.',
    /**
    * @description The name of a checkbox setting in the Rendering tool. This setting highlights areas
    * (regions) of the page that were shifted (where a 'layout shift' occurred). A layout shift is
    * where elements on the webpage move around and cause other nearby elements to move as well.
    */
    layoutShiftRegions: 'Layout Shift Regions',
    /**
    * @description Explanation text for the 'Layout Shift Regions' setting in the Rendering tool.
    */
    highlightsAreasOfThePageBlueThat: 'Highlights areas of the page (blue) that were shifted. May not be suitable for people prone to photosensitive epilepsy.',
    /**
    * @description The name of a checkbox setting in the Rendering tool. This setting shows the
    * borders of layers on the page. Layer is a noun.
    */
    layerBorders: 'Layer borders',
    /**
    * @description Explanation text for the 'Layer borders' setting in the Rendering tool.
    */
    showsLayerBordersOrangeoliveAnd: 'Shows layer borders (orange/olive) and tiles (cyan).',
    /**
    * @description The name of a checkbox setting in the Rendering tool. This setting shows the
    * rendering statistics for frames e.g. frames per second. Frame is a noun.
    */
    frameRenderingStats: 'Frame Rendering Stats',
    /**
    * @description Explanation text for the 'Frame Rendering Stats' setting in the Rendering tool.
    * Plots is a verb. GPU = Graphics Processing Unit.
    */
    plotsFrameThroughputDropped: 'Plots frame throughput, dropped frames distribution, and GPU memory.',
    /**
    * @description The name of a checkbox setting in the Rendering tool. This setting highlights
    * elements that can slow down scrolling on the page.
    */
    scrollingPerformanceIssues: 'Scrolling performance issues',
    /**
    * @description Explanation text for the 'Scrolling performance issues' setting in the Rendering tool.
    */
    highlightsElementsTealThatCan: 'Highlights elements (teal) that can slow down scrolling, including touch & wheel event handlers and other main-thread scrolling situations.',
    /**
    * @description The name of a checkbox setting in the Rendering tool. This setting highlights the
    * rendering frames for ads that are found on the page.
    */
    highlightAdFrames: 'Highlight ad frames',
    /**
    * @description Explanation text for the 'Highlight ad frames' setting in the Rendering tool.
    */
    highlightsFramesRedDetectedToBe: 'Highlights frames (red) detected to be ads.',
    /**
    * @description The name of a checkbox setting in the Rendering tool. This setting shows borders
    * around hit-test regions. 'hit-test regions' are areas on the page where the browser is listening
    * for mouse clicks.
    */
    hittestBorders: 'Hit-test borders',
    /**
    * @description Explanation text for the 'Hit-test borders' setting in the Rendering tool.
    */
    showsBordersAroundHittestRegions: 'Shows borders around hit-test regions.',
    /**
    * @description The name of a checkbox setting in the Rendering tool. This setting shows an overlay
    * with Core Web Vitals. Core Web Vitals: https://support.google.com/webmasters/answer/9205520?hl=en
    */
    coreWebVitals: 'Core Web Vitals',
    /**
    * @description Explanation text for the 'Core Web Vitals' setting in the Rendering tool.
    */
    showsAnOverlayWithCoreWebVitals: 'Shows an overlay with Core Web Vitals.',
    /**
    * @description The name of a checkbox setting in the Rendering tool. This setting prevents the
    * webpage from loading 'local' fonts. Local fonts are fonts that are installed on the user's
    * computer, and not loaded over the network.
    */
    disableLocalFonts: 'Disable local fonts',
    /**
    * @description Explanation text for the 'Disable local fonts' setting in the Rendering tool.
    */
    disablesLocalSourcesInFontface: 'Disables `local()` sources in `@font-face` rules. Requires a page reload to apply.',
    /**
    * @description The name of a checkbox setting in the Rendering tool. This setting
    * emulates/pretends that the webpage is focused i.e. that the user interacted with it most
    * recently.
    */
    emulateAFocusedPage: 'Emulate a focused page',
    /**
    * @description Explanation text for the 'Emulate a focused page' setting in the Rendering tool.
    */
    emulatesAFocusedPage: 'Emulates a focused page.',
    /**
    * @description Explanation text for the 'Emulate CSS media type' setting in the Rendering tool.
    * This setting overrides the CSS media type on the page:
    * https://developer.mozilla.org/en-US/docs/Web/CSS/@media#media_types
    */
    forcesMediaTypeForTestingPrint: 'Forces media type for testing print and screen styles',
    /**
    * @description Explanation text for the 'Forces CSS prefers-color-scheme media' setting in the Rendering tool.
    */
    forcesCssPreferscolorschemeMedia: 'Forces CSS `prefers-color-scheme` media feature',
    /**
    * @description Explanation text for the 'Forces CSS prefers-reduced-motion media' setting in the Rendering tool.
    */
    forcesCssPrefersreducedmotion: 'Forces CSS `prefers-reduced-motion` media feature',
    /**
    * @description Explanation text for the 'Forces CSS prefers-reduced-data media' setting in the Rendering tool.
    */
    forcesCssPrefersreduceddataMedia: 'Forces CSS `prefers-reduced-data` media feature',
    /**
    * @description Explanation text for the 'Forces CSS color-gamut media' setting in the Rendering tool.
    */
    forcesCssColorgamutMediaFeature: 'Forces CSS `color-gamut` media feature',
    /**
    * @description Explanation text for the 'Emulate vision deficiencies' setting in the Rendering tool.
    */
    forcesVisionDeficiencyEmulation: 'Forces vision deficiency emulation',
    /**
    * @description The name of a checkbox setting in the Rendering tool. This setting disables the
    * page from loading images with the AVIF format.
    */
    disableAvifImageFormat: 'Disable `AVIF` image format',
    /**
    * @description The name of a checkbox setting in the Rendering tool. This setting disables the
    * page from loading images with the JPEG XL format.
    */
    disableJpegXlImageFormat: 'Disable `JPEG XL` image format',
    /**
    * @description Explanation text for both the 'Disable AVIF image format' and 'Disable WebP image
    * format' settings in the Rendering tool.
    */
    requiresAPageReloadToApplyAnd: 'Requires a page reload to apply and disables caching for image requests.',
    /**
    * @description The name of a checkbox setting in the Rendering tool. This setting disables the
    * page from loading images with the WebP format.
    */
    disableWebpImageFormat: 'Disable `WebP` image format',
};
const str_ = i18n.i18n.registerUIStrings('entrypoints/inspector_main/RenderingOptions.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
// TODO(1096068): remove this feature detection and expose the UI
// unconditionally once prefers-reduced-data ships unflagged. At that
// point, we can also add `category` and `tags` to the entry in
// `front_end/sdk/module.json` to make this feature available in the
// Command Menu.
const supportsPrefersReducedData = () => {
    const query = '(prefers-reduced-data: reduce)';
    // Note: `media` serializes to `'not all'` for unsupported queries.
    return window.matchMedia(query).media === query;
};
const supportsJpegXl = async () => {
    const JPEG_XL_IMAGE_URL = 'data:image/jxl;base64,/wp/QCQIBgEAFABLEiRhAA==';
    const promise = new Promise((resolve) => {
        const img = document.createElement('img');
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = JPEG_XL_IMAGE_URL;
    });
    return promise;
};
let renderingOptionsViewInstance;
export class RenderingOptionsView extends UI.Widget.VBox {
    constructor() {
        super(true);
        this.registerRequiredCSS('entrypoints/inspector_main/renderingOptions.css', { enableLegacyPatching: false });
        this._appendCheckbox(i18nString(UIStrings.paintFlashing), i18nString(UIStrings.highlightsAreasOfThePageGreen), Common.Settings.Settings.instance().moduleSetting('showPaintRects'));
        this._appendCheckbox(i18nString(UIStrings.layoutShiftRegions), i18nString(UIStrings.highlightsAreasOfThePageBlueThat), Common.Settings.Settings.instance().moduleSetting('showLayoutShiftRegions'));
        this._appendCheckbox(i18nString(UIStrings.layerBorders), i18nString(UIStrings.showsLayerBordersOrangeoliveAnd), Common.Settings.Settings.instance().moduleSetting('showDebugBorders'));
        this._appendCheckbox(i18nString(UIStrings.frameRenderingStats), i18nString(UIStrings.plotsFrameThroughputDropped), Common.Settings.Settings.instance().moduleSetting('showFPSCounter'));
        this._appendCheckbox(i18nString(UIStrings.scrollingPerformanceIssues), i18nString(UIStrings.highlightsElementsTealThatCan), Common.Settings.Settings.instance().moduleSetting('showScrollBottleneckRects'));
        this._appendCheckbox(i18nString(UIStrings.highlightAdFrames), i18nString(UIStrings.highlightsFramesRedDetectedToBe), Common.Settings.Settings.instance().moduleSetting('showAdHighlights'));
        this._appendCheckbox(i18nString(UIStrings.hittestBorders), i18nString(UIStrings.showsBordersAroundHittestRegions), Common.Settings.Settings.instance().moduleSetting('showHitTestBorders'));
        this._appendCheckbox(i18nString(UIStrings.coreWebVitals), i18nString(UIStrings.showsAnOverlayWithCoreWebVitals), Common.Settings.Settings.instance().moduleSetting('showWebVitals'));
        this._appendCheckbox(i18nString(UIStrings.disableLocalFonts), i18nString(UIStrings.disablesLocalSourcesInFontface), Common.Settings.Settings.instance().moduleSetting('localFontsDisabled'));
        this._appendCheckbox(i18nString(UIStrings.emulateAFocusedPage), i18nString(UIStrings.emulatesAFocusedPage), Common.Settings.Settings.instance().moduleSetting('emulatePageFocus'));
        this.contentElement.createChild('div').classList.add('panel-section-separator');
        this._appendSelect(i18nString(UIStrings.forcesMediaTypeForTestingPrint), Common.Settings.Settings.instance().moduleSetting('emulatedCSSMedia'));
        this._appendSelect(i18nString(UIStrings.forcesCssPreferscolorschemeMedia), Common.Settings.Settings.instance().moduleSetting('emulatedCSSMediaFeaturePrefersColorScheme'));
        this._appendSelect(i18nString(UIStrings.forcesCssPrefersreducedmotion), Common.Settings.Settings.instance().moduleSetting('emulatedCSSMediaFeaturePrefersReducedMotion'));
        if (supportsPrefersReducedData()) {
            this._appendSelect(i18nString(UIStrings.forcesCssPrefersreduceddataMedia), Common.Settings.Settings.instance().moduleSetting('emulatedCSSMediaFeaturePrefersReducedData'));
        }
        this._appendSelect(i18nString(UIStrings.forcesCssColorgamutMediaFeature), Common.Settings.Settings.instance().moduleSetting('emulatedCSSMediaFeatureColorGamut'));
        this.contentElement.createChild('div').classList.add('panel-section-separator');
        this._appendSelect(i18nString(UIStrings.forcesVisionDeficiencyEmulation), Common.Settings.Settings.instance().moduleSetting('emulatedVisionDeficiency'));
        this.contentElement.createChild('div').classList.add('panel-section-separator');
        this._appendCheckbox(i18nString(UIStrings.disableAvifImageFormat), i18nString(UIStrings.requiresAPageReloadToApplyAnd), Common.Settings.Settings.instance().moduleSetting('avifFormatDisabled'));
        const webpCheckbox = this._appendCheckbox(i18nString(UIStrings.disableWebpImageFormat), i18nString(UIStrings.requiresAPageReloadToApplyAnd), Common.Settings.Settings.instance().moduleSetting('webpFormatDisabled'));
        this.contentElement.createChild('div').classList.add('panel-section-separator');
        supportsJpegXl().then(hasSupport => {
            if (!hasSupport) {
                return;
            }
            webpCheckbox.before(this._createCheckbox(i18nString(UIStrings.disableJpegXlImageFormat), i18nString(UIStrings.requiresAPageReloadToApplyAnd), Common.Settings.Settings.instance().moduleSetting('jpegXlFormatDisabled')));
        });
    }
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!renderingOptionsViewInstance || forceNew) {
            renderingOptionsViewInstance = new RenderingOptionsView();
        }
        return renderingOptionsViewInstance;
    }
    _createCheckbox(label, subtitle, setting) {
        const checkboxLabel = UI.UIUtils.CheckboxLabel.create(label, false, subtitle);
        UI.SettingsUI.bindCheckbox(checkboxLabel.checkboxElement, setting);
        return checkboxLabel;
    }
    _appendCheckbox(label, subtitle, setting) {
        const checkbox = this._createCheckbox(label, subtitle, setting);
        this.contentElement.appendChild(checkbox);
        return checkbox;
    }
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _appendSelect(label, setting) {
        const control = UI.SettingsUI.createControlForSetting(setting, label);
        if (control) {
            this.contentElement.appendChild(control);
        }
    }
}
//# sourceMappingURL=RenderingOptions.js.map