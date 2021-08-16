// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as i18n from '../../core/i18n/i18n.js';
import { VBox } from './Widget.js';
const UIStrings = {
    /**
    *@description Text in dialog box when the target page crashed
    */
    devtoolsWasDisconnectedFromThe: 'DevTools was disconnected from the page.',
    /**
    *@description Text content of content element
    */
    oncePageIsReloadedDevtoolsWill: 'Once page is reloaded, DevTools will automatically reconnect.',
};
const str_ = i18n.i18n.registerUIStrings('ui/legacy/TargetCrashedScreen.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class TargetCrashedScreen extends VBox {
    _hideCallback;
    constructor(hideCallback) {
        super(true);
        this.registerRequiredCSS('ui/legacy/targetCrashedScreen.css', { enableLegacyPatching: false });
        this.contentElement.createChild('div', 'message').textContent =
            i18nString(UIStrings.devtoolsWasDisconnectedFromThe);
        this.contentElement.createChild('div', 'message').textContent =
            i18nString(UIStrings.oncePageIsReloadedDevtoolsWill);
        this._hideCallback = hideCallback;
    }
    willHide() {
        this._hideCallback.call(null);
    }
}
//# sourceMappingURL=TargetCrashedScreen.js.map