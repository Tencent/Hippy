// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as i18n from '../../core/i18n/i18n.js';
import * as Recorder from '../../models/recorder/recorder.js';
import * as UI from '../../ui/legacy/legacy.js';
import { Plugin } from './Plugin.js';
const UIStrings = {
    /**
    *@description Text to record a series of actions for analysis
    */
    record: 'Record',
    /**
    *@description Text to replay a recording
    */
    play: 'Replay',
    /**
    *@description Text of a button to export as a Puppeteer script
    */
    export: 'Export',
};
const str_ = i18n.i18n.registerUIStrings('panels/sources/RecorderPlugin.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class RecorderPlugin extends Plugin {
    _textEditor;
    _uiSourceCode;
    constructor(textEditor, uiSourceCode) {
        super();
        this._textEditor = textEditor;
        this._uiSourceCode = uiSourceCode;
    }
    static accepts(uiSourceCode) {
        return Recorder.RecordingFileSystem.isRecordingUISourceCode(uiSourceCode);
    }
    leftToolbarItems() {
        const toggleRecording = UI.Toolbar.Toolbar.createActionButtonForId('recorder.toggle-recording');
        toggleRecording.setText(i18nString(UIStrings.record));
        const replayRecording = UI.Toolbar.Toolbar.createActionButtonForId('recorder.replay-recording');
        replayRecording.setText(i18nString(UIStrings.play));
        const exportRecording = UI.Toolbar.Toolbar.createActionButtonForId('recorder.export-recording');
        exportRecording.setText(i18nString(UIStrings.export));
        return [toggleRecording, replayRecording, exportRecording];
    }
}
//# sourceMappingURL=RecorderPlugin.js.map