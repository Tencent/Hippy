// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
const DARK_THEME_CLASS = '-theme-with-dark-background';
function toggleDarkMode() {
    document.body.classList.toggle(DARK_THEME_CLASS);
}
export function init() {
    const isDarkAlready = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (isDarkAlready) {
        document.body.classList.add(DARK_THEME_CLASS);
    }
    window.addEventListener('load', () => {
        const button = document.createElement('button');
        button.innerText = 'Toggle light/dark mode';
        button.style.position = 'fixed';
        button.style.bottom = '10px';
        button.style.right = '10px';
        button.style.width = '200px';
        button.style.fontSize = '16px';
        button.style.padding = '5px';
        button.style.cursor = 'pointer';
        button.addEventListener('click', event => {
            event.preventDefault();
            toggleDarkMode();
        });
        document.body.appendChild(button);
    });
}
//# sourceMappingURL=toggle_dark_mode.js.map