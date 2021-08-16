// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as LitHtml from '../../lit-html/lit-html.js';
export function init() {
    const container = document.createElement('ul');
    // clang-format off
    LitHtml.render(LitHtml.html `

  <style>
    .docs-breadcrumbs {
      display: flex;
      list-style: none;
      position: fixed;
      background: rgb(255 255 255 / .8);
      padding: 5px;
      bottom: 0;
      left: 10px;
      width: 300px;
    }

    .docs-breadcrumbs li a {
      display: block;
      padding: 10px;
      font-size: 16px;
    }

    .docs-breadcrumbs span {
      font-size: 20px;
    }
  </style>

  <ul class="docs-breadcrumbs">
    <li><a href="/">Index</a></li>
    <li><a href=".">All component examples</a></li>
  </ul>`, container);
    // clang-format on
    document.body.appendChild(container);
}
//# sourceMappingURL=create_breadcrumbs.js.map