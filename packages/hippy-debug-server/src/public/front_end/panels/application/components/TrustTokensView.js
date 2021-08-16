// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../../../core/i18n/i18n.js';
import * as DataGrid from '../../../ui/components/data_grid/data_grid.js';
import * as ComponentHelpers from '../../../ui/components/helpers/helpers.js';
import * as IconButton from '../../../ui/components/icon_button/icon_button.js';
import * as LitHtml from '../../../ui/lit-html/lit-html.js';
const UIStrings = {
    /**
    *@description Text for the issuer of an item
    */
    issuer: 'Issuer',
    /**
    *@description Column header for Trust Token table
    */
    storedTokenCount: 'Stored token count',
    /**
    *@description Hover text for an info icon in the Trust Token panel
    */
    allStoredTrustTokensAvailableIn: 'All stored Trust Tokens available in this browser instance.',
    /**
     * @description Text shown instead of a table when the table would be empty.
     */
    noTrustTokensStored: 'No Trust Tokens are currently stored.',
    /**
     * @description Each row in the Trust Token table has a delete button. This is the text shown
     * when hovering over this button. The placeholder is a normal URL, indicating the site which
     * provided the Trust Tokens that will be deleted when the button is clicked.
     * @example {https://google.com} PH1
     */
    deleteTrustTokens: 'Delete all stored Trust Tokens issued by {PH1}.',
};
const str_ = i18n.i18n.registerUIStrings('panels/application/components/TrustTokensView.ts', UIStrings);
export const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class TrustTokensView extends HTMLElement {
    shadow = this.attachShadow({ mode: 'open' });
    tokens = [];
    deleteClickHandler = () => { };
    connectedCallback() {
        this.render();
    }
    set data(data) {
        this.tokens = data.tokens;
        this.deleteClickHandler = data.deleteClickHandler;
        this.render();
    }
    render() {
        LitHtml.render(LitHtml.html `
      <style>
        :host {
          padding: 20px;
        }

        .heading {
          font-size: 15px;
        }

        devtools-data-grid-controller {
          border: 1px solid var(--color-details-hairline);
          margin-top: 20px;
        }

        .info-icon {
          vertical-align: text-bottom;
          height: 14px;
        }

        .no-tt-message {
          margin-top: 20px;
        }
      </style>
      <div>
        <span class="heading">Trust Tokens</span>
        <${IconButton.Icon.Icon.litTagName} class="info-icon" title=${i18nString(UIStrings.allStoredTrustTokensAvailableIn)}
          .data=${{ iconName: 'ic_info_black_18dp', color: 'var(--color-link)', width: '14px' }}>
        </${IconButton.Icon.Icon.litTagName}>
        ${this.renderGridOrNoDataMessage()}
      </div>
    `, this.shadow);
    }
    renderGridOrNoDataMessage() {
        if (this.tokens.length === 0) {
            return LitHtml.html `<div class="no-tt-message">${i18nString(UIStrings.noTrustTokensStored)}</div>`;
        }
        const gridData = {
            columns: [
                {
                    id: 'issuer',
                    title: i18nString(UIStrings.issuer),
                    widthWeighting: 10,
                    hideable: false,
                    visible: true,
                    sortable: true,
                },
                {
                    id: 'count',
                    title: i18nString(UIStrings.storedTokenCount),
                    widthWeighting: 5,
                    hideable: false,
                    visible: true,
                    sortable: true,
                },
                {
                    id: 'delete-button',
                    title: '',
                    widthWeighting: 1,
                    hideable: false,
                    visible: true,
                    sortable: false,
                },
            ],
            rows: this.buildRowsFromTokens(),
            initialSort: {
                columnId: 'issuer',
                direction: "ASC" /* ASC */,
            },
        };
        return LitHtml.html `
      <${DataGrid.DataGridController.DataGridController.litTagName} .data=${gridData}></${DataGrid.DataGridController.DataGridController.litTagName}>
    `;
    }
    buildRowsFromTokens() {
        const tokens = this.tokens.filter(token => token.count > 0);
        return tokens.map(token => ({
            cells: [
                {
                    columnId: 'delete-button',
                    value: removeTrailingSlash(token.issuerOrigin),
                    renderer: this.deleteButtonRenderer.bind(this),
                },
                { columnId: 'issuer', value: removeTrailingSlash(token.issuerOrigin) },
                { columnId: 'count', value: token.count },
            ],
        }));
    }
    deleteButtonRenderer(issuer) {
        // clang-format off
        return LitHtml.html `
      <style>
        .delete-button {
          width: 16px;
          height: 16px;
          background: transparent;
          overflow: hidden;
          border: none;
          padding: 0;
          outline: none;
          cursor: pointer;
        }

        .delete-button:hover devtools-icon {
          --icon-color: var(--color-text-primary);
        }

        .delete-button:focus devtools-icon {
          --icon-color: var(--color-text-secondary);
        }

        .button-container {
          display: block;
          text-align: center;
        }
      </style>
      <!-- Wrap the button in a container, otherwise we can't center it inside the column. -->
      <span class="button-container">
        <button class="delete-button"
          title=${i18nString(UIStrings.deleteTrustTokens, { PH1: issuer })}
          @click=${() => this.deleteClickHandler(issuer)}>
          <${IconButton.Icon.Icon.litTagName} .data=${{ iconName: 'trash_bin_icon', color: 'var(--color-text-secondary)', width: '9px', height: '14px' }}>
          </${IconButton.Icon.Icon.litTagName}>
        </button>
      </span>`;
        // clang-format on
    }
}
function removeTrailingSlash(s) {
    return s.replace(/\/$/, '');
}
ComponentHelpers.CustomElements.defineComponent('devtools-trust-tokens-storage-view', TrustTokensView);
//# sourceMappingURL=TrustTokensView.js.map