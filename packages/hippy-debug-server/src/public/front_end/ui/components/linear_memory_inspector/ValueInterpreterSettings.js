// Copyright (c) 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../../../core/i18n/i18n.js';
import * as LitHtml from '../../lit-html/lit-html.js';
import * as ComponentHelpers from '../helpers/helpers.js';
import { valueTypeToLocalizedString } from './ValueInterpreterDisplayUtils.js';
const { render, html } = LitHtml;
const UIStrings = {
    /**
    *@description Name of a group of selectable value types that do not fall under integer and floating point value types, e.g. Pointer32. The group appears name appears under the Value Interpreter Settings.
    */
    otherGroup: 'Other',
};
const str_ = i18n.i18n.registerUIStrings('ui/components/linear_memory_inspector/ValueInterpreterSettings.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
const GROUP_TO_TYPES = new Map([
    ["Integer" /* Integer */, ["Integer 8-bit" /* Int8 */, "Integer 16-bit" /* Int16 */, "Integer 32-bit" /* Int32 */, "Integer 64-bit" /* Int64 */]],
    ["Floating point" /* Float */, ["Float 32-bit" /* Float32 */, "Float 64-bit" /* Float64 */]],
    ["Other" /* Other */, ["Pointer 32-bit" /* Pointer32 */, "Pointer 64-bit" /* Pointer64 */]],
]);
function valueTypeGroupToLocalizedString(group) {
    if (group === "Other" /* Other */) {
        return i18nString(UIStrings.otherGroup);
    }
    // The remaining group type names should not be localized.
    return group;
}
export class TypeToggleEvent extends Event {
    data;
    constructor(type, checked) {
        super('typetoggle');
        this.data = { type, checked };
    }
}
export class ValueInterpreterSettings extends HTMLElement {
    static litTagName = LitHtml.literal `devtools-linear-memory-inspector-interpreter-settings`;
    shadow = this.attachShadow({ mode: 'open' });
    valueTypes = new Set();
    set data(data) {
        this.valueTypes = data.valueTypes;
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
          min-height: 20px;
        }

        .settings {
          display: flex;
          flex-wrap: wrap;
          margin: 0 12px 12px 12px;
          column-gap: 45px;
          row-gap: 15px;
        }

        .value-types-selection {
          display: flex;
          flex-direction: column;
        }

        .group {
          font-weight: bold;
          margin-bottom: 11px;
        }

        .type-label {
          white-space: nowrap;
        }

        .group + .type-label {
          margin-top: 5px;
        }

        .type-label input {
          margin: 0 6px 0 0;
          padding: 0;
        }

        .type-label + .type-label {
          margin-top: 6px;
        }
      </style>
      <div class="settings">
       ${[...GROUP_TO_TYPES.keys()].map(group => {
            return html `
          <div class="value-types-selection">
            <span class="group">${valueTypeGroupToLocalizedString(group)}</span>
            ${this.plotTypeSelections(group)}
          </div>
        `;
        })}
      </div>
      `, this.shadow, { host: this });
    }
    plotTypeSelections(group) {
        const types = GROUP_TO_TYPES.get(group);
        if (!types) {
            throw new Error(`Unknown group ${group}`);
        }
        return html `
      ${types.map(type => {
            return html `
          <label class="type-label" title=${valueTypeToLocalizedString(type)}>
            <input data-input="true" type="checkbox" .checked=${this.valueTypes.has(type)} @change=${(e) => this.onTypeToggle(type, e)}>
            <span data-title="true">${valueTypeToLocalizedString(type)}</span>
          </label>
     `;
        })}`;
    }
    onTypeToggle(type, event) {
        const checkbox = event.target;
        this.dispatchEvent(new TypeToggleEvent(type, checkbox.checked));
    }
}
ComponentHelpers.CustomElements.defineComponent('devtools-linear-memory-inspector-interpreter-settings', ValueInterpreterSettings);
//# sourceMappingURL=ValueInterpreterSettings.js.map