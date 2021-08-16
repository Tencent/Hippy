// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as ComponentHelpers from '../../components/helpers/helpers.js';
import * as LitHtml from '../../lit-html/lit-html.js';
export class ExpandableList extends HTMLElement {
    static litTagName = LitHtml.literal `devtools-expandable-list`;
    shadow = this.attachShadow({ mode: 'open' });
    expanded = false;
    rows = [];
    set data(data) {
        this.rows = data.rows;
        this.render();
    }
    onArrowClick() {
        this.expanded = !this.expanded;
        this.render();
    }
    render() {
        if (this.rows.length < 1) {
            return;
        }
        // Disabled until https://crbug.com/1079231 is fixed.
        // clang-format off
        LitHtml.render(LitHtml.html `
      <style>
        div {
          line-height: 1.7em;
        }

        .arrow-icon-button {
          cursor: pointer;
          padding: 1px 0;
          border: none;
          background: none;
        }

        .arrow-icon {
          display: inline-block;
          -webkit-mask-image: url(Images/treeoutlineTriangles.svg);
          -webkit-mask-size: 32px 24px;
          -webkit-mask-position: 0 0;
          background-color: var(--color-text-primary);
          margin-top: 2px;
          height: 12px;
          width: 13px;
        }

        .arrow-icon.expanded {
          -webkit-mask-position: -16px 0;
        }

        .expandable-list-container {
          display: flex;
          margin-top: 4px;
        }

        .expandable-list-items {
          overflow: hidden;
        }

        .link,
        .devtools-link {
          color: var(--color-link);
          text-decoration: underline;
          cursor: pointer;
          padding: 2px 0; /* adjust focus ring size */
        }

        button.link {
          border: none;
          background: none;
          font-family: inherit;
          font-size: inherit;
        }
      </style>
      <div class="expandable-list-container">
        <div>
          ${this.rows.length > 1 ?
            LitHtml.html `
              <button @click=${() => this.onArrowClick()} class="arrow-icon-button">
                <span class="arrow-icon ${this.expanded ? 'expanded' : ''}"></span>
              </button>
            `
            : LitHtml.nothing}
        </div>
        <div class="expandable-list-items">
          ${this.rows.filter((_, index) => (this.expanded || index === 0)).map(row => LitHtml.html `
            ${row}
          `)}
        </div>
      </div>
    `, this.shadow);
        // clang-format on
    }
}
ComponentHelpers.CustomElements.defineComponent('devtools-expandable-list', ExpandableList);
//# sourceMappingURL=ExpandableList.js.map