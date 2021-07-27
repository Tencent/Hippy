// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as UI from '../../ui/legacy/legacy.js';
export class SimpleApp {
    presentUI(document) {
        const rootView = new UI.RootView.RootView();
        UI.InspectorView.InspectorView.instance().show(rootView.element);
        rootView.attachToDocument(document);
        rootView.focus();
    }
}
let simpleAppProviderInstance;
export class SimpleAppProvider {
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!simpleAppProviderInstance || forceNew) {
            simpleAppProviderInstance = new SimpleAppProvider();
        }
        return simpleAppProviderInstance;
    }
    createApp() {
        return new SimpleApp();
    }
}
//# sourceMappingURL=SimpleApp.js.map