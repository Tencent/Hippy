// Copyright (c) 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../../../core/i18n/i18n.js';
import * as LitHtml from '../../lit-html/lit-html.js';
import * as ComponentHelpers from '../helpers/helpers.js';
import * as IconButton from '../icon_button/icon_button.js';
import { format, getDefaultValueTypeMapping, getPointerAddress, isNumber, isPointer, isValidMode, VALUE_TYPE_MODE_LIST } from './ValueInterpreterDisplayUtils.js';
const UIStrings = {
    /**
    *@description Tooltip text that appears when hovering over an unsigned interpretation of the memory under the Value Interpreter
    */
    unsignedValue: '`Unsigned` value',
    /**
     *@description Tooltip text that appears when hovering over the element to change value type modes of under the Value Interpreter. Value type modes
     *             are different ways of viewing a certain value, e.g.: 10 (decimal) can be 0xa in hexadecimal mode, or 12 in octal mode.
     */
    changeValueTypeMode: 'Change mode',
    /**
    *@description Tooltip text that appears when hovering over a signed interpretation of the memory under the Value Interpreter
    */
    signedValue: '`Signed` value',
    /**
    *@description Tooltip text that appears when hovering over a 'jump-to-address' button that is next to a pointer (32-bit or 64-bit) under the Value Interpreter
    */
    jumpToPointer: 'Jump to address',
    /**
    *@description Tooltip text that appears when hovering over a 'jump-to-address' button that is next to a pointer (32-bit or 64-bit) with an invalid address under the Value Interpreter.
    */
    addressOutOfRange: 'Address out of memory range',
};
const str_ = i18n.i18n.registerUIStrings('ui/components/linear_memory_inspector/ValueInterpreterDisplay.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
const { render, html } = LitHtml;
const getStyleSheets = ComponentHelpers.GetStylesheet.getStyleSheets;
const SORTED_VALUE_TYPES = Array.from(getDefaultValueTypeMapping().keys());
export class ValueTypeModeChangedEvent extends Event {
    data;
    constructor(type, mode) {
        super('valuetypemodechanged', {
            composed: true,
        });
        this.data = { type, mode };
    }
}
export class JumpToPointerAddressEvent extends Event {
    data;
    constructor(address) {
        super('jumptopointeraddress', {
            composed: true,
        });
        this.data = address;
    }
}
export class ValueInterpreterDisplay extends HTMLElement {
    static litTagName = LitHtml.literal `devtools-linear-memory-inspector-interpreter-display`;
    shadow = this.attachShadow({ mode: 'open' });
    endianness = "Little Endian" /* Little */;
    buffer = new ArrayBuffer(0);
    valueTypes = new Set();
    valueTypeModeConfig = getDefaultValueTypeMapping();
    memoryLength = 0;
    constructor() {
        super();
        this.shadow.adoptedStyleSheets = [
            ...getStyleSheets('ui/legacy/inspectorCommon.css', { enableLegacyPatching: false }),
        ];
    }
    set data(data) {
        this.buffer = data.buffer;
        this.endianness = data.endianness;
        this.valueTypes = data.valueTypes;
        this.memoryLength = data.memoryLength;
        if (data.valueTypeModes) {
            data.valueTypeModes.forEach((mode, valueType) => {
                if (isValidMode(valueType, mode)) {
                    this.valueTypeModeConfig.set(valueType, mode);
                }
            });
        }
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

        .mode-type {
          color: var(--text-highlight-color); /* stylelint-disable-line plugin/use_theme_colors */
          /* See: crbug.com/1152736 for color variable migration. */
        }

        .value-types {
          width: 100%;
          display: grid;
          grid-template-columns: auto auto 1fr;
          grid-column-gap: 24px;
          grid-row-gap: 4px;
          min-height: 24px;
          overflow: hidden;
          padding: 2px 12px;
          align-items: baseline;
          justify-content: start;
        }

        .value-type-cell {
          text-overflow: ellipsis;
          white-space: nowrap;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          min-height: 24px;
        }

        .value-type-value-with-link {
          display: flex;
          align-items: center;
        }

        .value-type-cell-no-mode {
          grid-column: 1 / 3;
        }

        .jump-to-button {
          display: flex;
          width: 20px;
          height: 20px;
          border: none;
          padding: 0;
          outline: none;
          justify-content: center;
          align-items: center;
          cursor: pointer;
        }

        .signed-divider {
          width: 1px;
          height: 15px;
          background-color: var(--color-details-hairline);
          margin: 0 4px;
        }
      </style>
      <div class="value-types">
        ${SORTED_VALUE_TYPES.map(type => this.valueTypes.has(type) ? this.showValue(type) : '')}
      </div>
    `, this.shadow, { host: this });
        // clang-format on
    }
    showValue(type) {
        if (isNumber(type)) {
            return this.renderNumberValues(type);
        }
        if (isPointer(type)) {
            return this.renderPointerValue(type);
        }
        throw new Error(`No known way to format ${type}`);
    }
    renderPointerValue(type) {
        const unsignedValue = this.parse({ type, signed: false });
        const address = getPointerAddress(type, this.buffer, this.endianness);
        const jumpDisabled = Number.isNaN(address) || BigInt(address) >= BigInt(this.memoryLength);
        const buttonTitle = jumpDisabled ? i18nString(UIStrings.addressOutOfRange) : i18nString(UIStrings.jumpToPointer);
        const iconColor = jumpDisabled ? 'var(--color-text-secondary)' : 'var(--color-primary)';
        // Disabled until https://crbug.com/1079231 is fixed.
        // clang-format off
        return html `
      <span class="value-type-cell-no-mode value-type-cell">${i18n.i18n.lockedString(type)}</span>
      <div class="value-type-cell">
        <div class="value-type-value-with-link" data-value="true">
        <span>${unsignedValue}</span>
          ${html `
              <button class="jump-to-button" data-jump="true" title=${buttonTitle} ?disabled=${jumpDisabled}
                @click=${this.onJumpToAddressClicked.bind(this, Number(address))}>
                <${IconButton.Icon.Icon.litTagName} .data=${{ iconName: 'link_icon', color: iconColor, width: '14px' }}>
                </${IconButton.Icon.Icon.litTagName}>
              </button>`}
        </div>
      </div>
    `;
        // clang-format on
    }
    onJumpToAddressClicked(address) {
        this.dispatchEvent(new JumpToPointerAddressEvent(address));
    }
    renderNumberValues(type) {
        // Disabled until https://crbug.com/1079231 is fixed.
        // clang-format off
        return html `
      <span class="value-type-cell">${i18n.i18n.lockedString(type)}</span>
      <div>
        <select title=${i18nString(UIStrings.changeValueTypeMode)}
          data-mode-settings="true"
          class="chrome-select"
          style="border: none; background-color: transparent; cursor: pointer; color: var(--color-text-secondary);"
          @change=${this.onValueTypeModeChange.bind(this, type)}>
            ${VALUE_TYPE_MODE_LIST.filter(x => isValidMode(type, x)).map(mode => {
            return html `
                <option value=${mode} .selected=${this.valueTypeModeConfig.get(type) === mode}>${i18n.i18n.lockedString(mode)}
                </option>`;
        })}
        </select>
      </div>
      ${this.renderSignedAndUnsigned(type)}
    `;
        // clang-format on
    }
    renderSignedAndUnsigned(type) {
        const unsignedValue = this.parse({ type, signed: false });
        const signedValue = this.parse({ type, signed: true });
        const mode = this.valueTypeModeConfig.get(type);
        const showSignedAndUnsigned = signedValue !== unsignedValue && mode !== "hex" /* Hexadecimal */ && mode !== "oct" /* Octal */;
        const unsignedRendered = html `<span class="value-type-cell"  title=${i18nString(UIStrings.unsignedValue)} data-value="true">${unsignedValue}</span>`;
        if (!showSignedAndUnsigned) {
            return unsignedRendered;
        }
        // Some values are too long to show in one line, we're putting them into the next line.
        const showInMultipleLines = type === "Integer 32-bit" /* Int32 */ || type === "Integer 64-bit" /* Int64 */;
        const signedRendered = html `<span data-value="true" title=${i18nString(UIStrings.signedValue)}>${signedValue}</span>`;
        if (showInMultipleLines) {
            return html `
        <div class="value-type-cell">
          ${unsignedRendered}
          ${signedRendered}
        </div>
        `;
        }
        return html `
      <div class="value-type-cell" style="flex-direction: row;">
        ${unsignedRendered}
        <span class="signed-divider"></span>
        ${signedRendered}
      </div>
    `;
    }
    onValueTypeModeChange(type, event) {
        event.preventDefault();
        const select = event.target;
        const mode = select.value;
        this.dispatchEvent(new ValueTypeModeChangedEvent(type, mode));
    }
    parse(data) {
        const mode = this.valueTypeModeConfig.get(data.type);
        return format({ buffer: this.buffer, type: data.type, endianness: this.endianness, signed: data.signed || false, mode });
    }
}
ComponentHelpers.CustomElements.defineComponent('devtools-linear-memory-inspector-interpreter-display', ValueInterpreterDisplay);
//# sourceMappingURL=ValueInterpreterDisplay.js.map