/*
 * Copyright (C) 2014 Google Inc. All rights reserved.
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
import * as ARIAUtils from './ARIAUtils.js';
import { InspectorView } from './InspectorView.js';
import { Tooltip } from './Tooltip.js';
import { CheckboxLabel } from './UIUtils.js';
const UIStrings = {
    /**
    *@description Note when a setting change will require the user to reload DevTools
    */
    srequiresReload: '*Requires reload',
    /**
    *@description Message to display if a setting change requires a reload of DevTools
    */
    oneOrMoreSettingsHaveChanged: 'One or more settings have changed which requires a reload to take effect.',
};
const str_ = i18n.i18n.registerUIStrings('ui/legacy/SettingsUI.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export const createSettingCheckbox = function (name, setting, omitParagraphElement, tooltip) {
    const label = CheckboxLabel.create(name);
    if (tooltip) {
        Tooltip.install(label, tooltip);
    }
    const input = label.checkboxElement;
    input.name = name;
    bindCheckbox(input, setting);
    if (omitParagraphElement) {
        return label;
    }
    const p = document.createElement('p');
    p.appendChild(label);
    return p;
};
const createSettingSelect = function (name, options, requiresReload, setting, subtitle) {
    const settingSelectElement = document.createElement('p');
    const label = settingSelectElement.createChild('label');
    const select = settingSelectElement.createChild('select', 'chrome-select');
    label.textContent = name;
    if (subtitle) {
        settingSelectElement.classList.add('chrome-select-label');
        label.createChild('p').textContent = subtitle;
    }
    ARIAUtils.bindLabelToControl(label, select);
    for (const option of options) {
        if (option.text && typeof option.value === 'string') {
            select.add(new Option(option.text, option.value));
        }
    }
    let reloadWarning = null;
    if (requiresReload) {
        reloadWarning = settingSelectElement.createChild('span', 'reload-warning hidden');
        reloadWarning.textContent = i18nString(UIStrings.srequiresReload);
        ARIAUtils.markAsAlert(reloadWarning);
    }
    setting.addChangeListener(settingChanged);
    settingChanged();
    select.addEventListener('change', selectChanged, false);
    return settingSelectElement;
    function settingChanged() {
        const newValue = setting.get();
        for (let i = 0; i < options.length; i++) {
            if (options[i].value === newValue) {
                select.selectedIndex = i;
            }
        }
    }
    function selectChanged() {
        // Don't use event.target.value to avoid conversion of the value to string.
        setting.set(options[select.selectedIndex].value);
        if (reloadWarning) {
            reloadWarning.classList.remove('hidden');
            InspectorView.instance().displayReloadRequiredWarning(i18nString(UIStrings.oneOrMoreSettingsHaveChanged));
        }
    }
};
export const bindCheckbox = function (inputElement, setting) {
    const input = inputElement;
    function settingChanged() {
        if (input.checked !== setting.get()) {
            input.checked = setting.get();
        }
    }
    setting.addChangeListener(settingChanged);
    settingChanged();
    function inputChanged() {
        if (setting.get() !== input.checked) {
            setting.set(input.checked);
        }
    }
    input.addEventListener('change', inputChanged, false);
};
export const createCustomSetting = function (name, element) {
    const p = document.createElement('p');
    const fieldsetElement = p.createChild('fieldset');
    const label = fieldsetElement.createChild('label');
    label.textContent = name;
    ARIAUtils.bindLabelToControl(label, element);
    fieldsetElement.appendChild(element);
    return p;
};
export const createControlForSetting = function (setting, subtitle) {
    const uiTitle = setting.title();
    switch (setting.type()) {
        case Common.Settings.SettingType.BOOLEAN:
            return createSettingCheckbox(uiTitle, setting);
        case Common.Settings.SettingType.ENUM:
            if (Array.isArray(setting.options())) {
                return createSettingSelect(uiTitle, setting.options(), setting.reloadRequired(), setting, subtitle);
            }
            console.error('Enum setting defined without options');
            return null;
        default:
            console.error('Invalid setting type: ' + setting.type());
            return null;
    }
};
//# sourceMappingURL=SettingsUI.js.map