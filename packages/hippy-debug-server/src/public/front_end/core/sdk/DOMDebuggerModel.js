// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../common/common.js';
import * as i18n from '../i18n/i18n.js';
import { DOMModel, Events as DOMModelEvents } from './DOMModel.js'; // eslint-disable-line no-unused-vars
import { RemoteObject } from './RemoteObject.js';
import { RuntimeModel } from './RuntimeModel.js';
import { Capability } from './Target.js';
import { SDKModel } from './SDKModel.js';
import { TargetManager } from './TargetManager.js';
const UIStrings = {
    /**
    *@description Title for a category of breakpoints on Trusted Type violations
    */
    trustedTypeViolations: 'Trusted Type Violations',
    /**
     * @description Noun. Title for a checkbox that turns on breakpoints on Trusted Type sink violations.
     * "Trusted Types" is a Web API. A "Sink" (Noun, singular) is a special function, akin to a data sink, that expects
     * to receive data in a specific format. Should the data be in the wrong format, or something else
     * go wrong, its called a "sink violation".
     */
    sinkViolations: 'Sink Violations',
    /**
    *@description Title for a checkbox that turns on breakpoints on Trusted Type policy violations
    */
    policyViolations: 'Policy Violations',
    /**
    *@description Text that refers to the animation of the web page
    */
    animation: 'Animation',
    /**
    *@description Text in DOMDebugger Model
    */
    canvas: 'Canvas',
    /**
    *@description Title for a group of cities
    */
    geolocation: 'Geolocation',
    /**
    *@description Text in DOMDebugger Model
    */
    notification: 'Notification',
    /**
    *@description Text to parse something
    */
    parse: 'Parse',
    /**
    *@description Label for a group of JavaScript files
    */
    script: 'Script',
    /**
    *@description Text in DOMDebugger Model
    */
    timer: 'Timer',
    /**
    *@description Text in DOMDebugger Model
    */
    window: 'Window',
    /**
    *@description Title of the WebAudio tool
    */
    webaudio: 'WebAudio',
    /**
    *@description Text that appears on a button for the media resource type filter.
    */
    media: 'Media',
    /**
    *@description Text in DOMDebugger Model
    */
    pictureinpicture: 'Picture-in-Picture',
    /**
    *@description Text in DOMDebugger Model
    */
    clipboard: 'Clipboard',
    /**
     * @description Noun. Describes a group of DOM events (such as 'select' and 'submit') in this context.
     */
    control: 'Control',
    /**
    *@description Text that refers to device such as a phone
    */
    device: 'Device',
    /**
    *@description Text in DOMDebugger Model
    */
    domMutation: 'DOM Mutation',
    /**
    *@description Text in DOMDebugger Model
    */
    dragDrop: 'Drag / drop',
    /**
    *@description Text in DOMDebugger Model
    */
    keyboard: 'Keyboard',
    /**
    *@description Text to load something
    */
    load: 'Load',
    /**
    *@description Text in DOMDebugger Model
    */
    mouse: 'Mouse',
    /**
    *@description Text in DOMDebugger Model
    */
    pointer: 'Pointer',
    /**
    *@description Text for the touch type to simulate on a device
    */
    touch: 'Touch',
    /**
    *@description Text that appears on a button for the xhr resource type filter.
    */
    xhr: 'XHR',
    /**
    *@description Text in the Event Listener Breakpoints Panel of the JavaScript Debugger in the Sources Panel
    *@example {setTimeout} PH1
    */
    setTimeoutOrIntervalFired: '{PH1} fired',
    /**
    *@description Text in the Event Listener Breakpoints Panel of the JavaScript Debugger in the Sources Panel
    */
    scriptFirstStatement: 'Script First Statement',
    /**
    *@description Text in the Event Listener Breakpoints Panel of the JavaScript Debugger in the Sources Panel
    */
    scriptBlockedByContentSecurity: 'Script Blocked by Content Security Policy',
    /**
    *@description Text for the request animation frame event
    */
    requestAnimationFrame: 'Request Animation Frame',
    /**
    *@description Text to cancel the animation frame
    */
    cancelAnimationFrame: 'Cancel Animation Frame',
    /**
    *@description Text for the event that an animation frame is fired
    */
    animationFrameFired: 'Animation Frame Fired',
    /**
    *@description Text in the Event Listener Breakpoints Panel of the JavaScript Debugger in the Sources Panel
    */
    webglErrorFired: 'WebGL Error Fired',
    /**
    *@description Text in the Event Listener Breakpoints Panel of the JavaScript Debugger in the Sources Panel
    */
    webglWarningFired: 'WebGL Warning Fired',
    /**
    *@description Text in the Event Listener Breakpoints Panel of the JavaScript Debugger in the Sources Panel
    */
    setInnerhtml: 'Set `innerHTML`',
    /**
    *@description Name of a breakpoint type in the Sources Panel.
    */
    createCanvasContext: 'Create canvas context',
    /**
    *@description Name of a breakpoint type in the Sources Panel.
    */
    createAudiocontext: 'Create `AudioContext`',
    /**
    *@description Name of a breakpoint type in the Sources Panel. Close is a verb.
    */
    closeAudiocontext: 'Close `AudioContext`',
    /**
    *@description Name of a breakpoint type in the Sources Panel. Resume is a verb.
    */
    resumeAudiocontext: 'Resume `AudioContext`',
    /**
    *@description Name of a breakpoint type in the Sources Panel.
    */
    suspendAudiocontext: 'Suspend `AudioContext`',
    /**
    *@description Error message text
    *@example {Snag Error} PH1
    */
    webglErrorFiredS: 'WebGL Error Fired ({PH1})',
    /**
    *@description Text in DOMDebugger Model
    *@example {"script-src 'self'"} PH1
    */
    scriptBlockedDueToContent: 'Script blocked due to Content Security Policy directive: {PH1}',
};
const str_ = i18n.i18n.registerUIStrings('core/sdk/DOMDebuggerModel.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class DOMDebuggerModel extends SDKModel {
    _agent;
    _runtimeModel;
    _domModel;
    _domBreakpoints;
    _domBreakpointsSetting;
    suspended = false;
    constructor(target) {
        super(target);
        this._agent = target.domdebuggerAgent();
        this._runtimeModel = target.model(RuntimeModel);
        this._domModel = target.model(DOMModel);
        this._domModel.addEventListener(DOMModelEvents.DocumentUpdated, this._documentUpdated, this);
        this._domModel.addEventListener(DOMModelEvents.NodeRemoved, this._nodeRemoved, this);
        this._domBreakpoints = [];
        this._domBreakpointsSetting = Common.Settings.Settings.instance().createLocalSetting('domBreakpoints', []);
        if (this._domModel.existingDocument()) {
            this._documentUpdated();
        }
    }
    runtimeModel() {
        return this._runtimeModel;
    }
    async suspendModel() {
        this.suspended = true;
    }
    async resumeModel() {
        this.suspended = false;
    }
    async eventListeners(remoteObject) {
        console.assert(remoteObject.runtimeModel() === this._runtimeModel);
        if (!remoteObject.objectId) {
            return [];
        }
        const listeners = await this._agent.invoke_getEventListeners({ objectId: remoteObject.objectId });
        const eventListeners = [];
        for (const payload of listeners.listeners || []) {
            const location = this._runtimeModel.debuggerModel().createRawLocationByScriptId(payload.scriptId, payload.lineNumber, payload.columnNumber);
            if (!location) {
                continue;
            }
            eventListeners.push(new EventListener(this, remoteObject, payload.type, payload.useCapture, payload.passive, payload.once, payload.handler ? this._runtimeModel.createRemoteObject(payload.handler) : null, payload.originalHandler ? this._runtimeModel.createRemoteObject(payload.originalHandler) : null, location, null));
        }
        return eventListeners;
    }
    retrieveDOMBreakpoints() {
        this._domModel.requestDocument();
    }
    domBreakpoints() {
        return this._domBreakpoints.slice();
    }
    hasDOMBreakpoint(node, type) {
        return this._domBreakpoints.some(breakpoint => (breakpoint.node === node && breakpoint.type === type));
    }
    setDOMBreakpoint(node, type) {
        for (const breakpoint of this._domBreakpoints) {
            if (breakpoint.node === node && breakpoint.type === type) {
                this.toggleDOMBreakpoint(breakpoint, true);
                return breakpoint;
            }
        }
        const breakpoint = new DOMBreakpoint(this, node, type, true);
        this._domBreakpoints.push(breakpoint);
        this._saveDOMBreakpoints();
        this._enableDOMBreakpoint(breakpoint);
        this.dispatchEventToListeners(Events.DOMBreakpointAdded, breakpoint);
        return breakpoint;
    }
    removeDOMBreakpoint(node, type) {
        this._removeDOMBreakpoints(breakpoint => breakpoint.node === node && breakpoint.type === type);
    }
    removeAllDOMBreakpoints() {
        this._removeDOMBreakpoints(_breakpoint => true);
    }
    toggleDOMBreakpoint(breakpoint, enabled) {
        if (enabled === breakpoint.enabled) {
            return;
        }
        breakpoint.enabled = enabled;
        if (enabled) {
            this._enableDOMBreakpoint(breakpoint);
        }
        else {
            this._disableDOMBreakpoint(breakpoint);
        }
        this.dispatchEventToListeners(Events.DOMBreakpointToggled, breakpoint);
    }
    _enableDOMBreakpoint(breakpoint) {
        if (breakpoint.node.id) {
            this._agent.invoke_setDOMBreakpoint({ nodeId: breakpoint.node.id, type: breakpoint.type });
            breakpoint.node.setMarker(Marker, true);
        }
    }
    _disableDOMBreakpoint(breakpoint) {
        if (breakpoint.node.id) {
            this._agent.invoke_removeDOMBreakpoint({ nodeId: breakpoint.node.id, type: breakpoint.type });
            breakpoint.node.setMarker(Marker, this._nodeHasBreakpoints(breakpoint.node) ? true : null);
        }
    }
    _nodeHasBreakpoints(node) {
        for (const breakpoint of this._domBreakpoints) {
            if (breakpoint.node === node && breakpoint.enabled) {
                return true;
            }
        }
        return false;
    }
    resolveDOMBreakpointData(auxData) {
        const type = auxData['type'];
        const node = this._domModel.nodeForId(auxData['nodeId']);
        if (!type || !node) {
            return null;
        }
        let targetNode = null;
        let insertion = false;
        if (type === "subtree-modified" /* SubtreeModified */) {
            insertion = auxData['insertion'] || false;
            targetNode = this._domModel.nodeForId(auxData['targetNodeId']);
        }
        return { type: type, node: node, targetNode: targetNode, insertion: insertion };
    }
    _currentURL() {
        const domDocument = this._domModel.existingDocument();
        return domDocument ? domDocument.documentURL : '';
    }
    async _documentUpdated() {
        if (this.suspended) {
            return;
        }
        const removed = this._domBreakpoints;
        this._domBreakpoints = [];
        this.dispatchEventToListeners(Events.DOMBreakpointsRemoved, removed);
        // this._currentURL() is empty when the page is reloaded because the
        // new document has not been requested yet and the old one has been
        // removed. Therefore, we need to request the document and wait for it.
        // Note that requestDocument() caches the document so that it is requested
        // only once.
        const document = await this._domModel.requestDocument();
        const currentURL = document ? document.documentURL : '';
        for (const breakpoint of this._domBreakpointsSetting.get()) {
            if (breakpoint.url === currentURL) {
                this._domModel.pushNodeByPathToFrontend(breakpoint.path).then(appendBreakpoint.bind(this, breakpoint));
            }
        }
        function appendBreakpoint(breakpoint, nodeId) {
            const node = nodeId ? this._domModel.nodeForId(nodeId) : null;
            if (!node) {
                return;
            }
            const domBreakpoint = new DOMBreakpoint(this, node, breakpoint.type, breakpoint.enabled);
            this._domBreakpoints.push(domBreakpoint);
            if (breakpoint.enabled) {
                this._enableDOMBreakpoint(domBreakpoint);
            }
            this.dispatchEventToListeners(Events.DOMBreakpointAdded, domBreakpoint);
        }
    }
    _removeDOMBreakpoints(filter) {
        const removed = [];
        const left = [];
        for (const breakpoint of this._domBreakpoints) {
            if (filter(breakpoint)) {
                removed.push(breakpoint);
                if (breakpoint.enabled) {
                    breakpoint.enabled = false;
                    this._disableDOMBreakpoint(breakpoint);
                }
            }
            else {
                left.push(breakpoint);
            }
        }
        if (!removed.length) {
            return;
        }
        this._domBreakpoints = left;
        this._saveDOMBreakpoints();
        this.dispatchEventToListeners(Events.DOMBreakpointsRemoved, removed);
    }
    _nodeRemoved(event) {
        if (this.suspended) {
            return;
        }
        const node = event.data.node;
        const children = node.children() || [];
        this._removeDOMBreakpoints(breakpoint => breakpoint.node === node || children.indexOf(breakpoint.node) !== -1);
    }
    _saveDOMBreakpoints() {
        const currentURL = this._currentURL();
        const breakpoints = this._domBreakpointsSetting.get().filter((breakpoint) => breakpoint.url !== currentURL);
        for (const breakpoint of this._domBreakpoints) {
            breakpoints.push({ url: currentURL, path: breakpoint.node.path(), type: breakpoint.type, enabled: breakpoint.enabled });
        }
        this._domBreakpointsSetting.set(breakpoints);
    }
}
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var Events;
(function (Events) {
    Events["DOMBreakpointAdded"] = "DOMBreakpointAdded";
    Events["DOMBreakpointToggled"] = "DOMBreakpointToggled";
    Events["DOMBreakpointsRemoved"] = "DOMBreakpointsRemoved";
})(Events || (Events = {}));
const Marker = 'breakpoint-marker';
export class DOMBreakpoint {
    domDebuggerModel;
    node;
    type;
    enabled;
    constructor(domDebuggerModel, node, type, enabled) {
        this.domDebuggerModel = domDebuggerModel;
        this.node = node;
        this.type = type;
        this.enabled = enabled;
    }
}
export class EventListener {
    _domDebuggerModel;
    _eventTarget;
    _type;
    _useCapture;
    _passive;
    _once;
    _handler;
    _originalHandler;
    _location;
    _sourceURL;
    _customRemoveFunction;
    _origin;
    constructor(domDebuggerModel, eventTarget, type, useCapture, passive, once, handler, originalHandler, location, customRemoveFunction, origin) {
        this._domDebuggerModel = domDebuggerModel;
        this._eventTarget = eventTarget;
        this._type = type;
        this._useCapture = useCapture;
        this._passive = passive;
        this._once = once;
        this._handler = handler;
        this._originalHandler = originalHandler || handler;
        this._location = location;
        const script = location.script();
        this._sourceURL = script ? script.contentURL() : '';
        this._customRemoveFunction = customRemoveFunction;
        this._origin = origin || EventListener.Origin.Raw;
    }
    domDebuggerModel() {
        return this._domDebuggerModel;
    }
    type() {
        return this._type;
    }
    useCapture() {
        return this._useCapture;
    }
    passive() {
        return this._passive;
    }
    once() {
        return this._once;
    }
    handler() {
        return this._handler;
    }
    location() {
        return this._location;
    }
    sourceURL() {
        return this._sourceURL;
    }
    originalHandler() {
        return this._originalHandler;
    }
    canRemove() {
        return Boolean(this._customRemoveFunction) || this._origin !== EventListener.Origin.FrameworkUser;
    }
    remove() {
        if (!this.canRemove()) {
            return Promise.resolve(undefined);
        }
        if (this._origin !== EventListener.Origin.FrameworkUser) {
            function removeListener(type, listener, useCapture) {
                this.removeEventListener(type, listener, useCapture);
                // @ts-ignore:
                if (this['on' + type]) {
                    // @ts-ignore:
                    this['on' + type] = undefined;
                }
            }
            return this._eventTarget
                .callFunction(
            // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
            // @ts-expect-error
            removeListener, [
                RemoteObject.toCallArgument(this._type),
                RemoteObject.toCallArgument(this._originalHandler),
                RemoteObject.toCallArgument(this._useCapture),
            ])
                .then(() => undefined);
        }
        if (this._customRemoveFunction) {
            function callCustomRemove(type, listener, useCapture, passive) {
                this.call(null, type, listener, useCapture, passive);
            }
            return this._customRemoveFunction
                .callFunction(
            // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
            // @ts-expect-error
            callCustomRemove, [
                RemoteObject.toCallArgument(this._type),
                RemoteObject.toCallArgument(this._originalHandler),
                RemoteObject.toCallArgument(this._useCapture),
                RemoteObject.toCallArgument(this._passive),
            ])
                .then(() => undefined);
        }
        return Promise.resolve(undefined);
    }
    canTogglePassive() {
        return this._origin !== EventListener.Origin.FrameworkUser;
    }
    togglePassive() {
        return this._eventTarget
            .callFunction(
        // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
        // @ts-expect-error
        callTogglePassive, [
            RemoteObject.toCallArgument(this._type),
            RemoteObject.toCallArgument(this._originalHandler),
            RemoteObject.toCallArgument(this._useCapture),
            RemoteObject.toCallArgument(this._passive),
        ])
            .then(() => undefined);
        function callTogglePassive(type, listener, useCapture, passive) {
            this.removeEventListener(type, listener, { capture: useCapture });
            this.addEventListener(type, listener, { capture: useCapture, passive: !passive });
        }
    }
    origin() {
        return this._origin;
    }
    markAsFramework() {
        this._origin = EventListener.Origin.Framework;
    }
    isScrollBlockingType() {
        return this._type === 'touchstart' || this._type === 'touchmove' || this._type === 'mousewheel' ||
            this._type === 'wheel';
    }
}
(function (EventListener) {
    // TODO(crbug.com/1167717): Make this a const enum again
    // eslint-disable-next-line rulesdir/const_enum
    let Origin;
    (function (Origin) {
        Origin["Raw"] = "Raw";
        Origin["Framework"] = "Framework";
        Origin["FrameworkUser"] = "FrameworkUser";
    })(Origin = EventListener.Origin || (EventListener.Origin = {}));
})(EventListener || (EventListener = {}));
export class CategorizedBreakpoint {
    _category;
    _title;
    _enabled;
    constructor(category, title) {
        this._category = category;
        this._title = title;
        this._enabled = false;
    }
    category() {
        return this._category;
    }
    enabled() {
        return this._enabled;
    }
    setEnabled(enabled) {
        this._enabled = enabled;
    }
    title() {
        return this._title;
    }
}
export class CSPViolationBreakpoint extends CategorizedBreakpoint {
    _type;
    constructor(category, title, type) {
        super(category, title);
        this._type = type;
    }
    type() {
        return this._type;
    }
}
export class EventListenerBreakpoint extends CategorizedBreakpoint {
    _instrumentationName;
    _eventName;
    _eventTargetNames;
    constructor(instrumentationName, eventName, eventTargetNames, category, title) {
        super(category, title);
        this._instrumentationName = instrumentationName;
        this._eventName = eventName;
        this._eventTargetNames = eventTargetNames;
    }
    setEnabled(enabled) {
        if (this._enabled === enabled) {
            return;
        }
        super.setEnabled(enabled);
        for (const model of TargetManager.instance().models(DOMDebuggerModel)) {
            this._updateOnModel(model);
        }
    }
    _updateOnModel(model) {
        if (this._instrumentationName) {
            if (this._enabled) {
                model._agent.invoke_setInstrumentationBreakpoint({ eventName: this._instrumentationName });
            }
            else {
                model._agent.invoke_removeInstrumentationBreakpoint({ eventName: this._instrumentationName });
            }
        }
        else {
            for (const eventTargetName of this._eventTargetNames) {
                if (this._enabled) {
                    model._agent.invoke_setEventListenerBreakpoint({ eventName: this._eventName, targetName: eventTargetName });
                }
                else {
                    model._agent.invoke_removeEventListenerBreakpoint({ eventName: this._eventName, targetName: eventTargetName });
                }
            }
        }
    }
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/naming-convention
    static _listener = 'listener:';
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/naming-convention
    static _instrumentation = 'instrumentation:';
}
let domDebuggerManagerInstance;
export class DOMDebuggerManager {
    _xhrBreakpointsSetting;
    _xhrBreakpoints;
    _cspViolationsToBreakOn;
    _eventListenerBreakpoints;
    constructor() {
        this._xhrBreakpointsSetting = Common.Settings.Settings.instance().createLocalSetting('xhrBreakpoints', []);
        this._xhrBreakpoints = new Map();
        for (const breakpoint of this._xhrBreakpointsSetting.get()) {
            this._xhrBreakpoints.set(breakpoint.url, breakpoint.enabled);
        }
        this._cspViolationsToBreakOn = [];
        this._cspViolationsToBreakOn.push(new CSPViolationBreakpoint(i18nString(UIStrings.trustedTypeViolations), i18nString(UIStrings.sinkViolations), "trustedtype-sink-violation" /* TrustedtypeSinkViolation */));
        this._cspViolationsToBreakOn.push(new CSPViolationBreakpoint(i18nString(UIStrings.trustedTypeViolations), i18nString(UIStrings.policyViolations), "trustedtype-policy-violation" /* TrustedtypePolicyViolation */));
        this._eventListenerBreakpoints = [];
        this._createInstrumentationBreakpoints(i18nString(UIStrings.animation), ['requestAnimationFrame', 'cancelAnimationFrame', 'requestAnimationFrame.callback']);
        this._createInstrumentationBreakpoints(i18nString(UIStrings.canvas), ['canvasContextCreated', 'webglErrorFired', 'webglWarningFired']);
        this._createInstrumentationBreakpoints(i18nString(UIStrings.geolocation), ['Geolocation.getCurrentPosition', 'Geolocation.watchPosition']);
        this._createInstrumentationBreakpoints(i18nString(UIStrings.notification), ['Notification.requestPermission']);
        this._createInstrumentationBreakpoints(i18nString(UIStrings.parse), ['Element.setInnerHTML', 'Document.write']);
        this._createInstrumentationBreakpoints(i18nString(UIStrings.script), ['scriptFirstStatement', 'scriptBlockedByCSP']);
        this._createInstrumentationBreakpoints(i18nString(UIStrings.timer), ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'setTimeout.callback', 'setInterval.callback']);
        this._createInstrumentationBreakpoints(i18nString(UIStrings.window), ['DOMWindow.close']);
        this._createInstrumentationBreakpoints(i18nString(UIStrings.webaudio), ['audioContextCreated', 'audioContextClosed', 'audioContextResumed', 'audioContextSuspended']);
        this._createEventListenerBreakpoints(i18nString(UIStrings.media), [
            'play', 'pause', 'playing', 'canplay', 'canplaythrough', 'seeking',
            'seeked', 'timeupdate', 'ended', 'ratechange', 'durationchange', 'volumechange',
            'loadstart', 'progress', 'suspend', 'abort', 'error', 'emptied',
            'stalled', 'loadedmetadata', 'loadeddata', 'waiting',
        ], ['audio', 'video']);
        this._createEventListenerBreakpoints(i18nString(UIStrings.pictureinpicture), ['enterpictureinpicture', 'leavepictureinpicture'], ['video']);
        this._createEventListenerBreakpoints(i18nString(UIStrings.pictureinpicture), ['resize'], ['PictureInPictureWindow']);
        this._createEventListenerBreakpoints(i18nString(UIStrings.clipboard), ['copy', 'cut', 'paste', 'beforecopy', 'beforecut', 'beforepaste'], ['*']);
        this._createEventListenerBreakpoints(i18nString(UIStrings.control), ['resize', 'scroll', 'zoom', 'focus', 'blur', 'select', 'change', 'submit', 'reset'], ['*']);
        this._createEventListenerBreakpoints(i18nString(UIStrings.device), ['deviceorientation', 'devicemotion'], ['*']);
        this._createEventListenerBreakpoints(i18nString(UIStrings.domMutation), [
            'DOMActivate',
            'DOMFocusIn',
            'DOMFocusOut',
            'DOMAttrModified',
            'DOMCharacterDataModified',
            'DOMNodeInserted',
            'DOMNodeInsertedIntoDocument',
            'DOMNodeRemoved',
            'DOMNodeRemovedFromDocument',
            'DOMSubtreeModified',
            'DOMContentLoaded',
        ], ['*']);
        this._createEventListenerBreakpoints(i18nString(UIStrings.dragDrop), ['drag', 'dragstart', 'dragend', 'dragenter', 'dragover', 'dragleave', 'drop'], ['*']);
        this._createEventListenerBreakpoints(i18nString(UIStrings.keyboard), ['keydown', 'keyup', 'keypress', 'input'], ['*']);
        this._createEventListenerBreakpoints(i18nString(UIStrings.load), ['load', 'beforeunload', 'unload', 'abort', 'error', 'hashchange', 'popstate'], ['*']);
        this._createEventListenerBreakpoints(i18nString(UIStrings.mouse), [
            'auxclick',
            'click',
            'dblclick',
            'mousedown',
            'mouseup',
            'mouseover',
            'mousemove',
            'mouseout',
            'mouseenter',
            'mouseleave',
            'mousewheel',
            'wheel',
            'contextmenu',
        ], ['*']);
        this._createEventListenerBreakpoints(i18nString(UIStrings.pointer), [
            'pointerover',
            'pointerout',
            'pointerenter',
            'pointerleave',
            'pointerdown',
            'pointerup',
            'pointermove',
            'pointercancel',
            'gotpointercapture',
            'lostpointercapture',
            'pointerrawupdate',
        ], ['*']);
        this._createEventListenerBreakpoints(i18nString(UIStrings.touch), ['touchstart', 'touchmove', 'touchend', 'touchcancel'], ['*']);
        this._createEventListenerBreakpoints(i18nString('Worker'), ['message', 'messageerror'], ['*']);
        this._createEventListenerBreakpoints(i18nString(UIStrings.xhr), ['readystatechange', 'load', 'loadstart', 'loadend', 'abort', 'error', 'progress', 'timeout'], ['xmlhttprequest', 'xmlhttprequestupload']);
        let breakpoint;
        breakpoint = this._resolveEventListenerBreakpoint('instrumentation:setTimeout.callback');
        if (breakpoint) {
            breakpoint._title = i18nString(UIStrings.setTimeoutOrIntervalFired, { PH1: 'setTimeout' });
        }
        breakpoint = this._resolveEventListenerBreakpoint('instrumentation:setInterval.callback');
        if (breakpoint) {
            breakpoint._title = i18nString(UIStrings.setTimeoutOrIntervalFired, { PH1: 'setInterval' });
        }
        breakpoint = this._resolveEventListenerBreakpoint('instrumentation:scriptFirstStatement');
        if (breakpoint) {
            breakpoint._title = i18nString(UIStrings.scriptFirstStatement);
        }
        breakpoint = this._resolveEventListenerBreakpoint('instrumentation:scriptBlockedByCSP');
        if (breakpoint) {
            breakpoint._title = i18nString(UIStrings.scriptBlockedByContentSecurity);
        }
        breakpoint = this._resolveEventListenerBreakpoint('instrumentation:requestAnimationFrame');
        if (breakpoint) {
            breakpoint._title = i18nString(UIStrings.requestAnimationFrame);
        }
        breakpoint = this._resolveEventListenerBreakpoint('instrumentation:cancelAnimationFrame');
        if (breakpoint) {
            breakpoint._title = i18nString(UIStrings.cancelAnimationFrame);
        }
        breakpoint = this._resolveEventListenerBreakpoint('instrumentation:requestAnimationFrame.callback');
        if (breakpoint) {
            breakpoint._title = i18nString(UIStrings.animationFrameFired);
        }
        breakpoint = this._resolveEventListenerBreakpoint('instrumentation:webglErrorFired');
        if (breakpoint) {
            breakpoint._title = i18nString(UIStrings.webglErrorFired);
        }
        breakpoint = this._resolveEventListenerBreakpoint('instrumentation:webglWarningFired');
        if (breakpoint) {
            breakpoint._title = i18nString(UIStrings.webglWarningFired);
        }
        breakpoint = this._resolveEventListenerBreakpoint('instrumentation:Element.setInnerHTML');
        if (breakpoint) {
            breakpoint._title = i18nString(UIStrings.setInnerhtml);
        }
        breakpoint = this._resolveEventListenerBreakpoint('instrumentation:canvasContextCreated');
        if (breakpoint) {
            breakpoint._title = i18nString(UIStrings.createCanvasContext);
        }
        breakpoint = this._resolveEventListenerBreakpoint('instrumentation:Geolocation.getCurrentPosition');
        if (breakpoint) {
            breakpoint._title = 'getCurrentPosition';
        }
        breakpoint = this._resolveEventListenerBreakpoint('instrumentation:Geolocation.watchPosition');
        if (breakpoint) {
            breakpoint._title = 'watchPosition';
        }
        breakpoint = this._resolveEventListenerBreakpoint('instrumentation:Notification.requestPermission');
        if (breakpoint) {
            breakpoint._title = 'requestPermission';
        }
        breakpoint = this._resolveEventListenerBreakpoint('instrumentation:DOMWindow.close');
        if (breakpoint) {
            breakpoint._title = 'window.close';
        }
        breakpoint = this._resolveEventListenerBreakpoint('instrumentation:Document.write');
        if (breakpoint) {
            breakpoint._title = 'document.write';
        }
        breakpoint = this._resolveEventListenerBreakpoint('instrumentation:audioContextCreated');
        if (breakpoint) {
            breakpoint._title = i18nString(UIStrings.createAudiocontext);
        }
        breakpoint = this._resolveEventListenerBreakpoint('instrumentation:audioContextClosed');
        if (breakpoint) {
            breakpoint._title = i18nString(UIStrings.closeAudiocontext);
        }
        breakpoint = this._resolveEventListenerBreakpoint('instrumentation:audioContextResumed');
        if (breakpoint) {
            breakpoint._title = i18nString(UIStrings.resumeAudiocontext);
        }
        breakpoint = this._resolveEventListenerBreakpoint('instrumentation:audioContextSuspended');
        if (breakpoint) {
            breakpoint._title = i18nString(UIStrings.suspendAudiocontext);
        }
        TargetManager.instance().observeModels(DOMDebuggerModel, this);
    }
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!domDebuggerManagerInstance || forceNew) {
            domDebuggerManagerInstance = new DOMDebuggerManager();
        }
        return domDebuggerManagerInstance;
    }
    cspViolationBreakpoints() {
        return this._cspViolationsToBreakOn.slice();
    }
    _createInstrumentationBreakpoints(category, instrumentationNames) {
        for (const instrumentationName of instrumentationNames) {
            this._eventListenerBreakpoints.push(new EventListenerBreakpoint(instrumentationName, '', [], category, instrumentationName));
        }
    }
    _createEventListenerBreakpoints(category, eventNames, eventTargetNames) {
        for (const eventName of eventNames) {
            this._eventListenerBreakpoints.push(new EventListenerBreakpoint('', eventName, eventTargetNames, category, eventName));
        }
    }
    _resolveEventListenerBreakpoint(eventName, eventTargetName) {
        const instrumentationPrefix = 'instrumentation:';
        const listenerPrefix = 'listener:';
        let instrumentationName = '';
        if (eventName.startsWith(instrumentationPrefix)) {
            instrumentationName = eventName.substring(instrumentationPrefix.length);
            eventName = '';
        }
        else if (eventName.startsWith(listenerPrefix)) {
            eventName = eventName.substring(listenerPrefix.length);
        }
        else {
            return null;
        }
        eventTargetName = (eventTargetName || '*').toLowerCase();
        let result = null;
        for (const breakpoint of this._eventListenerBreakpoints) {
            if (instrumentationName && breakpoint._instrumentationName === instrumentationName) {
                result = breakpoint;
            }
            if (eventName && breakpoint._eventName === eventName &&
                breakpoint._eventTargetNames.indexOf(eventTargetName) !== -1) {
                result = breakpoint;
            }
            if (!result && eventName && breakpoint._eventName === eventName &&
                breakpoint._eventTargetNames.indexOf('*') !== -1) {
                result = breakpoint;
            }
        }
        return result;
    }
    eventListenerBreakpoints() {
        return this._eventListenerBreakpoints.slice();
    }
    resolveEventListenerBreakpointTitle(auxData) {
        const id = auxData['eventName'];
        if (id === 'instrumentation:webglErrorFired' && auxData['webglErrorName']) {
            let errorName = auxData['webglErrorName'];
            // If there is a hex code of the error, display only this.
            errorName = errorName.replace(/^.*(0x[0-9a-f]+).*$/i, '$1');
            return i18nString(UIStrings.webglErrorFiredS, { PH1: errorName });
        }
        if (id === 'instrumentation:scriptBlockedByCSP' && auxData['directiveText']) {
            return i18nString(UIStrings.scriptBlockedDueToContent, { PH1: auxData['directiveText'] });
        }
        const breakpoint = this._resolveEventListenerBreakpoint(id, auxData['targetName']);
        if (!breakpoint) {
            return '';
        }
        if (auxData['targetName']) {
            return auxData['targetName'] + '.' + breakpoint._title;
        }
        return breakpoint._title;
    }
    resolveEventListenerBreakpoint(auxData) {
        return this._resolveEventListenerBreakpoint(auxData['eventName'], auxData['targetName']);
    }
    updateCSPViolationBreakpoints() {
        const violationTypes = this._cspViolationsToBreakOn.filter(v => v.enabled()).map(v => v.type());
        for (const model of TargetManager.instance().models(DOMDebuggerModel)) {
            this._updateCSPViolationBreakpointsForModel(model, violationTypes);
        }
    }
    _updateCSPViolationBreakpointsForModel(model, violationTypes) {
        model._agent.invoke_setBreakOnCSPViolation({ violationTypes: violationTypes });
    }
    xhrBreakpoints() {
        return this._xhrBreakpoints;
    }
    _saveXHRBreakpoints() {
        const breakpoints = [];
        for (const url of this._xhrBreakpoints.keys()) {
            breakpoints.push({ url: url, enabled: this._xhrBreakpoints.get(url) || false });
        }
        this._xhrBreakpointsSetting.set(breakpoints);
    }
    addXHRBreakpoint(url, enabled) {
        this._xhrBreakpoints.set(url, enabled);
        if (enabled) {
            for (const model of TargetManager.instance().models(DOMDebuggerModel)) {
                model._agent.invoke_setXHRBreakpoint({ url });
            }
        }
        this._saveXHRBreakpoints();
    }
    removeXHRBreakpoint(url) {
        const enabled = this._xhrBreakpoints.get(url);
        this._xhrBreakpoints.delete(url);
        if (enabled) {
            for (const model of TargetManager.instance().models(DOMDebuggerModel)) {
                model._agent.invoke_removeXHRBreakpoint({ url });
            }
        }
        this._saveXHRBreakpoints();
    }
    toggleXHRBreakpoint(url, enabled) {
        this._xhrBreakpoints.set(url, enabled);
        for (const model of TargetManager.instance().models(DOMDebuggerModel)) {
            if (enabled) {
                model._agent.invoke_setXHRBreakpoint({ url });
            }
            else {
                model._agent.invoke_removeXHRBreakpoint({ url });
            }
        }
        this._saveXHRBreakpoints();
    }
    modelAdded(domDebuggerModel) {
        for (const url of this._xhrBreakpoints.keys()) {
            if (this._xhrBreakpoints.get(url)) {
                domDebuggerModel._agent.invoke_setXHRBreakpoint({ url: url });
            }
        }
        for (const breakpoint of this._eventListenerBreakpoints) {
            if (breakpoint._enabled) {
                breakpoint._updateOnModel(domDebuggerModel);
            }
        }
        const violationTypes = this._cspViolationsToBreakOn.filter(v => v.enabled()).map(v => v.type());
        this._updateCSPViolationBreakpointsForModel(domDebuggerModel, violationTypes);
    }
    modelRemoved(_domDebuggerModel) {
    }
}
SDKModel.register(DOMDebuggerModel, { capabilities: Capability.DOM, autostart: false });
//# sourceMappingURL=DOMDebuggerModel.js.map