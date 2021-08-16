// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/*
 * Copyright (C) 2011 Brian Grinstead All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 * 1.  Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 * 2.  Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 * 3.  Neither the name of Apple Computer, Inc. ("Apple") nor the names of
 *     its contributors may be used to endorse or promote products derived
 *     from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE AND ITS CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL APPLE OR ITS CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../../../core/common/common.js';
import * as Host from '../../../../core/host/host.js';
import * as i18n from '../../../../core/i18n/i18n.js';
import * as Platform from '../../../../core/platform/platform.js';
import * as SDK from '../../../../core/sdk/sdk.js';
import * as IconButton from '../../../components/icon_button/icon_button.js';
import * as UI from '../../legacy.js';
import { ContrastDetails, Events as ContrastDetailsEvents } from './ContrastDetails.js';
import { ContrastOverlay } from './ContrastOverlay.js';
const UIStrings = {
    /**
    *@description Tooltip text that appears when hovering over largeicon eyedropper button in Spectrum of the Color Picker
    */
    toggleColorPicker: 'Toggle color picker',
    /**
    *@description Aria label for hue slider in Color Picker
    */
    changeHue: 'Change hue',
    /**
    * @description Aria label for alpha slider in Color Picker. Alpha refers to the alpha channel of a
    * color, and this tool allows the user to change the alpha value.
    */
    changeAlpha: 'Change alpha',
    /**
    *@description Aria label for HEX color format input
    */
    hex: 'HEX',
    /**
    *@description Aria label for color format switcher button in Color Picker
    */
    changeColorFormat: 'Change color format',
    /**
    *@description Screen reader reads this text when palette switcher button receives focus
    */
    previewPalettes: 'Preview palettes',
    /**
    *@description Tooltip text that appears when hovering over the largeicon add button in the Spectrum of the Color Picker
    */
    addToPalette: 'Add to palette',
    /**
    *@description Title text content in Spectrum of the Color Picker
    */
    colorPalettes: 'Color Palettes',
    /**
    *@description Label for close button in Color Picker
    */
    returnToColorPicker: 'Return to color picker',
    /**
    *@description Aria label which declares hex value of a swatch in the Color Picker
    *@example {#969696} PH1
    */
    colorS: 'Color {PH1}',
    /**
    *@description Color element title in Spectrum of the Color Picker
    *@example {#9c1724} PH1
    */
    longclickOrLongpressSpaceToShow: 'Long-click or long-press space to show alternate shades of {PH1}',
    /**
    *@description A context menu item in the Color Picker to organize the user-defined color palette (removes the user-defined color to which this action is performed)"
    */
    removeColor: 'Remove color',
    /**
    *@description A context menu item in the Color Picker to organize the user-defined color palette (removes all user-defined colors to the right of the color to which this action is performed)"
    */
    removeAllToTheRight: 'Remove all to the right',
    /**
    *@description A context menu item in the Color Picker to organize the user-defined color palette (removes all user-defined colors)"
    */
    clearPalette: 'Clear palette',
    /**
    *@description Aria label for RGBA and HSLA color format inputs in Color Picker
    *@example {R} PH1
    *@example {RGBA} PH2
    */
    sInS: '{PH1} in {PH2}',
    /**
    *@description Swatch copy icon title in Spectrum of the Color Picker
    */
    copyColorToClipboard: 'Copy color to clipboard',
    /**
    *@description Aria text for the swatch position. Swatch is the color picker spectrum tool.
    */
    pressArrowKeysMessage: 'Press arrow keys with or without modifiers to move swatch position. Arrow key with Shift key moves position largely, with Ctrl key it is less and with Alt key it is even less',
};
const str_ = i18n.i18n.registerUIStrings('ui/legacy/components/color_picker/Spectrum.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
const colorElementToMutable = new WeakMap();
const colorElementToColor = new WeakMap();
export class Spectrum extends UI.Widget.VBox {
    _colorElement;
    _colorDragElement;
    _dragX;
    _dragY;
    _colorPickerButton;
    _swatch;
    _hueElement;
    _hueSlider;
    _alphaElement;
    _alphaElementBackground;
    _alphaSlider;
    _displayContainer;
    _textValues;
    _textLabels;
    _hexContainer;
    _hexValue;
    _contrastInfo;
    _contrastOverlay;
    _contrastDetails;
    _contrastDetailsBackgroundColorPickedToggledBound;
    _palettes;
    _palettePanel;
    _palettePanelShowing;
    _paletteSectionContainer;
    _paletteContainer;
    _shadesContainer;
    _deleteIconToolbar;
    _deleteButton;
    _addColorToolbar;
    _colorPickedBound;
    _hsv;
    _hueAlphaWidth;
    dragWidth;
    dragHeight;
    _colorDragElementHeight;
    slideHelperWidth;
    _numPaletteRowsShown;
    _selectedColorPalette;
    _customPaletteSetting;
    _colorOffset;
    _closeButton;
    _paletteContainerMutable;
    _shadesCloseHandler;
    _dragElement;
    _dragHotSpotX;
    _dragHotSpotY;
    _originalFormat;
    _colorName;
    _colorString;
    _colorFormat;
    constructor(contrastInfo) {
        super(true);
        this.registerRequiredCSS('ui/legacy/components/color_picker/spectrum.css', { enableLegacyPatching: false });
        this.contentElement.tabIndex = 0;
        this._colorElement = this.contentElement.createChild('div', 'spectrum-color');
        this._colorElement.tabIndex = 0;
        this.setDefaultFocusedElement(this._colorElement);
        this._colorElement.addEventListener('keydown', this._onSliderKeydown.bind(this, positionColor.bind(this)));
        const swatchAriaText = i18nString(UIStrings.pressArrowKeysMessage);
        UI.ARIAUtils.setAccessibleName(this._colorElement, swatchAriaText);
        UI.ARIAUtils.markAsApplication(this._colorElement);
        this._colorDragElement = this._colorElement.createChild('div', 'spectrum-sat fill')
            .createChild('div', 'spectrum-val fill')
            .createChild('div', 'spectrum-dragger');
        this._dragX = 0;
        this._dragY = 0;
        const toolsContainer = this.contentElement.createChild('div', 'spectrum-tools');
        const toolbar = new UI.Toolbar.Toolbar('spectrum-eye-dropper', toolsContainer);
        this._colorPickerButton =
            new UI.Toolbar.ToolbarToggle(i18nString(UIStrings.toggleColorPicker), 'largeicon-eyedropper');
        this._colorPickerButton.setToggled(true);
        this._colorPickerButton.addEventListener(UI.Toolbar.ToolbarButton.Events.Click, this._toggleColorPicker.bind(this, undefined));
        toolbar.appendToolbarItem(this._colorPickerButton);
        this._swatch = new Swatch(toolsContainer);
        this._hueElement = toolsContainer.createChild('div', 'spectrum-hue');
        this._hueElement.tabIndex = 0;
        this._hueElement.addEventListener('keydown', this._onSliderKeydown.bind(this, positionHue.bind(this)));
        UI.ARIAUtils.setAccessibleName(this._hueElement, i18nString(UIStrings.changeHue));
        UI.ARIAUtils.markAsSlider(this._hueElement, 0, 360);
        this._hueSlider = this._hueElement.createChild('div', 'spectrum-slider');
        this._alphaElement = toolsContainer.createChild('div', 'spectrum-alpha');
        this._alphaElement.tabIndex = 0;
        this._alphaElement.addEventListener('keydown', this._onSliderKeydown.bind(this, positionAlpha.bind(this)));
        UI.ARIAUtils.setAccessibleName(this._alphaElement, i18nString(UIStrings.changeAlpha));
        UI.ARIAUtils.markAsSlider(this._alphaElement, 0, 1);
        this._alphaElementBackground = this._alphaElement.createChild('div', 'spectrum-alpha-background');
        this._alphaSlider = this._alphaElement.createChild('div', 'spectrum-slider');
        // RGBA/HSLA display.
        this._displayContainer = toolsContainer.createChild('div', 'spectrum-text source-code');
        UI.ARIAUtils.markAsPoliteLiveRegion(this._displayContainer, true);
        this._textValues = [];
        for (let i = 0; i < 4; ++i) {
            const inputValue = UI.UIUtils.createInput('spectrum-text-value');
            this._displayContainer.appendChild(inputValue);
            inputValue.maxLength = 4;
            this._textValues.push(inputValue);
            inputValue.addEventListener('keydown', this._inputChanged.bind(this), false);
            inputValue.addEventListener('input', this._inputChanged.bind(this), false);
            inputValue.addEventListener('wheel', this._inputChanged.bind(this), false);
            inputValue.addEventListener('paste', this._pasted.bind(this), false);
        }
        this._textLabels = this._displayContainer.createChild('div', 'spectrum-text-label');
        // HEX display.
        this._hexContainer = toolsContainer.createChild('div', 'spectrum-text spectrum-text-hex source-code');
        UI.ARIAUtils.markAsPoliteLiveRegion(this._hexContainer, true);
        this._hexValue = UI.UIUtils.createInput('spectrum-text-value');
        this._hexContainer.appendChild(this._hexValue);
        this._hexValue.maxLength = 9;
        this._hexValue.addEventListener('keydown', this._inputChanged.bind(this), false);
        this._hexValue.addEventListener('input', this._inputChanged.bind(this), false);
        this._hexValue.addEventListener('wheel', this._inputChanged.bind(this), false);
        this._hexValue.addEventListener('paste', this._pasted.bind(this), false);
        const label = this._hexContainer.createChild('div', 'spectrum-text-label');
        label.textContent = i18nString(UIStrings.hex);
        UI.ARIAUtils.setAccessibleName(this._hexValue, label.textContent);
        const displaySwitcher = toolsContainer.createChild('div', 'spectrum-display-switcher spectrum-switcher');
        appendSwitcherIcon(displaySwitcher);
        UI.UIUtils.setTitle(displaySwitcher, i18nString(UIStrings.changeColorFormat));
        displaySwitcher.tabIndex = 0;
        self.onInvokeElement(displaySwitcher, event => {
            this._formatViewSwitch();
            event.consume(true);
        });
        UI.ARIAUtils.markAsButton(displaySwitcher);
        UI.UIUtils.installDragHandle(this._hueElement, this._dragStart.bind(this, positionHue.bind(this)), positionHue.bind(this), null, 'pointer', 'default');
        UI.UIUtils.installDragHandle(this._alphaElement, this._dragStart.bind(this, positionAlpha.bind(this)), positionAlpha.bind(this), null, 'pointer', 'default');
        UI.UIUtils.installDragHandle(this._colorElement, this._dragStart.bind(this, positionColor.bind(this)), positionColor.bind(this), null, 'pointer', 'default');
        // Color contrast business.
        if (contrastInfo) {
            this._contrastInfo = contrastInfo;
            this._contrastOverlay = new ContrastOverlay(this._contrastInfo, this._colorElement);
            this._contrastDetails = new ContrastDetails(this._contrastInfo, this.contentElement, this._toggleColorPicker.bind(this), this._contrastPanelExpanded.bind(this), this.colorSelected.bind(this));
            this._contrastDetailsBackgroundColorPickedToggledBound =
                this._contrastDetailsBackgroundColorPickedToggled.bind(this);
        }
        this.element.classList.add('flex-none');
        this._palettes = new Map();
        this._palettePanel = this.contentElement.createChild('div', 'palette-panel');
        this._palettePanelShowing = false;
        this._paletteSectionContainer = this.contentElement.createChild('div', 'spectrum-palette-container');
        this._paletteContainer = this._paletteSectionContainer.createChild('div', 'spectrum-palette');
        this._paletteContainer.addEventListener('contextmenu', this._showPaletteColorContextMenu.bind(this, -1));
        this._shadesContainer = this.contentElement.createChild('div', 'palette-color-shades hidden');
        UI.UIUtils.installDragHandle(this._paletteContainer, this._paletteDragStart.bind(this), this._paletteDrag.bind(this), this._paletteDragEnd.bind(this), 'default');
        const paletteSwitcher = this._paletteSectionContainer.createChild('div', 'spectrum-palette-switcher spectrum-switcher');
        appendSwitcherIcon(paletteSwitcher);
        UI.UIUtils.setTitle(paletteSwitcher, i18nString(UIStrings.previewPalettes));
        UI.ARIAUtils.markAsButton(paletteSwitcher);
        paletteSwitcher.tabIndex = 0;
        self.onInvokeElement(paletteSwitcher, event => {
            this._togglePalettePanel(true);
            event.consume(true);
        });
        this._deleteIconToolbar = new UI.Toolbar.Toolbar('delete-color-toolbar');
        this._deleteButton = new UI.Toolbar.ToolbarButton('', 'largeicon-trash-bin');
        this._deleteIconToolbar.appendToolbarItem(this._deleteButton);
        const overlay = this.contentElement.createChild('div', 'spectrum-overlay fill');
        overlay.addEventListener('click', this._togglePalettePanel.bind(this, false));
        this._addColorToolbar = new UI.Toolbar.Toolbar('add-color-toolbar');
        const addColorButton = new UI.Toolbar.ToolbarButton(i18nString(UIStrings.addToPalette), 'largeicon-add');
        addColorButton.addEventListener(UI.Toolbar.ToolbarButton.Events.Click, this._onAddColorMousedown.bind(this));
        addColorButton.element.addEventListener('keydown', this._onAddColorKeydown.bind(this));
        this._addColorToolbar.appendToolbarItem(addColorButton);
        this._colorPickedBound = this._colorPicked.bind(this);
        this._numPaletteRowsShown = -1;
        this._loadPalettes();
        new PaletteGenerator(palette => {
            if (palette.colors.length) {
                this.addPalette(palette);
            }
            else if (this._selectedColorPalette.get() === palette.title) {
                this._paletteSelected(MaterialPalette);
            }
        });
        function getUpdatedSliderPosition(element, event) {
            const keyboardEvent = event;
            const elementPosition = element.getBoundingClientRect();
            switch (keyboardEvent.key) {
                case 'ArrowLeft':
                case 'ArrowDown':
                    return elementPosition.left - 1;
                case 'ArrowRight':
                case 'ArrowUp':
                    return elementPosition.right + 1;
                default:
                    return /** @type {!MouseEvent} */ event.x;
            }
        }
        function positionHue(event) {
            const hsva = this._hsv.slice();
            const sliderPosition = getUpdatedSliderPosition(this._hueSlider, event);
            const hueAlphaLeft = this._hueElement.getBoundingClientRect().left;
            const positionFraction = (sliderPosition - hueAlphaLeft) / this._hueAlphaWidth;
            const newHue = 1 - positionFraction;
            hsva[0] = Platform.NumberUtilities.clamp(newHue, 0, 1);
            this._innerSetColor(hsva, '', undefined /* colorName */, undefined, ChangeSource.Other);
            const colorValues = this._color().canonicalHSLA();
            UI.ARIAUtils.setValueNow(this._hueElement, colorValues[0]);
        }
        function positionAlpha(event) {
            const hsva = this._hsv.slice();
            const sliderPosition = getUpdatedSliderPosition(this._alphaSlider, event);
            const hueAlphaLeft = this._hueElement.getBoundingClientRect().left;
            const positionFraction = (sliderPosition - hueAlphaLeft) / this._hueAlphaWidth;
            const newAlpha = Math.round(positionFraction * 100) / 100;
            hsva[3] = Platform.NumberUtilities.clamp(newAlpha, 0, 1);
            this._innerSetColor(hsva, '', undefined /* colorName */, undefined, ChangeSource.Other);
            const colorValues = this._color().canonicalHSLA();
            UI.ARIAUtils.setValueText(this._alphaElement, colorValues[3]);
        }
        function positionColor(event) {
            const hsva = this._hsv.slice();
            const colorPosition = getUpdatedColorPosition(this._colorDragElement, event);
            this._colorOffset = this._colorElement.totalOffset();
            hsva[1] = Platform.NumberUtilities.clamp((colorPosition.x - this._colorOffset.left) / this.dragWidth, 0, 1);
            hsva[2] = Platform.NumberUtilities.clamp(1 - (colorPosition.y - this._colorOffset.top) / this.dragHeight, 0, 1);
            this._innerSetColor(hsva, '', undefined /* colorName */, undefined, ChangeSource.Other);
        }
        function getUpdatedColorPosition(dragElement, event) {
            const elementPosition = dragElement.getBoundingClientRect();
            const verticalX = elementPosition.x + elementPosition.width / 2;
            const horizontalY = elementPosition.y + elementPosition.width / 2;
            const defaultUnit = elementPosition.width / 4;
            const unit = getUnitToMove(defaultUnit, event);
            const keyboardEvent = event;
            switch (keyboardEvent.key) {
                case 'ArrowLeft':
                    return { x: elementPosition.left - unit, y: horizontalY };
                case 'ArrowRight':
                    return { x: elementPosition.right + unit, y: horizontalY };
                case 'ArrowDown':
                    return { x: verticalX, y: elementPosition.bottom + unit };
                case 'ArrowUp':
                    return { x: verticalX, y: elementPosition.top - unit };
                default:
                    return {
                        x: event.x,
                        y: event.y,
                    };
            }
        }
        function getUnitToMove(unit, event) {
            const keyboardEvent = event;
            if (keyboardEvent.altKey) {
                unit = 1;
            }
            else if (keyboardEvent.ctrlKey) {
                unit = 10;
            }
            else if (keyboardEvent.shiftKey) {
                unit = 20;
            }
            return unit;
        }
        function appendSwitcherIcon(parentElement) {
            const switcherIcon = new IconButton.Icon.Icon();
            switcherIcon.data = { iconName: 'switcherIcon', color: 'var(--color-text-primary)', width: '16px', height: '16px' };
            parentElement.appendChild(switcherIcon);
        }
    }
    _dragStart(callback, event) {
        this._colorOffset = this._colorElement.totalOffset();
        callback(event);
        return true;
    }
    _contrastDetailsBackgroundColorPickedToggled(event) {
        if (event.data) {
            this._toggleColorPicker(false);
        }
    }
    _contrastPanelExpanded() {
        if (!this._contrastOverlay || !this._contrastDetails) {
            return;
        }
        this._contrastOverlay.setVisible(this._contrastDetails.expanded());
        this._resizeForSelectedPalette(true);
    }
    _updatePalettePanel() {
        this._palettePanel.removeChildren();
        const title = this._palettePanel.createChild('div', 'palette-title');
        title.textContent = i18nString(UIStrings.colorPalettes);
        const toolbar = new UI.Toolbar.Toolbar('', this._palettePanel);
        this._closeButton = new UI.Toolbar.ToolbarButton(i18nString(UIStrings.returnToColorPicker), 'largeicon-delete');
        this._closeButton.addEventListener(UI.Toolbar.ToolbarButton.Events.Click, this._togglePalettePanel.bind(this, false));
        this._closeButton.element.addEventListener('keydown', this._onCloseBtnKeydown.bind(this));
        toolbar.appendToolbarItem(this._closeButton);
        for (const palette of this._palettes.values()) {
            this._palettePanel.appendChild(this._createPreviewPaletteElement(palette));
        }
    }
    _togglePalettePanel(show) {
        if (this._palettePanelShowing === show) {
            return;
        }
        if (show) {
            this._updatePalettePanel();
        }
        this._palettePanelShowing = show;
        this.contentElement.classList.toggle('palette-panel-showing', show);
        this._focus();
    }
    _onCloseBtnKeydown(event) {
        if (isEscKey(event) || isEnterOrSpaceKey(event)) {
            this._togglePalettePanel(false);
            event.consume(true);
        }
    }
    _onSliderKeydown(sliderNewPosition, event) {
        const keyboardEvent = event;
        switch (keyboardEvent.key) {
            case 'ArrowLeft':
            case 'ArrowRight':
            case 'ArrowDown':
            case 'ArrowUp':
                sliderNewPosition(event);
                event.consume(true);
        }
    }
    /**
     * (Suppress warning about preventScroll)
     */
    _focus() {
        if (!this.isShowing()) {
            return;
        }
        if (this._palettePanelShowing && this._closeButton) {
            this._closeButton.element.focus({ preventScroll: true });
        }
        else {
            this.contentElement.focus();
        }
    }
    _createPaletteColor(colorText, colorName, animationDelay) {
        const element = document.createElement('div');
        element.classList.add('spectrum-palette-color');
        element.style.background =
            Platform.StringUtilities.sprintf('linear-gradient(%s, %s), var(--image-file-checker)', colorText, colorText);
        if (animationDelay) {
            element.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 100, delay: animationDelay, fill: 'backwards' });
        }
        UI.Tooltip.Tooltip.install(element, colorName || colorText);
        return element;
    }
    _showPalette(palette, animate, _event) {
        this._resizeForSelectedPalette();
        this._paletteContainer.removeChildren();
        for (let i = 0; i < palette.colors.length; i++) {
            const animationDelay = animate ? i * 100 / palette.colors.length : 0;
            const colorElement = this._createPaletteColor(palette.colors[i], palette.colorNames[i], animationDelay);
            UI.ARIAUtils.markAsButton(colorElement);
            UI.ARIAUtils.setAccessibleName(colorElement, i18nString(UIStrings.colorS, { PH1: palette.colors[i] }));
            colorElement.tabIndex = -1;
            colorElement.addEventListener('mousedown', this._paletteColorSelected.bind(this, palette.colors[i], palette.colorNames[i], Boolean(palette.matchUserFormat)));
            colorElement.addEventListener('focus', this._paletteColorSelected.bind(this, palette.colors[i], palette.colorNames[i], Boolean(palette.matchUserFormat)));
            colorElement.addEventListener('keydown', this._onPaletteColorKeydown.bind(this, i));
            if (palette.mutable) {
                colorElementToMutable.set(colorElement, true);
                colorElementToColor.set(colorElement, palette.colors[i]);
                colorElement.addEventListener('contextmenu', this._showPaletteColorContextMenu.bind(this, i));
            }
            else if (palette === MaterialPalette) {
                colorElement.classList.add('has-material-shades');
                let shadow = colorElement.createChild('div', 'spectrum-palette-color spectrum-palette-color-shadow');
                shadow.style.background = palette.colors[i];
                shadow = colorElement.createChild('div', 'spectrum-palette-color spectrum-palette-color-shadow');
                shadow.style.background = palette.colors[i];
                UI.Tooltip.Tooltip.install(colorElement, i18nString(UIStrings.longclickOrLongpressSpaceToShow, { PH1: palette.colors[i] }));
                UI.ARIAUtils.setAccessibleName(colorElement, UI.Tooltip.Tooltip.getContent(colorElement));
                new UI.UIUtils.LongClickController(colorElement, this._showLightnessShades.bind(this, colorElement, palette.colors[i]));
            }
            this._paletteContainer.appendChild(colorElement);
        }
        if (this._paletteContainer.childNodes.length > 0) {
            this._paletteContainer.childNodes[0].tabIndex = 0;
        }
        this._paletteContainerMutable = palette.mutable;
        if (palette.mutable) {
            this._paletteContainer.appendChild(this._addColorToolbar.element);
            this._paletteContainer.appendChild(this._deleteIconToolbar.element);
        }
        else {
            this._addColorToolbar.element.remove();
            this._deleteIconToolbar.element.remove();
        }
        this._togglePalettePanel(false);
        this._focus();
    }
    _showLightnessShades(colorElement, colorText, _event) {
        function closeLightnessShades(element) {
            this._shadesContainer.classList.add('hidden');
            element.classList.remove('spectrum-shades-shown');
            if (this._shadesCloseHandler) {
                this._shadesContainer.ownerDocument.removeEventListener('mousedown', this._shadesCloseHandler, true);
            }
            delete this._shadesCloseHandler;
        }
        if (this._shadesCloseHandler) {
            this._shadesCloseHandler();
        }
        this._shadesContainer.classList.remove('hidden');
        this._shadesContainer.removeChildren();
        this._shadesContainer.animate([{ transform: 'scaleY(0)', opacity: '0' }, { transform: 'scaleY(1)', opacity: '1' }], { duration: 200, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' });
        let shadesTop = this._paletteContainer.offsetTop + colorElement.offsetTop +
            (colorElement.parentElement ? colorElement.parentElement.offsetTop : 0);
        if (this._contrastDetails) {
            shadesTop += this._contrastDetails.element().offsetHeight;
        }
        this._shadesContainer.style.top = shadesTop + 'px';
        this._shadesContainer.style.left = colorElement.offsetLeft + 'px';
        colorElement.classList.add('spectrum-shades-shown');
        const shades = MaterialPaletteShades[colorText];
        for (let i = shades.length - 1; i >= 0; i--) {
            const shadeElement = this._createPaletteColor(shades[i], undefined /* colorName */, i * 200 / shades.length + 100);
            UI.ARIAUtils.markAsButton(shadeElement);
            UI.ARIAUtils.setAccessibleName(shadeElement, i18nString(UIStrings.colorS, { PH1: shades[i] }));
            shadeElement.tabIndex = -1;
            shadeElement.addEventListener('mousedown', this._paletteColorSelected.bind(this, shades[i], shades[i], false));
            shadeElement.addEventListener('focus', this._paletteColorSelected.bind(this, shades[i], shades[i], false));
            shadeElement.addEventListener('keydown', this._onShadeColorKeydown.bind(this, colorElement));
            this._shadesContainer.appendChild(shadeElement);
        }
        if (this._shadesContainer.childNodes.length > 0) {
            this._shadesContainer.childNodes[this._shadesContainer.childNodes.length - 1].focus();
        }
        this._shadesCloseHandler = closeLightnessShades.bind(this, colorElement);
        this._shadesContainer.ownerDocument.addEventListener('mousedown', this._shadesCloseHandler, true);
    }
    _slotIndexForEvent(event) {
        const mouseEvent = event;
        const localX = mouseEvent.pageX - this._paletteContainer.totalOffsetLeft();
        const localY = mouseEvent.pageY - this._paletteContainer.totalOffsetTop();
        const col = Math.min(localX / COLOR_CHIP_SIZE | 0, ITEMS_PER_PALETTE_ROW - 1);
        const row = (localY / COLOR_CHIP_SIZE) | 0;
        return Math.min(row * ITEMS_PER_PALETTE_ROW + col, this._customPaletteSetting.get().colors.length - 1);
    }
    _isDraggingToBin(event) {
        const mouseEvent = event;
        return mouseEvent.pageX > this._deleteIconToolbar.element.totalOffsetLeft();
    }
    _paletteDragStart(event) {
        const element = UI.UIUtils.deepElementFromEvent(event);
        if (!element || !colorElementToMutable.get(element)) {
            return false;
        }
        const index = this._slotIndexForEvent(event);
        this._dragElement = element;
        const mouseEvent = event;
        this._dragHotSpotX = mouseEvent.pageX - (index % ITEMS_PER_PALETTE_ROW) * COLOR_CHIP_SIZE;
        this._dragHotSpotY = mouseEvent.pageY - (index / ITEMS_PER_PALETTE_ROW | 0) * COLOR_CHIP_SIZE;
        return true;
    }
    _paletteDrag(event) {
        const mouseEvent = event;
        if (mouseEvent.pageX < this._paletteContainer.totalOffsetLeft() ||
            mouseEvent.pageY < this._paletteContainer.totalOffsetTop()) {
            return;
        }
        if (!this._dragElement || this._dragHotSpotX === undefined || this._dragHotSpotY === undefined) {
            return;
        }
        const newIndex = this._slotIndexForEvent(event);
        const offsetX = mouseEvent.pageX - (newIndex % ITEMS_PER_PALETTE_ROW) * COLOR_CHIP_SIZE;
        const offsetY = mouseEvent.pageY - (newIndex / ITEMS_PER_PALETTE_ROW | 0) * COLOR_CHIP_SIZE;
        const isDeleting = this._isDraggingToBin(event);
        this._deleteIconToolbar.element.classList.add('dragging');
        this._deleteIconToolbar.element.classList.toggle('delete-color-toolbar-active', isDeleting);
        const dragElementTransform = 'translateX(' + (offsetX - this._dragHotSpotX) + 'px) translateY(' + (offsetY - this._dragHotSpotY) + 'px)';
        this._dragElement.style.transform = isDeleting ? dragElementTransform + ' scale(0.8)' : dragElementTransform;
        const children = Array.prototype.slice.call(this._paletteContainer.children);
        const index = children.indexOf(this._dragElement);
        const swatchOffsets = new Map();
        for (const swatch of children) {
            swatchOffsets.set(swatch, swatch.totalOffset());
        }
        if (index !== newIndex) {
            this._paletteContainer.insertBefore(this._dragElement, children[newIndex > index ? newIndex + 1 : newIndex]);
        }
        for (const swatch of children) {
            if (swatch === this._dragElement) {
                continue;
            }
            const before = swatchOffsets.get(swatch);
            const after = swatch.totalOffset();
            if (before && (before.left !== after.left || before.top !== after.top)) {
                swatch.animate([
                    {
                        transform: 'translateX(' + (before.left - after.left) + 'px) translateY(' + (before.top - after.top) + 'px)',
                    },
                    { transform: 'none' },
                ], { duration: 100, easing: 'cubic-bezier(0, 0, 0.2, 1)' });
            }
        }
    }
    _paletteDragEnd(e) {
        if (!this._dragElement) {
            return;
        }
        if (this._isDraggingToBin(e)) {
            this._dragElement.remove();
        }
        this._dragElement.style.removeProperty('transform');
        const children = this._paletteContainer.children;
        const colors = [];
        for (let i = 0; i < children.length; ++i) {
            const color = colorElementToColor.get(children[i]);
            if (color) {
                colors.push(color);
            }
        }
        const palette = this._customPaletteSetting.get();
        palette.colors = colors;
        this._customPaletteSetting.set(palette);
        this._showPalette(palette, false);
        this._deleteIconToolbar.element.classList.remove('dragging');
        this._deleteIconToolbar.element.classList.remove('delete-color-toolbar-active');
    }
    _loadPalettes() {
        this._palettes.set(MaterialPalette.title, MaterialPalette);
        const defaultCustomPalette = { title: 'Custom', colors: [], colorNames: [], mutable: true, matchUserFormat: undefined };
        this._customPaletteSetting =
            Common.Settings.Settings.instance().createSetting('customColorPalette', defaultCustomPalette);
        const customPalette = this._customPaletteSetting.get();
        // Fallback case for custom palettes created pre-m67
        customPalette.colorNames = customPalette.colorNames || [];
        this._palettes.set(customPalette.title, customPalette);
        this._selectedColorPalette =
            Common.Settings.Settings.instance().createSetting('selectedColorPalette', GeneratedPaletteTitle);
        const palette = this._palettes.get(this._selectedColorPalette.get());
        if (palette) {
            this._showPalette(palette, true);
        }
    }
    addPalette(palette) {
        this._palettes.set(palette.title, palette);
        if (this._selectedColorPalette.get() === palette.title) {
            this._showPalette(palette, true);
        }
    }
    _createPreviewPaletteElement(palette) {
        const colorsPerPreviewRow = 5;
        const previewElement = document.createElement('div');
        previewElement.classList.add('palette-preview');
        UI.ARIAUtils.markAsButton(previewElement);
        previewElement.tabIndex = 0;
        const titleElement = previewElement.createChild('div', 'palette-preview-title');
        titleElement.textContent = palette.title;
        let i;
        for (i = 0; i < colorsPerPreviewRow && i < palette.colors.length; i++) {
            previewElement.appendChild(this._createPaletteColor(palette.colors[i], palette.colorNames[i]));
        }
        for (; i < colorsPerPreviewRow; i++) {
            previewElement.createChild('div', 'spectrum-palette-color empty-color');
        }
        self.onInvokeElement(previewElement, event => {
            this._paletteSelected(palette);
            event.consume(true);
        });
        return previewElement;
    }
    _paletteSelected(palette) {
        this._selectedColorPalette.set(palette.title);
        this._showPalette(palette, true);
    }
    _resizeForSelectedPalette(force) {
        const palette = this._palettes.get(this._selectedColorPalette.get());
        if (!palette) {
            return;
        }
        let numColors = palette.colors.length;
        if (palette === this._customPaletteSetting.get()) {
            numColors++;
        }
        const rowsNeeded = Math.max(1, Math.ceil(numColors / ITEMS_PER_PALETTE_ROW));
        if (this._numPaletteRowsShown === rowsNeeded && !force) {
            return;
        }
        this._numPaletteRowsShown = rowsNeeded;
        const paletteColorHeight = 12;
        const paletteMargin = 12;
        let paletteTop = 236;
        if (this._contrastDetails) {
            if (this._contrastDetails.expanded()) {
                paletteTop += 78;
            }
            else {
                paletteTop += 36;
            }
        }
        this.element.style.height = (paletteTop + paletteMargin + (paletteColorHeight + paletteMargin) * rowsNeeded) + 'px';
        this.dispatchEventToListeners(Events.SizeChanged);
    }
    _paletteColorSelected(colorText, colorName, matchUserFormat) {
        const color = Common.Color.Color.parse(colorText);
        if (!color) {
            return;
        }
        this._innerSetColor(color.hsva(), colorText, colorName, matchUserFormat ? this._colorFormat : color.format(), ChangeSource.Other);
    }
    _onPaletteColorKeydown(colorIndex, event) {
        const keyboardEvent = event;
        let nextColorIndex;
        switch (keyboardEvent.key) {
            case 'ArrowLeft':
                nextColorIndex = colorIndex - 1;
                break;
            case 'ArrowRight':
                nextColorIndex = colorIndex + 1;
                break;
            case 'ArrowUp':
                nextColorIndex = colorIndex - ITEMS_PER_PALETTE_ROW;
                break;
            case 'ArrowDown':
                nextColorIndex = colorIndex + ITEMS_PER_PALETTE_ROW;
                break;
        }
        if (nextColorIndex !== undefined && nextColorIndex > -1 &&
            nextColorIndex < this._paletteContainer.childNodes.length) {
            this._paletteContainer.childNodes[nextColorIndex].focus();
        }
    }
    _onShadeColorKeydown(colorElement, event) {
        const keyboardEvent = event;
        const target = keyboardEvent.target;
        if (isEscKey(event) || keyboardEvent.key === 'Tab') {
            colorElement.focus();
            if (this._shadesCloseHandler) {
                this._shadesCloseHandler();
            }
            event.consume(true);
        }
        else if (keyboardEvent.key === 'ArrowUp' && target.previousElementSibling) {
            target.previousElementSibling.focus();
            event.consume(true);
        }
        else if (keyboardEvent.key === 'ArrowDown' && target.nextElementSibling) {
            target.nextElementSibling.focus();
            event.consume(true);
        }
    }
    _onAddColorMousedown() {
        this._addColorToCustomPalette();
    }
    _onAddColorKeydown(event) {
        if (isEnterOrSpaceKey(event)) {
            this._addColorToCustomPalette();
            event.consume(true);
        }
    }
    _addColorToCustomPalette() {
        const palette = this._customPaletteSetting.get();
        palette.colors.push(this.colorString());
        this._customPaletteSetting.set(palette);
        this._showPalette(palette, false);
        const colorElements = this._paletteContainer.querySelectorAll('.spectrum-palette-color');
        colorElements[colorElements.length - 1].focus();
    }
    _showPaletteColorContextMenu(colorIndex, event) {
        if (!this._paletteContainerMutable) {
            return;
        }
        const contextMenu = new UI.ContextMenu.ContextMenu(event);
        if (colorIndex !== -1) {
            contextMenu.defaultSection().appendItem(i18nString(UIStrings.removeColor), this._deletePaletteColors.bind(this, colorIndex, false));
            contextMenu.defaultSection().appendItem(i18nString(UIStrings.removeAllToTheRight), this._deletePaletteColors.bind(this, colorIndex, true));
        }
        contextMenu.defaultSection().appendItem(i18nString(UIStrings.clearPalette), this._deletePaletteColors.bind(this, -1, true));
        contextMenu.show();
    }
    _deletePaletteColors(colorIndex, toRight) {
        const palette = this._customPaletteSetting.get();
        if (toRight) {
            palette.colors.splice(colorIndex + 1, palette.colors.length - colorIndex - 1);
        }
        else {
            palette.colors.splice(colorIndex, 1);
        }
        this._customPaletteSetting.set(palette);
        this._showPalette(palette, false);
    }
    setColor(color, colorFormat) {
        this._originalFormat = colorFormat;
        this._innerSetColor(color.hsva(), '', undefined /* colorName */, colorFormat, ChangeSource.Model);
        const colorValues = this._color().canonicalHSLA();
        UI.ARIAUtils.setValueNow(this._hueElement, colorValues[0]);
        UI.ARIAUtils.setValueText(this._alphaElement, colorValues[3]);
    }
    colorSelected(color) {
        this._innerSetColor(color.hsva(), '', undefined /* colorName */, undefined /* colorFormat */, ChangeSource.Other);
    }
    _innerSetColor(hsva, colorString, colorName, colorFormat, changeSource) {
        if (hsva !== undefined) {
            this._hsv = hsva;
        }
        this._colorName = colorName;
        if (colorString !== undefined) {
            this._colorString = colorString;
        }
        if (colorFormat !== undefined) {
            const cf = Common.Color.Format;
            console.assert(colorFormat !== cf.Original, 'Spectrum\'s color format cannot be Original');
            if (colorFormat === cf.RGBA) {
                colorFormat = cf.RGB;
            }
            else if (colorFormat === cf.HSLA) {
                colorFormat = cf.HSL;
            }
            else if (colorFormat === cf.HEXA) {
                colorFormat = cf.HEX;
            }
            else if (colorFormat === cf.ShortHEXA) {
                colorFormat = cf.ShortHEX;
            }
            this._colorFormat = colorFormat;
        }
        if (this._contrastInfo) {
            this._contrastInfo.setColor(Common.Color.Color.fromHSVA(this._hsv), this._colorFormat);
        }
        this._updateHelperLocations();
        this._updateUI();
        if (changeSource !== ChangeSource.Input) {
            this._updateInput();
        }
        if (changeSource !== ChangeSource.Model) {
            this.dispatchEventToListeners(Events.ColorChanged, this.colorString());
        }
    }
    _color() {
        return Common.Color.Color.fromHSVA(this._hsv);
    }
    colorName() {
        return this._colorName;
    }
    colorString() {
        if (this._colorString) {
            return this._colorString;
        }
        const cf = Common.Color.Format;
        const color = this._color();
        let colorString = color.asString(this._colorFormat);
        if (colorString) {
            return colorString;
        }
        if (this._colorFormat === cf.Nickname) {
            colorString = color.asString(color.hasAlpha() ? cf.HEXA : cf.HEX);
        }
        else if (this._colorFormat === cf.ShortHEX) {
            colorString = color.asString(color.detectHEXFormat());
        }
        else if (this._colorFormat === cf.HEX) {
            colorString = color.asString(cf.HEXA);
        }
        else if (this._colorFormat === cf.HSL) {
            colorString = color.asString(cf.HSLA);
        }
        else {
            colorString = color.asString(cf.RGBA);
        }
        console.assert(Boolean(colorString));
        return colorString || '';
    }
    _updateHelperLocations() {
        const h = this._hsv[0];
        const s = this._hsv[1];
        const v = this._hsv[2];
        const alpha = this._hsv[3];
        // Where to show the little circle that displays your current selected color.
        this._dragX = s * this.dragWidth;
        this._dragY = this.dragHeight - (v * this.dragHeight);
        const dragX = Math.max(-this._colorDragElementHeight, Math.min(this.dragWidth - this._colorDragElementHeight, this._dragX - this._colorDragElementHeight));
        const dragY = Math.max(-this._colorDragElementHeight, Math.min(this.dragHeight - this._colorDragElementHeight, this._dragY - this._colorDragElementHeight));
        this._colorDragElement.positionAt(dragX, dragY);
        // Where to show the bar that displays your current selected hue.
        const hueSlideX = (1 - h) * this._hueAlphaWidth - this.slideHelperWidth;
        this._hueSlider.style.left = hueSlideX + 'px';
        const alphaSlideX = alpha * this._hueAlphaWidth - this.slideHelperWidth;
        this._alphaSlider.style.left = alphaSlideX + 'px';
    }
    _updateInput() {
        const cf = Common.Color.Format;
        if (this._colorFormat === cf.HEX || this._colorFormat === cf.ShortHEX || this._colorFormat === cf.Nickname) {
            this._hexContainer.hidden = false;
            this._displayContainer.hidden = true;
            if (this._colorFormat === cf.ShortHEX) {
                this._hexValue.value = String(this._color().asString(this._color().detectHEXFormat()));
            }
            else { // Don't use ShortHEX if original was not in that format.
                this._hexValue.value = String(this._color().asString(this._color().hasAlpha() ? cf.HEXA : cf.HEX));
            }
        }
        else {
            // RGBA, HSLA display.
            this._hexContainer.hidden = true;
            this._displayContainer.hidden = false;
            const isRgb = this._colorFormat === cf.RGB;
            this._textLabels.textContent = isRgb ? 'RGBA' : 'HSLA';
            const colorValues = isRgb ? this._color().canonicalRGBA() : this._color().canonicalHSLA();
            for (let i = 0; i < 3; ++i) {
                UI.ARIAUtils.setAccessibleName(this._textValues[i], 
                /** R in RGBA */ i18nString(UIStrings.sInS, {
                    PH1: this._textLabels.textContent.charAt(i),
                    PH2: this._textLabels.textContent,
                }));
                this._textValues[i].value = String(colorValues[i]);
                if (!isRgb && (i === 1 || i === 2)) {
                    this._textValues[i].value += '%';
                }
            }
            UI.ARIAUtils.setAccessibleName(this._textValues[3], 
            /** A in RGBA */ i18nString(UIStrings.sInS, {
                PH1: this._textLabels.textContent.charAt(3),
                PH2: this._textLabels.textContent,
            }));
            this._textValues[3].value = String(Math.round(colorValues[3] * 100) / 100);
        }
    }
    _updateUI() {
        const h = Common.Color.Color.fromHSVA([this._hsv[0], 1, 1, 1]);
        this._colorElement.style.backgroundColor = h.asString(Common.Color.Format.RGB);
        if (this._contrastOverlay) {
            this._contrastOverlay.setDimensions(this.dragWidth, this.dragHeight);
        }
        this._swatch.setColor(this._color(), this.colorString());
        this._colorDragElement.style.backgroundColor = this._color().asString(Common.Color.Format.RGBA);
        const noAlpha = Common.Color.Color.fromHSVA(this._hsv.slice(0, 3).concat(1));
        this._alphaElementBackground.style.backgroundImage = Platform.StringUtilities.sprintf('linear-gradient(to right, rgba(0,0,0,0), %s)', noAlpha.asString(Common.Color.Format.RGB));
    }
    _formatViewSwitch() {
        const cf = Common.Color.Format;
        let format = cf.RGB;
        if (this._colorFormat === cf.RGB) {
            format = cf.HSL;
        }
        else if (this._colorFormat === cf.HSL) {
            format = (this._originalFormat === cf.ShortHEX || this._originalFormat === cf.ShortHEXA) ? cf.ShortHEX : cf.HEX;
        }
        this._innerSetColor(undefined, '', undefined /* colorName */, format, ChangeSource.Other);
    }
    /**
     * If the pasted input is parsable as a color, applies it converting to the current user format
     */
    _pasted(/** @type {!ClipboardEvent} */ event) {
        if (!event.clipboardData) {
            return;
        }
        const text = event.clipboardData.getData('text');
        const color = Common.Color.Color.parse(text);
        if (!color) {
            return;
        }
        this._innerSetColor(color.hsva(), text, undefined /* colorName */, undefined /* colorFormat */, ChangeSource.Other);
        event.preventDefault();
    }
    _inputChanged(event) {
        function elementValue(element) {
            return element.value;
        }
        const inputElement = event.currentTarget;
        const newValue = UI.UIUtils.createReplacementString(inputElement.value, event);
        if (newValue) {
            inputElement.value = newValue;
            inputElement.selectionStart = 0;
            inputElement.selectionEnd = newValue.length;
            event.consume(true);
        }
        const cf = Common.Color.Format;
        let colorString;
        if (this._colorFormat === cf.Nickname || this._colorFormat === cf.HEX || this._colorFormat === cf.ShortHEX) {
            colorString = this._hexValue.value;
        }
        else {
            const format = this._colorFormat === cf.RGB ? 'rgb' : 'hsl';
            const values = this._textValues.slice(0, -1).map(elementValue).join(' ');
            const alpha = this._textValues.slice(-1).map(elementValue).join(' ');
            colorString = Platform.StringUtilities.sprintf('%s(%s)', format, [values, alpha].join(' / '));
        }
        const color = Common.Color.Color.parse(colorString);
        if (!color) {
            return;
        }
        let colorFormat = undefined;
        if (this._colorFormat === cf.HEX || this._colorFormat === cf.ShortHEX) {
            colorFormat = color.detectHEXFormat();
        }
        this._innerSetColor(color.hsva(), colorString, undefined /* colorName */, colorFormat, ChangeSource.Input);
    }
    wasShown() {
        this._hueAlphaWidth = this._hueElement.offsetWidth;
        this.slideHelperWidth = this._hueSlider.offsetWidth / 2;
        this.dragWidth = this._colorElement.offsetWidth;
        this.dragHeight = this._colorElement.offsetHeight;
        this._colorDragElementHeight = this._colorDragElement.offsetHeight / 2;
        this._innerSetColor(undefined, undefined, undefined /* colorName */, undefined, ChangeSource.Model);
        this._toggleColorPicker(true);
        if (this._contrastDetails && this._contrastDetailsBackgroundColorPickedToggledBound) {
            this._contrastDetails.addEventListener(ContrastDetailsEvents.BackgroundColorPickerWillBeToggled, this._contrastDetailsBackgroundColorPickedToggledBound);
        }
    }
    willHide() {
        this._toggleColorPicker(false);
        if (this._contrastDetails && this._contrastDetailsBackgroundColorPickedToggledBound) {
            this._contrastDetails.removeEventListener(ContrastDetailsEvents.BackgroundColorPickerWillBeToggled, this._contrastDetailsBackgroundColorPickedToggledBound);
        }
    }
    _toggleColorPicker(enabled, _event) {
        if (enabled === undefined) {
            enabled = !this._colorPickerButton.toggled();
        }
        this._colorPickerButton.setToggled(enabled);
        // This is to make sure that only one picker is open at a time
        // Also have a look at this._contrastDetailsBackgroundColorPickedToggled
        if (this._contrastDetails && enabled && this._contrastDetails.backgroundColorPickerEnabled()) {
            this._contrastDetails.toggleBackgroundColorPicker(false);
        }
        Host.InspectorFrontendHost.InspectorFrontendHostInstance.setEyeDropperActive(enabled);
        if (enabled) {
            Host.InspectorFrontendHost.InspectorFrontendHostInstance.events.addEventListener(Host.InspectorFrontendHostAPI.Events.EyeDropperPickedColor, this._colorPickedBound);
        }
        else {
            Host.InspectorFrontendHost.InspectorFrontendHostInstance.events.removeEventListener(Host.InspectorFrontendHostAPI.Events.EyeDropperPickedColor, this._colorPickedBound);
        }
    }
    _colorPicked(event) {
        const rgbColor = event.data;
        const rgba = [rgbColor.r, rgbColor.g, rgbColor.b, (rgbColor.a / 2.55 | 0) / 100];
        const color = Common.Color.Color.fromRGBA(rgba);
        this._innerSetColor(color.hsva(), '', undefined /* colorName */, undefined, ChangeSource.Other);
        Host.InspectorFrontendHost.InspectorFrontendHostInstance.bringToFront();
    }
}
export const ChangeSource = {
    Input: 'Input',
    Model: 'Model',
    Other: 'Other',
};
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var Events;
(function (Events) {
    Events["ColorChanged"] = "ColorChanged";
    Events["SizeChanged"] = "SizeChanged";
})(Events || (Events = {}));
const COLOR_CHIP_SIZE = 24;
const ITEMS_PER_PALETTE_ROW = 8;
const GeneratedPaletteTitle = 'Page colors';
export class PaletteGenerator {
    _callback;
    _frequencyMap;
    constructor(callback) {
        this._callback = callback;
        this._frequencyMap = new Map();
        const stylesheetPromises = [];
        for (const cssModel of SDK.TargetManager.TargetManager.instance().models(SDK.CSSModel.CSSModel)) {
            for (const stylesheet of cssModel.allStyleSheets()) {
                stylesheetPromises.push(this._processStylesheet(stylesheet));
            }
        }
        Promise.all(stylesheetPromises)
            .catch(error => {
            console.error(error);
        })
            .then(this._finish.bind(this));
    }
    _frequencyComparator(a, b) {
        return this._frequencyMap.get(b) - this._frequencyMap.get(a);
    }
    _finish() {
        function hueComparator(a, b) {
            const hsva = paletteColors.get(a).hsva();
            const hsvb = paletteColors.get(b).hsva();
            // First trim the shades of gray
            if (hsvb[1] < 0.12 && hsva[1] < 0.12) {
                return hsvb[2] * hsvb[3] - hsva[2] * hsva[3];
            }
            if (hsvb[1] < 0.12) {
                return -1;
            }
            if (hsva[1] < 0.12) {
                return 1;
            }
            // Equal hue -> sort by sat
            if (hsvb[0] === hsva[0]) {
                return hsvb[1] * hsvb[3] - hsva[1] * hsva[3];
            }
            return (hsvb[0] + 0.94) % 1 - (hsva[0] + 0.94) % 1;
        }
        let colors = [...this._frequencyMap.keys()];
        colors = colors.sort(this._frequencyComparator.bind(this));
        const paletteColors = new Map();
        const colorsPerRow = 24;
        while (paletteColors.size < colorsPerRow && colors.length) {
            const colorText = colors.shift();
            const color = Common.Color.Color.parse(colorText);
            if (!color || color.nickname() === 'white' || color.nickname() === 'black') {
                continue;
            }
            paletteColors.set(colorText, color);
        }
        this._callback({
            title: GeneratedPaletteTitle,
            colors: [...paletteColors.keys()].sort(hueComparator),
            colorNames: [],
            mutable: false,
            matchUserFormat: undefined,
        });
    }
    async _processStylesheet(stylesheet) {
        let text = (await stylesheet.requestContent()).content || '';
        text = text.toLowerCase();
        const regexResult = text.match(/((?:rgb|hsl)a?\([^)]+\)|#[0-9a-f]{6}|#[0-9a-f]{3})/g) || [];
        for (const c of regexResult) {
            let frequency = this._frequencyMap.get(c) || 0;
            this._frequencyMap.set(c, ++frequency);
        }
    }
}
export const MaterialPaletteShades = {
    '#F44336': ['#FFEBEE', '#FFCDD2', '#EF9A9A', '#E57373', '#EF5350', '#F44336', '#E53935', '#D32F2F', '#C62828', '#B71C1C'],
    '#E91E63': ['#FCE4EC', '#F8BBD0', '#F48FB1', '#F06292', '#EC407A', '#E91E63', '#D81B60', '#C2185B', '#AD1457', '#880E4F'],
    '#9C27B0': ['#F3E5F5', '#E1BEE7', '#CE93D8', '#BA68C8', '#AB47BC', '#9C27B0', '#8E24AA', '#7B1FA2', '#6A1B9A', '#4A148C'],
    '#673AB7': ['#EDE7F6', '#D1C4E9', '#B39DDB', '#9575CD', '#7E57C2', '#673AB7', '#5E35B1', '#512DA8', '#4527A0', '#311B92'],
    '#3F51B5': ['#E8EAF6', '#C5CAE9', '#9FA8DA', '#7986CB', '#5C6BC0', '#3F51B5', '#3949AB', '#303F9F', '#283593', '#1A237E'],
    '#2196F3': ['#E3F2FD', '#BBDEFB', '#90CAF9', '#64B5F6', '#42A5F5', '#2196F3', '#1E88E5', '#1976D2', '#1565C0', '#0D47A1'],
    '#03A9F4': ['#E1F5FE', '#B3E5FC', '#81D4FA', '#4FC3F7', '#29B6F6', '#03A9F4', '#039BE5', '#0288D1', '#0277BD', '#01579B'],
    '#00BCD4': ['#E0F7FA', '#B2EBF2', '#80DEEA', '#4DD0E1', '#26C6DA', '#00BCD4', '#00ACC1', '#0097A7', '#00838F', '#006064'],
    '#009688': ['#E0F2F1', '#B2DFDB', '#80CBC4', '#4DB6AC', '#26A69A', '#009688', '#00897B', '#00796B', '#00695C', '#004D40'],
    '#4CAF50': ['#E8F5E9', '#C8E6C9', '#A5D6A7', '#81C784', '#66BB6A', '#4CAF50', '#43A047', '#388E3C', '#2E7D32', '#1B5E20'],
    '#8BC34A': ['#F1F8E9', '#DCEDC8', '#C5E1A5', '#AED581', '#9CCC65', '#8BC34A', '#7CB342', '#689F38', '#558B2F', '#33691E'],
    '#CDDC39': ['#F9FBE7', '#F0F4C3', '#E6EE9C', '#DCE775', '#D4E157', '#CDDC39', '#C0CA33', '#AFB42B', '#9E9D24', '#827717'],
    '#FFEB3B': ['#FFFDE7', '#FFF9C4', '#FFF59D', '#FFF176', '#FFEE58', '#FFEB3B', '#FDD835', '#FBC02D', '#F9A825', '#F57F17'],
    '#FFC107': ['#FFF8E1', '#FFECB3', '#FFE082', '#FFD54F', '#FFCA28', '#FFC107', '#FFB300', '#FFA000', '#FF8F00', '#FF6F00'],
    '#FF9800': ['#FFF3E0', '#FFE0B2', '#FFCC80', '#FFB74D', '#FFA726', '#FF9800', '#FB8C00', '#F57C00', '#EF6C00', '#E65100'],
    '#FF5722': ['#FBE9E7', '#FFCCBC', '#FFAB91', '#FF8A65', '#FF7043', '#FF5722', '#F4511E', '#E64A19', '#D84315', '#BF360C'],
    '#795548': ['#EFEBE9', '#D7CCC8', '#BCAAA4', '#A1887F', '#8D6E63', '#795548', '#6D4C41', '#5D4037', '#4E342E', '#3E2723'],
    '#9E9E9E': ['#FAFAFA', '#F5F5F5', '#EEEEEE', '#E0E0E0', '#BDBDBD', '#9E9E9E', '#757575', '#616161', '#424242', '#212121'],
    '#607D8B': ['#ECEFF1', '#CFD8DC', '#B0BEC5', '#90A4AE', '#78909C', '#607D8B', '#546E7A', '#455A64', '#37474F', '#263238'],
};
export const MaterialPalette = {
    title: 'Material',
    mutable: false,
    matchUserFormat: true,
    colors: Object.keys(MaterialPaletteShades),
    colorNames: [],
};
export class Swatch {
    _colorString;
    _swatchInnerElement;
    _swatchOverlayElement;
    _swatchCopyIcon;
    constructor(parentElement) {
        const swatchElement = parentElement.createChild('span', 'swatch');
        this._swatchInnerElement = swatchElement.createChild('span', 'swatch-inner');
        this._swatchOverlayElement = swatchElement.createChild('span', 'swatch-overlay');
        UI.ARIAUtils.markAsButton(this._swatchOverlayElement);
        UI.ARIAUtils.setPressed(this._swatchOverlayElement, false);
        this._swatchOverlayElement.tabIndex = 0;
        self.onInvokeElement(this._swatchOverlayElement, this._onCopyText.bind(this));
        this._swatchOverlayElement.addEventListener('mouseout', this._onCopyIconMouseout.bind(this));
        this._swatchOverlayElement.addEventListener('blur', this._onCopyIconMouseout.bind(this));
        this._swatchCopyIcon = UI.Icon.Icon.create('largeicon-copy', 'copy-color-icon');
        UI.Tooltip.Tooltip.install(this._swatchCopyIcon, i18nString(UIStrings.copyColorToClipboard));
        this._swatchOverlayElement.appendChild(this._swatchCopyIcon);
        UI.ARIAUtils.setAccessibleName(this._swatchOverlayElement, this._swatchCopyIcon.title);
    }
    setColor(color, colorString) {
        this._swatchInnerElement.style.backgroundColor = color.asString(Common.Color.Format.RGBA);
        // Show border if the swatch is white.
        this._swatchInnerElement.classList.toggle('swatch-inner-white', color.hsla()[2] > 0.9);
        this._colorString = colorString || null;
        if (colorString) {
            this._swatchOverlayElement.hidden = false;
        }
        else {
            this._swatchOverlayElement.hidden = true;
        }
    }
    _onCopyText(event) {
        this._swatchCopyIcon.setIconType('largeicon-checkmark');
        Host.InspectorFrontendHost.InspectorFrontendHostInstance.copyText(this._colorString);
        UI.ARIAUtils.setPressed(this._swatchOverlayElement, true);
        event.consume();
    }
    _onCopyIconMouseout() {
        this._swatchCopyIcon.setIconType('largeicon-copy');
        UI.ARIAUtils.setPressed(this._swatchOverlayElement, false);
    }
}
//# sourceMappingURL=Spectrum.js.map