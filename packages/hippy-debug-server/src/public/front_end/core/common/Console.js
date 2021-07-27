// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import { ObjectWrapper } from './Object.js';
import { reveal } from './Revealer.js';
let consoleInstance;
export class Console extends ObjectWrapper {
    _messages;
    /**
     * Instantiable via the instance() factory below.
     */
    constructor() {
        super();
        this._messages = [];
    }
    static instance({ forceNew } = { forceNew: false }) {
        if (!consoleInstance || forceNew) {
            consoleInstance = new Console();
        }
        return consoleInstance;
    }
    addMessage(text, level, show) {
        const message = new Message(text, level || MessageLevel.Info, Date.now(), show || false);
        this._messages.push(message);
        this.dispatchEventToListeners(Events.MessageAdded, message);
    }
    log(text) {
        this.addMessage(text, MessageLevel.Info);
    }
    warn(text) {
        this.addMessage(text, MessageLevel.Warning);
    }
    error(text) {
        this.addMessage(text, MessageLevel.Error, true);
    }
    messages() {
        return this._messages;
    }
    show() {
        this.showPromise();
    }
    showPromise() {
        return reveal(this);
    }
}
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var Events;
(function (Events) {
    Events["MessageAdded"] = "messageAdded";
})(Events || (Events = {}));
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var MessageLevel;
(function (MessageLevel) {
    MessageLevel["Info"] = "info";
    MessageLevel["Warning"] = "warning";
    MessageLevel["Error"] = "error";
})(MessageLevel || (MessageLevel = {}));
export class Message {
    text;
    level;
    timestamp;
    show;
    constructor(text, level, timestamp, show) {
        this.text = text;
        this.level = level;
        this.timestamp = (typeof timestamp === 'number') ? timestamp : Date.now();
        this.show = show;
    }
}
//# sourceMappingURL=Console.js.map