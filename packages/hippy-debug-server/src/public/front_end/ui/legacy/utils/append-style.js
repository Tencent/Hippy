// Copyright 2019 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Root from '../../../core/root/root.js';
import * as ThemeSupport from '../theme_support/theme_support.js';
export function appendStyle(node, cssFile, options = {
    enableLegacyPatching: false,
}) {
    const content = Root.Runtime.cachedResources.get(cssFile) || '';
    if (!content) {
        console.error(cssFile + ' not preloaded. Check module.json');
    }
    let styleElement = document.createElement('style');
    styleElement.textContent = content;
    node.appendChild(styleElement);
    /**
     * We are incrementally removing patching support in favour of CSS variables for supporting dark mode.
     * See https://docs.google.com/document/d/1QrSSRsJRzaQBY3zz73ZL84bTcFUV60yMtE5cuu6ED14 for details.
     */
    if (options.enableLegacyPatching) {
        const themeStyleSheet = ThemeSupport.ThemeSupport.instance().themeStyleSheet(cssFile, content);
        if (themeStyleSheet) {
            styleElement = document.createElement('style');
            styleElement.textContent = themeStyleSheet + '\n' + Root.Runtime.Runtime.resolveSourceURL(cssFile + '.theme');
            node.appendChild(styleElement);
        }
    }
}
//# sourceMappingURL=append-style.js.map