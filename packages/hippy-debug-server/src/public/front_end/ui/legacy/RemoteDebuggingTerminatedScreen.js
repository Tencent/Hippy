// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as i18n from '../../core/i18n/i18n.js';
import { Dialog } from './Dialog.js';
import { SizeBehavior } from './GlassPane.js';
import { createTextButton, formatLocalized } from './UIUtils.js';
import { VBox } from './Widget.js';
const UIStrings = {
    /**
     * @description Text in a dialog box showing how to reconnect to DevTools when remote debugging has been terminated.
     * "Remote debugging" here means that DevTools on a PC is inspecting a website running on an actual mobile device
     * (see https://developer.chrome.com/docs/devtools/remote-debugging/).
     * "Reconnect when ready", refers to the state of the mobile device. The developer first has to put the mobile
     * device back in a state where it can be inspected, before DevTools can reconnect to it.
     */
    reconnectWhenReadyByReopening: 'Reconnect when ready by reopening DevTools.',
    /**
     * @description Text on a button to reconnect Devtools when remote debugging terminated.
     * "Remote debugging" here means that DevTools on a PC is inspecting a website running on an actual mobile device
     * (see https://developer.chrome.com/docs/devtools/remote-debugging/).
     */
    reconnectDevtools: 'Reconnect `DevTools`',
};
const str_ = i18n.i18n.registerUIStrings('ui/legacy/RemoteDebuggingTerminatedScreen.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class RemoteDebuggingTerminatedScreen extends VBox {
    constructor(reason) {
        super(true);
        this.registerRequiredCSS('ui/legacy/remoteDebuggingTerminatedScreen.css', { enableLegacyPatching: false });
        const message = this.contentElement.createChild('div', 'message');
        const reasonElement = message.createChild('span', 'reason');
        reasonElement.textContent = reason;
        message.appendChild(formatLocalized('Debugging connection was closed. Reason: %s', [reasonElement]));
        this.contentElement.createChild('div', 'message').textContent = i18nString(UIStrings.reconnectWhenReadyByReopening);
        const button = createTextButton(i18nString(UIStrings.reconnectDevtools), () => window.location.reload());
        this.contentElement.createChild('div', 'button').appendChild(button);
    }
    static show(reason) {
        const dialog = new Dialog();
        dialog.setSizeBehavior(SizeBehavior.MeasureContent);
        dialog.addCloseButton();
        dialog.setDimmed(true);
        new RemoteDebuggingTerminatedScreen(reason).show(dialog.contentElement);
        dialog.show();
    }
}
//# sourceMappingURL=RemoteDebuggingTerminatedScreen.js.map