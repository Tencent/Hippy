// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as UI from '../../ui/legacy/legacy.js';
export class ComboBoxOfCheckBoxes extends UI.Toolbar.ToolbarButton {
    options = new Array();
    headers = new Array();
    onOptionClicked = () => { };
    constructor(title) {
        super(title);
        this.turnIntoSelect();
        this.addEventListener(UI.Toolbar.ToolbarButton.Events.Click, this.showLevelContextMenu.bind(this));
        UI.ARIAUtils.markAsMenuButton(this.element);
    }
    addOption(option, value, defaultEnabled) {
        this.options.push({ 'title': option, 'value': value, default: defaultEnabled, 'enabled': defaultEnabled });
    }
    setOptionEnabled(index, enabled) {
        const option = this.options[index];
        if (!option) {
            return;
        }
        option.enabled = enabled;
        this.onOptionClicked();
    }
    addHeader(headerName, callback) {
        this.headers.push({ title: headerName, callback: callback });
    }
    setOnOptionClicked(onOptionClicked) {
        this.onOptionClicked = onOptionClicked;
    }
    getOptions() {
        return this.options;
    }
    showLevelContextMenu(event) {
        const mouseEvent = /** @type {!Event} */ (event.data);
        const contextMenu = new UI.ContextMenu.ContextMenu(mouseEvent, true, this.element.totalOffsetLeft(), this.element.totalOffsetTop() +
            /** @type {!HTMLElement} */ (this.element).offsetHeight);
        for (const { title, callback } of this.headers) {
            contextMenu.headerSection().appendCheckboxItem(title, () => callback());
        }
        for (const [index, { title, enabled }] of this.options.entries()) {
            contextMenu.defaultSection().appendCheckboxItem(title, () => {
                this.setOptionEnabled(index, !enabled);
            }, enabled);
        }
        contextMenu.show();
    }
}
//# sourceMappingURL=ComboBoxOfCheckBoxes.js.map