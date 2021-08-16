// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
export function set(component, name, value) {
    /*
     * TypeScript only types host as an Element, but within a ShadowRoot of a Custom Element it will be an HTMLElement so we can safely cast here.
     */
    component.style.setProperty(name, value);
}
//# sourceMappingURL=set-css-property.js.map