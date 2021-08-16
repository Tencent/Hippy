// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as i18n from '../../../../core/i18n/i18n.js';
import * as SDK from '../../../../core/sdk/sdk.js';
import * as IconButton from '../../../components/icon_button/icon_button.js';
import * as UI from '../../legacy.js';
import * as FontEditorUnitConverter from './FontEditorUnitConverter.js';
import * as FontEditorUtils from './FontEditorUtils.js';
const UIStrings = {
    /**
    *@description Font editor label for font family selector
    */
    fontFamily: 'Font Family',
    /**
    *@description Section header for CSS property inputs
    */
    cssProperties: 'CSS Properties',
    /**
    *@description Font size slider label for Font Editor
    */
    fontSize: 'Font Size',
    /**
    *@description Line height slider label for Font Editor
    */
    lineHeight: 'Line Height',
    /**
    *@description Font weight slider label for Font Editor
    */
    fontWeight: 'Font Weight',
    /**
    *@description Label for letter-spacing labels
    */
    spacing: 'Spacing',
    /**
    *@description Label for numbered fallback selectors
    *@example {2} PH1
    */
    fallbackS: 'Fallback {PH1}',
    /**
    *@description Announcement for deleting an empty font family selector in the Font Editor
    *@example {2} PH1
    */
    thereIsNoValueToDeleteAtIndexS: 'There is no value to delete at index: {PH1}',
    /**
    *@description Announcement when deleting a font selector in the Font Editor
    *@example {2} PH1
    */
    fontSelectorDeletedAtIndexS: 'Font Selector deleted at index: {PH1}',
    /**
    *@description Label for Font Editor button to delete font family/fallback selectors
    *@example {Fallback 1} PH1
    */
    deleteS: 'Delete {PH1}',
    /**
    * @description Warning message for Font Editor invalid text input. The placeholder is the name of
    * the CSS attribute that is incorrect.
    * @example {font-size} PH1
    */
    PleaseEnterAValidValueForSText: '* Please enter a valid value for {PH1} text input',
    /**
    *@description Error text in Font Editor
    *@example {font-size} PH1
    */
    thisPropertyIsSetToContainUnits: 'This property is set to contain units but does not have a defined corresponding unitsArray: {PH1}',
    /**
    *@description Label for slider input in the Font Editor.
    *@example {font-size} PH1
    */
    sSliderInput: '{PH1} Slider Input',
    /**
    *@description Accessible label for a text input for a property in the Font Editor.
    *@example {font-size} PH1
    */
    sTextInput: '{PH1} Text Input',
    /**
    *@description Font Editor units text box label
    */
    units: 'Units',
    /**
    * @description Accessible name for Font Editor unit input. The placeholder is the name of the font
    * property that this UI input controls. e.g. font-size, line-height, line-weight.
    * @example {font-size} PH1
    */
    sUnitInput: '{PH1} Unit Input',
    /**
    *@description Text used in the Font Editor for the key values selector
    *@example {font-size} PH1
    */
    sKeyValueSelector: '{PH1} Key Value Selector',
    /**
    * @description Label for Font Editor toggle input type button. The placeholder is the name of the
    * font property that this UI input controls. e.g. font-size, line-height, line-weight. Tooltip for
    * a button next to the text input which allows the user to change the input type. When they click
    * this button, the UI changes to allow the user to choose from a list of pre-selected font
    * categories.
    * @example {font-size} PH1
    */
    sToggleInputType: '{PH1} toggle input type',
    /**
    *@description Label for Font Editor alert in CSS Properties section when toggling inputs
    */
    selectorInputMode: 'Selector Input Mode',
    /**
    *@description Label for Font Editor alert in CSS Properties section when toggling inputs
    */
    sliderInputMode: 'Slider Input Mode',
};
const str_ = i18n.i18n.registerUIStrings('ui/legacy/components/inline_editor/FontEditor.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class FontEditor extends UI.Widget.VBox {
    _selectedNode;
    _propertyMap;
    _fontSelectorSection;
    _fontSelectors;
    _fontsList;
    constructor(propertyMap) {
        super(true);
        this.registerRequiredCSS('ui/legacy/components/inline_editor/fontEditor.css', { enableLegacyPatching: false });
        this._selectedNode = UI.Context.Context.instance().flavor(SDK.DOMModel.DOMNode);
        this._propertyMap = propertyMap;
        this.contentElement.tabIndex = 0;
        this.setDefaultFocusedElement(this.contentElement);
        // Font Selector Section
        this._fontSelectorSection = this.contentElement.createChild('div', 'font-selector-section');
        this._fontSelectorSection.createChild('h2', 'font-section-header').textContent = i18nString(UIStrings.fontFamily);
        this._fontSelectors = [];
        this._fontsList = null;
        const propertyValue = this._propertyMap.get('font-family');
        this._createFontSelectorSection(propertyValue);
        //  CSS Font Property Section
        const cssPropertySection = this.contentElement.createChild('div', 'font-section');
        cssPropertySection.createChild('h2', 'font-section-header').textContent = i18nString(UIStrings.cssProperties);
        // The regexes only handle valid property values as invalid values are not passed into the property map.
        const fontSizePropertyInfo = this._getPropertyInfo('font-size', FontEditorUtils.FontSizeStaticParams.regex);
        const lineHeightPropertyInfo = this._getPropertyInfo('line-height', FontEditorUtils.LineHeightStaticParams.regex);
        const fontWeightPropertyInfo = this._getPropertyInfo('font-weight', FontEditorUtils.FontWeightStaticParams.regex);
        const letterSpacingPropertyInfo = this._getPropertyInfo('letter-spacing', FontEditorUtils.LetterSpacingStaticParams.regex);
        new FontPropertyInputs('font-size', i18nString(UIStrings.fontSize), cssPropertySection, fontSizePropertyInfo, FontEditorUtils.FontSizeStaticParams, this._updatePropertyValue.bind(this), this._resizePopout.bind(this), 
        /** hasUnits= */ true);
        new FontPropertyInputs('line-height', i18nString(UIStrings.lineHeight), cssPropertySection, lineHeightPropertyInfo, FontEditorUtils.LineHeightStaticParams, this._updatePropertyValue.bind(this), this._resizePopout.bind(this), 
        /** hasUnits= */ true);
        new FontPropertyInputs('font-weight', i18nString(UIStrings.fontWeight), cssPropertySection, fontWeightPropertyInfo, FontEditorUtils.FontWeightStaticParams, this._updatePropertyValue.bind(this), this._resizePopout.bind(this), 
        /** hasUnits= */ false);
        new FontPropertyInputs('letter-spacing', i18nString(UIStrings.spacing), cssPropertySection, letterSpacingPropertyInfo, FontEditorUtils.LetterSpacingStaticParams, this._updatePropertyValue.bind(this), this._resizePopout.bind(this), 
        /** hasUnits= */ true);
    }
    async _createFontSelectorSection(propertyValue) {
        if (propertyValue) {
            // FIXME(crbug.com/1148434): propertyValue will not be split correctly for font family names that contain commas.
            // e.g. font-family: "Name,with,commas"
            const splitValue = propertyValue.split(',');
            await this._createFontSelector(splitValue[0], /* isPrimary= */ true);
            if (!FontEditorUtils.GlobalValues.includes(splitValue[0])) {
                // We add one to the splitValue length so that we have an additional empty fallback selector
                for (let i = 1; i < splitValue.length + 1; i++) {
                    this._createFontSelector(splitValue[i]);
                }
            }
        }
        else {
            this._createFontSelector('', true);
        }
        this._resizePopout();
    }
    async _createFontsList() {
        const computedFontArray = await FontEditorUtils.generateComputedFontArray();
        const computedMap = new Map();
        const splicedArray = this._splitComputedFontArray(computedFontArray);
        computedMap.set('Computed Fonts', splicedArray);
        const systemMap = new Map();
        systemMap.set('System Fonts', FontEditorUtils.SystemFonts);
        systemMap.set('Generic Families', FontEditorUtils.GenericFonts);
        const fontList = [];
        fontList.push(computedMap);
        fontList.push(systemMap);
        return fontList;
    }
    _splitComputedFontArray(computedFontArray) {
        const array = [];
        for (const fontFamilyValue of computedFontArray) {
            if (fontFamilyValue.includes(',')) {
                const fonts = fontFamilyValue.split(',');
                fonts.forEach(element => {
                    if (array.findIndex(item => item.toLowerCase() === element.trim().toLowerCase().replace(/"/g, '\'')) === -1) {
                        array.push(element.trim().replace(/"/g, ''));
                    }
                });
            }
            else if (array.findIndex(item => item.toLowerCase() === fontFamilyValue.toLowerCase().replace('"', '\'')) === -1) {
                array.push(fontFamilyValue.replace(/"/g, ''));
            }
        }
        return array;
    }
    async _createFontSelector(value, isPrimary) {
        // FIXME(crbug.com/1148434): Custom font family names that use single/double quotes in the font family name will not be handled correctly.
        // e.g. font-family: "FontWith\"DoubleQuotes"
        value = value ? value.trim() : '';
        if (value) {
            const firstChar = value.charAt(0);
            if (firstChar === '\'') {
                value = value.replace(/'/g, '');
            }
            else if (firstChar === '"') {
                value = value.replace(/"/g, '');
            }
        }
        const selectorField = this._fontSelectorSection.createChild('div', 'shadow-editor-field shadow-editor-flex-field');
        if (!this._fontsList) {
            this._fontsList = await this._createFontsList();
        }
        let label;
        if (isPrimary) {
            label = i18nString(UIStrings.fontFamily);
            const globalValuesMap = new Map([['Global Values', FontEditorUtils.GlobalValues]]);
            const primaryFontList = [...this._fontsList];
            primaryFontList.push(globalValuesMap);
            this._createSelector(selectorField, label, primaryFontList, value.trim());
        }
        else {
            label = i18nString(UIStrings.fallbackS, { PH1: this._fontSelectors.length });
            this._createSelector(selectorField, label, this._fontsList, value.trim());
        }
    }
    _deleteFontSelector(index, isGlobalValue) {
        let fontSelectorObject = this._fontSelectors[index];
        const isPrimary = index === 0;
        if (fontSelectorObject.input.value === '' && !isGlobalValue) {
            UI.ARIAUtils.alert(i18nString(UIStrings.thereIsNoValueToDeleteAtIndexS, { PH1: index }));
            return;
        }
        if (isPrimary) {
            // When deleting the primary font selector, we overwrite the value of the primary selector
            // with the value of the secondary selector and delete the secondary selector.
            const secondarySelector = this._fontSelectors[1];
            let newPrimarySelectorValue = '';
            if (secondarySelector) {
                newPrimarySelectorValue = secondarySelector.input.value;
                fontSelectorObject = secondarySelector;
            }
            const primarySelector = this._fontSelectors[0].input;
            primarySelector.value = newPrimarySelectorValue;
            index = 1;
        }
        if (fontSelectorObject.input.parentNode) {
            const hasSecondarySelector = this._fontSelectors.length > 1;
            if (!isPrimary || hasSecondarySelector) {
                const selectorElement = fontSelectorObject.input.parentElement;
                if (selectorElement) {
                    selectorElement.remove();
                    this._fontSelectors.splice(index, 1);
                    this._updateFontSelectorList();
                }
            }
            UI.ARIAUtils.alert(i18nString(UIStrings.fontSelectorDeletedAtIndexS, { PH1: index }));
        }
        this._onFontSelectorChanged();
        this._resizePopout();
        const focusIndex = isPrimary ? 0 : index - 1;
        this._fontSelectors[focusIndex].input.focus();
    }
    _updateFontSelectorList() {
        for (let i = 0; i < this._fontSelectors.length; i++) {
            const fontSelectorObject = this._fontSelectors[i];
            let label;
            if (i === 0) {
                label = i18nString(UIStrings.fontFamily);
            }
            else {
                label = i18nString(UIStrings.fallbackS, { PH1: i });
            }
            fontSelectorObject.label.textContent = label;
            UI.ARIAUtils.setAccessibleName(fontSelectorObject.input, label);
            fontSelectorObject.deleteButton.setTitle(i18nString(UIStrings.deleteS, { PH1: label }));
            fontSelectorObject.index = i;
        }
    }
    _getPropertyInfo(name, regex) {
        const value = this._propertyMap.get(name);
        if (value) {
            const valueString = value;
            const match = valueString.match(regex);
            if (match) {
                const retValue = match[1].charAt(0) === '+' ? match[1].substr(1) : match[1];
                const retUnits = match[2] ? match[2] : '';
                return { value: retValue, units: retUnits };
            }
            return { value: valueString, units: null };
        }
        return { value: null, units: null };
    }
    _createSelector(field, label, options, currentValue) {
        const index = this._fontSelectors.length;
        const selectInput = UI.UIUtils.createSelect(label, options);
        selectInput.value = currentValue;
        const selectLabel = UI.UIUtils.createLabel(label, 'shadow-editor-label', selectInput);
        selectInput.addEventListener('input', this._onFontSelectorChanged.bind(this), false);
        // We want to prevent the Enter key from propagating to the SwatchPopoverHelper which will close the editor.
        selectInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.consume();
            }
        }, false);
        field.appendChild(selectLabel);
        field.appendChild(selectInput);
        const deleteToolbar = new UI.Toolbar.Toolbar('', field);
        const deleteButton = new UI.Toolbar.ToolbarButton(i18nString(UIStrings.deleteS, { PH1: label }), 'largeicon-trash-bin');
        deleteToolbar.appendToolbarItem(deleteButton);
        const fontSelectorObject = { label: selectLabel, input: selectInput, deleteButton, index };
        deleteButton.addEventListener(UI.Toolbar.ToolbarButton.Events.Click, () => {
            this._deleteFontSelector(fontSelectorObject.index);
        });
        deleteButton.element.addEventListener('keydown', (event) => {
            if (isEnterOrSpaceKey(event)) {
                this._deleteFontSelector(fontSelectorObject.index);
                event.consume();
            }
        }, false);
        this._fontSelectors.push(fontSelectorObject);
    }
    _onFontSelectorChanged() {
        let value = '';
        const isGlobalValue = FontEditorUtils.GlobalValues.includes(this._fontSelectors[0].input.value);
        if (isGlobalValue) {
            for (let i = 1; i < this._fontSelectors.length; i++) {
                this._deleteFontSelector(i, /** isGlobalValue= */ true);
            }
        }
        for (const fontSelector of this._fontSelectors) {
            const fontSelectorInput = fontSelector.input;
            if (fontSelectorInput.value !== '') {
                if (value === '') {
                    value = this._fontSelectors[0].input.value;
                }
                else {
                    value += ', ' + fontSelectorInput.value;
                }
            }
        }
        // Add an extra blank selector as long as the last selector doesn't have an empty value, the primary
        // selector's value is not a global value and if the list of selectors has not exceeded 10.
        if (this._fontSelectors[this._fontSelectors.length - 1].input.value !== '' && !isGlobalValue &&
            this._fontSelectors.length < 10) {
            this._createFontSelector(/** value= */ '');
            this._resizePopout();
        }
        this._updatePropertyValue('font-family', value);
    }
    _updatePropertyValue(propertyName, value) {
        this.dispatchEventToListeners(Events.FontChanged, { propertyName, value });
    }
    _resizePopout() {
        this.dispatchEventToListeners(Events.FontEditorResized);
    }
}
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var Events;
(function (Events) {
    Events["FontChanged"] = "FontChanged";
    Events["FontEditorResized"] = "FontEditorResized";
})(Events || (Events = {}));
class FontPropertyInputs {
    _showSliderMode;
    _errorText;
    _propertyInfo;
    _propertyName;
    _staticParams;
    _hasUnits;
    _units;
    _addedUnit;
    _initialRange;
    _boundUpdateCallback;
    _boundResizeCallback;
    _selectedNode;
    _sliderInput;
    _textBoxInput;
    _unitInput;
    _selectorInput;
    _applyNextInput;
    constructor(propertyName, label, field, propertyInfo, staticParams, updateCallback, resizeCallback, hasUnits) {
        this._showSliderMode = true;
        const propertyField = field.createChild('div', 'shadow-editor-field shadow-editor-flex-field');
        this._errorText = field.createChild('div', 'error-text');
        this._errorText.textContent = i18nString(UIStrings.PleaseEnterAValidValueForSText, { PH1: propertyName });
        this._errorText.hidden = true;
        UI.ARIAUtils.markAsAlert(this._errorText);
        this._propertyInfo = propertyInfo;
        this._propertyName = propertyName;
        this._staticParams = staticParams;
        // Unit handling
        this._hasUnits = hasUnits;
        if (this._hasUnits && this._staticParams.units && this._staticParams.defaultUnit !== null) {
            const defaultUnits = this._staticParams.defaultUnit;
            this._units = propertyInfo.units !== null ? propertyInfo.units : defaultUnits;
            this._addedUnit = !this._staticParams.units.has(this._units);
        }
        else if (this._hasUnits) {
            throw new Error(i18nString(UIStrings.thisPropertyIsSetToContainUnits, { PH1: propertyName }));
        }
        else {
            this._units = '';
        }
        this._initialRange = this._getUnitRange();
        this._boundUpdateCallback = updateCallback;
        this._boundResizeCallback = resizeCallback;
        this._selectedNode = UI.Context.Context.instance().flavor(SDK.DOMModel.DOMNode);
        const propertyLabel = UI.UIUtils.createLabel(label, 'shadow-editor-label');
        propertyField.append(propertyLabel);
        this._sliderInput = this._createSliderInput(propertyField, label);
        this._textBoxInput = this._createTextBoxInput(propertyField);
        UI.ARIAUtils.bindLabelToControl(propertyLabel, this._textBoxInput);
        this._unitInput = this._createUnitInput(propertyField);
        this._selectorInput = this._createSelectorInput(propertyField);
        this._createTypeToggle(propertyField);
        this._checkSelectorValueAndToggle();
        this._applyNextInput = false;
    }
    _setInvalidTextBoxInput(invalid) {
        if (invalid) {
            if (this._errorText.hidden) {
                this._errorText.hidden = false;
                this._textBoxInput.classList.add('error-input');
                this._boundResizeCallback();
            }
        }
        else {
            if (!this._errorText.hidden) {
                this._errorText.hidden = true;
                this._textBoxInput.classList.remove('error-input');
                this._boundResizeCallback();
            }
        }
    }
    _checkSelectorValueAndToggle() {
        if (this._staticParams.keyValues && this._propertyInfo.value !== null &&
            (this._staticParams.keyValues.has(this._propertyInfo.value))) {
            this._toggleInputType();
            return true;
        }
        return false;
    }
    _getUnitRange() {
        let min = 0;
        let max = 100;
        let step = 1;
        if (this._propertyInfo.value !== null && /\d/.test(this._propertyInfo.value)) {
            if (this._staticParams.rangeMap.get(this._units)) {
                const unitRangeMap = this._staticParams.rangeMap.get(this._units);
                if (unitRangeMap) {
                    min = Math.min(unitRangeMap.min, parseFloat(this._propertyInfo.value));
                    max = Math.max(unitRangeMap.max, parseFloat(this._propertyInfo.value));
                    step = unitRangeMap.step;
                }
            }
            else {
                const unitRangeMap = this._staticParams.rangeMap.get('px');
                if (unitRangeMap) {
                    min = Math.min(unitRangeMap.min, parseFloat(this._propertyInfo.value));
                    max = Math.max(unitRangeMap.max, parseFloat(this._propertyInfo.value));
                    step = unitRangeMap.step;
                }
            }
        }
        else {
            const unitRangeMap = this._staticParams.rangeMap.get(this._units);
            if (unitRangeMap) {
                min = unitRangeMap.min;
                max = unitRangeMap.max;
                step = unitRangeMap.step;
            }
        }
        return { min, max, step };
    }
    _createSliderInput(field, _label) {
        const min = this._initialRange.min;
        const max = this._initialRange.max;
        const step = this._initialRange.step;
        const slider = UI.UIUtils.createSlider(min, max, -1);
        slider.sliderElement.step = step.toString();
        slider.sliderElement.tabIndex = 0;
        if (this._propertyInfo.value) {
            slider.value = parseFloat(this._propertyInfo.value);
        }
        else {
            const newValue = (min + max) / 2;
            slider.value = newValue;
        }
        slider.addEventListener('input', event => {
            this._onSliderInput(event, /** apply= */ false);
        });
        slider.addEventListener('mouseup', event => {
            this._onSliderInput(event, /** apply= */ true);
        });
        slider.addEventListener('keydown', event => {
            if (event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'ArrowLeft' ||
                event.key === 'ArrowRight') {
                // Pressing an arrow key will trigger two events for the slider: A keyboard event and an input event
                // The keyboard event will come before the slider value has changed and the subsequent input event will cause
                // the value to change.  We use the _applyNextInput boolean to tell _onSliderInput that the next input event
                // is coming because of the keyboard event and that it should be applied to the section.
                this._applyNextInput = true;
            }
        });
        field.appendChild(slider);
        UI.ARIAUtils.setAccessibleName(slider.sliderElement, i18nString(UIStrings.sSliderInput, { PH1: this._propertyName }));
        return slider;
    }
    _createTextBoxInput(field) {
        const textBoxInput = UI.UIUtils.createInput('shadow-editor-text-input', 'number');
        textBoxInput.step = this._initialRange.step.toString();
        textBoxInput.classList.add('font-editor-text-input');
        if (this._propertyInfo.value !== null) {
            if (this._propertyInfo.value.charAt(0) === '+') {
                this._propertyInfo.value = this._propertyInfo.value.substr(1);
            }
            textBoxInput.value = this._propertyInfo.value;
        }
        textBoxInput.step = 'any';
        textBoxInput.addEventListener('input', this._onTextBoxInput.bind(this), false);
        field.appendChild(textBoxInput);
        UI.ARIAUtils.setAccessibleName(textBoxInput, i18nString(UIStrings.sTextInput, { PH1: this._propertyName }));
        return textBoxInput;
    }
    _createUnitInput(field) {
        let unitInput;
        if (this._hasUnits && this._staticParams.units) {
            const currentValue = this._propertyInfo.units;
            const options = this._staticParams.units;
            unitInput = UI.UIUtils.createSelect(i18nString(UIStrings.units), options);
            unitInput.classList.add('font-editor-select');
            if (this._addedUnit && currentValue) {
                unitInput.add(new Option(currentValue, currentValue));
            }
            if (currentValue) {
                unitInput.value = currentValue;
            }
            unitInput.addEventListener('change', this._onUnitInput.bind(this), false);
        }
        else {
            unitInput = UI.UIUtils.createSelect(i18nString(UIStrings.units), []);
            unitInput.classList.add('font-editor-select');
            unitInput.disabled = true;
        }
        // We want to prevent the Enter key from propagating to the SwatchPopoverHelper which will close the editor.
        unitInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.consume();
            }
        }, false);
        field.appendChild(unitInput);
        UI.ARIAUtils.setAccessibleName(unitInput, i18nString(UIStrings.sUnitInput, { PH1: this._propertyName }));
        return unitInput;
    }
    _createSelectorInput(field) {
        const selectInput = UI.UIUtils.createSelect(i18nString(UIStrings.sKeyValueSelector, { PH1: this._propertyName }), this._staticParams.keyValues);
        selectInput.classList.add('font-selector-input');
        if (this._propertyInfo.value) {
            selectInput.value = this._propertyInfo.value;
        }
        selectInput.addEventListener('input', this._onSelectorInput.bind(this), false);
        // We want to prevent the Enter key from propagating to the SwatchPopoverHelper which will close the editor.
        selectInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.consume();
            }
        }, false);
        field.appendChild(selectInput);
        selectInput.hidden = true;
        return selectInput;
    }
    _onSelectorInput(event) {
        if (event.currentTarget) {
            const value = event.currentTarget.value;
            this._textBoxInput.value = '';
            const newValue = (parseFloat(this._sliderInput.sliderElement.min) + parseFloat(this._sliderInput.sliderElement.max)) / 2;
            this._sliderInput.value = newValue;
            this._setInvalidTextBoxInput(false);
            this._boundUpdateCallback(this._propertyName, value);
        }
    }
    _onSliderInput(event, apply) {
        const target = event.currentTarget;
        if (target) {
            const value = target.value;
            this._textBoxInput.value = value;
            this._selectorInput.value = '';
            const valueString = this._hasUnits ? value + this._unitInput.value : value.toString();
            this._setInvalidTextBoxInput(false);
            if (apply || this._applyNextInput) {
                this._boundUpdateCallback(this._propertyName, valueString);
                this._applyNextInput = false;
            }
        }
    }
    _onTextBoxInput(event) {
        const target = event.currentTarget;
        if (target) {
            const value = target.value;
            const units = value === '' ? '' : this._unitInput.value;
            const valueString = value + units;
            if (this._staticParams.regex.test(valueString) || (value === '' && !target.validationMessage.length)) {
                if (parseFloat(value) > parseFloat(this._sliderInput.sliderElement.max)) {
                    this._sliderInput.sliderElement.max = value;
                }
                else if (parseFloat(value) < parseFloat(this._sliderInput.sliderElement.min)) {
                    this._sliderInput.sliderElement.min = value;
                }
                this._sliderInput.value = parseFloat(value);
                this._selectorInput.value = '';
                this._setInvalidTextBoxInput(false);
                this._boundUpdateCallback(this._propertyName, valueString);
            }
            else {
                this._setInvalidTextBoxInput(true);
            }
        }
    }
    async _onUnitInput(event) {
        const unitInput = event.currentTarget;
        const hasFocus = unitInput.hasFocus();
        const newUnit = unitInput.value;
        unitInput.disabled = true;
        const prevUnit = this._units;
        const conversionMultiplier = await FontEditorUnitConverter.getUnitConversionMultiplier(prevUnit, newUnit, this._propertyName === 'font-size');
        this._setInputUnits(conversionMultiplier, newUnit);
        if (this._textBoxInput.value) {
            this._boundUpdateCallback(this._propertyName, this._textBoxInput.value + newUnit);
        }
        this._units = newUnit;
        unitInput.disabled = false;
        if (hasFocus) {
            unitInput.focus();
        }
    }
    _createTypeToggle(field) {
        const displaySwitcher = field.createChild('div', 'spectrum-switcher');
        const icon = new IconButton.Icon.Icon();
        icon.data = { iconName: 'switcherIcon', color: 'var(--color-text-primary)', width: '16px', height: '16px' };
        displaySwitcher.appendChild(icon);
        UI.UIUtils.setTitle(displaySwitcher, i18nString(UIStrings.sToggleInputType, { PH1: this._propertyName }));
        displaySwitcher.tabIndex = 0;
        self.onInvokeElement(displaySwitcher, this._toggleInputType.bind(this));
        UI.ARIAUtils.markAsButton(displaySwitcher);
    }
    _toggleInputType(event) {
        if (event && event.key === 'Enter') {
            event.consume();
        }
        if (this._showSliderMode) {
            // Show selector input type
            this._sliderInput.hidden = true;
            this._textBoxInput.hidden = true;
            this._unitInput.hidden = true;
            this._selectorInput.hidden = false;
            this._showSliderMode = false;
            UI.ARIAUtils.alert(i18nString(UIStrings.selectorInputMode));
        }
        else {
            // Show sliderinput type
            this._sliderInput.hidden = false;
            this._textBoxInput.hidden = false;
            this._unitInput.hidden = false;
            this._selectorInput.hidden = true;
            this._showSliderMode = true;
            UI.ARIAUtils.alert(i18nString(UIStrings.sliderInputMode));
        }
    }
    _setInputUnits(multiplier, newUnit) {
        const newRangeMap = this._staticParams.rangeMap.get(newUnit);
        let newMin, newMax, newStep;
        if (newRangeMap) {
            newMin = newRangeMap.min;
            newMax = newRangeMap.max;
            newStep = newRangeMap.step;
        }
        else {
            newMin = 0;
            newMax = 100;
            newStep = 1;
        }
        let hasValue = false;
        const roundingPrecision = FontEditorUtils.getRoundingPrecision(newStep);
        let newValue = (newMin + newMax) / 2;
        if (this._textBoxInput.value) {
            hasValue = true;
            newValue = parseFloat((parseFloat(this._textBoxInput.value) * multiplier).toFixed(roundingPrecision));
        }
        this._sliderInput.sliderElement.min = Math.min(newValue, newMin).toString();
        this._sliderInput.sliderElement.max = Math.max(newValue, newMax).toString();
        this._sliderInput.sliderElement.step = newStep.toString();
        this._textBoxInput.step = newStep.toString();
        if (hasValue) {
            this._textBoxInput.value = newValue.toString();
        }
        this._sliderInput.value = newValue;
    }
}
//# sourceMappingURL=FontEditor.js.map