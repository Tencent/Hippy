/*
 * Copyright (C) 2011 Google Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as UI from '../../ui/legacy/legacy.js';
import { IsolateSelector } from './IsolateSelector.js';
const UIStrings = {
    /**
    *@description Text in Profile Launcher View of a profiler tool
    */
    selectJavascriptVmInstance: 'Select JavaScript VM instance',
    /**
    *@description Text to load something
    */
    load: 'Load',
    /**
    *@description Control button text content in Profile Launcher View of a profiler tool
    */
    takeSnapshot: 'Take snapshot',
    /**
    *@description Text of an item that stops the running task
    */
    stop: 'Stop',
    /**
    *@description Control button text content in Profile Launcher View of a profiler tool
    */
    start: 'Start',
    /**
    *@description Profile type header element text content in Profile Launcher View of a profiler tool
    */
    selectProfilingType: 'Select profiling type',
};
const str_ = i18n.i18n.registerUIStrings('panels/profiler/ProfileLauncherView.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class ProfileLauncherView extends UI.Widget.VBox {
    _panel;
    _contentElement;
    _selectedProfileTypeSetting;
    _profileTypeHeaderElement;
    _profileTypeSelectorForm;
    _controlButton;
    _loadButton;
    _recordButtonEnabled;
    _typeIdToOptionElementAndProfileType;
    _isProfiling;
    _isInstantProfile;
    _isEnabled;
    constructor(profilesPanel) {
        super();
        this.registerRequiredCSS('panels/profiler/profileLauncherView.css', { enableLegacyPatching: false });
        this._panel = profilesPanel;
        this.element.classList.add('profile-launcher-view');
        this._contentElement = this.element.createChild('div', 'profile-launcher-view-content vbox');
        const profileTypeSelectorElement = this._contentElement.createChild('div', 'vbox');
        this._selectedProfileTypeSetting = Common.Settings.Settings.instance().createSetting('selectedProfileType', 'CPU');
        this._profileTypeHeaderElement = profileTypeSelectorElement.createChild('h1');
        this._profileTypeSelectorForm = profileTypeSelectorElement.createChild('form');
        UI.ARIAUtils.markAsRadioGroup(this._profileTypeSelectorForm);
        const isolateSelectorElement = this._contentElement.createChild('div', 'vbox profile-isolate-selector-block');
        isolateSelectorElement.createChild('h1').textContent = i18nString(UIStrings.selectJavascriptVmInstance);
        const isolateSelector = new IsolateSelector();
        const isolateSelectorElementChild = isolateSelectorElement.createChild('div', 'vbox profile-launcher-target-list');
        isolateSelectorElementChild.classList.add('profile-launcher-target-list-container');
        isolateSelector.show(isolateSelectorElementChild);
        isolateSelectorElement.appendChild(isolateSelector.totalMemoryElement());
        const buttonsDiv = this._contentElement.createChild('div', 'hbox profile-launcher-buttons');
        this._controlButton =
            UI.UIUtils.createTextButton('', this._controlButtonClicked.bind(this), '', /* primary */ true);
        this._loadButton = UI.UIUtils.createTextButton(i18nString(UIStrings.load), this._loadButtonClicked.bind(this), '');
        buttonsDiv.appendChild(this._controlButton);
        buttonsDiv.appendChild(this._loadButton);
        this._recordButtonEnabled = true;
        this._typeIdToOptionElementAndProfileType = new Map();
    }
    _loadButtonClicked() {
        this._panel.showLoadFromFileDialog();
    }
    _updateControls() {
        if (this._isEnabled && this._recordButtonEnabled) {
            this._controlButton.removeAttribute('disabled');
        }
        else {
            this._controlButton.setAttribute('disabled', '');
        }
        UI.Tooltip.Tooltip.install(this._controlButton, this._recordButtonEnabled ? '' : UI.UIUtils.anotherProfilerActiveLabel());
        if (this._isInstantProfile) {
            this._controlButton.classList.remove('running');
            this._controlButton.classList.add('primary-button');
            this._controlButton.textContent = i18nString(UIStrings.takeSnapshot);
        }
        else if (this._isProfiling) {
            this._controlButton.classList.add('running');
            this._controlButton.classList.remove('primary-button');
            this._controlButton.textContent = i18nString(UIStrings.stop);
        }
        else {
            this._controlButton.classList.remove('running');
            this._controlButton.classList.add('primary-button');
            this._controlButton.textContent = i18nString(UIStrings.start);
        }
        for (const { optionElement } of this._typeIdToOptionElementAndProfileType.values()) {
            optionElement.disabled = Boolean(this._isProfiling);
        }
    }
    profileStarted() {
        this._isProfiling = true;
        this._updateControls();
    }
    profileFinished() {
        this._isProfiling = false;
        this._updateControls();
    }
    updateProfileType(profileType, recordButtonEnabled) {
        this._isInstantProfile = profileType.isInstantProfile();
        this._recordButtonEnabled = recordButtonEnabled;
        this._isEnabled = profileType.isEnabled();
        this._updateControls();
    }
    addProfileType(profileType) {
        const labelElement = UI.UIUtils.createRadioLabel('profile-type', profileType.name);
        this._profileTypeSelectorForm.appendChild(labelElement);
        const optionElement = labelElement.radioElement;
        this._typeIdToOptionElementAndProfileType.set(profileType.id, { optionElement, profileType });
        optionElement.addEventListener('change', this._profileTypeChanged.bind(this, profileType), false);
        const descriptionElement = this._profileTypeSelectorForm.createChild('p');
        descriptionElement.textContent = profileType.description;
        UI.ARIAUtils.setDescription(optionElement, profileType.description);
        const customContent = profileType.customContent();
        if (customContent) {
            this._profileTypeSelectorForm.createChild('p').appendChild(customContent);
            profileType.setCustomContentEnabled(false);
        }
        const headerText = this._typeIdToOptionElementAndProfileType.size > 1 ? i18nString(UIStrings.selectProfilingType) :
            profileType.name;
        this._profileTypeHeaderElement.textContent = headerText;
        UI.ARIAUtils.setAccessibleName(this._profileTypeSelectorForm, headerText);
    }
    restoreSelectedProfileType() {
        let typeId = this._selectedProfileTypeSetting.get();
        if (!this._typeIdToOptionElementAndProfileType.has(typeId)) {
            typeId = this._typeIdToOptionElementAndProfileType.keys().next().value;
            this._selectedProfileTypeSetting.set(typeId);
        }
        const optionElementAndProfileType = this._typeIdToOptionElementAndProfileType.get(typeId);
        optionElementAndProfileType.optionElement.checked = true;
        const type = optionElementAndProfileType.profileType;
        for (const [id, { profileType }] of this._typeIdToOptionElementAndProfileType) {
            const enabled = (id === typeId);
            profileType.setCustomContentEnabled(enabled);
        }
        this.dispatchEventToListeners(Events.ProfileTypeSelected, type);
    }
    _controlButtonClicked() {
        this._panel.toggleRecord();
    }
    _profileTypeChanged(profileType) {
        const typeId = this._selectedProfileTypeSetting.get();
        const type = this._typeIdToOptionElementAndProfileType.get(typeId).profileType;
        type.setCustomContentEnabled(false);
        profileType.setCustomContentEnabled(true);
        this.dispatchEventToListeners(Events.ProfileTypeSelected, profileType);
        this._isInstantProfile = profileType.isInstantProfile();
        this._isEnabled = profileType.isEnabled();
        this._updateControls();
        this._selectedProfileTypeSetting.set(profileType.id);
    }
}
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var Events;
(function (Events) {
    Events["ProfileTypeSelected"] = "ProfileTypeSelected";
})(Events || (Events = {}));
//# sourceMappingURL=ProfileLauncherView.js.map