// Copyright (c) 2019 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as i18n from '../../core/i18n/i18n.js';
import * as Platform from '../../core/platform/platform.js';
import * as ProtocolClient from '../../core/protocol_client/protocol_client.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Bindings from '../../models/bindings/bindings.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as Timeline from '../timeline/timeline.js';
import { InputModel } from './InputModel.js';
const UIStrings = {
    /**
    *@description Text to clear everything
    */
    clearAll: 'Clear all',
    /**
    *@description Tooltip text that appears when hovering over the largeicon load button
    */
    loadProfile: 'Load profile…',
    /**
    *@description Tooltip text that appears when hovering over the largeicon download button
    */
    saveProfile: 'Save profile…',
};
const str_ = i18n.i18n.registerUIStrings('panels/input//InputTimeline.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
let inputTimelineInstance;
export class InputTimeline extends UI.Widget.VBox {
    _tracingClient;
    _tracingModel;
    _inputModel;
    _state;
    _toggleRecordAction;
    _startReplayAction;
    _togglePauseAction;
    _panelToolbar;
    _clearButton;
    _loadButton;
    _saveButton;
    _fileSelectorElement;
    _loader;
    constructor() {
        super(true);
        this.registerRequiredCSS('panels/input//inputTimeline.css', { enableLegacyPatching: false });
        this.element.classList.add('inputs-timeline');
        this._tracingClient = null;
        this._tracingModel = null;
        this._inputModel = null;
        this._state = "Idle" /* Idle */;
        this._toggleRecordAction =
            UI.ActionRegistry.ActionRegistry.instance().action('input.toggle-recording');
        this._startReplayAction =
            UI.ActionRegistry.ActionRegistry.instance().action('input.start-replaying');
        this._togglePauseAction =
            UI.ActionRegistry.ActionRegistry.instance().action('input.toggle-pause');
        const toolbarContainer = this.contentElement.createChild('div', 'input-timeline-toolbar-container');
        this._panelToolbar = new UI.Toolbar.Toolbar('input-timeline-toolbar', toolbarContainer);
        this._panelToolbar.appendToolbarItem(UI.Toolbar.Toolbar.createActionButton(this._toggleRecordAction));
        this._panelToolbar.appendToolbarItem(UI.Toolbar.Toolbar.createActionButton(this._startReplayAction));
        this._panelToolbar.appendToolbarItem(UI.Toolbar.Toolbar.createActionButton(this._togglePauseAction));
        this._clearButton = new UI.Toolbar.ToolbarButton(i18nString(UIStrings.clearAll), 'largeicon-clear');
        this._clearButton.addEventListener(UI.Toolbar.ToolbarButton.Events.Click, this._reset.bind(this));
        this._panelToolbar.appendToolbarItem(this._clearButton);
        this._panelToolbar.appendSeparator();
        // Load / Save
        this._loadButton = new UI.Toolbar.ToolbarButton(i18nString(UIStrings.loadProfile), 'largeicon-load');
        this._loadButton.addEventListener(UI.Toolbar.ToolbarButton.Events.Click, () => this._selectFileToLoad());
        this._saveButton = new UI.Toolbar.ToolbarButton(i18nString(UIStrings.saveProfile), 'largeicon-download');
        this._saveButton.addEventListener(UI.Toolbar.ToolbarButton.Events.Click, _event => {
            this._saveToFile();
        });
        this._panelToolbar.appendSeparator();
        this._panelToolbar.appendToolbarItem(this._loadButton);
        this._panelToolbar.appendToolbarItem(this._saveButton);
        this._panelToolbar.appendSeparator();
        this._createFileSelector();
        this._updateControls();
    }
    static instance(opts = { forceNew: false }) {
        const { forceNew } = opts;
        if (!inputTimelineInstance || forceNew) {
            inputTimelineInstance = new InputTimeline();
        }
        return inputTimelineInstance;
    }
    _reset() {
        this._tracingClient = null;
        this._tracingModel = null;
        this._inputModel = null;
        this._setState("Idle" /* Idle */);
    }
    _createFileSelector() {
        if (this._fileSelectorElement) {
            this._fileSelectorElement.remove();
        }
        this._fileSelectorElement = UI.UIUtils.createFileSelectorElement(this._loadFromFile.bind(this));
        this.element.appendChild(this._fileSelectorElement);
    }
    wasShown() {
    }
    willHide() {
    }
    _setState(state) {
        this._state = state;
        this._updateControls();
    }
    _isAvailableState() {
        return this._state === "Idle" /* Idle */ || this._state === "ReplayPaused" /* ReplayPaused */;
    }
    _updateControls() {
        this._toggleRecordAction.setToggled(this._state === "Recording" /* Recording */);
        this._toggleRecordAction.setEnabled(this._isAvailableState() || this._state === "Recording" /* Recording */);
        this._startReplayAction.setEnabled(this._isAvailableState() && Boolean(this._tracingModel));
        this._togglePauseAction.setEnabled(this._state === "Replaying" /* Replaying */ || this._state === "ReplayPaused" /* ReplayPaused */);
        this._togglePauseAction.setToggled(this._state === "ReplayPaused" /* ReplayPaused */);
        this._clearButton.setEnabled(this._isAvailableState());
        this._loadButton.setEnabled(this._isAvailableState());
        this._saveButton.setEnabled(this._isAvailableState() && Boolean(this._tracingModel));
    }
    _toggleRecording() {
        switch (this._state) {
            case "Recording" /* Recording */: {
                this._stopRecording();
                break;
            }
            case "Idle" /* Idle */: {
                this._startRecording();
                break;
            }
        }
    }
    _startReplay() {
        this._replayEvents();
    }
    _toggleReplayPause() {
        switch (this._state) {
            case "Replaying" /* Replaying */: {
                this._pauseReplay();
                break;
            }
            case "ReplayPaused" /* ReplayPaused */: {
                this._resumeReplay();
                break;
            }
        }
    }
    /**
     * Saves all current events in a file (JSON format).
     */
    async _saveToFile() {
        console.assert(this._state === "Idle" /* Idle */);
        if (!this._tracingModel) {
            return;
        }
        const fileName = `InputProfile-${Platform.DateUtilities.toISO8601Compact(new Date())}.json`;
        const stream = new Bindings.FileUtils.FileOutputStream();
        const accepted = await stream.open(fileName);
        if (!accepted) {
            return;
        }
        const backingStorage = this._tracingModel.backingStorage();
        await backingStorage.writeToStream(stream);
        stream.close();
    }
    _selectFileToLoad() {
        if (this._fileSelectorElement) {
            this._fileSelectorElement.click();
        }
    }
    _loadFromFile(file) {
        console.assert(this._isAvailableState());
        this._setState("Loading" /* Loading */);
        this._loader = Timeline.TimelineLoader.TimelineLoader.loadFromFile(file, this);
        this._createFileSelector();
    }
    async _startRecording() {
        this._setState("StartPending" /* StartPending */);
        this._tracingClient =
            new TracingClient(SDK.TargetManager.TargetManager.instance().mainTarget(), this);
        const response = await this._tracingClient.startRecording();
        // @ts-ignore crbug.com/1011811 Fix tracing manager type once Closure is gone
        if (response[ProtocolClient.InspectorBackend.ProtocolError]) {
            this._recordingFailed();
        }
        else {
            this._setState("Recording" /* Recording */);
        }
    }
    async _stopRecording() {
        if (!this._tracingClient) {
            return;
        }
        this._setState("StopPending" /* StopPending */);
        await this._tracingClient.stopRecording();
        this._tracingClient = null;
    }
    async _replayEvents() {
        if (!this._inputModel) {
            return;
        }
        this._setState("Replaying" /* Replaying */);
        await this._inputModel.startReplay(this.replayStopped.bind(this));
    }
    _pauseReplay() {
        if (!this._inputModel) {
            return;
        }
        this._inputModel.pause();
        this._setState("ReplayPaused" /* ReplayPaused */);
    }
    _resumeReplay() {
        if (!this._inputModel) {
            return;
        }
        this._inputModel.resume();
        this._setState("Replaying" /* Replaying */);
    }
    loadingStarted() {
    }
    loadingProgress(_progress) {
    }
    processingStarted() {
    }
    loadingComplete(tracingModel) {
        if (!tracingModel) {
            this._reset();
            return;
        }
        this._inputModel = new InputModel(SDK.TargetManager.TargetManager.instance().mainTarget());
        this._tracingModel = tracingModel;
        this._inputModel.setEvents(tracingModel);
        this._setState("Idle" /* Idle */);
    }
    _recordingFailed() {
        this._tracingClient = null;
        this._setState("Idle" /* Idle */);
    }
    replayStopped() {
        this._setState("Idle" /* Idle */);
    }
}
let actionDelegateInstance;
export class ActionDelegate {
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!actionDelegateInstance || forceNew) {
            actionDelegateInstance = new ActionDelegate();
        }
        return actionDelegateInstance;
    }
    handleAction(context, actionId) {
        const inputViewId = 'Inputs';
        UI.ViewManager.ViewManager.instance()
            .showView(inputViewId)
            .then(() => UI.ViewManager.ViewManager.instance().view(inputViewId).widget())
            .then(widget => this._innerHandleAction(widget, actionId));
        return true;
    }
    _innerHandleAction(inputTimeline, actionId) {
        switch (actionId) {
            case 'input.toggle-recording':
                inputTimeline._toggleRecording();
                break;
            case 'input.start-replaying':
                inputTimeline._startReplay();
                break;
            case 'input.toggle-pause':
                inputTimeline._toggleReplayPause();
                break;
            default:
                console.assert(false, `Unknown action: ${actionId}`);
        }
    }
}
export class TracingClient {
    _target;
    _tracingManager;
    _client;
    _tracingModel;
    _tracingCompleteCallback;
    constructor(target, client) {
        this._target = target;
        this._tracingManager = target.model(SDK.TracingManager.TracingManager);
        this._client = client;
        const backingStorage = new Bindings.TempFile.TempFileBackingStorage();
        this._tracingModel = new SDK.TracingModel.TracingModel(backingStorage);
        this._tracingCompleteCallback = null;
    }
    async startRecording() {
        if (!this._tracingManager) {
            return {};
        }
        const categoriesArray = ['devtools.timeline', 'disabled-by-default-devtools.timeline.inputs'];
        const categories = categoriesArray.join(',');
        const response = await this._tracingManager.start(this, categories, '');
        // @ts-ignore crbug.com/1011811 Fix tracing manager type once Closure is gone
        if (response['Protocol.Error']) {
            await this._waitForTracingToStop(false);
        }
        return response;
    }
    async stopRecording() {
        if (this._tracingManager) {
            this._tracingManager.stop();
        }
        await this._waitForTracingToStop(true);
        await SDK.TargetManager.TargetManager.instance().resumeAllTargets();
        this._tracingModel.tracingComplete();
        this._client.loadingComplete(this._tracingModel);
    }
    traceEventsCollected(events) {
        this._tracingModel.addEvents(events);
    }
    tracingComplete() {
        if (this._tracingCompleteCallback) {
            this._tracingCompleteCallback();
        }
        this._tracingCompleteCallback = null;
    }
    tracingBufferUsage(_usage) {
    }
    eventsRetrievalProgress(_progress) {
    }
    _waitForTracingToStop(awaitTracingCompleteCallback) {
        return new Promise(resolve => {
            if (this._tracingManager && awaitTracingCompleteCallback) {
                this._tracingCompleteCallback = resolve;
            }
            else {
                resolve();
            }
        });
    }
}
//# sourceMappingURL=InputTimeline.js.map