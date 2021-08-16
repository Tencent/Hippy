// Copyright (c) 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as ComponentHelpers from '../../components/helpers/helpers.js';
import * as LitHtml from '../../lit-html/lit-html.js';
export class Report extends HTMLElement {
    static litTagName = LitHtml.literal `devtools-report`;
    shadow = this.attachShadow({ mode: 'open' });
    reportTitle = '';
    set data({ reportTitle }) {
        this.reportTitle = reportTitle;
        this.render();
    }
    connectedCallback() {
        this.render();
    }
    render() {
        // Disabled until https://crbug.com/1079231 is fixed.
        // clang-format off
        LitHtml.render(LitHtml.html `
      <style>
        :host {
          display: block;
        }

        .content {
          background-color: var(--color-background);
          display: grid;
          grid-template-columns: min-content 1fr;
          user-select: text;
        }

        .report-title {
          padding: 12px 24px;
          font-size: 15px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          border-bottom: 1px solid var(--color-details-hairline);
          color: var(--color-text-primary);
          background-color: var(--color-background);
          grid-column-start: span 2;
        }
      </style>

      <div class="content">
        ${this.reportTitle ? LitHtml.html `<div class="report-title">${this.reportTitle}</div>` : LitHtml.nothing}
        <slot></slot>
      </div>
    `, this.shadow);
        // clang-format on
    }
}
export class ReportSectionHeader extends HTMLElement {
    static litTagName = LitHtml.literal `devtools-report-section-header`;
    shadow = this.attachShadow({ mode: 'open' });
    connectedCallback() {
        this.render();
    }
    render() {
        // Disabled until https://crbug.com/1079231 is fixed.
        // clang-format off
        LitHtml.render(LitHtml.html `
      <style>
        :host {
          grid-column-start: span 2;
        }

        .section-header {
          padding: 12px;
          margin-left: 18px;
          display: flex;
          flex-direction: row;
          align-items: center;
          flex: auto;
          text-overflow: ellipsis;
          overflow: hidden;
          font-weight: bold;
          color: var(--color-text-primary);
        }
      </style>
      <div class="section-header">
        <slot></slot>
      </div>
    `, this.shadow);
        // clang-format on
    }
}
export class ReportSectionDivider extends HTMLElement {
    static litTagName = LitHtml.literal `devtools-report-divider`;
    shadow = this.attachShadow({ mode: 'open' });
    connectedCallback() {
        this.render();
    }
    render() {
        // Disabled until https://crbug.com/1079231 is fixed.
        // clang-format off
        LitHtml.render(LitHtml.html `
      <style>
        :host {
          grid-column-start: span 2;
        }

        .section-divider {
          border-bottom: 1px solid var(--color-details-hairline);
        }
      </style>
      <div class="section-divider">
      </div>
    `, this.shadow);
        // clang-format on
    }
}
export class ReportKey extends HTMLElement {
    static litTagName = LitHtml.literal `devtools-report-key`;
    shadow = this.attachShadow({ mode: 'open' });
    connectedCallback() {
        this.render();
    }
    render() {
        // Disabled until https://crbug.com/1079231 is fixed.
        // clang-format off
        LitHtml.render(LitHtml.html `
      <style>
        :host {
          line-height: 28px;
          margin: 0 0 8px 0;
        }

        .key {
          color: var(--color-text-secondary);
          padding: 0 6px;
          text-align: right;
          white-space: pre;
        }
      </style>
      <div class="key"><slot></slot></div>
    `, this.shadow);
        // clang-format on
    }
}
export class ReportValue extends HTMLElement {
    static litTagName = LitHtml.literal `devtools-report-value`;
    shadow = this.attachShadow({ mode: 'open' });
    connectedCallback() {
        this.render();
    }
    render() {
        // Disabled until https://crbug.com/1079231 is fixed.
        // clang-format off
        LitHtml.render(LitHtml.html `
      <style>
        :host {
          line-height: 28px;
          margin: 0 0 8px 0;
          min-width: 150px;
        }

        .value {
          color: var(--color-text-primary);
          margin-inline-start: 0;
          padding: 0 6px;
        }
      </style>
      <div class="value"><slot></slot></div>
    `, this.shadow);
        // clang-format on
    }
}
ComponentHelpers.CustomElements.defineComponent('devtools-report', Report);
ComponentHelpers.CustomElements.defineComponent('devtools-report-section-header', ReportSectionHeader);
ComponentHelpers.CustomElements.defineComponent('devtools-report-key', ReportKey);
ComponentHelpers.CustomElements.defineComponent('devtools-report-value', ReportValue);
ComponentHelpers.CustomElements.defineComponent('devtools-report-divider', ReportSectionDivider);
//# sourceMappingURL=ReportView.js.map