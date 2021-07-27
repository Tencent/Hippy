// Copyright (c) 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../../../core/i18n/i18n.js';
import * as LitHtml from '../../lit-html/lit-html.js';
import * as ComponentHelpers from '../helpers/helpers.js';
import * as IconButton from '../icon_button/icon_button.js';
const UIStrings = {
    /**
    *@description Tooltip text that appears when hovering over a valid memory address (e.g. 0x0) in the address line in the Linear Memory Inspector.
    */
    enterAddress: 'Enter address',
    /**
    *@description Tooltip text that appears when hovering over the button to go back in history in the Linear Memory Navigator
    */
    goBackInAddressHistory: 'Go back in address history',
    /**
    *@description Tooltip text that appears when hovering over the button to go forward in history in the Linear Memory Navigator
    */
    goForwardInAddressHistory: 'Go forward in address history',
    /**
    *@description Tooltip text that appears when hovering over the page back icon in the Linear Memory Navigator
    */
    previousPage: 'Previous page',
    /**
    *@description Tooltip text that appears when hovering over the next page icon in the Linear Memory Navigator
    */
    nextPage: 'Next page',
    /**
    *@description Text to refresh the page
    */
    refresh: 'Refresh',
};
const str_ = i18n.i18n.registerUIStrings('ui/components/linear_memory_inspector/LinearMemoryNavigator.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
const { render, html } = LitHtml;
export class AddressInputChangedEvent extends Event {
    data;
    constructor(address, mode) {
        super('addressinputchanged');
        this.data = { address, mode };
    }
}
export class PageNavigationEvent extends Event {
    data;
    constructor(navigation) {
        super('pagenavigation', {});
        this.data = navigation;
    }
}
export class HistoryNavigationEvent extends Event {
    data;
    constructor(navigation) {
        super('historynavigation', {});
        this.data = navigation;
    }
}
export class RefreshRequestedEvent extends Event {
    constructor() {
        super('refreshrequested', {});
    }
}
export class LinearMemoryNavigator extends HTMLElement {
    static litTagName = LitHtml.literal `devtools-linear-memory-inspector-navigator`;
    shadow = this.attachShadow({ mode: 'open' });
    address = '0';
    error = undefined;
    valid = true;
    canGoBackInHistory = false;
    canGoForwardInHistory = false;
    set data(data) {
        this.address = data.address;
        this.error = data.error;
        this.valid = data.valid;
        this.canGoBackInHistory = data.canGoBackInHistory;
        this.canGoForwardInHistory = data.canGoForwardInHistory;
        this.render();
        const addressInput = this.shadow.querySelector('.address-input');
        if (addressInput) {
            if (data.mode === "Submitted" /* Submitted */) {
                addressInput.blur();
            }
            else if (data.mode === "InvalidSubmit" /* InvalidSubmit */) {
                addressInput.select();
            }
        }
    }
    render() {
        // Disabled until https://crbug.com/1079231 is fixed.
        // clang-format off
        const result = html `
      <style>
        .navigator {
          min-height: 24px;
          display: flex;
          flex-wrap: nowrap;
          justify-content: space-between;
          overflow: hidden;
          align-items: center;
          background-color: var(--color-background);
          color: var(--color-text-primary);
        }

        .navigator-item {
          display: flex;
          white-space: nowrap;
          overflow: hidden;
        }

        .address-input {
          text-align: center;
          outline: none;
          color: var(--color-text-primary);
          border: 1px solid var(--color-background-elevation-2);
          background: transparent;
        }

        .address-input.invalid {
          color: var(--color-accent-red);
        }

        .navigator-button {
          display: flex;
          width: 20px;
          height: 20px;
          background: transparent;
          overflow: hidden;
          border: none;
          padding: 0;
          outline: none;
          justify-content: center;
          align-items: center;
          cursor: pointer;
        }

        .navigator-button devtools-icon {
          height: 14px;
          width: 14px;
          min-height: 14px;
          min-width: 14px;
        }

        .navigator-button:enabled:hover devtools-icon {
          --icon-color: var(--color-text-primary);
        }

        .navigator-button:enabled:focus devtools-icon {
          --icon-color: var(--color-text-secondary);
        }
        </style>
      <div class="navigator">
        <div class="navigator-item">
          ${this.createButton({ icon: 'ic_undo_16x16_icon', title: i18nString(UIStrings.goBackInAddressHistory),
            event: new HistoryNavigationEvent("Backward" /* Backward */), enabled: this.canGoBackInHistory })}
          ${this.createButton({ icon: 'ic_redo_16x16_icon', title: i18nString(UIStrings.goForwardInAddressHistory),
            event: new HistoryNavigationEvent("Forward" /* Forward */), enabled: this.canGoForwardInHistory })}
        </div>
        <div class="navigator-item">
          ${this.createButton({ icon: 'ic_page_prev_16x16_icon', title: i18nString(UIStrings.previousPage),
            event: new PageNavigationEvent("Backward" /* Backward */), enabled: true })}
          ${this.createAddressInput()}
          ${this.createButton({ icon: 'ic_page_next_16x16_icon', title: i18nString(UIStrings.nextPage),
            event: new PageNavigationEvent("Forward" /* Forward */), enabled: true })}
        </div>
        ${this.createButton({ icon: 'refresh_12x12_icon', title: i18nString(UIStrings.refresh),
            event: new RefreshRequestedEvent(), enabled: true })}
      </div>
      `;
        render(result, this.shadow, { host: this });
        // clang-format on
    }
    createAddressInput() {
        const classMap = {
            'address-input': true,
            invalid: !this.valid,
        };
        return html `
      <input class=${LitHtml.Directives.classMap(classMap)} data-input="true" .value=${this.address}
        title=${this.valid ? i18nString(UIStrings.enterAddress) : this.error} @change=${this.onAddressChange.bind(this, "Submitted" /* Submitted */)} @input=${this.onAddressChange.bind(this, "Edit" /* Edit */)}/>`;
    }
    onAddressChange(mode, event) {
        const addressInput = event.target;
        this.dispatchEvent(new AddressInputChangedEvent(addressInput.value, mode));
    }
    createButton(data) {
        const iconColor = data.enabled ? 'var(--color-text-secondary)' : 'var(--color-background-highlight)';
        return html `
      <button class="navigator-button" ?disabled=${!data.enabled}
        data-button=${data.event.type} title=${data.title}
        @click=${this.dispatchEvent.bind(this, data.event)}>
        <${IconButton.Icon.Icon.litTagName} .data=${{ iconName: data.icon, color: iconColor, width: '14px' }}>
        </${IconButton.Icon.Icon.litTagName}>
      </button>`;
    }
}
ComponentHelpers.CustomElements.defineComponent('devtools-linear-memory-inspector-navigator', LinearMemoryNavigator);
//# sourceMappingURL=LinearMemoryNavigator.js.map