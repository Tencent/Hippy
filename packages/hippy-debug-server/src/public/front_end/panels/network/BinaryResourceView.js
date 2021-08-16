// Copyright 2019 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js'; // eslint-disable-line no-unused-vars
import * as Host from '../../core/host/host.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as SourceFrame from '../../ui/legacy/components/source_frame/source_frame.js';
import * as UI from '../../ui/legacy/legacy.js';
const UIStrings = {
    /**
    * @description Text in Binary Resource View of the Network panel. Shown to the user as a status
    * message after the current text has been copied to the clipboard. Base64 is a format for encoding
    * data.
    */
    copiedAsBase: 'Copied as `Base64`',
    /**
    *@description Text in Binary Resource View of the Network panel
    */
    hexViewer: '`Hex` Viewer',
    /**
    * @description Text in Binary Resource View of the Network panel. Shown to the user as a status
    * message after the current text has been copied to the clipboard. Hex is short for hexadecimal,
    * and is a format for encoding data.
    */
    copiedAsHex: 'Copied as `Hex`',
    /**
    *@description Text in Binary Resource View of the Network panel. Shown to the user as a status
    * message after the current text has been copied to the clipboard. UTF-8 is a format for encoding data.
    */
    copiedAsUtf: 'Copied as `UTF-8`',
    /**
    *@description Screen reader label for a select box that chooses how to display binary data in the Network panel
    */
    binaryViewType: 'Binary view type',
    /**
    *@description Tooltip text that appears when hovering over the largeicon copy button in the Binary Resource View of the Network panel
    */
    copyToClipboard: 'Copy to clipboard',
    /**
    * @description A context menu command in the Binary Resource View of the Network panel, for
    * copying to the clipboard. Base64 is a format for encoding data.
    */
    copyAsBase: 'Copy as `Base64`',
    /**
    *@description A context menu command in the Binary Resource View of the Network panel, for copying
    * to the clipboard. Hex is short for hexadecimal, and is a format for encoding data.
    */
    copyAsHex: 'Copy as `Hex`',
    /**
    *@description A context menu command in the Binary Resource View of the Network panel, for copying
    *to the clipboard. UTF-8 is a format for encoding data.
    */
    copyAsUtf: 'Copy as `UTF-8`',
};
const str_ = i18n.i18n.registerUIStrings('panels/network/BinaryResourceView.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class BinaryResourceView extends UI.Widget.VBox {
    _binaryResourceViewFactory;
    _toolbar;
    _binaryViewObjects;
    _binaryViewTypeSetting;
    _binaryViewTypeCombobox;
    _copiedText;
    _addFadeoutSettimeoutId;
    _lastView;
    constructor(base64content, contentUrl, resourceType) {
        super();
        this.registerRequiredCSS('panels/network/binaryResourceView.css', { enableLegacyPatching: false });
        this._binaryResourceViewFactory =
            new SourceFrame.BinaryResourceViewFactory.BinaryResourceViewFactory(base64content, contentUrl, resourceType);
        this._toolbar = new UI.Toolbar.Toolbar('binary-view-toolbar', this.element);
        this._binaryViewObjects = [
            new BinaryViewObject('base64', i18n.i18n.lockedString('Base64'), i18nString(UIStrings.copiedAsBase), this._binaryResourceViewFactory.createBase64View.bind(this._binaryResourceViewFactory), this._binaryResourceViewFactory.base64.bind(this._binaryResourceViewFactory)),
            new BinaryViewObject('hex', i18nString(UIStrings.hexViewer), i18nString(UIStrings.copiedAsHex), this._binaryResourceViewFactory.createHexView.bind(this._binaryResourceViewFactory), this._binaryResourceViewFactory.hex.bind(this._binaryResourceViewFactory)),
            new BinaryViewObject('utf8', i18n.i18n.lockedString('UTF-8'), i18nString(UIStrings.copiedAsUtf), this._binaryResourceViewFactory.createUtf8View.bind(this._binaryResourceViewFactory), this._binaryResourceViewFactory.utf8.bind(this._binaryResourceViewFactory)),
        ];
        this._binaryViewTypeSetting = Common.Settings.Settings.instance().createSetting('binaryViewType', 'hex');
        this._binaryViewTypeCombobox =
            new UI.Toolbar.ToolbarComboBox(this._binaryViewTypeChanged.bind(this), i18nString(UIStrings.binaryViewType));
        for (const viewObject of this._binaryViewObjects) {
            this._binaryViewTypeCombobox.addOption(this._binaryViewTypeCombobox.createOption(viewObject.label, viewObject.type));
        }
        this._toolbar.appendToolbarItem(this._binaryViewTypeCombobox);
        const copyButton = new UI.Toolbar.ToolbarButton(i18nString(UIStrings.copyToClipboard), 'largeicon-copy');
        copyButton.addEventListener(UI.Toolbar.ToolbarButton.Events.Click, _event => {
            this._copySelectedViewToClipboard();
        }, this);
        this._toolbar.appendToolbarItem(copyButton);
        this._copiedText = new UI.Toolbar.ToolbarText();
        this._copiedText.element.classList.add('binary-view-copied-text');
        this._toolbar.element.appendChild(this._copiedText.element);
        this._addFadeoutSettimeoutId = null;
        this._lastView = null;
        this._updateView();
    }
    _getCurrentViewObject() {
        const filter = (obj) => obj.type === this._binaryViewTypeSetting.get();
        const binaryViewObject = this._binaryViewObjects.find(filter);
        console.assert(Boolean(binaryViewObject), `No binary view found for binary view type found in setting 'binaryViewType': ${this._binaryViewTypeSetting.get()}`);
        return binaryViewObject || null;
    }
    async _copySelectedViewToClipboard() {
        const viewObject = this._getCurrentViewObject();
        if (!viewObject) {
            return;
        }
        Host.InspectorFrontendHost.InspectorFrontendHostInstance.copyText((await viewObject.content()).content);
        this._copiedText.setText(viewObject.copiedMessage);
        this._copiedText.element.classList.remove('fadeout');
        function addFadeoutClass() {
            this._copiedText.element.classList.add('fadeout');
        }
        if (this._addFadeoutSettimeoutId) {
            clearTimeout(this._addFadeoutSettimeoutId);
            this._addFadeoutSettimeoutId = null;
        }
        this._addFadeoutSettimeoutId = window.setTimeout(addFadeoutClass.bind(this), 2000);
    }
    wasShown() {
        this._updateView();
    }
    _updateView() {
        const newViewObject = this._getCurrentViewObject();
        if (!newViewObject) {
            return;
        }
        const newView = newViewObject.getView();
        if (newView === this._lastView) {
            return;
        }
        if (this._lastView) {
            this._lastView.detach();
        }
        this._lastView = newView;
        newView.show(this.element, this._toolbar.element);
        this._binaryViewTypeCombobox.selectElement().value = this._binaryViewTypeSetting.get();
    }
    _binaryViewTypeChanged() {
        const selectedOption = this._binaryViewTypeCombobox.selectedOption();
        if (!selectedOption) {
            return;
        }
        const newViewType = selectedOption.value;
        if (this._binaryViewTypeSetting.get() === newViewType) {
            return;
        }
        this._binaryViewTypeSetting.set(newViewType);
        this._updateView();
    }
    addCopyToContextMenu(contextMenu, submenuItemText) {
        const copyMenu = contextMenu.clipboardSection().appendSubMenuItem(submenuItemText);
        const footerSection = copyMenu.footerSection();
        footerSection.appendItem(i18nString(UIStrings.copyAsBase), async () => {
            const content = await this._binaryResourceViewFactory.base64();
            Host.InspectorFrontendHost.InspectorFrontendHostInstance.copyText(content.content);
        });
        footerSection.appendItem(i18nString(UIStrings.copyAsHex), async () => {
            const content = await this._binaryResourceViewFactory.hex();
            Host.InspectorFrontendHost.InspectorFrontendHostInstance.copyText(content.content);
        });
        footerSection.appendItem(i18nString(UIStrings.copyAsUtf), async () => {
            const content = await this._binaryResourceViewFactory.utf8();
            Host.InspectorFrontendHost.InspectorFrontendHostInstance.copyText(content.content);
        });
    }
}
export class BinaryViewObject {
    type;
    label;
    copiedMessage;
    content;
    _createViewFn;
    _view;
    constructor(type, label, copiedMessage, createViewFn, deferredContent) {
        this.type = type;
        this.label = label;
        this.copiedMessage = copiedMessage;
        this.content = deferredContent;
        this._createViewFn = createViewFn;
        this._view = null;
    }
    getView() {
        if (!this._view) {
            this._view = this._createViewFn();
        }
        return this._view;
    }
}
//# sourceMappingURL=BinaryResourceView.js.map