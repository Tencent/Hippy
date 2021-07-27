// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../../../core/common/common.js';
import * as Host from '../../../../core/host/host.js';
import * as i18n from '../../../../core/i18n/i18n.js';
import * as Platform from '../../../../core/platform/platform.js';
import * as Root from '../../../../core/root/root.js';
import * as UI from '../../legacy.js';
const UIStrings = {
    /**
    *@description Label for when no contrast information is available in the color picker
    */
    noContrastInformationAvailable: 'No contrast information available',
    /**
    *@description Text of a DOM element in Contrast Details of the Color Picker
    */
    contrastRatio: 'Contrast ratio',
    /**
    *@description Text to show more content
    */
    showMore: 'Show more',
    /**
    *@description Choose bg color text content in Contrast Details of the Color Picker
    */
    pickBackgroundColor: 'Pick background color',
    /**
    *@description Tooltip text that appears when hovering over largeicon eyedropper button in Contrast Details of the Color Picker
    */
    toggleBackgroundColorPicker: 'Toggle background color picker',
    /**
    *@description Text of a button in Contrast Details of the Color Picker
    *@example {rgba(0 0 0 / 100%) } PH1
    */
    useSuggestedColorStoFixLow: 'Use suggested color {PH1}to fix low contrast',
    /**
    *@description Label for the APCA contrast in Color Picker
    */
    apca: 'APCA',
    /**
    *@description Label aa text content in Contrast Details of the Color Picker
    */
    aa: 'AA',
    /**
    *@description Text that starts with a colon and includes a placeholder
    *@example {3.0} PH1
    */
    placeholderWithColon: ': {PH1}',
    /**
    *@description Label aaa text content in Contrast Details of the Color Picker
    */
    aaa: 'AAA',
    /**
    *@description Text to show less content
    */
    showLess: 'Show less',
};
const str_ = i18n.i18n.registerUIStrings('ui/legacy/components/color_picker/ContrastDetails.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class ContrastDetails extends Common.ObjectWrapper.ObjectWrapper {
    _contrastInfo;
    _element;
    _toggleMainColorPicker;
    _expandedChangedCallback;
    _colorSelectedCallback;
    _expanded;
    _passesAA;
    _contrastUnknown;
    _visible;
    _noContrastInfoAvailable;
    _contrastValueBubble;
    _contrastValue;
    _contrastValueBubbleIcons;
    _expandButton;
    _expandedDetails;
    _contrastThresholds;
    _contrastAA;
    _contrastPassFailAA;
    _contrastAAA;
    _contrastPassFailAAA;
    _contrastAPCA;
    _contrastPassFailAPCA;
    _chooseBgColor;
    _bgColorPickerButton;
    _bgColorPickedBound;
    _bgColorSwatch;
    constructor(contrastInfo, contentElement, toggleMainColorPickerCallback, expandedChangedCallback, colorSelectedCallback) {
        super();
        this._contrastInfo = contrastInfo;
        this._element = contentElement.createChild('div', 'spectrum-contrast-details collapsed');
        this._toggleMainColorPicker = toggleMainColorPickerCallback;
        this._expandedChangedCallback = expandedChangedCallback;
        this._colorSelectedCallback = colorSelectedCallback;
        this._expanded = false;
        this._passesAA = true;
        this._contrastUnknown = false;
        // This will not be visible if we don't get ContrastInfo,
        // e.g. for a non-font color property such as border-color.
        this._visible = false;
        // No contrast info message is created to show if it's not possible to provide the extended details.
        this._noContrastInfoAvailable = contentElement.createChild('div', 'no-contrast-info-available');
        this._noContrastInfoAvailable.textContent = i18nString(UIStrings.noContrastInformationAvailable);
        this._noContrastInfoAvailable.classList.add('hidden');
        const contrastValueRow = this._element.createChild('div');
        contrastValueRow.addEventListener('click', this._topRowClicked.bind(this));
        const contrastValueRowContents = contrastValueRow.createChild('div', 'container');
        UI.UIUtils.createTextChild(contrastValueRowContents, i18nString(UIStrings.contrastRatio));
        this._contrastValueBubble = contrastValueRowContents.createChild('span', 'contrast-details-value');
        this._contrastValue = this._contrastValueBubble.createChild('span');
        this._contrastValueBubbleIcons = [];
        this._contrastValueBubbleIcons.push(this._contrastValueBubble.appendChild(UI.Icon.Icon.create('smallicon-checkmark-square')));
        this._contrastValueBubbleIcons.push(this._contrastValueBubble.appendChild(UI.Icon.Icon.create('smallicon-checkmark-behind')));
        this._contrastValueBubbleIcons.push(this._contrastValueBubble.appendChild(UI.Icon.Icon.create('smallicon-no')));
        this._contrastValueBubbleIcons.forEach(button => button.addEventListener('click', (event) => {
            ContrastDetails._showHelp();
            event.consume(false);
        }));
        const expandToolbar = new UI.Toolbar.Toolbar('expand', contrastValueRowContents);
        this._expandButton = new UI.Toolbar.ToolbarButton(i18nString(UIStrings.showMore), 'smallicon-expand-more');
        this._expandButton.addEventListener(UI.Toolbar.ToolbarButton.Events.Click, this._expandButtonClicked.bind(this));
        UI.ARIAUtils.setExpanded(this._expandButton.element, false);
        expandToolbar.appendToolbarItem(this._expandButton);
        this._expandedDetails = this._element.createChild('div', 'expanded-details');
        UI.ARIAUtils.setControls(this._expandButton.element, this._expandedDetails);
        this._contrastThresholds = this._expandedDetails.createChild('div', 'contrast-thresholds');
        this._contrastAA = this._contrastThresholds.createChild('div', 'contrast-threshold');
        this._contrastPassFailAA = this._contrastAA.createChild('div', 'contrast-pass-fail');
        this._contrastAAA = this._contrastThresholds.createChild('div', 'contrast-threshold');
        this._contrastPassFailAAA = this._contrastAAA.createChild('div', 'contrast-pass-fail');
        this._contrastAPCA = this._contrastThresholds.createChild('div', 'contrast-threshold');
        this._contrastPassFailAPCA = this._contrastAPCA.createChild('div', 'contrast-pass-fail');
        this._chooseBgColor = this._expandedDetails.createChild('div', 'contrast-choose-bg-color');
        this._chooseBgColor.textContent = i18nString(UIStrings.pickBackgroundColor);
        const bgColorContainer = this._expandedDetails.createChild('div', 'background-color');
        const pickerToolbar = new UI.Toolbar.Toolbar('spectrum-eye-dropper', bgColorContainer);
        this._bgColorPickerButton =
            new UI.Toolbar.ToolbarToggle(i18nString(UIStrings.toggleBackgroundColorPicker), 'largeicon-eyedropper');
        this._bgColorPickerButton.addEventListener(UI.Toolbar.ToolbarButton.Events.Click, this._toggleBackgroundColorPicker.bind(this, undefined, true));
        pickerToolbar.appendToolbarItem(this._bgColorPickerButton);
        this._bgColorPickedBound = this._bgColorPicked.bind(this);
        this._bgColorSwatch = new Swatch(bgColorContainer);
        this._contrastInfo.addEventListener("ContrastInfoUpdated" /* ContrastInfoUpdated */, this._update.bind(this));
    }
    _showNoContrastInfoAvailableMessage() {
        this._noContrastInfoAvailable.classList.remove('hidden');
    }
    _hideNoContrastInfoAvailableMessage() {
        this._noContrastInfoAvailable.classList.add('hidden');
    }
    _computeSuggestedColor(threshold) {
        const fgColor = this._contrastInfo.color();
        const bgColor = this._contrastInfo.bgColor();
        if (!fgColor || !bgColor) {
            return;
        }
        if (threshold === 'APCA') {
            const requiredContrast = this._contrastInfo.contrastRatioAPCAThreshold();
            if (requiredContrast === null) {
                return;
            }
            // We add 1% to the min required contrast to make sure we are over the limit.
            return Common.Color.Color.findFgColorForContrastAPCA(fgColor, bgColor, requiredContrast + 1);
        }
        const requiredContrast = this._contrastInfo.contrastRatioThreshold(threshold);
        if (!requiredContrast) {
            return;
        }
        // We add a bit to the required contrast to make sure we are over the limit.
        return Common.Color.Color.findFgColorForContrast(fgColor, bgColor, requiredContrast + 0.1);
    }
    _onSuggestColor(threshold) {
        Host.userMetrics.colorFixed(threshold);
        const color = this._computeSuggestedColor(threshold);
        if (color) {
            this._colorSelectedCallback(color);
        }
    }
    _createFixColorButton(parent, suggestedColor) {
        const button = parent.createChild('button', 'contrast-fix-button');
        const originalColorFormat = this._contrastInfo.colorFormat();
        const colorFormat = originalColorFormat && originalColorFormat !== Common.Color.Format.Nickname &&
            originalColorFormat !== Common.Color.Format.Original ?
            originalColorFormat :
            Common.Color.Format.HEXA;
        const formattedColor = suggestedColor.asString(colorFormat);
        const suggestedColorString = formattedColor ? formattedColor + ' ' : '';
        const label = i18nString(UIStrings.useSuggestedColorStoFixLow, { PH1: suggestedColorString });
        UI.ARIAUtils.setAccessibleName(button, label);
        UI.Tooltip.Tooltip.install(button, label);
        button.tabIndex = 0;
        button.style.backgroundColor = suggestedColorString;
        return button;
    }
    _update() {
        if (this._contrastInfo.isNull()) {
            this._showNoContrastInfoAvailableMessage();
            this.setVisible(false);
            return;
        }
        this.setVisible(true);
        this._hideNoContrastInfoAvailableMessage();
        const isAPCAEnabled = Root.Runtime.experiments.isEnabled('APCA');
        const fgColor = this._contrastInfo.color();
        const bgColor = this._contrastInfo.bgColor();
        if (isAPCAEnabled) {
            const apcaContrastRatio = this._contrastInfo.contrastRatioAPCA();
            if (apcaContrastRatio === null || !bgColor || !fgColor) {
                this._contrastUnknown = true;
                this._contrastValue.textContent = '';
                this._contrastValueBubble.classList.add('contrast-unknown');
                this._chooseBgColor.classList.remove('hidden');
                this._contrastThresholds.classList.add('hidden');
                this._showNoContrastInfoAvailableMessage();
                return;
            }
            this._contrastUnknown = false;
            this._chooseBgColor.classList.add('hidden');
            this._contrastThresholds.classList.remove('hidden');
            this._contrastValueBubble.classList.remove('contrast-unknown');
            this._contrastValue.textContent = `${Platform.NumberUtilities.floor(apcaContrastRatio, 2)}%`;
            const apcaThreshold = this._contrastInfo.contrastRatioAPCAThreshold();
            const passesAPCA = apcaContrastRatio && apcaThreshold ? Math.abs(apcaContrastRatio) >= apcaThreshold : false;
            this._contrastPassFailAPCA.removeChildren();
            const labelAPCA = this._contrastPassFailAPCA.createChild('span', 'contrast-link-label');
            labelAPCA.textContent = i18nString(UIStrings.apca);
            if (apcaThreshold !== null) {
                this._contrastPassFailAPCA.createChild('span').textContent = `: ${apcaThreshold.toFixed(2)}%`;
            }
            if (passesAPCA) {
                this._contrastPassFailAPCA.appendChild(UI.Icon.Icon.create('smallicon-checkmark-square'));
            }
            else {
                this._contrastPassFailAPCA.appendChild(UI.Icon.Icon.create('smallicon-no'));
                const suggestedColor = this._computeSuggestedColor('APCA');
                if (suggestedColor) {
                    const fixAPCA = this._createFixColorButton(this._contrastPassFailAPCA, suggestedColor);
                    fixAPCA.addEventListener('click', () => this._onSuggestColor('APCA'));
                }
            }
            labelAPCA.addEventListener('click', (_event) => ContrastDetails._showHelp());
            this._element.classList.toggle('contrast-fail', !passesAPCA);
            this._contrastValueBubble.classList.toggle('contrast-aa', passesAPCA);
            return;
        }
        const contrastRatio = this._contrastInfo.contrastRatio();
        if (!contrastRatio || !bgColor || !fgColor) {
            this._contrastUnknown = true;
            this._contrastValue.textContent = '';
            this._contrastValueBubble.classList.add('contrast-unknown');
            this._chooseBgColor.classList.remove('hidden');
            this._contrastThresholds.classList.add('hidden');
            this._showNoContrastInfoAvailableMessage();
            return;
        }
        this._contrastUnknown = false;
        this._chooseBgColor.classList.add('hidden');
        this._contrastThresholds.classList.remove('hidden');
        this._contrastValueBubble.classList.remove('contrast-unknown');
        this._contrastValue.textContent = String(Platform.NumberUtilities.floor(contrastRatio, 2));
        this._bgColorSwatch.setColors(fgColor, bgColor);
        // In greater then comparisons we can substite null with 0.
        const aa = this._contrastInfo.contrastRatioThreshold('aa') || 0;
        this._passesAA = (this._contrastInfo.contrastRatio() || 0) >= aa;
        this._contrastPassFailAA.removeChildren();
        const labelAA = this._contrastPassFailAA.createChild('span', 'contrast-link-label');
        labelAA.textContent = i18nString(UIStrings.aa);
        this._contrastPassFailAA.createChild('span').textContent =
            i18nString(UIStrings.placeholderWithColon, { PH1: aa.toFixed(1) });
        if (this._passesAA) {
            this._contrastPassFailAA.appendChild(UI.Icon.Icon.create('smallicon-checkmark-square'));
        }
        else {
            this._contrastPassFailAA.appendChild(UI.Icon.Icon.create('smallicon-no'));
            const suggestedColor = this._computeSuggestedColor('aa');
            if (suggestedColor) {
                const fixAA = this._createFixColorButton(this._contrastPassFailAA, suggestedColor);
                fixAA.addEventListener('click', () => this._onSuggestColor('aa'));
            }
        }
        // In greater then comparisons we can substite null with 0.
        const aaa = this._contrastInfo.contrastRatioThreshold('aaa') || 0;
        const passesAAA = (this._contrastInfo.contrastRatio() || 0) >= aaa;
        this._contrastPassFailAAA.removeChildren();
        const labelAAA = this._contrastPassFailAAA.createChild('span', 'contrast-link-label');
        labelAAA.textContent = i18nString(UIStrings.aaa);
        this._contrastPassFailAAA.createChild('span').textContent =
            i18nString(UIStrings.placeholderWithColon, { PH1: aaa.toFixed(1) });
        if (passesAAA) {
            this._contrastPassFailAAA.appendChild(UI.Icon.Icon.create('smallicon-checkmark-square'));
        }
        else {
            this._contrastPassFailAAA.appendChild(UI.Icon.Icon.create('smallicon-no'));
            const suggestedColor = this._computeSuggestedColor('aaa');
            if (suggestedColor) {
                const fixAAA = this._createFixColorButton(this._contrastPassFailAAA, suggestedColor);
                fixAAA.addEventListener('click', () => this._onSuggestColor('aaa'));
            }
        }
        [labelAA, labelAAA].forEach(e => e.addEventListener('click', () => ContrastDetails._showHelp()));
        this._element.classList.toggle('contrast-fail', !this._passesAA);
        this._contrastValueBubble.classList.toggle('contrast-aa', this._passesAA);
        this._contrastValueBubble.classList.toggle('contrast-aaa', passesAAA);
    }
    static _showHelp() {
        Host.InspectorFrontendHost.InspectorFrontendHostInstance.openInNewTab(UI.UIUtils.addReferrerToURL('https://web.dev/color-and-contrast-accessibility/'));
    }
    setVisible(visible) {
        this._visible = visible;
        this._element.classList.toggle('hidden', !visible);
    }
    visible() {
        return this._visible;
    }
    element() {
        return this._element;
    }
    _expandButtonClicked(_event) {
        const selection = this._contrastValueBubble.getComponentSelection();
        if (selection) {
            selection.empty();
        }
        this._toggleExpanded();
    }
    _topRowClicked(event) {
        const selection = this._contrastValueBubble.getComponentSelection();
        if (selection) {
            selection.empty();
        }
        this._toggleExpanded();
        event.consume(true);
    }
    _toggleExpanded() {
        this._expanded = !this._expanded;
        UI.ARIAUtils.setExpanded(this._expandButton.element, this._expanded);
        this._element.classList.toggle('collapsed', !this._expanded);
        if (this._expanded) {
            this._toggleMainColorPicker(false);
            this._expandButton.setGlyph('smallicon-expand-less');
            this._expandButton.setTitle(i18nString(UIStrings.showLess));
            if (this._contrastUnknown) {
                this._toggleBackgroundColorPicker(true);
            }
        }
        else {
            this._toggleBackgroundColorPicker(false);
            this._expandButton.setGlyph('smallicon-expand-more');
            this._expandButton.setTitle(i18nString(UIStrings.showMore));
        }
        this._expandedChangedCallback();
    }
    collapse() {
        this._element.classList.remove('expanded');
        this._toggleBackgroundColorPicker(false);
        this._toggleMainColorPicker(false);
    }
    expanded() {
        return this._expanded;
    }
    backgroundColorPickerEnabled() {
        return this._bgColorPickerButton.toggled();
    }
    toggleBackgroundColorPicker(enabled) {
        this._toggleBackgroundColorPicker(enabled, false);
    }
    _toggleBackgroundColorPicker(enabled, shouldTriggerEvent = true) {
        if (enabled === undefined) {
            enabled = !this._bgColorPickerButton.toggled();
        }
        this._bgColorPickerButton.setToggled(enabled);
        if (shouldTriggerEvent) {
            this.dispatchEventToListeners(Events.BackgroundColorPickerWillBeToggled, enabled);
        }
        Host.InspectorFrontendHost.InspectorFrontendHostInstance.setEyeDropperActive(enabled);
        if (enabled) {
            Host.InspectorFrontendHost.InspectorFrontendHostInstance.events.addEventListener(Host.InspectorFrontendHostAPI.Events.EyeDropperPickedColor, this._bgColorPickedBound);
        }
        else {
            Host.InspectorFrontendHost.InspectorFrontendHostInstance.events.removeEventListener(Host.InspectorFrontendHostAPI.Events.EyeDropperPickedColor, this._bgColorPickedBound);
        }
    }
    _bgColorPicked(event) {
        const rgbColor = event.data;
        const rgba = [rgbColor.r, rgbColor.g, rgbColor.b, (rgbColor.a / 2.55 | 0) / 100];
        const color = Common.Color.Color.fromRGBA(rgba);
        this._contrastInfo.setBgColor(color);
        this._toggleBackgroundColorPicker(false);
        Host.InspectorFrontendHost.InspectorFrontendHostInstance.bringToFront();
    }
}
export const Events = {
    BackgroundColorPickerWillBeToggled: Symbol('BackgroundColorPickerWillBeToggled'),
};
export class Swatch {
    _parentElement;
    _swatchElement;
    _swatchInnerElement;
    _textPreview;
    constructor(parentElement) {
        this._parentElement = parentElement;
        this._swatchElement = parentElement.createChild('span', 'swatch contrast swatch-inner-white');
        this._swatchInnerElement = this._swatchElement.createChild('span', 'swatch-inner');
        this._textPreview = this._swatchElement.createChild('div', 'text-preview');
        this._textPreview.textContent = 'Aa';
    }
    setColors(fgColor, bgColor) {
        this._textPreview.style.color = fgColor.asString(Common.Color.Format.RGBA);
        this._swatchInnerElement.style.backgroundColor = bgColor.asString(Common.Color.Format.RGBA);
        // Show border if the swatch is white.
        this._swatchElement.classList.toggle('swatch-inner-white', bgColor.hsla()[2] > 0.9);
    }
}
//# sourceMappingURL=ContrastDetails.js.map