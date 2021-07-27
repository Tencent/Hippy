// Copyright (c) 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../../../core/common/common.js';
import * as Host from '../../../core/host/host.js';
import * as ComponentHelpers from '../../../ui/components/helpers/helpers.js';
import * as SurveyLink from '../../../ui/components/survey_link/survey_link.js';
import * as LitHtml from '../../../ui/lit-html/lit-html.js';
import { NodeText } from './NodeText.js';
import * as i18n from '../../../core/i18n/i18n.js';
const UIStrings = {
    /**
    *@description Title of the show element button in the Layout pane of the Elements panel
    */
    showElementInTheElementsPanel: 'Show element in the Elements panel',
    /**
    *@description Title of a section on CSS Grid tooling
    */
    grid: 'Grid',
    /**
    *@description Title of a section in the Layout Sidebar pane of the Elements panel
    */
    overlayDisplaySettings: 'Overlay display settings',
    /**
    *@description Text of a link to a HaTS survey in the Layout panel
    */
    feedback: 'Feedback',
    /**
    *@description Title of a section in Layout sidebar pane
    */
    gridOverlays: 'Grid overlays',
    /**
    *@description Message in the Layout panel informing users that no CSS Grid layouts were found on the page
    */
    noGridLayoutsFoundOnThisPage: 'No grid layouts found on this page',
    /**
    *@description Title of the Flexbox section in the Layout panel
    */
    flexbox: 'Flexbox',
    /**
    *@description Title of a section in the Layout panel
    */
    flexboxOverlays: 'Flexbox overlays',
    /**
    *@description Text in the Layout panel, when no flexbox elements are found
    */
    noFlexboxLayoutsFoundOnThisPage: 'No flexbox layouts found on this page',
};
const str_ = i18n.i18n.registerUIStrings('panels/elements/components/LayoutPane.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
const { render, html } = LitHtml;
const getStyleSheets = ComponentHelpers.GetStylesheet.getStyleSheets;
export class SettingChangedEvent extends Event {
    data;
    constructor(setting, value) {
        super('settingchanged', {});
        this.data = { setting, value };
    }
}
function isEnumSetting(setting) {
    return setting.type === Common.Settings.SettingType.ENUM;
}
function isBooleanSetting(setting) {
    return setting.type === Common.Settings.SettingType.BOOLEAN;
}
export class LayoutPane extends HTMLElement {
    shadow = this.attachShadow({ mode: 'open' });
    settings = [];
    gridElements = [];
    flexContainerElements = [];
    constructor() {
        super();
        this.shadow.adoptedStyleSheets = [
            ...getStyleSheets('panels/elements/layoutPane.css', { enableLegacyPatching: false }),
            // Required for chrome-select styles.
            ...getStyleSheets('ui/legacy/inspectorCommon.css', { enableLegacyPatching: false }),
        ];
    }
    set data(data) {
        this.settings = data.settings;
        this.gridElements = data.gridElements;
        this.flexContainerElements = data.flexContainerElements;
        this.render();
    }
    onSummaryKeyDown(event) {
        if (!event.target) {
            return;
        }
        const summaryElement = event.target;
        const detailsElement = summaryElement.parentElement;
        if (!detailsElement) {
            throw new Error('<details> element is not found for a <summary> element');
        }
        switch (event.key) {
            case 'ArrowLeft':
                detailsElement.open = false;
                break;
            case 'ArrowRight':
                detailsElement.open = true;
                break;
        }
    }
    render() {
        // Disabled until https://crbug.com/1079231 is fixed.
        // clang-format off
        render(html `
      <details open>
        <summary class="header" @keydown=${this.onSummaryKeyDown}>
          ${i18nString(UIStrings.grid)}
        </summary>
        <div class="content-section">
          <div class="feedback-container">
            <div>
              <h3 class="content-section-title">${i18nString(UIStrings.overlayDisplaySettings)}</h3>
            </div>
            <div class="feedback">
              <${SurveyLink.SurveyLink.SurveyLink.litTagName} .data=${{
            trigger: 'devtools-layout-panel',
            promptText: i18nString(UIStrings.feedback),
            canShowSurvey: Host.InspectorFrontendHost.InspectorFrontendHostInstance.canShowSurvey,
            showSurvey: Host.InspectorFrontendHost.InspectorFrontendHostInstance.showSurvey,
        }}></${SurveyLink.SurveyLink.SurveyLink.litTagName}>
            </div>
          </div>
          <div class="select-settings">
            ${this.getEnumSettings().map(setting => this.renderEnumSetting(setting))}
          </div>
          <div class="checkbox-settings">
            ${this.getBooleanSettings().map(setting => this.renderBooleanSetting(setting))}
          </div>
        </div>
        ${this.gridElements ?
            html `<div class="content-section">
            <h3 class="content-section-title">
              ${this.gridElements.length ? i18nString(UIStrings.gridOverlays) : i18nString(UIStrings.noGridLayoutsFoundOnThisPage)}
            </h3>
            ${this.gridElements.length ?
                html `<div class="elements">
                ${this.gridElements.map(element => this.renderElement(element))}
              </div>` : ''}
          </div>` : ''}
      </details>
      ${this.flexContainerElements !== undefined ?
            html `
        <details open>
          <summary class="header" @keydown=${this.onSummaryKeyDown}>
            ${i18nString(UIStrings.flexbox)}
          </summary>
          ${this.flexContainerElements ?
                html `<div class="content-section">
              <h3 class="content-section-title">
                ${this.flexContainerElements.length ? i18nString(UIStrings.flexboxOverlays) : i18nString(UIStrings.noFlexboxLayoutsFoundOnThisPage)}
              </h3>
              ${this.flexContainerElements.length ?
                    html `<div class="elements">
                  ${this.flexContainerElements.map(element => this.renderElement(element))}
                </div>` : ''}
            </div>` : ''}
        </details>
        `
            : ''}
    `, this.shadow, {
            host: this,
        });
        // clang-format on
    }
    getEnumSettings() {
        return this.settings.filter(isEnumSetting);
    }
    getBooleanSettings() {
        return this.settings.filter(isBooleanSetting);
    }
    onBooleanSettingChange(setting, event) {
        event.preventDefault();
        this.dispatchEvent(new SettingChangedEvent(setting.name, event.target.checked));
    }
    onEnumSettingChange(setting, event) {
        event.preventDefault();
        this.dispatchEvent(new SettingChangedEvent(setting.name, event.target.value));
    }
    onElementToggle(element, event) {
        event.preventDefault();
        element.toggle(event.target.checked);
    }
    onElementClick(element, event) {
        event.preventDefault();
        element.reveal();
    }
    onColorChange(element, event) {
        event.preventDefault();
        element.setColor(event.target.value);
        this.render();
    }
    onElementMouseEnter(element, event) {
        event.preventDefault();
        element.highlight();
    }
    onElementMouseLeave(element, event) {
        event.preventDefault();
        element.hideHighlight();
    }
    renderElement(element) {
        const onElementToggle = this.onElementToggle.bind(this, element);
        const onElementClick = this.onElementClick.bind(this, element);
        const onColorChange = this.onColorChange.bind(this, element);
        const onMouseEnter = this.onElementMouseEnter.bind(this, element);
        const onMouseLeave = this.onElementMouseLeave.bind(this, element);
        const onColorLabelKeyUp = (event) => {
            // Handle Enter and Space events to make the color picker accessible.
            if (event.key !== 'Enter' && event.key !== ' ') {
                return;
            }
            const target = event.target;
            const input = target.querySelector('input');
            input.click();
            event.preventDefault();
        };
        const onColorLabelKeyDown = (event) => {
            // Prevent default scrolling when the Space key is pressed.
            if (event.key === ' ') {
                event.preventDefault();
            }
        };
        // Disabled until https://crbug.com/1079231 is fixed.
        // clang-format off
        return html `<div class="element">
      <label data-element="true" class="checkbox-label" title=${element.name}>
        <input data-input="true" type="checkbox" .checked=${element.enabled} @change=${onElementToggle} />
        <span class="node-text-container" data-label="true" @mouseenter=${onMouseEnter} @mouseleave=${onMouseLeave}>
          <${NodeText.litTagName} .data=${{
            nodeId: element.domId,
            nodeTitle: element.name,
            nodeClasses: element.domClasses,
        }}></${NodeText.litTagName}>
        </span>
      </label>
      <label @keyup=${onColorLabelKeyUp} @keydown=${onColorLabelKeyDown} tabindex="0" class="color-picker-label" style="background: ${element.color};">
        <input @change=${onColorChange} @input=${onColorChange} class="color-picker" type="color" value=${element.color} />
      </label>
      <button tabindex="0" @click=${onElementClick} title=${i18nString(UIStrings.showElementInTheElementsPanel)} class="show-element"></button>
    </div>`;
        // clang-format on
    }
    renderBooleanSetting(setting) {
        const onBooleanSettingChange = this.onBooleanSettingChange.bind(this, setting);
        return html `<label data-boolean-setting="true" class="checkbox-label" title=${setting.title}>
      <input data-input="true" type="checkbox" .checked=${setting.value} @change=${onBooleanSettingChange} />
      <span data-label="true">${setting.title}</span>
    </label>`;
    }
    renderEnumSetting(setting) {
        const onEnumSettingChange = this.onEnumSettingChange.bind(this, setting);
        return html `<label data-enum-setting="true" class="select-label" title=${setting.title}>
      <select class="chrome-select" data-input="true" @change=${onEnumSettingChange}>
        ${setting.options.map(opt => html `<option value=${opt.value} .selected=${setting.value === opt.value}>${opt.title}</option>`)}
      </select>
    </label>`;
    }
}
ComponentHelpers.CustomElements.defineComponent('devtools-layout-pane', LayoutPane);
//# sourceMappingURL=LayoutPane.js.map