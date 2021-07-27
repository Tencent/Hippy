// Copyright (c) 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import '../../legacy/legacy.js'; // Required for <x-link>.
import * as ComponentHelpers from '../../components/helpers/helpers.js';
import * as LitHtml from '../../lit-html/lit-html.js';
import { getMarkdownLink } from './MarkdownLinksMap.js';
/**
 * Component to render link from parsed markdown.
 * Parsed links from markdown are not directly rendered, instead they have to be added to the <key, link> map in MarkdownLinksMap.ts.
 * This makes sure that all links are accounted for and no bad links are introduced to devtools via markdown.
 */
export class MarkdownLink extends HTMLElement {
    static litTagName = LitHtml.literal `devtools-markdown-link`;
    shadow = this.attachShadow({ mode: 'open' });
    linkText = '';
    linkUrl = '';
    set data(data) {
        const { key, title } = data;
        const markdownLink = getMarkdownLink(key);
        this.linkText = title;
        this.linkUrl = markdownLink;
        this.render();
    }
    render() {
        // clang-format off
        const output = LitHtml.html `
      <style>
        .devtools-link {
          color: var(--color-link);
          text-decoration: none;
        }

        .devtools-link:hover {
          text-decoration: underline;
        }
      </style>
      <x-link class="devtools-link" href=${this.linkUrl}>${this.linkText}</x-link>
    `;
        LitHtml.render(output, this.shadow);
        // clang-format on
    }
}
ComponentHelpers.CustomElements.defineComponent('devtools-markdown-link', MarkdownLink);
//# sourceMappingURL=MarkdownLink.js.map