// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import { VBox } from './Widget.js';
import { ZoomManager } from './ZoomManager.js';
export class RootView extends VBox {
    _window;
    constructor() {
        super();
        this.markAsRoot();
        this.element.classList.add('root-view');
        this.registerRequiredCSS('ui/legacy/rootView.css', { enableLegacyPatching: false });
        this.element.setAttribute('spellcheck', 'false');
    }
    attachToDocument(document) {
        if (document.defaultView) {
            document.defaultView.addEventListener('resize', this.doResize.bind(this), false);
        }
        this._window = document.defaultView;
        this.doResize();
        this.show(document.body);
    }
    doResize() {
        if (this._window) {
            const size = this.constraints().minimum;
            const zoom = ZoomManager.instance().zoomFactor();
            const right = Math.min(0, this._window.innerWidth - size.width / zoom);
            this.element.style.marginRight = right + 'px';
            const bottom = Math.min(0, this._window.innerHeight - size.height / zoom);
            this.element.style.marginBottom = bottom + 'px';
        }
        super.doResize();
    }
}
//# sourceMappingURL=RootView.js.map