// Copyright (c) 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as ComponentHelpers from '../../../ui/components/helpers/helpers.js';
import * as LitHtml from '../../../ui/lit-html/lit-html.js';
const { render, html } = LitHtml;
export class ComputedStyleProperty extends HTMLElement {
    shadow = this.attachShadow({ mode: 'open' });
    inherited = false;
    traceable = false;
    onNavigateToSource = () => { };
    set data(data) {
        this.inherited = data.inherited;
        this.traceable = data.traceable;
        this.onNavigateToSource = data.onNavigateToSource;
        this.render();
    }
    render() {
        // Disabled until https://crbug.com/1079231 is fixed.
        // clang-format off
        render(html `
      <style>
        :host {
          position: relative;
          overflow: hidden;
          flex: auto;
          text-overflow: ellipsis;
        }

        .computed-style-property {
          min-height: 16px;
          box-sizing: border-box;
          padding-top: 2px;
          white-space: nowrap;
        }

        .computed-style-property.inherited {
          opacity: 50%;
        }

        slot[name="property-name"],
        slot[name="property-value"] {
          overflow: hidden;
          text-overflow: ellipsis;
        }

        slot[name="property-name"] {
          width: 16em;
          max-width: 52%;
          display: inline-block;
          vertical-align: text-top;
        }

        slot[name="property-value"] {
          margin-left: 2em;
        }

        .goto {
          --size: 16px;

          display: none;
          position: absolute;
          width: var(--size);
          height: var(--size);
          margin: -1px 0 0 calc(-1 * var(--size));
          -webkit-mask-image: var(--image-file-mediumIcons);
          -webkit-mask-position: -32px 48px;
          background-color: var(--legacy-active-control-bg-color);
        }

        .computed-style-property:hover .goto {
          display: inline-block;
        }

        .hidden {
          display: none;
        }
        /* narrowed styles */
        :host-context(.computed-narrow) .computed-style-property {
          white-space: normal;
        }

        :host-context(.computed-narrow) slot[name="property-name"],
        :host-context(.computed-narrow) slot[name="property-value"] {
          display: inline-block;
          width: 100%;
          max-width: 100%;
          margin-left: 0;
          white-space: nowrap;
        }

        :host-context(.computed-narrow) .goto {
          display: none;
        }
        /* high-contrast styles */
        @media (forced-colors: active) {
          .computed-style-property.inherited {
            opacity: 100%;
          }

          :host-context(.monospace.computed-properties) .computed-style-property:hover {
            forced-color-adjust: none;
            background-color: Highlight;
          }

          :host-context(.monospace.computed-properties) .computed-style-property:hover * {
            color: HighlightText;
          }

          :host-context(.monospace.computed-properties) .goto {
            background-color: HighlightText;
          }
        }
      </style>

      <div class="computed-style-property ${this.inherited ? 'inherited' : ''}">
        <slot name="property-name"></slot>
        <span class="hidden" aria-hidden="false">: </span>
        ${this.traceable ?
            html `<span class="goto" @click=${this.onNavigateToSource}></span>` :
            null}
        <slot name="property-value"></slot>
        <span class="hidden" aria-hidden="false">;</span>
      </div>
    `, this.shadow, {
            host: this,
        });
        // clang-format on
    }
}
ComponentHelpers.CustomElements.defineComponent('devtools-computed-style-property', ComputedStyleProperty);
//# sourceMappingURL=ComputedStyleProperty.js.map