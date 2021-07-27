// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as Platform from '../../core/platform/platform.js';
import * as Persistence from '../persistence/persistence.js';
import * as Workspace from '../workspace/workspace.js';
const UIStrings = {
    /**
    * @description Default name of a new recording
    * @example {1} nextId
    */
    defaultRecordingName: 'Recording #{nextId}',
    /**
    * @description Text to show something is linked to another
    * @example {example.url} PH1
    */
    linkedToS: 'Linked to {PH1}',
};
const str_ = i18n.i18n.registerUIStrings('models/recorder/RecordingFileSystem.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
function escapeRecordingName(name) {
    return escape(name);
}
function unescapeRecordingName(name) {
    return unescape(name);
}
export class RecordingFileSystem extends Persistence.PlatformFileSystem.PlatformFileSystem {
    _lastRecordingIdentifierSetting;
    _recordingsSetting;
    constructor() {
        super('recording://', 'recordings');
        this._lastRecordingIdentifierSetting =
            Common.Settings.Settings.instance().createSetting('recorder_lastIdentifier', 0);
        this._recordingsSetting = Common.Settings.Settings.instance().createSetting('recorder_recordings', []);
    }
    initialFilePaths() {
        const savedRecordings = this._recordingsSetting.get();
        return savedRecordings.map(recording => escapeRecordingName(recording.name));
    }
    async createFile(_path, _name) {
        const nextId = this._lastRecordingIdentifierSetting.get() + 1;
        this._lastRecordingIdentifierSetting.set(nextId);
        const recordingName = i18nString(UIStrings.defaultRecordingName, { nextId: nextId });
        const recordings = this._recordingsSetting.get();
        recordings.push({ name: recordingName, content: '{"steps": []}' });
        this._recordingsSetting.set(recordings);
        return escapeRecordingName(recordingName);
    }
    async deleteFile(path) {
        const name = unescapeRecordingName(path.substring(1));
        const allRecordings = this._recordingsSetting.get();
        const recordings = allRecordings.filter(recording => recording.name !== name);
        if (allRecordings.length !== recordings.length) {
            this._recordingsSetting.set(recordings);
            return true;
        }
        return false;
    }
    async requestFileContent(path) {
        const name = unescapeRecordingName(path.substring(1));
        const recordings = this._recordingsSetting.get();
        const recording = recordings.find(recording => recording.name === name);
        if (recording) {
            return { content: recording.content, isEncoded: false };
        }
        return { content: null, isEncoded: false, error: `A recording with name '${name}' was not found` };
    }
    async setFileContent(path, content, _isBase64) {
        const name = unescapeRecordingName(path.substring(1));
        const recordings = this._recordingsSetting.get();
        const recording = recordings.find(recording => recording.name === name);
        if (recording) {
            recording.content = content;
            this._recordingsSetting.set(recordings);
            return true;
        }
        return false;
    }
    renameFile(path, newName, callback) {
        const name = unescapeRecordingName(path.substring(1));
        const recordings = this._recordingsSetting.get();
        const recording = recordings.find(recording => recording.name === name);
        newName = newName.trim();
        if (!recording || newName.length === 0 || recordings.find(recording => recording.name === newName)) {
            callback(false);
            return;
        }
        recording.name = newName;
        this._recordingsSetting.set(recordings);
        callback(true, newName);
    }
    async searchInPath(query, _progress) {
        const re = new RegExp(Platform.StringUtilities.escapeForRegExp(query), 'i');
        const allRecordings = this._recordingsSetting.get();
        const matchedRecordings = allRecordings.filter(recording => recording.content.match(re));
        return matchedRecordings.map(recording => `recording:///${escapeRecordingName(recording.name)}`);
    }
    mimeFromPath(_path) {
        return 'text/javascript';
    }
    contentType(_path) {
        return Common.ResourceType.resourceTypes.Script;
    }
    tooltipForURL(url) {
        return i18nString(UIStrings.linkedToS, { PH1: unescapeRecordingName(url.substring(this.path().length)) });
    }
    supportsAutomapping() {
        return true;
    }
}
export function isRecordingUISourceCode(uiSourceCode) {
    return uiSourceCode.url().startsWith('recording://');
}
export function isRecordingProject(project) {
    return project.type() === Workspace.Workspace.projectTypes.FileSystem &&
        Persistence.FileSystemWorkspaceBinding.FileSystemWorkspaceBinding.fileSystemType(project) === 'recordings';
}
export function findRecordingsProject() {
    const workspace = Workspace.Workspace.WorkspaceImpl.instance();
    const projects = workspace.projectsForType(Workspace.Workspace.projectTypes.FileSystem);
    const project = projects.find(project => {
        const type = Persistence.FileSystemWorkspaceBinding.FileSystemWorkspaceBinding.fileSystemType(project);
        return type === 'recordings';
    });
    if (!project) {
        throw new Error('Unable to find workspace project for the recordings file system.');
    }
    return project;
}
//# sourceMappingURL=RecordingFileSystem.js.map