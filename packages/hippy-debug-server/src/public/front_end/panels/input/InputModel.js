// Copyright 2019 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as SDK from '../../core/sdk/sdk.js';
export class InputModel extends SDK.SDKModel.SDKModel {
    _inputAgent;
    _eventDispatchTimer;
    _dispatchEventDataList;
    _finishCallback;
    _dispatchingIndex;
    _lastEventTime;
    _replayPaused;
    constructor(target) {
        super(target);
        this._inputAgent = target.inputAgent();
        this._eventDispatchTimer = 0;
        this._dispatchEventDataList = [];
        this._finishCallback = null;
        this._reset();
    }
    _reset() {
        this._lastEventTime = null;
        this._replayPaused = false;
        this._dispatchingIndex = 0;
        window.clearTimeout(this._eventDispatchTimer);
    }
    setEvents(tracingModel) {
        this._dispatchEventDataList = [];
        for (const process of tracingModel.sortedProcesses()) {
            for (const thread of process.sortedThreads()) {
                this._processThreadEvents(tracingModel, thread);
            }
        }
        function compareTimestamp(a, b) {
            return a.timestamp - b.timestamp;
        }
        this._dispatchEventDataList.sort(compareTimestamp);
    }
    startReplay(finishCallback) {
        this._reset();
        this._finishCallback = finishCallback;
        if (this._dispatchEventDataList.length) {
            this._dispatchNextEvent();
        }
        else {
            this._replayStopped();
        }
    }
    pause() {
        window.clearTimeout(this._eventDispatchTimer);
        if (this._dispatchingIndex >= this._dispatchEventDataList.length) {
            this._replayStopped();
        }
        else {
            this._replayPaused = true;
        }
    }
    resume() {
        this._replayPaused = false;
        if (this._dispatchingIndex < this._dispatchEventDataList.length) {
            this._dispatchNextEvent();
        }
    }
    _processThreadEvents(_tracingModel, thread) {
        for (const event of thread.events()) {
            if (event.name === 'EventDispatch' && this._isValidInputEvent(event.args.data)) {
                this._dispatchEventDataList.push(event.args.data);
            }
        }
    }
    _isValidInputEvent(eventData) {
        return this._isMouseEvent(eventData) || this._isKeyboardEvent(eventData);
    }
    _isMouseEvent(eventData) {
        if (!MOUSE_EVENT_TYPE_TO_REQUEST_TYPE.has(eventData.type)) {
            return false;
        }
        if (!('x' in eventData && 'y' in eventData)) {
            return false;
        }
        return true;
    }
    _isKeyboardEvent(eventData) {
        if (!KEYBOARD_EVENT_TYPE_TO_REQUEST_TYPE.has(eventData.type)) {
            return false;
        }
        if (!('code' in eventData && 'key' in eventData)) {
            return false;
        }
        return true;
    }
    _dispatchNextEvent() {
        const eventData = this._dispatchEventDataList[this._dispatchingIndex];
        this._lastEventTime = eventData.timestamp;
        if (MOUSE_EVENT_TYPE_TO_REQUEST_TYPE.has(eventData.type)) {
            this._dispatchMouseEvent(eventData);
        }
        else if (KEYBOARD_EVENT_TYPE_TO_REQUEST_TYPE.has(eventData.type)) {
            this._dispatchKeyEvent(eventData);
        }
        ++this._dispatchingIndex;
        if (this._dispatchingIndex < this._dispatchEventDataList.length) {
            const waitTime = (this._dispatchEventDataList[this._dispatchingIndex].timestamp - this._lastEventTime) / 1000;
            this._eventDispatchTimer = window.setTimeout(this._dispatchNextEvent.bind(this), waitTime);
        }
        else {
            this._replayStopped();
        }
    }
    async _dispatchMouseEvent(eventData) {
        const type = MOUSE_EVENT_TYPE_TO_REQUEST_TYPE.get(eventData.type);
        if (!type) {
            throw new Error(`Could not find mouse event type for eventData ${eventData.type}`);
        }
        const buttonActionName = BUTTONID_TO_ACTION_NAME.get(eventData.button);
        const params = {
            type,
            x: eventData.x,
            y: eventData.y,
            modifiers: eventData.modifiers,
            button: (eventData.type === 'mousedown' || eventData.type === 'mouseup') ? buttonActionName :
                "none" /* None */,
            buttons: eventData.buttons,
            clickCount: eventData.clickCount,
            deltaX: eventData.deltaX,
            deltaY: eventData.deltaY,
        };
        await this._inputAgent.invoke_dispatchMouseEvent(params);
    }
    async _dispatchKeyEvent(eventData) {
        const type = KEYBOARD_EVENT_TYPE_TO_REQUEST_TYPE.get(eventData.type);
        if (!type) {
            throw new Error(`Could not find key event type for eventData ${eventData.type}`);
        }
        const text = eventData.type === 'keypress' ? eventData.key[0] : undefined;
        const params = {
            type,
            modifiers: eventData.modifiers,
            text: text,
            unmodifiedText: text ? text.toLowerCase() : undefined,
            code: eventData.code,
            key: eventData.key,
        };
        await this._inputAgent.invoke_dispatchKeyEvent(params);
    }
    _replayStopped() {
        window.clearTimeout(this._eventDispatchTimer);
        this._reset();
        if (this._finishCallback) {
            this._finishCallback();
        }
    }
}
const MOUSE_EVENT_TYPE_TO_REQUEST_TYPE = new Map([
    ['mousedown', "mousePressed" /* MousePressed */],
    ['mouseup', "mouseReleased" /* MouseReleased */],
    ['mousemove', "mouseMoved" /* MouseMoved */],
    ['wheel', "mouseWheel" /* MouseWheel */],
]);
const KEYBOARD_EVENT_TYPE_TO_REQUEST_TYPE = new Map([
    ['keydown', "keyDown" /* KeyDown */],
    ['keyup', "keyUp" /* KeyUp */],
    ['keypress', "char" /* Char */],
]);
const BUTTONID_TO_ACTION_NAME = new Map([
    [0, "left" /* Left */],
    [1, "middle" /* Middle */],
    [2, "right" /* Right */],
    [3, "back" /* Back */],
    [4, "forward" /* Forward */],
]);
SDK.SDKModel.SDKModel.register(InputModel, { capabilities: SDK.Target.Capability.Input, autostart: false });
//# sourceMappingURL=InputModel.js.map