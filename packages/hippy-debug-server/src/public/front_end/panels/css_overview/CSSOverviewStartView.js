// Copyright 2019 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as i18n from '../../core/i18n/i18n.js';
import * as UI from '../../ui/legacy/legacy.js';
import { Events } from './CSSOverviewController.js';
const UIStrings = {
    /**
    *@description Label for the capture button in the CSS Overview Panel
    */
    captureOverview: 'Capture overview',
    /**
    *@description Title of the CSS Overview Panel
    */
    cssOverview: 'CSS Overview',
};
const str_ = i18n.i18n.registerUIStrings('panels/css_overview/CSSOverviewStartView.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class CSSOverviewStartView extends UI.Widget.Widget {
    _controller;
    constructor(controller) {
        super();
        this.registerRequiredCSS('panels/css_overview/cssOverviewStartView.css', { enableLegacyPatching: false });
        this._controller = controller;
        this._render();
    }
    _render() {
        const startButton = UI.UIUtils.createTextButton(i18nString(UIStrings.captureOverview), () => this._controller.dispatchEventToListeners(Events.RequestOverviewStart), '', true /* primary */);
        this.setDefaultFocusedElement(startButton);
        const fragment = UI.Fragment.Fragment.build `
  <div class="vbox overview-start-view">
  <h1>${i18nString(UIStrings.cssOverview)}</h1>
  <div>${startButton}</div>
  </div>
  `;
        this.contentElement.appendChild(fragment.element());
        this.contentElement.style.overflow = 'auto';
    }
}
//# sourceMappingURL=CSSOverviewStartView.js.map