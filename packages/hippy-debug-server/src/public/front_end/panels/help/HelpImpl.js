// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../../core/common/common.js';
import * as Host from '../../core/host/host.js';
import * as UI from '../../ui/legacy/legacy.js'; // eslint-disable-line no-unused-vars
import { releaseNoteText } from './ReleaseNoteText.js';
export const releaseVersionSeen = 'releaseNoteVersionSeen';
export const releaseNoteViewId = 'release-note';
let latestReleaseNoteInstance;
let releaseNotesForTest;
let releaseNoteVersionSetting;
export function latestReleaseNote() {
    if (!latestReleaseNoteInstance) {
        latestReleaseNoteInstance =
            (releaseNotesForTest || releaseNoteText).reduce((acc, note) => note.version > acc.version ? note : acc);
    }
    return latestReleaseNoteInstance;
}
export function showReleaseNoteIfNeeded() {
    const releaseNoteVersionSetting = Common.Settings.Settings.instance().createSetting(releaseVersionSeen, 0);
    const releaseNoteVersionSettingValue = releaseNoteVersionSetting.get();
    innerShowReleaseNoteIfNeeded(releaseNoteVersionSettingValue, latestReleaseNote().version, Common.Settings.Settings.instance().moduleSetting('help.show-release-note').get());
}
export function setReleaseNotesForTest(releaseNote) {
    releaseNotesForTest = releaseNote;
}
export function getReleaseNoteVersionSetting() {
    if (!releaseNoteVersionSetting) {
        releaseNoteVersionSetting = Common.Settings.Settings.instance().createSetting(releaseVersionSeen, 0);
    }
    return releaseNoteVersionSetting;
}
export function innerShowReleaseNoteIfNeeded(lastSeenVersion, latestVersion, showReleaseNote) {
    const releaseNoteVersionSetting = Common.Settings.Settings.instance().createSetting(releaseVersionSeen, 0);
    if (!lastSeenVersion) {
        releaseNoteVersionSetting.set(latestVersion);
        return false;
    }
    if (!showReleaseNote) {
        return false;
    }
    if (lastSeenVersion >= latestVersion) {
        return false;
    }
    releaseNoteVersionSetting.set(latestVersion);
    UI.ViewManager.ViewManager.instance().showView(releaseNoteViewId, true);
    return true;
}
let helpLateInitializationInstance;
export class HelpLateInitialization {
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!helpLateInitializationInstance || forceNew) {
            helpLateInitializationInstance = new HelpLateInitialization();
        }
        return helpLateInitializationInstance;
    }
    async run() {
        if (!Host.InspectorFrontendHost.isUnderTest()) {
            showReleaseNoteIfNeeded();
        }
    }
}
Common.Runnable.registerLateInitializationRunnable(HelpLateInitialization.instance);
let releaseNotesActionDelegateInstance;
export class ReleaseNotesActionDelegate {
    handleAction(_context, _actionId) {
        Host.InspectorFrontendHost.InspectorFrontendHostInstance.openInNewTab(latestReleaseNote().link);
        return true;
    }
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!releaseNotesActionDelegateInstance || forceNew) {
            releaseNotesActionDelegateInstance = new ReleaseNotesActionDelegate();
        }
        return releaseNotesActionDelegateInstance;
    }
}
let reportIssueActionDelegateInstance;
export class ReportIssueActionDelegate {
    handleAction(_context, _actionId) {
        Host.InspectorFrontendHost.InspectorFrontendHostInstance.openInNewTab('https://bugs.chromium.org/p/chromium/issues/entry?template=DevTools+issue');
        return true;
    }
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!reportIssueActionDelegateInstance || forceNew) {
            reportIssueActionDelegateInstance = new ReportIssueActionDelegate();
        }
        return reportIssueActionDelegateInstance;
    }
}
//# sourceMappingURL=HelpImpl.js.map