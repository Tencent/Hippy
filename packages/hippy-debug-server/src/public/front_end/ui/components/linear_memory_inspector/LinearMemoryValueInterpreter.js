// Copyright (c) 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as LitHtml from '../../lit-html/lit-html.js';
import * as ComponentHelpers from '../helpers/helpers.js';
import * as IconButton from '../icon_button/icon_button.js';
import { ValueInterpreterDisplay } from './ValueInterpreterDisplay.js';
import { ValueInterpreterSettings } from './ValueInterpreterSettings.js';
import * as i18n from '../../../core/i18n/i18n.js';
const UIStrings = {
    /**
    *@description Tooltip text that appears when hovering over the gear button to open and close settings in the Linear Memory Inspector. These settings
    *             allow the user to change the value type to view, such as 32-bit Integer, or 32-bit Float.
    */
    toggleValueTypeSettings: 'Toggle value type settings',
    /**
    *@description Tooltip text that appears when hovering over the 'Little Endian' or 'Big Endian' setting in the Linear Memory Inspector.
    */
    changeEndianness: 'Change `Endianness`',
};
const str_ = i18n.i18n.registerUIStrings('ui/components/linear_memory_inspector/LinearMemoryValueInterpreter.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
const { render, html } = LitHtml;
const getStyleSheets = ComponentHelpers.GetStylesheet.getStyleSheets;
export class EndiannessChangedEvent extends Event {
    data;
    constructor(endianness) {
        super('endiannesschanged');
        this.data = endianness;
    }
}
export class ValueTypeToggledEvent extends Event {
    data;
    constructor(type, checked) {
        super('valuetypetoggled');
        this.data = { type, checked };
    }
}
export class LinearMemoryValueInterpreter extends HTMLElement {
    static litTagName = LitHtml.literal `devtools-linear-memory-inspector-interpreter`;
    shadow = this.attachShadow({ mode: 'open' });
    endianness = "Little Endian" /* Little */;
    buffer = new ArrayBuffer(0);
    valueTypes = new Set();
    valueTypeModeConfig = new Map();
    memoryLength = 0;
    showSettings = false;
    constructor() {
        super();
        this.shadow.adoptedStyleSheets = [
            ...getStyleSheets('ui/legacy/inspectorCommon.css', { enableLegacyPatching: false }),
        ];
    }
    set data(data) {
        this.endianness = data.endianness;
        this.buffer = data.value;
        this.valueTypes = data.valueTypes;
        this.valueTypeModeConfig = data.valueTypeModes || new Map();
        this.memoryLength = data.memoryLength;
        this.render();
    }
    render() {
        // Disabled until https://crbug.com/1079231 is fixed.
        // clang-format off
        render(html `
      <style>
        :host {
          flex: auto;
          display: flex;
        }

        .value-interpreter {
          --text-highlight-color: #80868b;

          border: var(--legacy-divider-border);
          background-color: var(--color-background-elevation-1);
          overflow: hidden;
          width: 400px;
        }

        .settings-toolbar {
          min-height: 26px;
          display: flex;
          flex-wrap: nowrap;
          justify-content: space-between;
          padding-left: 12px;
          padding-right: 12px;
          align-items: center;
        }

        .settings-toolbar-button {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 20px;
          height: 20px;
          border: none;
          background-color: transparent;
          cursor: pointer;
        }

        .settings-toolbar-button devtools-icon {
          height: 14px;
          width: 14px;
          min-height: 14px;
          min-width: 14px;
        }

        .settings-toolbar-button.active devtools-icon {
          --icon-color: var(--color-primary);
        }

        .divider {
          display: block;
          height: 1px;
          margin-bottom: 12px;
          background-color: var(--color-details-hairline, #d0d0d0); /* stylelint-disable-line plugin/use_theme_colors */
          /* See: crbug.com/1152736 for color variable migration. */
        }
      </style>
      <div class="value-interpreter">
        <div class="settings-toolbar">
          ${this.renderEndiannessSetting()}
          <button data-settings="true" class="settings-toolbar-button ${this.showSettings ? 'active' : ''}" title=${i18nString(UIStrings.toggleValueTypeSettings)} @click=${this.onSettingsToggle}>
            <${IconButton.Icon.Icon.litTagName}
              .data=${{ iconName: 'settings_14x14_icon', color: 'var(--color-text-secondary)', width: '14px' }}>
            </${IconButton.Icon.Icon.litTagName}>
          </button>
        </div>
        <span class="divider"></span>
        <div>
          ${this.showSettings ?
            html `
              <${ValueInterpreterSettings.litTagName}
                .data=${{ valueTypes: this.valueTypes }}
                @typetoggle=${this.onTypeToggle}>
              </${ValueInterpreterSettings.litTagName}>` :
            html `
              <${ValueInterpreterDisplay.litTagName}
                .data=${{
                buffer: this.buffer,
                valueTypes: this.valueTypes,
                endianness: this.endianness,
                valueTypeModes: this.valueTypeModeConfig,
                memoryLength: this.memoryLength,
            }}>
              </${ValueInterpreterDisplay.litTagName}>`}
        </div>
      </div>
    `, this.shadow, { host: this });
        // clang-format on
    }
    onEndiannessChange(event) {
        event.preventDefault();
        const select = event.target;
        const endianness = select.value;
        this.dispatchEvent(new EndiannessChangedEvent(endianness));
    }
    renderEndiannessSetting() {
        const onEnumSettingChange = this.onEndiannessChange.bind(this);
        // Disabled until https://crbug.com/1079231 is fixed.
        // clang-format off
        return html `
    <label data-endianness-setting="true" title=${i18nString(UIStrings.changeEndianness)}>
      <select class="chrome-select"
        style="border: none; background-color: transparent; cursor: pointer;"
        data-endianness="true" @change=${onEnumSettingChange}>
        ${["Little Endian" /* Little */, "Big Endian" /* Big */].map(endianness => {
            return html `<option value=${endianness} .selected=${this.endianness === endianness}>${i18n.i18n.lockedString(endianness)}</option>`;
        })}
      </select>
    </label>
    `;
        // clang-format on
    }
    onSettingsToggle() {
        this.showSettings = !this.showSettings;
        this.render();
    }
    onTypeToggle(e) {
        this.dispatchEvent(new ValueTypeToggledEvent(e.data.type, e.data.checked));
    }
}
ComponentHelpers.CustomElements.defineComponent('devtools-linear-memory-inspector-interpreter', LinearMemoryValueInterpreter);
//# sourceMappingURL=LinearMemoryValueInterpreter.js.map