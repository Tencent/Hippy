// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Bindings from '../../models/bindings/bindings.js';
import * as UI from '../../ui/legacy/legacy.js';
import { RecordingPlayer } from './RecordingPlayer.js';
import { RecordingSession } from './RecordingSession.js';
import { findRecordingsProject } from './RecordingFileSystem.js';
import { RecordingScriptWriter } from './RecordingScriptWriter.js';
export class RecorderModel extends SDK.SDKModel.SDKModel {
    _debuggerAgent;
    _domDebuggerAgent;
    _runtimeAgent;
    _accessibilityAgent;
    _toggleRecordAction;
    _replayAction;
    _state;
    _currentRecordingSession;
    _indentation;
    constructor(target) {
        super(target);
        this._debuggerAgent = target.debuggerAgent();
        this._domDebuggerAgent = target.domdebuggerAgent();
        this._runtimeAgent = target.runtimeAgent();
        this._accessibilityAgent = target.accessibilityAgent();
        this._toggleRecordAction =
            UI.ActionRegistry.ActionRegistry.instance().action('recorder.toggle-recording');
        this._replayAction =
            UI.ActionRegistry.ActionRegistry.instance().action('recorder.replay-recording');
        this._state = "Idle" /* Idle */;
        this._currentRecordingSession = null;
        this._indentation = Common.Settings.Settings.instance().moduleSetting('textEditorIndent').get();
    }
    async updateState(newState) {
        this._state = newState;
        this._toggleRecordAction.setToggled(this._state === "Recording" /* Recording */);
        this._toggleRecordAction.setEnabled(this._state !== "Replaying" /* Replaying */);
        this._replayAction.setEnabled(this._state !== "Replaying" /* Replaying */);
    }
    isRecording() {
        return this._state === "Recording" /* Recording */;
    }
    parseUserFlow(source) {
        return JSON.parse(source);
    }
    async replayRecording(userFlow) {
        this.updateState("Replaying" /* Replaying */);
        try {
            const player = new RecordingPlayer(userFlow);
            await player.play();
        }
        finally {
            this.updateState("Idle" /* Idle */);
        }
    }
    async toggleRecording() {
        if (this._state === "Idle" /* Idle */) {
            await this.startRecording();
            await this.updateState("Recording" /* Recording */);
        }
        else if (this._state === "Recording" /* Recording */) {
            await this.stopRecording();
            await this.updateState("Idle" /* Idle */);
        }
        return this._currentRecordingSession;
    }
    async startRecording() {
        this._currentRecordingSession = new RecordingSession(this.target(), this._indentation);
        await this._currentRecordingSession.start();
        return this._currentRecordingSession;
    }
    async stopRecording() {
        if (!this._currentRecordingSession) {
            return;
        }
        this._currentRecordingSession.stop();
        this._currentRecordingSession = null;
    }
    async exportRecording(uiSourceCode) {
        const userFlow = this.parseUserFlow(uiSourceCode.content());
        const writer = new RecordingScriptWriter('  ');
        const filename = uiSourceCode.name();
        const stream = new Bindings.FileUtils.FileOutputStream();
        if (!await stream.open(filename + '.js')) {
            return;
        }
        stream.write(writer.getScript(userFlow));
        stream.close();
    }
    async getAvailableRecordings() {
        const project = findRecordingsProject();
        const uiSourceCodes = project.uiSourceCodes();
        const userFlows = [];
        for (const uiSourceCode of uiSourceCodes) {
            try {
                userFlows.push(this.parseUserFlow(uiSourceCode.content()));
            }
            catch {
            }
        }
        return userFlows;
    }
}
SDK.SDKModel.SDKModel.register(RecorderModel, { capabilities: SDK.Target.Capability.None, autostart: false });
//# sourceMappingURL=RecorderModel.js.map