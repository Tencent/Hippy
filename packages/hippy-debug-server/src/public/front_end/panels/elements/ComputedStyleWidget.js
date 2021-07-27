// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/*
 * Copyright (C) 2007 Apple Inc.  All rights reserved.
 * Copyright (C) 2009 Joseph Pecoraro
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
import * as Common from '../../core/common/common.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as Platform from '../../core/platform/platform.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as InlineEditor from '../../ui/legacy/components/inline_editor/inline_editor.js';
import * as Components from '../../ui/legacy/components/utils/utils.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as ElementsComponents from './components/components.js';
import { ComputedStyleModel } from './ComputedStyleModel.js'; // eslint-disable-line no-unused-vars
import { ImagePreviewPopover } from './ImagePreviewPopover.js';
import { PlatformFontsWidget } from './PlatformFontsWidget.js';
import { categorizePropertyName, DefaultCategoryOrder } from './PropertyNameCategories.js'; // eslint-disable-line no-unused-vars
import { IdleCallbackManager, StylePropertiesSection, StylesSidebarPane, StylesSidebarPropertyRenderer } from './StylesSidebarPane.js';
const UIStrings = {
    /**
    * @description Placeholder text for a text input used to filter which CSS properties show up in
    * the list of computed properties. In the Computed Style Widget of the Elements panel.
    */
    filter: 'Filter',
    /**
    * @description ARIA accessible name for the text input used to filter which CSS properties show up
    * in the list of computed properties. In the Computed Style Widget of the Elements panel.
    */
    filterComputedStyles: 'Filter Computed Styles',
    /**
    * @description Text for a checkbox setting that controls whether the user-supplied filter text
    * excludes all CSS propreties which are filtered out, or just greys them out. In Computed Style
    * Widget of the Elements panel
    */
    showAll: 'Show all',
    /**
    * @description Text for a checkbox setting that controls whether similar CSS properties should be
    * grouped together or not. In Computed Style Widget of the Elements panel.
    */
    group: 'Group',
    /**
    * @description Text shown to the user when a filter is applied to the computed CSS properties, but
    * no properties matched the filter and thus no results were returned.
    */
    noMatchingProperty: 'No matching property',
    /**
    * @description Context menu item in Elements panel to navigate to the source code location of the
    * CSS selector that was clicked on.
    */
    navigateToSelectorSource: 'Navigate to selector source',
    /**
    * @description Context menu item in Elements panel to navigate to the corresponding CSS style rule
    * for this computed property.
    */
    navigateToStyle: 'Navigate to style',
};
const str_ = i18n.i18n.registerUIStrings('panels/elements/ComputedStyleWidget.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
const createPropertyElement = (node, propertyName, propertyValue) => {
    const propertyElement = new ElementsComponents.ComputedStyleProperty.ComputedStyleProperty();
    const renderer = new StylesSidebarPropertyRenderer(null, node, propertyName, propertyValue);
    renderer.setColorHandler(processComputedColor);
    const propertyNameElement = renderer.renderName();
    propertyNameElement.slot = 'property-name';
    propertyElement.appendChild(propertyNameElement);
    const propertyValueElement = renderer.renderValue();
    propertyValueElement.slot = 'property-value';
    propertyElement.appendChild(propertyValueElement);
    return propertyElement;
};
const createTraceElement = (node, property, isPropertyOverloaded, matchedStyles, linkifier) => {
    const trace = new ElementsComponents.ComputedStyleTrace.ComputedStyleTrace();
    const renderer = new StylesSidebarPropertyRenderer(null, node, property.name, property.value);
    renderer.setColorHandler(processColor);
    const valueElement = renderer.renderValue();
    valueElement.slot = 'trace-value';
    trace.appendChild(valueElement);
    const rule = property.ownerStyle.parentRule;
    if (rule) {
        const linkSpan = document.createElement('span');
        linkSpan.appendChild(StylePropertiesSection.createRuleOriginNode(matchedStyles, linkifier, rule));
        linkSpan.slot = 'trace-link';
        trace.appendChild(linkSpan);
    }
    trace.data = {
        selector: rule ? rule.selectorText() : 'element.style',
        active: !isPropertyOverloaded,
        onNavigateToSource: navigateToSource.bind(null, property),
    };
    return trace;
};
const processColor = (text) => {
    const swatch = new InlineEditor.ColorSwatch.ColorSwatch();
    swatch.renderColor(text, true);
    swatch.createChild('span').textContent = text;
    return swatch;
};
const processComputedColor = (text) => {
    const swatch = new InlineEditor.ColorSwatch.ColorSwatch();
    // Computed styles don't provide the original format, so switch to RGB.
    swatch.renderColor(text, Common.Color.Format.RGB);
    swatch.createChild('span').textContent = text;
    return swatch;
};
const navigateToSource = (cssProperty, event) => {
    Common.Revealer.reveal(cssProperty);
    event.consume(true);
};
const propertySorter = (propA, propB) => {
    if (propA.startsWith('--') !== propB.startsWith('--')) {
        return propA.startsWith('--') ? 1 : -1;
    }
    if (propA.startsWith('-webkit') !== propB.startsWith('-webkit')) {
        return propA.startsWith('-webkit') ? 1 : -1;
    }
    const canonicalA = SDK.CSSMetadata.cssMetadata().canonicalPropertyName(propA);
    const canonicalB = SDK.CSSMetadata.cssMetadata().canonicalPropertyName(propB);
    return Platform.StringUtilities.compare(canonicalA, canonicalB);
};
export class ComputedStyleWidget extends UI.ThrottledWidget.ThrottledWidget {
    _computedStyleModel;
    _showInheritedComputedStylePropertiesSetting;
    _groupComputedStylesSetting;
    input;
    _filterRegex;
    _noMatchesElement;
    _propertiesOutline;
    _propertyByTreeElement;
    _categoryByTreeElement;
    _expandedProperties;
    _expandedGroups;
    _linkifier;
    _imagePreviewPopover;
    _idleCallbackManager;
    constructor() {
        super(true);
        this.registerRequiredCSS('panels/elements/computedStyleSidebarPane.css', { enableLegacyPatching: false });
        this._computedStyleModel = new ComputedStyleModel();
        this._computedStyleModel.addEventListener("ComputedStyleChanged" /* ComputedStyleChanged */, this.update, this);
        this._showInheritedComputedStylePropertiesSetting =
            Common.Settings.Settings.instance().createSetting('showInheritedComputedStyleProperties', false);
        this._showInheritedComputedStylePropertiesSetting.addChangeListener(this.update.bind(this));
        this._groupComputedStylesSetting = Common.Settings.Settings.instance().createSetting('groupComputedStyles', false);
        this._groupComputedStylesSetting.addChangeListener(() => {
            this.update();
        });
        const hbox = this.contentElement.createChild('div', 'hbox styles-sidebar-pane-toolbar');
        const filterContainerElement = hbox.createChild('div', 'styles-sidebar-pane-filter-box');
        const filterInput = StylesSidebarPane.createPropertyFilterElement(i18nString(UIStrings.filter), hbox, this.filterComputedStyles.bind(this));
        UI.ARIAUtils.setAccessibleName(filterInput, i18nString(UIStrings.filterComputedStyles));
        filterContainerElement.appendChild(filterInput);
        this.input = filterInput;
        this._filterRegex = null;
        const toolbar = new UI.Toolbar.Toolbar('styles-pane-toolbar', hbox);
        toolbar.appendToolbarItem(new UI.Toolbar.ToolbarSettingCheckbox(this._showInheritedComputedStylePropertiesSetting, undefined, i18nString(UIStrings.showAll)));
        toolbar.appendToolbarItem(new UI.Toolbar.ToolbarSettingCheckbox(this._groupComputedStylesSetting, undefined, i18nString(UIStrings.group)));
        this._noMatchesElement = this.contentElement.createChild('div', 'gray-info-message');
        this._noMatchesElement.textContent = i18nString(UIStrings.noMatchingProperty);
        this._propertiesOutline = new UI.TreeOutline.TreeOutlineInShadow();
        this._propertiesOutline.hideOverflow();
        this._propertiesOutline.setShowSelectionOnKeyboardFocus(true);
        this._propertiesOutline.setFocusable(true);
        this._propertiesOutline.registerRequiredCSS('panels/elements/computedStyleWidgetTree.css', { enableLegacyPatching: false });
        this._propertiesOutline.element.classList.add('monospace', 'computed-properties');
        this._propertiesOutline.addEventListener(UI.TreeOutline.Events.ElementExpanded, this._onTreeElementToggled, this);
        this._propertiesOutline.addEventListener(UI.TreeOutline.Events.ElementCollapsed, this._onTreeElementToggled, this);
        this.contentElement.appendChild(this._propertiesOutline.element);
        this._propertyByTreeElement = new WeakMap();
        this._categoryByTreeElement = new WeakMap();
        this._expandedProperties = new Set();
        this._expandedGroups = new Set(DefaultCategoryOrder);
        this._linkifier = new Components.Linkifier.Linkifier(_maxLinkLength);
        this._imagePreviewPopover = new ImagePreviewPopover(this.contentElement, event => {
            const link = event.composedPath()[0];
            if (link instanceof Element) {
                return link;
            }
            return null;
        }, () => this._computedStyleModel.node());
        const fontsWidget = new PlatformFontsWidget(this._computedStyleModel);
        fontsWidget.show(this.contentElement);
        this._idleCallbackManager = new IdleCallbackManager();
    }
    onResize() {
        const isNarrow = this.contentElement.offsetWidth < 260;
        this._propertiesOutline.contentElement.classList.toggle('computed-narrow', isNarrow);
    }
    _showInheritedComputedStyleChanged() {
        this.update();
    }
    update() {
        if (this._idleCallbackManager) {
            this._idleCallbackManager.discard();
        }
        this._idleCallbackManager = new IdleCallbackManager();
        super.update();
    }
    async doUpdate() {
        const [nodeStyles, matchedStyles] = await Promise.all([this._computedStyleModel.fetchComputedStyle(), this._fetchMatchedCascade()]);
        const shouldGroupComputedStyles = this._groupComputedStylesSetting.get();
        this._propertiesOutline.contentElement.classList.toggle('grouped-list', shouldGroupComputedStyles);
        this._propertiesOutline.contentElement.classList.toggle('alphabetical-list', !shouldGroupComputedStyles);
        if (shouldGroupComputedStyles) {
            await this._rebuildGroupedList(nodeStyles, matchedStyles);
        }
        else {
            await this._rebuildAlphabeticalList(nodeStyles, matchedStyles);
        }
    }
    async _fetchMatchedCascade() {
        const node = this._computedStyleModel.node();
        if (!node || !this._computedStyleModel.cssModel()) {
            return null;
        }
        const cssModel = this._computedStyleModel.cssModel();
        if (!cssModel) {
            return null;
        }
        return cssModel.cachedMatchedCascadeForNode(node).then(validateStyles.bind(this));
        function validateStyles(matchedStyles) {
            return matchedStyles && matchedStyles.node() === this._computedStyleModel.node() ? matchedStyles : null;
        }
    }
    async _rebuildAlphabeticalList(nodeStyle, matchedStyles) {
        const hadFocus = this._propertiesOutline.element.hasFocus();
        this._imagePreviewPopover.hide();
        this._propertiesOutline.removeChildren();
        this._linkifier.reset();
        const cssModel = this._computedStyleModel.cssModel();
        if (!nodeStyle || !matchedStyles || !cssModel) {
            this._noMatchesElement.classList.remove('hidden');
            return;
        }
        const uniqueProperties = [...nodeStyle.computedStyle.keys()];
        uniqueProperties.sort(propertySorter);
        const node = nodeStyle.node;
        const propertyTraces = this._computePropertyTraces(matchedStyles);
        const nonInheritedProperties = this._computeNonInheritedProperties(matchedStyles);
        const showInherited = this._showInheritedComputedStylePropertiesSetting.get();
        const computedStyleQueue = [];
        // filter and preprocess properties to line up in the computed style queue
        for (const propertyName of uniqueProperties) {
            const propertyValue = nodeStyle.computedStyle.get(propertyName) || '';
            const canonicalName = SDK.CSSMetadata.cssMetadata().canonicalPropertyName(propertyName);
            const isInherited = !nonInheritedProperties.has(canonicalName);
            if (!showInherited && isInherited && !_alwaysShownComputedProperties.has(propertyName)) {
                continue;
            }
            if (!showInherited && propertyName.startsWith('--')) {
                continue;
            }
            if (propertyName !== canonicalName && propertyValue === nodeStyle.computedStyle.get(canonicalName)) {
                continue;
            }
            computedStyleQueue.push({ propertyName, propertyValue, isInherited });
        }
        this._propertiesOutline.contentElement.classList.add('render-flash');
        // Render computed style properties in batches via idle callbacks to avoid a
        // very long task. The batchSize and timeoutInterval should be tweaked in
        // pair. Currently, updating, laying-out, rendering, and painting 20 items
        // in every 100ms seems to be a good balance between updating too lazy vs.
        // updating too much in one cycle.
        const batchSize = 20;
        const timeoutInterval = 100;
        let timeout = 100;
        while (computedStyleQueue.length > 0) {
            const currentBatch = computedStyleQueue.splice(0, batchSize);
            this._idleCallbackManager.schedule(() => {
                for (const { propertyName, propertyValue, isInherited } of currentBatch) {
                    const treeElement = this._buildPropertyTreeElement(propertyTraces, node, matchedStyles, propertyName, propertyValue, isInherited, hadFocus);
                    this._propertiesOutline.appendChild(treeElement);
                }
                this._filterAlphabeticalList();
            }, timeout);
            timeout += timeoutInterval;
        }
        await this._idleCallbackManager.awaitDone();
        this._propertiesOutline.contentElement.classList.remove('render-flash');
    }
    async _rebuildGroupedList(nodeStyle, matchedStyles) {
        const hadFocus = this._propertiesOutline.element.hasFocus();
        this._imagePreviewPopover.hide();
        this._propertiesOutline.removeChildren();
        this._linkifier.reset();
        const cssModel = this._computedStyleModel.cssModel();
        if (!nodeStyle || !matchedStyles || !cssModel) {
            this._noMatchesElement.classList.remove('hidden');
            return;
        }
        const node = nodeStyle.node;
        const propertyTraces = this._computePropertyTraces(matchedStyles);
        const nonInheritedProperties = this._computeNonInheritedProperties(matchedStyles);
        const showInherited = this._showInheritedComputedStylePropertiesSetting.get();
        const propertiesByCategory = new Map();
        for (const [propertyName, propertyValue] of nodeStyle.computedStyle) {
            const canonicalName = SDK.CSSMetadata.cssMetadata().canonicalPropertyName(propertyName);
            const isInherited = !nonInheritedProperties.has(canonicalName);
            if (!showInherited && isInherited && !_alwaysShownComputedProperties.has(propertyName)) {
                continue;
            }
            if (!showInherited && propertyName.startsWith('--')) {
                continue;
            }
            if (propertyName !== canonicalName && propertyValue === nodeStyle.computedStyle.get(canonicalName)) {
                continue;
            }
            const categories = categorizePropertyName(propertyName);
            for (const category of categories) {
                const treeElement = this._buildPropertyTreeElement(propertyTraces, node, matchedStyles, propertyName, propertyValue, isInherited, hadFocus);
                if (!propertiesByCategory.has(category)) {
                    propertiesByCategory.set(category, []);
                }
                // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
                // @ts-expect-error
                propertiesByCategory.get(category).push(treeElement);
            }
        }
        for (const category of DefaultCategoryOrder) {
            const properties = propertiesByCategory.get(category);
            if (properties && properties.length > 0) {
                const title = document.createElement('h1');
                title.textContent = category;
                const group = new UI.TreeOutline.TreeElement(title);
                group.listItemElement.classList.add('group-title');
                group.toggleOnClick = true;
                for (const property of properties) {
                    group.appendChild(property);
                }
                this._propertiesOutline.appendChild(group);
                if (this._expandedGroups.has(category)) {
                    group.expand();
                }
                this._categoryByTreeElement.set(group, category);
            }
        }
        this._filterGroupLists();
    }
    _onTreeElementToggled(event) {
        const treeElement = event.data;
        const property = this._propertyByTreeElement.get(treeElement);
        if (property) {
            treeElement.expanded ? this._expandedProperties.add(property.name) :
                this._expandedProperties.delete(property.name);
        }
        else {
            const category = this._categoryByTreeElement.get(treeElement);
            if (category) {
                treeElement.expanded ? this._expandedGroups.add(category) : this._expandedGroups.delete(category);
            }
        }
    }
    _buildPropertyTreeElement(propertyTraces, node, matchedStyles, propertyName, propertyValue, isInherited, hadFocus) {
        const treeElement = new UI.TreeOutline.TreeElement();
        const trace = propertyTraces.get(propertyName);
        let navigate = () => { };
        if (trace) {
            const activeProperty = this._renderPropertyTrace(matchedStyles, node, treeElement, trace);
            treeElement.setExpandable(true);
            treeElement.listItemElement.addEventListener('click', event => {
                treeElement.expanded ? treeElement.collapse() : treeElement.expand();
                event.consume();
            }, false);
            navigate = navigateToSource.bind(this, activeProperty);
        }
        const propertyElement = createPropertyElement(node, propertyName, propertyValue);
        propertyElement.data = {
            traceable: propertyTraces.has(propertyName),
            inherited: isInherited,
            onNavigateToSource: navigate,
        };
        treeElement.title = propertyElement;
        this._propertyByTreeElement.set(treeElement, { name: propertyName, value: propertyValue });
        if (!this._propertiesOutline.selectedTreeElement) {
            treeElement.select(!hadFocus);
        }
        if (this._expandedProperties.has(propertyName)) {
            treeElement.expand();
        }
        return treeElement;
    }
    _renderPropertyTrace(matchedStyles, node, rootTreeElement, tracedProperties) {
        let activeProperty = null;
        for (const property of tracedProperties) {
            const isPropertyOverloaded = matchedStyles.propertyState(property) === SDK.CSSMatchedStyles.PropertyState.Overloaded;
            if (!isPropertyOverloaded) {
                activeProperty = property;
                rootTreeElement.listItemElement.addEventListener('contextmenu', this._handleContextMenuEvent.bind(this, matchedStyles, property));
            }
            const trace = createTraceElement(node, property, isPropertyOverloaded, matchedStyles, this._linkifier);
            const traceTreeElement = new UI.TreeOutline.TreeElement();
            traceTreeElement.title = trace;
            traceTreeElement.listItemElement.addEventListener('contextmenu', this._handleContextMenuEvent.bind(this, matchedStyles, property));
            rootTreeElement.appendChild(traceTreeElement);
        }
        return activeProperty;
    }
    _handleContextMenuEvent(matchedStyles, property, event) {
        const contextMenu = new UI.ContextMenu.ContextMenu(event);
        const rule = property.ownerStyle.parentRule;
        if (rule) {
            const header = rule.styleSheetId ? matchedStyles.cssModel().styleSheetHeaderForId(rule.styleSheetId) : null;
            if (header && !header.isAnonymousInlineStyleSheet()) {
                contextMenu.defaultSection().appendItem(i18nString(UIStrings.navigateToSelectorSource), () => {
                    StylePropertiesSection.tryNavigateToRuleLocation(matchedStyles, rule);
                });
            }
        }
        contextMenu.defaultSection().appendItem(i18nString(UIStrings.navigateToStyle), () => Common.Revealer.reveal(property));
        contextMenu.show();
    }
    _computePropertyTraces(matchedStyles) {
        const result = new Map();
        for (const style of matchedStyles.nodeStyles()) {
            const allProperties = style.allProperties();
            for (const property of allProperties) {
                if (!property.activeInStyle() || !matchedStyles.propertyState(property)) {
                    continue;
                }
                if (!result.has(property.name)) {
                    result.set(property.name, []);
                }
                // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
                // @ts-expect-error
                result.get(property.name).push(property);
            }
        }
        return result;
    }
    _computeNonInheritedProperties(matchedStyles) {
        const result = new Set();
        for (const style of matchedStyles.nodeStyles()) {
            for (const property of style.allProperties()) {
                if (!matchedStyles.propertyState(property)) {
                    continue;
                }
                result.add(SDK.CSSMetadata.cssMetadata().canonicalPropertyName(property.name));
            }
        }
        return result;
    }
    filterComputedStyles(regex) {
        this._filterRegex = regex;
        if (this._groupComputedStylesSetting.get()) {
            this._filterGroupLists();
        }
        else {
            this._filterAlphabeticalList();
        }
    }
    _filterAlphabeticalList() {
        const regex = this._filterRegex;
        const children = this._propertiesOutline.rootElement().children();
        let hasMatch = false;
        for (const child of children) {
            const property = this._propertyByTreeElement.get(child);
            if (!property) {
                continue;
            }
            const matched = !regex || regex.test(property.name) || regex.test(property.value);
            child.hidden = !matched;
            hasMatch = hasMatch || matched;
        }
        this._noMatchesElement.classList.toggle('hidden', Boolean(hasMatch));
    }
    _filterGroupLists() {
        const regex = this._filterRegex;
        const groups = this._propertiesOutline.rootElement().children();
        let hasOverallMatch = false;
        let foundFirstGroup = false;
        for (const group of groups) {
            let hasGroupMatch = false;
            const properties = group.children();
            for (const propertyTreeElement of properties) {
                const property = this._propertyByTreeElement.get(propertyTreeElement);
                if (!property) {
                    continue;
                }
                const matched = !regex || regex.test(property.name) || regex.test(property.value);
                propertyTreeElement.hidden = !matched;
                hasOverallMatch = hasOverallMatch || matched;
                hasGroupMatch = hasGroupMatch || matched;
            }
            group.hidden = !hasGroupMatch;
            // the first visible group won't have a divider before the group title
            group.listItemElement.classList.toggle('first-group', hasGroupMatch && !foundFirstGroup);
            foundFirstGroup = foundFirstGroup || hasGroupMatch;
        }
        this._noMatchesElement.classList.toggle('hidden', hasOverallMatch);
    }
}
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
// eslint-disable-next-line @typescript-eslint/naming-convention
const _maxLinkLength = 30;
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
// eslint-disable-next-line @typescript-eslint/naming-convention
const _alwaysShownComputedProperties = new Set(['display', 'height', 'width']);
//# sourceMappingURL=ComputedStyleWidget.js.map