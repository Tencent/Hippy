// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as IconButton from '../../ui/components/icon_button/icon_button.js';
import * as UI from '../../ui/legacy/legacy.js';
import { StylePropertyTreeElement } from './StylePropertyTreeElement.js';
let instance = null;
/**
 * Thin UI.Widget wrapper around style editors to allow using it as a popover.
 */
export class StyleEditorWidget extends UI.Widget.VBox {
    editor;
    pane;
    section;
    editorContainer;
    constructor() {
        super(true);
        this.contentElement.tabIndex = 0;
        this.setDefaultFocusedElement(this.contentElement);
        this.editorContainer = document.createElement('div');
        this.contentElement.appendChild(this.editorContainer);
        this.onPropertySelected = this.onPropertySelected.bind(this);
        this.onPropertyDeselected = this.onPropertyDeselected.bind(this);
    }
    getSection() {
        return this.section;
    }
    async onPropertySelected(event) {
        if (!this.section) {
            return;
        }
        const target = ensureTreeElementForProperty(this.section, event.data.name);
        target.property.value = event.data.value;
        target.updateTitle();
        await target.applyStyleText(target.renderedPropertyText(), false);
        await this.render();
    }
    async onPropertyDeselected(event) {
        if (!this.section) {
            return;
        }
        const target = ensureTreeElementForProperty(this.section, event.data.name);
        await target.applyStyleText('', false);
        await this.render();
    }
    bindContext(pane, section) {
        this.pane = pane;
        this.section = section;
        this.editor?.addEventListener('propertyselected', this.onPropertySelected);
        this.editor?.addEventListener('propertydeselected', this.onPropertyDeselected);
    }
    unbindContext() {
        this.pane = undefined;
        this.section = undefined;
        this.editor?.removeEventListener('propertyselected', this.onPropertySelected);
        this.editor?.removeEventListener('propertydeselected', this.onPropertyDeselected);
    }
    async render() {
        if (!this.editor) {
            return;
        }
        this.editor.data = {
            authoredProperties: this.section ? getAuthoredStyles(this.section, this.editor.getEditableProperties()) :
                new Map(),
            computedProperties: this.pane ? await fetchComputedStyles(this.pane) : new Map(),
        };
    }
    static instance() {
        if (!instance) {
            instance = new StyleEditorWidget();
        }
        return instance;
    }
    setEditor(editorClass) {
        if (!(this.editor instanceof editorClass)) {
            this.contentElement.removeChildren();
            this.editor = new editorClass();
            this.contentElement.appendChild(this.editor);
        }
    }
    static createTriggerButton(pane, section, editorClass, buttonTitle) {
        const triggerButton = createButton(buttonTitle);
        triggerButton.onclick = async (event) => {
            event.stopPropagation();
            const popoverHelper = pane.swatchPopoverHelper();
            const widget = StyleEditorWidget.instance();
            widget.setEditor(editorClass);
            widget.bindContext(pane, section);
            await widget.render();
            const scrollerElement = triggerButton.enclosingNodeOrSelfWithClass('style-panes-wrapper');
            const onScroll = () => {
                popoverHelper.hide(true);
            };
            popoverHelper.show(widget, triggerButton, () => {
                widget.unbindContext();
                if (scrollerElement) {
                    scrollerElement.removeEventListener('scroll', onScroll);
                }
            });
            if (scrollerElement) {
                scrollerElement.addEventListener('scroll', onScroll);
            }
        };
        return triggerButton;
    }
}
function createButton(buttonTitle) {
    const button = document.createElement('button');
    button.classList.add('styles-pane-button');
    button.tabIndex = 0;
    button.title = buttonTitle;
    button.onmouseup = (event) => {
        // Stop propagation to prevent the property editor from being activated.
        event.stopPropagation();
    };
    const icon = new IconButton.Icon.Icon();
    icon.data = { iconName: 'flex-wrap-icon', color: 'var(--color-text-secondary)', width: '12px', height: '12px' };
    button.appendChild(icon);
    return button;
}
function ensureTreeElementForProperty(section, propertyName) {
    const target = section.propertiesTreeOutline.rootElement().children().find(child => child instanceof StylePropertyTreeElement && child.property.name === propertyName);
    if (target) {
        return target;
    }
    const newTarget = section.addNewBlankProperty();
    newTarget.property.name = propertyName;
    return newTarget;
}
async function fetchComputedStyles(pane) {
    const computedStyleModel = pane.computedStyleModel();
    const style = await computedStyleModel.fetchComputedStyle();
    return style ? style.computedStyle : new Map();
}
function getAuthoredStyles(section, editableProperties) {
    const authoredProperties = new Map();
    const editablePropertiesSet = new Set(editableProperties.map(prop => prop.propertyName));
    for (const prop of section._style.leadingProperties()) {
        if (editablePropertiesSet.has(prop.name)) {
            authoredProperties.set(prop.name, prop.value);
        }
    }
    return authoredProperties;
}
//# sourceMappingURL=StyleEditorWidget.js.map