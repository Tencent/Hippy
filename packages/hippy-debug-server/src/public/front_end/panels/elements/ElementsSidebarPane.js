// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as UI from '../../ui/legacy/legacy.js';
import { ComputedStyleModel } from './ComputedStyleModel.js';
export class ElementsSidebarPane extends UI.Widget.VBox {
    _computedStyleModel;
    _updateThrottler;
    _updateWhenVisible;
    constructor(delegatesFocus) {
        super(true, delegatesFocus);
        this.element.classList.add('flex-none');
        this._computedStyleModel = new ComputedStyleModel();
        this._computedStyleModel.addEventListener("ComputedStyleChanged" /* ComputedStyleChanged */, this.onCSSModelChanged, this);
        this._updateThrottler = new Common.Throttler.Throttler(100);
        this._updateWhenVisible = false;
    }
    node() {
        return this._computedStyleModel.node();
    }
    cssModel() {
        return this._computedStyleModel.cssModel();
    }
    computedStyleModel() {
        return this._computedStyleModel;
    }
    async doUpdate() {
        return;
    }
    update() {
        this._updateWhenVisible = !this.isShowing();
        if (this._updateWhenVisible) {
            return;
        }
        this._updateThrottler.schedule(innerUpdate.bind(this));
        function innerUpdate() {
            return this.isShowing() ? this.doUpdate() : Promise.resolve();
        }
    }
    wasShown() {
        super.wasShown();
        if (this._updateWhenVisible) {
            this.update();
        }
    }
    onCSSModelChanged(_event) {
    }
}
//# sourceMappingURL=ElementsSidebarPane.js.map