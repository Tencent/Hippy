// Copyright (c) 2016 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as ARIAUtils from './ARIAUtils.js';
import { Toolbar } from './Toolbar.js';
import { Tooltip } from './Tooltip.js';
import { VBox } from './Widget.js';
/**
 * @deprecated Please consider using the web component version of this widget
 *             (`ui/components/report_view/ReportView.ts`) for new code.
 */
export class ReportView extends VBox {
    _contentBox;
    _headerElement;
    _titleElement;
    _sectionList;
    _subtitleElement;
    _urlElement;
    constructor(title) {
        super(true);
        this.registerRequiredCSS('ui/legacy/reportView.css', { enableLegacyPatching: false });
        this._contentBox = this.contentElement.createChild('div', 'report-content-box');
        this._headerElement = this._contentBox.createChild('div', 'report-header vbox');
        this._titleElement = this._headerElement.createChild('div', 'report-title');
        if (title) {
            this._titleElement.textContent = title;
        }
        else {
            this._headerElement.classList.add('hidden');
        }
        ARIAUtils.markAsHeading(this._titleElement, 1);
        this._sectionList = this._contentBox.createChild('div', 'vbox');
    }
    setTitle(title) {
        if (this._titleElement.textContent === title) {
            return;
        }
        this._titleElement.textContent = title;
        this._headerElement.classList.toggle('hidden', Boolean(title));
    }
    setSubtitle(subtitle) {
        if (this._subtitleElement && this._subtitleElement.textContent === subtitle) {
            return;
        }
        if (!this._subtitleElement) {
            this._subtitleElement = this._headerElement.createChild('div', 'report-subtitle');
        }
        this._subtitleElement.textContent = subtitle;
    }
    setURL(link) {
        if (!this._urlElement) {
            this._urlElement = this._headerElement.createChild('div', 'report-url link');
        }
        this._urlElement.removeChildren();
        if (link) {
            this._urlElement.appendChild(link);
        }
    }
    createToolbar() {
        const toolbar = new Toolbar('');
        this._headerElement.appendChild(toolbar.element);
        return toolbar;
    }
    appendSection(title, className) {
        const section = new Section(title, className);
        section.show(this._sectionList);
        return section;
    }
    sortSections(comparator) {
        const sections = this.children().slice();
        const sorted = sections.every((e, i, a) => !i || comparator(a[i - 1], a[i]) <= 0);
        if (sorted) {
            return;
        }
        this.detachChildWidgets();
        sections.sort(comparator);
        for (const section of sections) {
            section.show(this._sectionList);
        }
    }
    setHeaderVisible(visible) {
        this._headerElement.classList.toggle('hidden', !visible);
    }
    setBodyScrollable(scrollable) {
        this._contentBox.classList.toggle('no-scroll', !scrollable);
    }
}
export class Section extends VBox {
    _headerElement;
    _titleElement;
    _fieldList;
    _fieldMap;
    constructor(title, className) {
        super();
        this.element.classList.add('report-section');
        if (className) {
            this.element.classList.add(className);
        }
        this._headerElement = this.element.createChild('div', 'report-section-header');
        this._titleElement = this._headerElement.createChild('div', 'report-section-title');
        this.setTitle(title);
        ARIAUtils.markAsHeading(this._titleElement, 2);
        this._fieldList = this.element.createChild('div', 'vbox');
        this._fieldMap = new Map();
    }
    title() {
        return this._titleElement.textContent || '';
    }
    setTitle(title, tooltip) {
        if (this._titleElement.textContent !== title) {
            this._titleElement.textContent = title;
        }
        Tooltip.install(this._titleElement, tooltip || '');
        this._titleElement.classList.toggle('hidden', !this._titleElement.textContent);
    }
    /**
     * Declares the overall container to be a group and assigns a title.
     */
    setUiGroupTitle(groupTitle) {
        ARIAUtils.markAsGroup(this.element);
        ARIAUtils.setAccessibleName(this.element, groupTitle);
    }
    createToolbar() {
        const toolbar = new Toolbar('');
        this._headerElement.appendChild(toolbar.element);
        return toolbar;
    }
    appendField(title, textValue) {
        let row = this._fieldMap.get(title);
        if (!row) {
            row = this._fieldList.createChild('div', 'report-field');
            row.createChild('div', 'report-field-name').textContent = title;
            this._fieldMap.set(title, row);
            row.createChild('div', 'report-field-value');
        }
        if (textValue && row.lastElementChild) {
            row.lastElementChild.textContent = textValue;
        }
        return /** @type {!HTMLElement} */ row.lastElementChild;
    }
    appendFlexedField(title, textValue) {
        const field = this.appendField(title, textValue);
        field.classList.add('report-field-value-is-flexed');
        return field;
    }
    removeField(title) {
        const row = this._fieldMap.get(title);
        if (row) {
            row.remove();
        }
        this._fieldMap.delete(title);
    }
    setFieldVisible(title, visible) {
        const row = this._fieldMap.get(title);
        if (row) {
            row.classList.toggle('hidden', !visible);
        }
    }
    fieldValue(title) {
        const row = this._fieldMap.get(title);
        return row ? row.lastElementChild : null;
    }
    appendRow() {
        return /** @type {!HTMLElement} */ this._fieldList.createChild('div', 'report-row');
    }
    appendSelectableRow() {
        return /** @type {!HTMLElement} */ this._fieldList.createChild('div', 'report-row report-row-selectable');
    }
    clearContent() {
        this._fieldList.removeChildren();
        this._fieldMap.clear();
    }
    markFieldListAsGroup() {
        ARIAUtils.markAsGroup(this._fieldList);
        ARIAUtils.setAccessibleName(this._fieldList, this.title());
    }
    setIconMasked(masked) {
        this.element.classList.toggle('show-mask', masked);
    }
}
//# sourceMappingURL=ReportView.js.map