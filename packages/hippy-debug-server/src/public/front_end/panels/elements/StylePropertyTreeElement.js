// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as Host from '../../core/host/host.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as Platform from '../../core/platform/platform.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Bindings from '../../models/bindings/bindings.js';
import * as TextUtils from '../../models/text_utils/text_utils.js';
import * as ColorPicker from '../../ui/legacy/components/color_picker/color_picker.js';
import * as InlineEditor from '../../ui/legacy/components/inline_editor/inline_editor.js';
import * as UI from '../../ui/legacy/legacy.js';
import { BezierPopoverIcon, ColorSwatchPopoverIcon, ShadowSwatchPopoverHelper } from './ColorSwatchPopoverIcon.js';
import * as ElementsComponents from './components/components.js';
import { ElementsPanel } from './ElementsPanel.js';
import { StyleEditorWidget } from './StyleEditorWidget.js';
import { CSSPropertyPrompt, StylesSidebarPane, StylesSidebarPropertyRenderer } from './StylesSidebarPane.js'; // eslint-disable-line no-unused-vars
const FlexboxEditor = ElementsComponents.StylePropertyEditor.FlexboxEditor;
const GridEditor = ElementsComponents.StylePropertyEditor.GridEditor;
const UIStrings = {
    /**
    *@description Text in Color Swatch Popover Icon of the Elements panel
    */
    shiftClickToChangeColorFormat: 'Shift + Click to change color format.',
    /**
    *@description Swatch icon element title in Color Swatch Popover Icon of the Elements panel
    *@example {Shift + Click to change color format.} PH1
    */
    openColorPickerS: 'Open color picker. {PH1}',
    /**
    *@description The warning text shown in Elements panel when font-variation-settings don't match allowed values
    *@example {wdth} PH1
    *@example {100} PH2
    *@example {10} PH3
    *@example {20} PH4
    *@example {Arial} PH5
    */
    valueForSettingSSIsOutsideThe: 'Value for setting “{PH1}” {PH2} is outside the supported range [{PH3}, {PH4}] for font-family “{PH5}”.',
    /**
    *@description Context menu item for style property in edit mode
    */
    togglePropertyAndContinueEditing: 'Toggle property and continue editing',
    /**
    *@description Context menu item for style property in edit mode
    */
    revealInSourcesPanel: 'Reveal in Sources panel',
    /**
    *@description A context menu item in Styles panel to copy CSS declaration
    */
    copyDeclaration: 'Copy declaration',
    /**
    *@description A context menu item in Styles panel to copy CSS property
    */
    copyProperty: 'Copy property',
    /**
    *@description A context menu item in the Watch Expressions Sidebar Pane of the Sources panel and Network pane request.
    */
    copyValue: 'Copy value',
    /**
    *@description A context menu item in Styles panel to copy CSS rule
    */
    copyRule: 'Copy rule',
    /**
    *@description A context menu item in Styles panel to copy all CSS declarations
    */
    copyAllDeclarations: 'Copy all declarations',
    /**
    *@description A context menu item in Styles panel to view the computed CSS property value.
    */
    viewComputedValue: 'View computed value',
    /**
    * @description Title of the button that opens the flexbox editor in the Styles panel.
    */
    flexboxEditorButton: 'Open `flexbox` editor',
    /**
    * @description Title of the button that opens the CSS Grid editor in the Styles panel.
    */
    gridEditorButton: 'Open `grid` editor',
};
const str_ = i18n.i18n.registerUIStrings('panels/elements/StylePropertyTreeElement.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
const parentMap = new WeakMap();
export class StylePropertyTreeElement extends UI.TreeOutline.TreeElement {
    _style;
    _matchedStyles;
    property;
    _inherited;
    _overloaded;
    _parentPane;
    isShorthand;
    _applyStyleThrottler;
    _newProperty;
    _expandedDueToFilter;
    valueElement;
    nameElement;
    _expandElement;
    _originalPropertyText;
    _hasBeenEditedIncrementally;
    _prompt;
    _lastComputedValue;
    _contextForTest;
    constructor(stylesPane, matchedStyles, property, isShorthand, inherited, overloaded, newProperty) {
        // Pass an empty title, the title gets made later in onattach.
        super('', isShorthand);
        this._style = property.ownerStyle;
        this._matchedStyles = matchedStyles;
        this.property = property;
        this._inherited = inherited;
        this._overloaded = overloaded;
        this.selectable = false;
        this._parentPane = stylesPane;
        this.isShorthand = isShorthand;
        this._applyStyleThrottler = new Common.Throttler.Throttler(0);
        this._newProperty = newProperty;
        if (this._newProperty) {
            this.listItemElement.textContent = '';
        }
        this._expandedDueToFilter = false;
        this.valueElement = null;
        this.nameElement = null;
        this._expandElement = null;
        this._originalPropertyText = '';
        this._hasBeenEditedIncrementally = false;
        this._prompt = null;
        this._lastComputedValue = null;
    }
    matchedStyles() {
        return this._matchedStyles;
    }
    _editable() {
        return Boolean(this._style.styleSheetId && this._style.range);
    }
    inherited() {
        return this._inherited;
    }
    overloaded() {
        return this._overloaded;
    }
    setOverloaded(x) {
        if (x === this._overloaded) {
            return;
        }
        this._overloaded = x;
        this._updateState();
    }
    get name() {
        return this.property.name;
    }
    get value() {
        return this.property.value;
    }
    updateFilter() {
        const regex = this._parentPane.filterRegex();
        const matches = regex !== null && (regex.test(this.property.name) || regex.test(this.property.value));
        this.listItemElement.classList.toggle('filter-match', matches);
        this.onpopulate();
        let hasMatchingChildren = false;
        for (let i = 0; i < this.childCount(); ++i) {
            const child = this.childAt(i);
            if (!child || (child && !child.updateFilter())) {
                continue;
            }
            hasMatchingChildren = true;
        }
        if (!regex) {
            if (this._expandedDueToFilter) {
                this.collapse();
            }
            this._expandedDueToFilter = false;
        }
        else if (hasMatchingChildren && !this.expanded) {
            this.expand();
            this._expandedDueToFilter = true;
        }
        else if (!hasMatchingChildren && this.expanded && this._expandedDueToFilter) {
            this.collapse();
            this._expandedDueToFilter = false;
        }
        return matches;
    }
    _processColor(text, valueChild) {
        const useUserSettingFormat = this._editable();
        const shiftClickMessage = i18nString(UIStrings.shiftClickToChangeColorFormat);
        const tooltip = this._editable() ? i18nString(UIStrings.openColorPickerS, { PH1: shiftClickMessage }) : shiftClickMessage;
        const swatch = new InlineEditor.ColorSwatch.ColorSwatch();
        swatch.renderColor(text, useUserSettingFormat, tooltip);
        if (!valueChild) {
            valueChild = swatch.createChild('span');
            const color = swatch.getColor();
            valueChild.textContent = color ? color.asString(swatch.getFormat()) : text;
        }
        swatch.appendChild(valueChild);
        const onFormatchanged = (event) => {
            // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data } = event;
            swatch.firstElementChild && swatch.firstElementChild.remove();
            swatch.createChild('span').textContent = data.text;
        };
        swatch.addEventListener('formatchanged', onFormatchanged);
        if (this._editable()) {
            this._addColorContrastInfo(swatch);
        }
        return swatch;
    }
    _processVar(text) {
        const computedSingleValue = this._matchedStyles.computeSingleVariableValue(this._style, text);
        if (!computedSingleValue) {
            return document.createTextNode(text);
        }
        const { computedValue, fromFallback } = computedSingleValue;
        const varSwatch = new InlineEditor.CSSVarSwatch.CSSVarSwatch();
        UI.UIUtils.createTextChild(varSwatch, text);
        varSwatch.data = { text, computedValue, fromFallback, onLinkActivate: this._handleVarDefinitionActivate.bind(this) };
        if (!computedValue || !Common.Color.Color.parse(computedValue)) {
            return varSwatch;
        }
        return this._processColor(computedValue, varSwatch);
    }
    _handleVarDefinitionActivate(variableName) {
        Host.userMetrics.actionTaken(Host.UserMetrics.Action.CustomPropertyLinkClicked);
        this._parentPane.jumpToProperty(variableName);
    }
    async _addColorContrastInfo(swatch) {
        const swatchPopoverHelper = this._parentPane.swatchPopoverHelper();
        const swatchIcon = new ColorSwatchPopoverIcon(this, swatchPopoverHelper, swatch);
        if (this.property.name !== 'color' || !this._parentPane.cssModel() || !this.node()) {
            return;
        }
        const cssModel = this._parentPane.cssModel();
        const node = this.node();
        if (cssModel && node && typeof node.id !== 'undefined') {
            const contrastInfo = new ColorPicker.ContrastInfo.ContrastInfo(await cssModel.backgroundColorsPromise(node.id));
            swatchIcon.setContrastInfo(contrastInfo);
        }
    }
    renderedPropertyText() {
        if (!this.nameElement || !this.valueElement) {
            return '';
        }
        return this.nameElement.textContent + ': ' + this.valueElement.textContent;
    }
    _processBezier(text) {
        if (!this._editable() || !UI.Geometry.CubicBezier.parse(text)) {
            return document.createTextNode(text);
        }
        const swatchPopoverHelper = this._parentPane.swatchPopoverHelper();
        const swatch = InlineEditor.Swatches.BezierSwatch.create();
        swatch.setBezierText(text);
        new BezierPopoverIcon(this, swatchPopoverHelper, swatch);
        return swatch;
    }
    _processFont(text) {
        const section = this.section();
        if (section) {
            section.registerFontProperty(this);
        }
        return document.createTextNode(text);
    }
    _processShadow(propertyValue, propertyName) {
        if (!this._editable()) {
            return document.createTextNode(propertyValue);
        }
        let shadows;
        if (propertyName === 'text-shadow') {
            shadows = InlineEditor.CSSShadowModel.CSSShadowModel.parseTextShadow(propertyValue);
        }
        else {
            shadows = InlineEditor.CSSShadowModel.CSSShadowModel.parseBoxShadow(propertyValue);
        }
        if (!shadows.length) {
            return document.createTextNode(propertyValue);
        }
        const container = document.createDocumentFragment();
        const swatchPopoverHelper = this._parentPane.swatchPopoverHelper();
        for (let i = 0; i < shadows.length; i++) {
            if (i !== 0) {
                container.appendChild(document.createTextNode(', '));
            } // Add back commas and spaces between each shadow.
            // TODO(flandy): editing the property value should use the original value with all spaces.
            const cssShadowSwatch = InlineEditor.Swatches.CSSShadowSwatch.create();
            cssShadowSwatch.setCSSShadow(shadows[i]);
            new ShadowSwatchPopoverHelper(this, swatchPopoverHelper, cssShadowSwatch);
            const colorSwatch = cssShadowSwatch.colorSwatch();
            if (colorSwatch) {
                new ColorSwatchPopoverIcon(this, swatchPopoverHelper, colorSwatch);
            }
            container.appendChild(cssShadowSwatch);
        }
        return container;
    }
    _processGrid(propertyValue, _propertyName) {
        const splitResult = TextUtils.TextUtils.Utils.splitStringByRegexes(propertyValue, [SDK.CSSMetadata.GridAreaRowRegex]);
        if (splitResult.length <= 1) {
            return document.createTextNode(propertyValue);
        }
        const indent = Common.Settings.Settings.instance().moduleSetting('textEditorIndent').get();
        const container = document.createDocumentFragment();
        for (const result of splitResult) {
            const value = result.value.trim();
            const content = UI.Fragment.html `<br /><span class='styles-clipboard-only'>${indent.repeat(2)}</span>${value}`;
            container.appendChild(content);
        }
        return container;
    }
    _processAngle(angleText) {
        if (!this._editable()) {
            return document.createTextNode(angleText);
        }
        const cssAngle = new InlineEditor.CSSAngle.CSSAngle();
        const valueElement = document.createElement('span');
        valueElement.textContent = angleText;
        const computedPropertyValue = this._matchedStyles.computeValue(this.property.ownerStyle, this.property.value) || '';
        cssAngle.data = {
            propertyName: this.property.name,
            propertyValue: computedPropertyValue,
            angleText,
            containingPane: this._parentPane.element.enclosingNodeOrSelfWithClass('style-panes-wrapper'),
        };
        cssAngle.append(valueElement);
        const popoverToggled = (event) => {
            const section = this.section();
            if (!section) {
                return;
            }
            // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data } = event;
            if (data.open) {
                this._parentPane.hideAllPopovers();
                this._parentPane.activeCSSAngle = cssAngle;
            }
            section.element.classList.toggle('has-open-popover', data.open);
            this._parentPane.setEditingStyle(data.open);
        };
        const valueChanged = async (event) => {
            // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data } = event;
            valueElement.textContent = data.value;
            await this.applyStyleText(this.renderedPropertyText(), false);
            const computedPropertyValue = this._matchedStyles.computeValue(this.property.ownerStyle, this.property.value) || '';
            cssAngle.updateProperty(this.property.name, computedPropertyValue);
        };
        const unitChanged = async (event) => {
            // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data } = event;
            valueElement.textContent = data.value;
        };
        cssAngle.addEventListener('popovertoggled', popoverToggled);
        cssAngle.addEventListener('valuechanged', valueChanged);
        cssAngle.addEventListener('unitchanged', unitChanged);
        return cssAngle;
    }
    _updateState() {
        if (!this.listItemElement) {
            return;
        }
        if (this._style.isPropertyImplicit(this.name)) {
            this.listItemElement.classList.add('implicit');
        }
        else {
            this.listItemElement.classList.remove('implicit');
        }
        const hasIgnorableError = !this.property.parsedOk && StylesSidebarPane.ignoreErrorsForProperty(this.property);
        if (hasIgnorableError) {
            this.listItemElement.classList.add('has-ignorable-error');
        }
        else {
            this.listItemElement.classList.remove('has-ignorable-error');
        }
        if (this.inherited()) {
            this.listItemElement.classList.add('inherited');
        }
        else {
            this.listItemElement.classList.remove('inherited');
        }
        if (this.overloaded()) {
            this.listItemElement.classList.add('overloaded');
        }
        else {
            this.listItemElement.classList.remove('overloaded');
        }
        if (this.property.disabled) {
            this.listItemElement.classList.add('disabled');
        }
        else {
            this.listItemElement.classList.remove('disabled');
        }
    }
    node() {
        return this._parentPane.node();
    }
    parentPane() {
        return this._parentPane;
    }
    section() {
        if (!this.treeOutline) {
            return null;
        }
        // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return this.treeOutline.section;
    }
    _updatePane() {
        const section = this.section();
        if (section) {
            section.refreshUpdate(this);
        }
    }
    async _toggleDisabled(disabled) {
        const oldStyleRange = this._style.range;
        if (!oldStyleRange) {
            return;
        }
        this._parentPane.setUserOperation(true);
        const success = await this.property.setDisabled(disabled);
        this._parentPane.setUserOperation(false);
        if (!success) {
            return;
        }
        this._matchedStyles.resetActiveProperties();
        this._updatePane();
        this.styleTextAppliedForTest();
    }
    async onpopulate() {
        // Only populate once and if this property is a shorthand.
        if (this.childCount() || !this.isShorthand) {
            return;
        }
        const longhandProperties = this._style.longhandProperties(this.name);
        const leadingProperties = this._style.leadingProperties();
        for (let i = 0; i < longhandProperties.length; ++i) {
            const name = longhandProperties[i].name;
            let inherited = false;
            let overloaded = false;
            const section = this.section();
            if (section) {
                inherited = section.isPropertyInherited(name);
                overloaded =
                    this._matchedStyles.propertyState(longhandProperties[i]) === SDK.CSSMatchedStyles.PropertyState.Overloaded;
            }
            const leadingProperty = leadingProperties.find(property => property.name === name && property.activeInStyle());
            if (leadingProperty) {
                overloaded = true;
            }
            const item = new StylePropertyTreeElement(this._parentPane, this._matchedStyles, longhandProperties[i], false, inherited, overloaded, false);
            this.appendChild(item);
        }
    }
    onattach() {
        this.updateTitle();
        this.listItemElement.addEventListener('mousedown', event => {
            if (event.button === 0) {
                parentMap.set(this._parentPane, this);
            }
        }, false);
        this.listItemElement.addEventListener('mouseup', this._mouseUp.bind(this));
        this.listItemElement.addEventListener('click', event => {
            if (!event.target) {
                return;
            }
            const node = event.target;
            if (!node.hasSelection() && event.target !== this.listItemElement) {
                event.consume(true);
            }
        });
        // Copy context menu.
        this.listItemElement.addEventListener('contextmenu', this._handleCopyContextMenuEvent.bind(this));
    }
    onexpand() {
        this._updateExpandElement();
    }
    oncollapse() {
        this._updateExpandElement();
    }
    _updateExpandElement() {
        if (!this._expandElement) {
            return;
        }
        if (this.expanded) {
            this._expandElement.setIconType('smallicon-triangle-down');
        }
        else {
            this._expandElement.setIconType('smallicon-triangle-right');
        }
    }
    updateTitleIfComputedValueChanged() {
        const computedValue = this._matchedStyles.computeValue(this.property.ownerStyle, this.property.value);
        if (computedValue === this._lastComputedValue) {
            return;
        }
        this._lastComputedValue = computedValue;
        this._innerUpdateTitle();
    }
    updateTitle() {
        this._lastComputedValue = this._matchedStyles.computeValue(this.property.ownerStyle, this.property.value);
        this._innerUpdateTitle();
    }
    _innerUpdateTitle() {
        this._updateState();
        if (this.isExpandable()) {
            this._expandElement = UI.Icon.Icon.create('smallicon-triangle-right', 'expand-icon');
        }
        else {
            this._expandElement = null;
        }
        const propertyRenderer = new StylesSidebarPropertyRenderer(this._style.parentRule, this.node(), this.name, this.value);
        if (this.property.parsedOk) {
            propertyRenderer.setVarHandler(this._processVar.bind(this));
            propertyRenderer.setColorHandler(this._processColor.bind(this));
            propertyRenderer.setBezierHandler(this._processBezier.bind(this));
            propertyRenderer.setFontHandler(this._processFont.bind(this));
            propertyRenderer.setShadowHandler(this._processShadow.bind(this));
            propertyRenderer.setGridHandler(this._processGrid.bind(this));
            propertyRenderer.setAngleHandler(this._processAngle.bind(this));
        }
        this.listItemElement.removeChildren();
        this.nameElement = propertyRenderer.renderName();
        if (this.property.name.startsWith('--') && this.nameElement) {
            UI.Tooltip.Tooltip.install(this.nameElement, this._matchedStyles.computeCSSVariable(this._style, this.property.name) || '');
        }
        this.valueElement = propertyRenderer.renderValue();
        if (!this.treeOutline) {
            return;
        }
        const indent = Common.Settings.Settings.instance().moduleSetting('textEditorIndent').get();
        UI.UIUtils.createTextChild(this.listItemElement.createChild('span', 'styles-clipboard-only'), indent + (this.property.disabled ? '/* ' : ''));
        if (this.nameElement) {
            this.listItemElement.appendChild(this.nameElement);
        }
        if (this.valueElement) {
            const lineBreakValue = this.valueElement.firstElementChild && this.valueElement.firstElementChild.tagName === 'BR';
            const separator = lineBreakValue ? ':' : ': ';
            this.listItemElement.createChild('span', 'styles-name-value-separator').textContent = separator;
            if (this._expandElement) {
                this.listItemElement.appendChild(this._expandElement);
            }
            this.listItemElement.appendChild(this.valueElement);
            UI.UIUtils.createTextChild(this.listItemElement, ';');
            if (this.property.disabled) {
                UI.UIUtils.createTextChild(this.listItemElement.createChild('span', 'styles-clipboard-only'), ' */');
            }
        }
        const section = this.section();
        if (this.valueElement && section && section.editable && this.property.name === 'display') {
            const propertyValue = this.property.trimmedValueWithoutImportant();
            if (propertyValue === 'flex' || propertyValue === 'inline-flex') {
                this.listItemElement.appendChild(StyleEditorWidget.createTriggerButton(this._parentPane, section, FlexboxEditor, i18nString(UIStrings.flexboxEditorButton)));
            }
            if (propertyValue === 'grid' || propertyValue === 'inline-grid') {
                this.listItemElement.appendChild(StyleEditorWidget.createTriggerButton(this._parentPane, section, GridEditor, i18nString(UIStrings.gridEditorButton)));
            }
        }
        if (!this.property.parsedOk) {
            // Avoid having longhands under an invalid shorthand.
            this.listItemElement.classList.add('not-parsed-ok');
            // Add a separate exclamation mark IMG element with a tooltip.
            this.listItemElement.insertBefore(StylesSidebarPane.createExclamationMark(this.property, null), this.listItemElement.firstChild);
        }
        else {
            this._updateFontVariationSettingsWarning();
        }
        if (!this.property.activeInStyle()) {
            this.listItemElement.classList.add('inactive');
        }
        this.updateFilter();
        if (this.property.parsedOk && this.section() && this.parent && this.parent.root) {
            const enabledCheckboxElement = document.createElement('input');
            enabledCheckboxElement.className = 'enabled-button';
            enabledCheckboxElement.type = 'checkbox';
            enabledCheckboxElement.checked = !this.property.disabled;
            enabledCheckboxElement.addEventListener('mousedown', event => event.consume(), false);
            enabledCheckboxElement.addEventListener('click', event => {
                this._toggleDisabled(!this.property.disabled);
                event.consume();
            }, false);
            if (this.nameElement && this.valueElement) {
                UI.ARIAUtils.setAccessibleName(enabledCheckboxElement, `${this.nameElement.textContent} ${this.valueElement.textContent}`);
            }
            this.listItemElement.insertBefore(enabledCheckboxElement, this.listItemElement.firstChild);
        }
    }
    async _updateFontVariationSettingsWarning() {
        if (this.property.name !== 'font-variation-settings') {
            return;
        }
        const value = this.property.value;
        const cssModel = this._parentPane.cssModel();
        if (!cssModel) {
            return;
        }
        const computedStyleModel = this._parentPane.computedStyleModel();
        const styles = await computedStyleModel.fetchComputedStyle();
        if (!styles) {
            return;
        }
        const fontFamily = styles.computedStyle.get('font-family');
        if (!fontFamily) {
            return;
        }
        const fontFamilies = new Set(SDK.CSSPropertyParser.parseFontFamily(fontFamily));
        const matchingFontFaces = cssModel.fontFaces().filter(f => fontFamilies.has(f.getFontFamily()));
        const variationSettings = SDK.CSSPropertyParser.parseFontVariationSettings(value);
        const warnings = [];
        for (const elementSetting of variationSettings) {
            for (const font of matchingFontFaces) {
                const fontSetting = font.getVariationAxisByTag(elementSetting.tag);
                if (!fontSetting) {
                    continue;
                }
                if (elementSetting.value < fontSetting.minValue || elementSetting.value > fontSetting.maxValue) {
                    warnings.push(i18nString(UIStrings.valueForSettingSSIsOutsideThe, {
                        PH1: elementSetting.tag,
                        PH2: elementSetting.value,
                        PH3: fontSetting.minValue,
                        PH4: fontSetting.maxValue,
                        PH5: font.getFontFamily(),
                    }));
                }
            }
        }
        if (!warnings.length) {
            return;
        }
        this.listItemElement.classList.add('has-warning');
        this.listItemElement.insertBefore(StylesSidebarPane.createExclamationMark(this.property, warnings.join(' ')), this.listItemElement.firstChild);
    }
    _mouseUp(event) {
        const activeTreeElement = parentMap.get(this._parentPane);
        parentMap.delete(this._parentPane);
        if (!activeTreeElement) {
            return;
        }
        if (this.listItemElement.hasSelection()) {
            return;
        }
        if (UI.UIUtils.isBeingEdited(event.target)) {
            return;
        }
        event.consume(true);
        if (event.target === this.listItemElement) {
            return;
        }
        const section = this.section();
        if (UI.KeyboardShortcut.KeyboardShortcut.eventHasCtrlOrMeta(event) && section &&
            section.navigable) {
            this._navigateToSource(event.target);
            return;
        }
        this.startEditing(event.target);
    }
    _handleContextMenuEvent(context, event) {
        const contextMenu = new UI.ContextMenu.ContextMenu(event);
        if (this.property.parsedOk && this.section() && this.parent && this.parent.root) {
            contextMenu.defaultSection().appendCheckboxItem(i18nString(UIStrings.togglePropertyAndContinueEditing), async () => {
                const sectionIndex = this._parentPane.focusedSectionIndex();
                if (this.treeOutline) {
                    const propertyIndex = this.treeOutline.rootElement().indexOfChild(this);
                    // order matters here: this.editingCancelled may invalidate this.treeOutline.
                    this.editingCancelled(null, context);
                    await this._toggleDisabled(!this.property.disabled);
                    event.consume();
                    this._parentPane.continueEditingElement(sectionIndex, propertyIndex);
                }
            }, !this.property.disabled);
        }
        const revealCallback = this._navigateToSource.bind(this);
        contextMenu.defaultSection().appendItem(i18nString(UIStrings.revealInSourcesPanel), revealCallback);
        contextMenu.show();
    }
    _handleCopyContextMenuEvent(event) {
        const target = event.target;
        if (!target) {
            return;
        }
        const contextMenu = new UI.ContextMenu.ContextMenu(event);
        contextMenu.clipboardSection().appendItem(i18nString(UIStrings.copyDeclaration), () => {
            const propertyText = `${this.property.name}: ${this.property.value};`;
            Host.InspectorFrontendHost.InspectorFrontendHostInstance.copyText(propertyText);
        });
        contextMenu.clipboardSection().appendItem(i18nString(UIStrings.copyProperty), () => {
            Host.InspectorFrontendHost.InspectorFrontendHostInstance.copyText(this.property.name);
        });
        contextMenu.clipboardSection().appendItem(i18nString(UIStrings.copyValue), () => {
            Host.InspectorFrontendHost.InspectorFrontendHostInstance.copyText(this.property.value);
        });
        contextMenu.defaultSection().appendItem(i18nString(UIStrings.copyRule), () => {
            const section = this.section();
            const ruleText = StylesSidebarPane.formatLeadingProperties(section).ruleText;
            Host.InspectorFrontendHost.InspectorFrontendHostInstance.copyText(ruleText);
        });
        contextMenu.defaultSection().appendItem(i18nString(UIStrings.copyAllDeclarations), () => {
            const section = this.section();
            const allDeclarationText = StylesSidebarPane.formatLeadingProperties(section).allDeclarationText;
            Host.InspectorFrontendHost.InspectorFrontendHostInstance.copyText(allDeclarationText);
        });
        contextMenu.defaultSection().appendItem(i18nString(UIStrings.viewComputedValue), () => {
            this._viewComputedValue();
        });
        contextMenu.show();
    }
    async _viewComputedValue() {
        const computedStyleWidget = ElementsPanel.instance().getComputedStyleWidget();
        if (!computedStyleWidget.isShowing()) {
            await UI.ViewManager.ViewManager.instance().showView('Computed');
        }
        let propertyNamePattern = '';
        if (this.isShorthand) {
            propertyNamePattern = '^' + this.property.name + '-';
        }
        else {
            propertyNamePattern = '^' + this.property.name + '$';
        }
        const regex = new RegExp(propertyNamePattern, 'i');
        computedStyleWidget.filterComputedStyles(regex);
        const filterInput = computedStyleWidget.input;
        filterInput.value = this.property.name;
        filterInput.focus();
    }
    _navigateToSource(element, omitFocus) {
        const section = this.section();
        if (!section || !section.navigable) {
            return;
        }
        const propertyNameClicked = element === this.nameElement;
        const uiLocation = Bindings.CSSWorkspaceBinding.CSSWorkspaceBinding.instance().propertyUILocation(this.property, propertyNameClicked);
        if (uiLocation) {
            Common.Revealer.reveal(uiLocation, omitFocus);
        }
    }
    startEditing(selectElement) {
        // FIXME: we don't allow editing of longhand properties under a shorthand right now.
        if (this.parent instanceof StylePropertyTreeElement && this.parent.isShorthand) {
            return;
        }
        if (this._expandElement && selectElement === this._expandElement) {
            return;
        }
        const section = this.section();
        if (section && !section.editable) {
            return;
        }
        if (selectElement) {
            selectElement = selectElement.enclosingNodeOrSelfWithClass('webkit-css-property') ||
                selectElement.enclosingNodeOrSelfWithClass('value');
        }
        if (!selectElement) {
            selectElement = this.nameElement;
        }
        if (UI.UIUtils.isBeingEdited(selectElement)) {
            return;
        }
        const isEditingName = selectElement === this.nameElement;
        if (!isEditingName && this.valueElement) {
            if (SDK.CSSMetadata.cssMetadata().isGridAreaDefiningProperty(this.name)) {
                this.valueElement.textContent = restoreGridIndents(this.value);
            }
            this.valueElement.textContent = restoreURLs(this.valueElement.textContent || '', this.value);
        }
        function restoreGridIndents(value) {
            const splitResult = TextUtils.TextUtils.Utils.splitStringByRegexes(value, [SDK.CSSMetadata.GridAreaRowRegex]);
            return splitResult.map(result => result.value.trim()).join('\n');
        }
        function restoreURLs(fieldValue, modelValue) {
            const splitFieldValue = fieldValue.split(SDK.CSSMetadata.URLRegex);
            if (splitFieldValue.length === 1) {
                return fieldValue;
            }
            const modelUrlRegex = new RegExp(SDK.CSSMetadata.URLRegex);
            for (let i = 1; i < splitFieldValue.length; i += 2) {
                const match = modelUrlRegex.exec(modelValue);
                if (match) {
                    splitFieldValue[i] = match[0];
                }
            }
            return splitFieldValue.join('');
        }
        const previousContent = selectElement ? (selectElement.textContent || '') : '';
        const context = {
            expanded: this.expanded,
            hasChildren: this.isExpandable(),
            isEditingName: isEditingName,
            originalProperty: this.property,
            previousContent: previousContent,
            originalName: undefined,
            originalValue: undefined,
        };
        this._contextForTest = context;
        // Lie about our children to prevent expanding on double click and to collapse shorthands.
        this.setExpandable(false);
        if (selectElement) {
            if (selectElement.parentElement) {
                selectElement.parentElement.classList.add('child-editing');
            }
            selectElement.textContent = selectElement.textContent; // remove color swatch and the like
        }
        function pasteHandler(context, event) {
            const clipboardEvent = event;
            const clipboardData = clipboardEvent.clipboardData;
            if (!clipboardData) {
                return;
            }
            const data = clipboardData.getData('Text');
            if (!data) {
                return;
            }
            const colonIdx = data.indexOf(':');
            if (colonIdx < 0) {
                return;
            }
            const name = data.substring(0, colonIdx).trim();
            const value = data.substring(colonIdx + 1).trim();
            event.preventDefault();
            if (typeof context.originalName === 'undefined') {
                if (this.nameElement) {
                    context.originalName = this.nameElement.textContent || '';
                }
                if (this.valueElement) {
                    context.originalValue = this.valueElement.textContent || '';
                }
            }
            this.property.name = name;
            this.property.value = value;
            if (this.nameElement) {
                this.nameElement.textContent = name;
                this.nameElement.normalize();
            }
            if (this.valueElement) {
                this.valueElement.textContent = value;
                this.valueElement.normalize();
            }
            const target = event.target;
            this._editingCommitted(target.textContent || '', context, 'forward');
        }
        function blurListener(context, event) {
            const target = event.target;
            let text = target.textContent;
            if (!context.isEditingName) {
                text = this.value || text;
            }
            this._editingCommitted(text || '', context, '');
        }
        this._originalPropertyText = this.property.propertyText || '';
        this._parentPane.setEditingStyle(true, this);
        if (selectElement && selectElement.parentElement) {
            selectElement.parentElement.scrollIntoViewIfNeeded(false);
        }
        this._prompt = new CSSPropertyPrompt(this, isEditingName);
        this._prompt.setAutocompletionTimeout(0);
        this._prompt.addEventListener(UI.TextPrompt.Events.TextChanged, _event => {
            this._applyFreeFlowStyleTextEdit(context);
        });
        const invalidString = this.property.getInvalidStringForInvalidProperty();
        if (invalidString && selectElement) {
            UI.ARIAUtils.alert(invalidString);
        }
        if (selectElement) {
            const proxyElement = this._prompt.attachAndStartEditing(selectElement, blurListener.bind(this, context));
            this._navigateToSource(selectElement, true);
            proxyElement.addEventListener('keydown', this._editingNameValueKeyDown.bind(this, context), false);
            proxyElement.addEventListener('keypress', this._editingNameValueKeyPress.bind(this, context), false);
            if (isEditingName) {
                proxyElement.addEventListener('paste', pasteHandler.bind(this, context), false);
                proxyElement.addEventListener('contextmenu', this._handleContextMenuEvent.bind(this, context), false);
            }
            const componentSelection = selectElement.getComponentSelection();
            if (componentSelection) {
                componentSelection.selectAllChildren(selectElement);
            }
        }
    }
    _editingNameValueKeyDown(context, event) {
        if (event.handled) {
            return;
        }
        const keyboardEvent = event;
        const target = keyboardEvent.target;
        let result;
        if (keyboardEvent.key === 'Enter' && !keyboardEvent.shiftKey) {
            result = 'forward';
        }
        else if (keyboardEvent.keyCode === UI.KeyboardShortcut.Keys.Esc.code || keyboardEvent.key === 'Escape') {
            result = 'cancel';
        }
        else if (!context.isEditingName && this._newProperty &&
            keyboardEvent.keyCode === UI.KeyboardShortcut.Keys.Backspace.code) {
            // For a new property, when Backspace is pressed at the beginning of new property value, move back to the property name.
            const selection = target.getComponentSelection();
            if (selection && selection.isCollapsed && !selection.focusOffset) {
                event.preventDefault();
                result = 'backward';
            }
        }
        else if (keyboardEvent.key === 'Tab') {
            result = keyboardEvent.shiftKey ? 'backward' : 'forward';
            event.preventDefault();
        }
        if (result) {
            switch (result) {
                case 'cancel':
                    this.editingCancelled(null, context);
                    break;
                case 'forward':
                case 'backward':
                    this._editingCommitted(target.textContent || '', context, result);
                    break;
            }
            event.consume();
            return;
        }
    }
    _editingNameValueKeyPress(context, event) {
        function shouldCommitValueSemicolon(text, cursorPosition) {
            // FIXME: should this account for semicolons inside comments?
            let openQuote = '';
            for (let i = 0; i < cursorPosition; ++i) {
                const ch = text[i];
                if (ch === '\\' && openQuote !== '') {
                    ++i;
                } // skip next character inside string
                else if (!openQuote && (ch === '"' || ch === '\'')) {
                    openQuote = ch;
                }
                else if (openQuote === ch) {
                    openQuote = '';
                }
            }
            return !openQuote;
        }
        const keyboardEvent = event;
        const target = keyboardEvent.target;
        const keyChar = String.fromCharCode(keyboardEvent.charCode);
        const selectionLeftOffset = target.selectionLeftOffset();
        const isFieldInputTerminated = (context.isEditingName ? keyChar === ':' :
            keyChar === ';' && selectionLeftOffset !== null &&
                shouldCommitValueSemicolon(target.textContent || '', selectionLeftOffset));
        if (isFieldInputTerminated) {
            // Enter or colon (for name)/semicolon outside of string (for value).
            event.consume(true);
            this._editingCommitted(target.textContent || '', context, 'forward');
            return;
        }
    }
    async _applyFreeFlowStyleTextEdit(context) {
        if (!this._prompt || !this._parentPane.node()) {
            return;
        }
        const enteredText = this._prompt.text();
        if (context.isEditingName && enteredText.includes(':')) {
            this._editingCommitted(enteredText, context, 'forward');
            return;
        }
        const valueText = this._prompt.textWithCurrentSuggestion();
        if (valueText.includes(';')) {
            return;
        }
        // Prevent destructive side-effects during live-edit. crbug.com/433889
        const parentNode = this._parentPane.node();
        if (parentNode) {
            const isPseudo = Boolean(parentNode.pseudoType());
            if (isPseudo) {
                if (this.name.toLowerCase() === 'content') {
                    return;
                }
                const lowerValueText = valueText.trim().toLowerCase();
                if (lowerValueText.startsWith('content:') || lowerValueText === 'display: none') {
                    return;
                }
            }
        }
        if (context.isEditingName) {
            if (valueText.includes(':')) {
                await this.applyStyleText(valueText, false);
            }
            else if (this._hasBeenEditedIncrementally) {
                await this._applyOriginalStyle(context);
            }
        }
        else {
            if (this.nameElement) {
                await this.applyStyleText(`${this.nameElement.textContent}: ${valueText}`, false);
            }
        }
    }
    kickFreeFlowStyleEditForTest() {
        const context = this._contextForTest;
        return this._applyFreeFlowStyleTextEdit(context);
    }
    editingEnded(context) {
        this.setExpandable(context.hasChildren);
        if (context.expanded) {
            this.expand();
        }
        const editedElement = context.isEditingName ? this.nameElement : this.valueElement;
        // The proxyElement has been deleted, no need to remove listener.
        if (editedElement && editedElement.parentElement) {
            editedElement.parentElement.classList.remove('child-editing');
        }
        this._parentPane.setEditingStyle(false);
    }
    editingCancelled(element, context) {
        this._removePrompt();
        if (this._hasBeenEditedIncrementally) {
            this._applyOriginalStyle(context);
        }
        else if (this._newProperty && this.treeOutline) {
            this.treeOutline.removeChild(this);
        }
        this.updateTitle();
        // This should happen last, as it clears the info necessary to restore the property value after [Page]Up/Down changes.
        this.editingEnded(context);
    }
    async _applyOriginalStyle(context) {
        await this.applyStyleText(this._originalPropertyText, false, context.originalProperty);
    }
    _findSibling(moveDirection) {
        let target = this;
        do {
            const sibling = moveDirection === 'forward' ? target.nextSibling : target.previousSibling;
            target = sibling instanceof StylePropertyTreeElement ? sibling : null;
        } while (target && target.inherited());
        return target;
    }
    async _editingCommitted(userInput, context, moveDirection) {
        this._removePrompt();
        this.editingEnded(context);
        const isEditingName = context.isEditingName;
        // If the underlying property has been ripped out, always assume that the value having been entered was
        // a name-value pair and attempt to process it via the SDK.
        if (!this.nameElement || !this.valueElement) {
            return;
        }
        const nameElementValue = this.nameElement.textContent || '';
        const nameValueEntered = (isEditingName && nameElementValue.includes(':')) || !this.property;
        // Determine where to move to before making changes
        let createNewProperty = false;
        let moveToSelector = false;
        const isDataPasted = typeof context.originalName !== 'undefined';
        const isDirtyViaPaste = isDataPasted &&
            (this.nameElement.textContent !== context.originalName ||
                this.valueElement.textContent !== context.originalValue);
        const isPropertySplitPaste = isDataPasted && isEditingName && this.valueElement.textContent !== context.originalValue;
        let moveTo = this;
        const moveToOther = (isEditingName !== (moveDirection === 'forward'));
        const abandonNewProperty = this._newProperty && !userInput && (moveToOther || isEditingName);
        if (moveDirection === 'forward' && (!isEditingName || isPropertySplitPaste) ||
            moveDirection === 'backward' && isEditingName) {
            moveTo = moveTo._findSibling(moveDirection);
            if (!moveTo) {
                if (moveDirection === 'forward' && (!this._newProperty || userInput)) {
                    createNewProperty = true;
                }
                else if (moveDirection === 'backward') {
                    moveToSelector = true;
                }
            }
        }
        // Make the Changes and trigger the moveToNextCallback after updating.
        let moveToIndex = -1;
        if (moveTo !== null && this.treeOutline) {
            moveToIndex = this.treeOutline.rootElement().indexOfChild(moveTo);
        }
        const blankInput = Platform.StringUtilities.isWhitespace(userInput);
        const shouldCommitNewProperty = this._newProperty &&
            (isPropertySplitPaste || moveToOther || (!moveDirection && !isEditingName) || (isEditingName && blankInput) ||
                nameValueEntered);
        const section = this.section();
        if (((userInput !== context.previousContent || isDirtyViaPaste) && !this._newProperty) || shouldCommitNewProperty) {
            let propertyText;
            if (nameValueEntered) {
                propertyText = this.nameElement.textContent;
            }
            else if (blankInput ||
                (this._newProperty && Platform.StringUtilities.isWhitespace(this.valueElement.textContent || ''))) {
                propertyText = '';
            }
            else {
                if (isEditingName) {
                    propertyText = userInput + ': ' + this.property.value;
                }
                else {
                    propertyText = this.property.name + ': ' + userInput;
                }
            }
            await this.applyStyleText(propertyText || '', true);
            moveToNextCallback.call(this, this._newProperty, !blankInput, section);
        }
        else {
            if (isEditingName) {
                this.property.name = userInput;
            }
            else {
                this.property.value = userInput;
            }
            if (!isDataPasted && !this._newProperty) {
                this.updateTitle();
            }
            moveToNextCallback.call(this, this._newProperty, false, section);
        }
        /**
         * The Callback to start editing the next/previous property/selector.
         */
        function moveToNextCallback(alreadyNew, valueChanged, section) {
            if (!moveDirection) {
                this._parentPane.resetFocus();
                return;
            }
            // User just tabbed through without changes.
            if (moveTo && moveTo.parent) {
                moveTo.startEditing(!isEditingName ? moveTo.nameElement : moveTo.valueElement);
                return;
            }
            // User has made a change then tabbed, wiping all the original treeElements.
            // Recalculate the new treeElement for the same property we were going to edit next.
            if (moveTo && !moveTo.parent) {
                const rootElement = section.propertiesTreeOutline.rootElement();
                if (moveDirection === 'forward' && blankInput && !isEditingName) {
                    --moveToIndex;
                }
                if (moveToIndex >= rootElement.childCount() && !this._newProperty) {
                    createNewProperty = true;
                }
                else {
                    const treeElement = (moveToIndex >= 0 ? rootElement.childAt(moveToIndex) : null);
                    if (treeElement) {
                        let elementToEdit = !isEditingName || isPropertySplitPaste ? treeElement.nameElement : treeElement.valueElement;
                        if (alreadyNew && blankInput) {
                            elementToEdit = moveDirection === 'forward' ? treeElement.nameElement : treeElement.valueElement;
                        }
                        treeElement.startEditing(elementToEdit);
                        return;
                    }
                    if (!alreadyNew) {
                        moveToSelector = true;
                    }
                }
            }
            // Create a new attribute in this section (or move to next editable selector if possible).
            if (createNewProperty) {
                if (alreadyNew && !valueChanged && (isEditingName !== (moveDirection === 'backward'))) {
                    return;
                }
                section.addNewBlankProperty().startEditing();
                return;
            }
            if (abandonNewProperty) {
                moveTo = this._findSibling(moveDirection);
                const sectionToEdit = (moveTo || moveDirection === 'backward') ? section : section.nextEditableSibling();
                if (sectionToEdit) {
                    if (sectionToEdit.style().parentRule) {
                        sectionToEdit.startEditingSelector();
                    }
                    else {
                        sectionToEdit.moveEditorFromSelector(moveDirection);
                    }
                }
                return;
            }
            if (moveToSelector) {
                if (section.style().parentRule) {
                    section.startEditingSelector();
                }
                else {
                    section.moveEditorFromSelector(moveDirection);
                }
            }
        }
    }
    _removePrompt() {
        // BUG 53242. This cannot go into editingEnded(), as it should always happen first for any editing outcome.
        if (this._prompt) {
            this._prompt.detach();
            this._prompt = null;
        }
    }
    styleTextAppliedForTest() {
    }
    applyStyleText(styleText, majorChange, property) {
        return this._applyStyleThrottler.schedule(this._innerApplyStyleText.bind(this, styleText, majorChange, property));
    }
    async _innerApplyStyleText(styleText, majorChange, property) {
        // this.property might have been nulled at the end of the last _innerApplyStyleText
        if (!this.treeOutline || !this.property) {
            return;
        }
        const oldStyleRange = this._style.range;
        if (!oldStyleRange) {
            return;
        }
        const hasBeenEditedIncrementally = this._hasBeenEditedIncrementally;
        styleText = styleText.replace(/[\xA0\t]/g, ' ').trim(); // Replace &nbsp; with whitespace.
        if (!styleText.length && majorChange && this._newProperty && !hasBeenEditedIncrementally) {
            // The user deleted everything and never applied a new property value via Up/Down scrolling/live editing, so remove the tree element and update.
            this.parent && this.parent.removeChild(this);
            return;
        }
        const currentNode = this._parentPane.node();
        this._parentPane.setUserOperation(true);
        // Append a ";" if the new text does not end in ";".
        // FIXME: this does not handle trailing comments.
        if (styleText.length && !/;\s*$/.test(styleText)) {
            styleText += ';';
        }
        const overwriteProperty = !this._newProperty || hasBeenEditedIncrementally;
        let success = await this.property.setText(styleText, majorChange, overwriteProperty);
        // Revert to the original text if applying the new text failed
        if (hasBeenEditedIncrementally && majorChange && !success) {
            majorChange = false;
            success = await this.property.setText(this._originalPropertyText, majorChange, overwriteProperty);
        }
        this._parentPane.setUserOperation(false);
        // TODO: using this.property.index to access its containing StyleDeclaration's property will result in
        // off-by-1 errors when the containing StyleDeclaration's respective property has already been deleted.
        // These referencing logic needs to be updated to be more robust.
        const updatedProperty = property || this._style.propertyAt(this.property.index);
        const isPropertyWithinBounds = this.property.index < this._style.allProperties().length;
        if (!success || (!updatedProperty && isPropertyWithinBounds)) {
            if (majorChange) {
                // It did not apply, cancel editing.
                if (this._newProperty) {
                    this.treeOutline.removeChild(this);
                }
                else {
                    this.updateTitle();
                }
            }
            this.styleTextAppliedForTest();
            return;
        }
        this._matchedStyles.resetActiveProperties();
        this._hasBeenEditedIncrementally = true;
        // null check for updatedProperty before setting this.property as the code never expects this.property to be undefined or null.
        // This occurs when deleting the last index of a StylePropertiesSection as this._style._allProperties array gets updated
        // before we index it when setting the value for updatedProperty
        const deleteProperty = majorChange && !styleText.length;
        const section = this.section();
        if (deleteProperty && section) {
            section.resetToolbars();
        }
        else if (!deleteProperty && updatedProperty) {
            this.property = updatedProperty;
        }
        if (currentNode === this.node()) {
            this._updatePane();
        }
        this.styleTextAppliedForTest();
    }
    ondblclick() {
        return true; // handled
    }
    isEventWithinDisclosureTriangle(event) {
        return event.target === this._expandElement;
    }
}
//# sourceMappingURL=StylePropertyTreeElement.js.map