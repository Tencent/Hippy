// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Host from '../../core/host/host.js';
import { Context } from './Context.js'; // eslint-disable-line no-unused-vars
import { KeyboardShortcut } from './KeyboardShortcut.js';
import { ForwardedShortcut, ShortcutRegistry } from './ShortcutRegistry.js'; // eslint-disable-line no-unused-vars
export class ForwardedInputEventHandler {
    constructor() {
        Host.InspectorFrontendHost.InspectorFrontendHostInstance.events.addEventListener(Host.InspectorFrontendHostAPI.Events.KeyEventUnhandled, this._onKeyEventUnhandled, this);
    }
    _onKeyEventUnhandled(event) {
        const data = event.data;
        const type = data.type;
        const key = data.key;
        const keyCode = data.keyCode;
        const modifiers = data.modifiers;
        if (type !== 'keydown') {
            return;
        }
        const context = Context.instance();
        const shortcutRegistry = ShortcutRegistry.instance();
        context.setFlavor(ForwardedShortcut, ForwardedShortcut.instance);
        shortcutRegistry.handleKey(KeyboardShortcut.makeKey(keyCode, modifiers), key);
        context.setFlavor(ForwardedShortcut, null);
    }
}
new ForwardedInputEventHandler();
//# sourceMappingURL=ForwardedInputEventHandler.js.map