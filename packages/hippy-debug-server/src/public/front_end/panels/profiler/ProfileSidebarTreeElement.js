// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../../core/i18n/i18n.js';
import * as UI from '../../ui/legacy/legacy.js';
import { Events as ProfileHeaderEvents } from './ProfileHeader.js';
const UIStrings = {
    /**
    *@description Text to save something
    */
    save: 'Save',
    /**
    *@description Text to save something (with ellipsis)
    */
    saveWithEllipsis: 'Save…',
    /**
    *@description A context menu item in the Profiles Panel of a profiler tool
    */
    load: 'Load…',
    /**
    *@description Text to delete something
    */
    delete: 'Delete',
};
const str_ = i18n.i18n.registerUIStrings('panels/profiler/ProfileSidebarTreeElement.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
let sharedFileSelectorElement = null;
function getSharedFileSelectorElement() {
    return sharedFileSelectorElement;
}
export function setSharedFileSelectorElement(element) {
    sharedFileSelectorElement = element;
}
export class ProfileSidebarTreeElement extends UI.TreeOutline.TreeElement {
    _iconElement;
    _titlesElement;
    _titleContainer;
    titleElement;
    _subtitleElement;
    _className;
    _small;
    _dataDisplayDelegate;
    profile;
    _saveLinkElement;
    _editing;
    constructor(dataDisplayDelegate, profile, className) {
        super('', false);
        this._iconElement = document.createElement('div');
        this._iconElement.classList.add('icon');
        this._titlesElement = document.createElement('div');
        this._titlesElement.classList.add('titles');
        this._titlesElement.classList.add('no-subtitle');
        this._titleContainer = this._titlesElement.createChild('span', 'title-container');
        this.titleElement = this._titleContainer.createChild('span', 'title');
        this._subtitleElement = this._titlesElement.createChild('span', 'subtitle');
        this.titleElement.textContent = profile.title;
        this._className = className;
        this._small = false;
        this._dataDisplayDelegate = dataDisplayDelegate;
        this.profile = profile;
        profile.addEventListener(ProfileHeaderEvents.UpdateStatus, this._updateStatus, this);
        if (profile.canSaveToFile()) {
            this._createSaveLink();
        }
        else {
            profile.addEventListener(ProfileHeaderEvents.ProfileReceived, this._onProfileReceived, this);
        }
    }
    _createSaveLink() {
        this._saveLinkElement = this._titleContainer.createChild('span', 'save-link');
        this._saveLinkElement.textContent = i18nString(UIStrings.save);
        this._saveLinkElement.addEventListener('click', this._saveProfile.bind(this), false);
    }
    _onProfileReceived(_event) {
        this._createSaveLink();
    }
    _updateStatus(event) {
        const statusUpdate = event.data;
        if (statusUpdate.subtitle !== null) {
            this._subtitleElement.textContent = statusUpdate.subtitle || '';
            this._titlesElement.classList.toggle('no-subtitle', !statusUpdate.subtitle);
        }
        if (typeof statusUpdate.wait === 'boolean' && this.listItemElement) {
            this._iconElement.classList.toggle('spinner', statusUpdate.wait);
            this.listItemElement.classList.toggle('wait', statusUpdate.wait);
        }
    }
    ondblclick(event) {
        if (!this._editing) {
            this._startEditing(event.target);
        }
        return false;
    }
    _startEditing(eventTarget) {
        const container = eventTarget.enclosingNodeOrSelfWithClass('title');
        if (!container) {
            return;
        }
        const config = new UI.InplaceEditor.Config(this._editingCommitted.bind(this), this._editingCancelled.bind(this));
        this._editing = UI.InplaceEditor.InplaceEditor.startEditing(container, config);
    }
    _editingCommitted(container, newTitle) {
        delete this._editing;
        this.profile.setTitle(newTitle);
    }
    _editingCancelled() {
        delete this._editing;
    }
    dispose() {
        this.profile.removeEventListener(ProfileHeaderEvents.UpdateStatus, this._updateStatus, this);
        this.profile.removeEventListener(ProfileHeaderEvents.ProfileReceived, this._onProfileReceived, this);
    }
    onselect() {
        this._dataDisplayDelegate.showProfile(this.profile);
        return true;
    }
    ondelete() {
        this.profile.profileType().removeProfile(this.profile);
        return true;
    }
    onattach() {
        if (this._className) {
            this.listItemElement.classList.add(this._className);
        }
        if (this._small) {
            this.listItemElement.classList.add('small');
        }
        this.listItemElement.append(this._iconElement, this._titlesElement);
        this.listItemElement.addEventListener('contextmenu', this._handleContextMenuEvent.bind(this), true);
        UI.ARIAUtils.setDescription(this.listItemElement, this.profile.profileType().name);
    }
    _handleContextMenuEvent(event) {
        const profile = this.profile;
        const contextMenu = new UI.ContextMenu.ContextMenu(event);
        // FIXME: use context menu provider
        const sharedFileSelectorElement = getSharedFileSelectorElement();
        if (!sharedFileSelectorElement) {
            throw new Error('File selector element shared by ProfilePanel instances is missing');
        }
        contextMenu.headerSection().appendItem(i18nString(UIStrings.load), sharedFileSelectorElement.click.bind(sharedFileSelectorElement));
        if (profile.canSaveToFile()) {
            contextMenu.saveSection().appendItem(i18nString(UIStrings.saveWithEllipsis), profile.saveToFile.bind(profile));
        }
        contextMenu.footerSection().appendItem(i18nString(UIStrings.delete), this.ondelete.bind(this));
        contextMenu.show();
    }
    _saveProfile(_event) {
        this.profile.saveToFile();
    }
    setSmall(small) {
        this._small = small;
        if (this.listItemElement) {
            this.listItemElement.classList.toggle('small', this._small);
        }
    }
    setMainTitle(title) {
        this.titleElement.textContent = title;
    }
}
//# sourceMappingURL=ProfileSidebarTreeElement.js.map