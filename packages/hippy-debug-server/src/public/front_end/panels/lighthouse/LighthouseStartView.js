// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../../core/i18n/i18n.js';
import * as UI from '../../ui/legacy/legacy.js';
import { Events, Presets, RuntimeSettings } from './LighthouseController.js';
import { RadioSetting } from './RadioSetting.js';
const UIStrings = {
    /**
    *@description Text that is usually a hyperlink to more documentation
    */
    learnMore: 'Learn more',
    /**
    *@description Text that refers to device such as a phone
    */
    device: 'Device',
    /**
    *@description Title in the Lighthouse Start View for list of categories to run during audit
    */
    categories: 'Categories',
    /**
    *@description Text in Lighthouse Status View
    */
    communityPluginsBeta: 'Community Plugins (beta)',
    /**
    *@description Text of audits start button in Lighthouse Start View
    */
    generateReport: 'Generate report',
    /**
    *@description Text in Lighthouse Start View
    */
    identifyAndFixCommonProblemsThat: 'Identify and fix common problems that affect your site\'s performance, accessibility, and user experience.',
};
const str_ = i18n.i18n.registerUIStrings('panels/lighthouse/LighthouseStartView.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class StartView extends UI.Widget.Widget {
    _controller;
    _settingsToolbar;
    _startButton;
    _helpText;
    _warningText;
    _shouldConfirm;
    constructor(controller) {
        super();
        this.registerRequiredCSS('panels/lighthouse/lighthouseStartView.css', { enableLegacyPatching: false });
        this._controller = controller;
        this._settingsToolbar = new UI.Toolbar.Toolbar('');
        this._render();
    }
    settingsToolbar() {
        return this._settingsToolbar;
    }
    _populateRuntimeSettingAsRadio(settingName, label, parentElement) {
        const runtimeSetting = RuntimeSettings.find(item => item.setting.name === settingName);
        if (!runtimeSetting || !runtimeSetting.options) {
            throw new Error(`${settingName} is not a setting with options`);
        }
        const control = new RadioSetting(runtimeSetting.options, runtimeSetting.setting, runtimeSetting.description());
        parentElement.appendChild(control.element);
        UI.ARIAUtils.setAccessibleName(control.element, label);
    }
    _populateRuntimeSettingAsToolbarCheckbox(settingName, toolbar) {
        const runtimeSetting = RuntimeSettings.find(item => item.setting.name === settingName);
        if (!runtimeSetting || !runtimeSetting.title) {
            throw new Error(`${settingName} is not a setting with a title`);
        }
        runtimeSetting.setting.setTitle(runtimeSetting.title());
        const control = new UI.Toolbar.ToolbarSettingCheckbox(runtimeSetting.setting, runtimeSetting.description());
        toolbar.appendToolbarItem(control);
        if (runtimeSetting.learnMore) {
            const link = UI.XLink.XLink.create(runtimeSetting.learnMore, i18nString(UIStrings.learnMore), 'lighthouse-learn-more');
            link.style.padding = '5px';
            control.element.appendChild(link);
        }
    }
    _populateFormControls(fragment) {
        // Populate the device type
        const deviceTypeFormElements = fragment.$('device-type-form-elements');
        this._populateRuntimeSettingAsRadio('lighthouse.device_type', i18nString(UIStrings.device), deviceTypeFormElements);
        // Populate the categories
        const categoryFormElements = fragment.$('categories-form-elements');
        const pluginFormElements = fragment.$('plugins-form-elements');
        for (const preset of Presets) {
            const formElements = preset.plugin ? pluginFormElements : categoryFormElements;
            preset.setting.setTitle(preset.title());
            const checkbox = new UI.Toolbar.ToolbarSettingCheckbox(preset.setting, preset.description());
            const row = formElements.createChild('div', 'vbox lighthouse-launcher-row');
            row.appendChild(checkbox.element);
        }
        UI.ARIAUtils.markAsGroup(categoryFormElements);
        UI.ARIAUtils.setAccessibleName(categoryFormElements, i18nString(UIStrings.categories));
        UI.ARIAUtils.markAsGroup(pluginFormElements);
        UI.ARIAUtils.setAccessibleName(pluginFormElements, i18nString(UIStrings.communityPluginsBeta));
    }
    _render() {
        this._populateRuntimeSettingAsToolbarCheckbox('lighthouse.clear_storage', this._settingsToolbar);
        this._populateRuntimeSettingAsToolbarCheckbox('lighthouse.throttling', this._settingsToolbar);
        this._startButton = UI.UIUtils.createTextButton(i18nString(UIStrings.generateReport), () => this._controller.dispatchEventToListeners(Events.RequestLighthouseStart, 
        /* keyboardInitiated */ this._startButton.matches(':focus-visible')), 
        /* className */ '', /* primary */ true);
        this.setDefaultFocusedElement(this._startButton);
        const auditsDescription = i18nString(UIStrings.identifyAndFixCommonProblemsThat); // crbug.com/972969
        const fragment = UI.Fragment.Fragment.build `
  <div class="vbox lighthouse-start-view">
  <header>
  <div class="lighthouse-logo"></div>
  <div class="lighthouse-start-button-container hbox">
  ${this._startButton}
  </div>
  <div $="help-text" class="lighthouse-help-text hidden"></div>
  <div class="lighthouse-start-view-text">
  <span>${auditsDescription}</span>
  ${UI.XLink.XLink.create('https://developers.google.com/web/tools/lighthouse/', i18nString(UIStrings.learnMore))}
  </div>
  <div $="warning-text" class="lighthouse-warning-text hidden"></div>
  </header>
  <form>
  <div class="lighthouse-form-categories">
  <div class="lighthouse-form-section">
  <div class="lighthouse-form-section-label">
  ${i18nString(UIStrings.categories)}
  </div>
  <div class="lighthouse-form-elements" $="categories-form-elements"></div>
  </div>
  <div class="lighthouse-form-section">
  <div class="lighthouse-form-section-label">
  <div class="lighthouse-icon-label">${i18nString(UIStrings.communityPluginsBeta)}</div>
  </div>
  <div class="lighthouse-form-elements" $="plugins-form-elements"></div>
  </div>
  </div>
  <div class="lighthouse-form-section">
  <div class="lighthouse-form-section-label">
  ${i18nString(UIStrings.device)}
  </div>
  <div class="lighthouse-form-elements" $="device-type-form-elements"></div>
  </div>
  </form>
  </div>
  `;
        this._helpText = fragment.$('help-text');
        this._warningText = fragment.$('warning-text');
        this._populateFormControls(fragment);
        this.contentElement.appendChild(fragment.element());
        this.contentElement.style.overflow = 'auto';
    }
    onResize() {
        const useNarrowLayout = this.contentElement.offsetWidth < 560;
        const startViewEl = this.contentElement.querySelector('.lighthouse-start-view');
        if (!startViewEl) {
            return;
        }
        startViewEl.classList.toggle('hbox', !useNarrowLayout);
        startViewEl.classList.toggle('vbox', useNarrowLayout);
    }
    focusStartButton() {
        this._startButton.focus();
    }
    setStartButtonEnabled(isEnabled) {
        if (this._helpText) {
            this._helpText.classList.toggle('hidden', isEnabled);
        }
        if (this._startButton) {
            this._startButton.disabled = !isEnabled;
        }
    }
    setUnauditableExplanation(text) {
        if (this._helpText) {
            this._helpText.textContent = text;
        }
    }
    setWarningText(text) {
        if (this._warningText) {
            this._warningText.textContent = text;
            this._warningText.classList.toggle('hidden', !text);
            this._shouldConfirm = Boolean(text);
        }
    }
}
//# sourceMappingURL=LighthouseStartView.js.map