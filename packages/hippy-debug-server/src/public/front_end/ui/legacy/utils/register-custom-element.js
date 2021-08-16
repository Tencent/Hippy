// Copyright 2019 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
export function registerCustomElement(localName, typeExtension, definition) {
    self.customElements.define(typeExtension, class extends definition {
        constructor() {
            // The JSDoc above does not allow the super call to have no params, but
            // it seems to be the nearest to something both Closure and TS understand.
            // @ts-ignore crbug.com/1011811: Fix after Closure has been removed.
            super();
            // TODO(einbinder) convert to classes and custom element tags
            this.setAttribute('is', typeExtension);
        }
    }, { extends: localName });
    return () => document.createElement(localName, { is: typeExtension });
}
//# sourceMappingURL=register-custom-element.js.map