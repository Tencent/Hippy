// Copyright (c) 2015 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var Events;
(function (Events) {
    Events["AppendedToURL"] = "appendedToURL";
    Events["CanceledSaveURL"] = "canceledSaveURL";
    Events["ContextMenuCleared"] = "contextMenuCleared";
    Events["ContextMenuItemSelected"] = "contextMenuItemSelected";
    Events["DeviceCountUpdated"] = "deviceCountUpdated";
    Events["DevicesDiscoveryConfigChanged"] = "devicesDiscoveryConfigChanged";
    Events["DevicesPortForwardingStatusChanged"] = "devicesPortForwardingStatusChanged";
    Events["DevicesUpdated"] = "devicesUpdated";
    Events["DispatchMessage"] = "dispatchMessage";
    Events["DispatchMessageChunk"] = "dispatchMessageChunk";
    Events["EnterInspectElementMode"] = "enterInspectElementMode";
    Events["EyeDropperPickedColor"] = "eyeDropperPickedColor";
    Events["FileSystemsLoaded"] = "fileSystemsLoaded";
    Events["FileSystemRemoved"] = "fileSystemRemoved";
    Events["FileSystemAdded"] = "fileSystemAdded";
    Events["FileSystemFilesChangedAddedRemoved"] = "FileSystemFilesChangedAddedRemoved";
    Events["IndexingTotalWorkCalculated"] = "indexingTotalWorkCalculated";
    Events["IndexingWorked"] = "indexingWorked";
    Events["IndexingDone"] = "indexingDone";
    Events["KeyEventUnhandled"] = "keyEventUnhandled";
    Events["ReattachMainTarget"] = "reattachMainTarget";
    Events["ReloadInspectedPage"] = "reloadInspectedPage";
    Events["RevealSourceLine"] = "revealSourceLine";
    Events["SavedURL"] = "savedURL";
    Events["SearchCompleted"] = "searchCompleted";
    Events["SetInspectedTabId"] = "setInspectedTabId";
    Events["SetUseSoftMenu"] = "setUseSoftMenu";
    Events["ShowPanel"] = "showPanel";
})(Events || (Events = {}));
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export const EventDescriptors = [
    [Events.AppendedToURL, 'appendedToURL', ['url']],
    [Events.CanceledSaveURL, 'canceledSaveURL', ['url']],
    [Events.ContextMenuCleared, 'contextMenuCleared', []],
    [Events.ContextMenuItemSelected, 'contextMenuItemSelected', ['id']],
    [Events.DeviceCountUpdated, 'deviceCountUpdated', ['count']],
    [Events.DevicesDiscoveryConfigChanged, 'devicesDiscoveryConfigChanged', ['config']],
    [Events.DevicesPortForwardingStatusChanged, 'devicesPortForwardingStatusChanged', ['status']],
    [Events.DevicesUpdated, 'devicesUpdated', ['devices']],
    [Events.DispatchMessage, 'dispatchMessage', ['messageObject']],
    [Events.DispatchMessageChunk, 'dispatchMessageChunk', ['messageChunk', 'messageSize']],
    [Events.EnterInspectElementMode, 'enterInspectElementMode', []],
    [Events.EyeDropperPickedColor, 'eyeDropperPickedColor', ['color']],
    [Events.FileSystemsLoaded, 'fileSystemsLoaded', ['fileSystems']],
    [Events.FileSystemRemoved, 'fileSystemRemoved', ['fileSystemPath']],
    [Events.FileSystemAdded, 'fileSystemAdded', ['errorMessage', 'fileSystem']],
    [Events.FileSystemFilesChangedAddedRemoved, 'fileSystemFilesChangedAddedRemoved', ['changed', 'added', 'removed']],
    [Events.IndexingTotalWorkCalculated, 'indexingTotalWorkCalculated', ['requestId', 'fileSystemPath', 'totalWork']],
    [Events.IndexingWorked, 'indexingWorked', ['requestId', 'fileSystemPath', 'worked']],
    [Events.IndexingDone, 'indexingDone', ['requestId', 'fileSystemPath']],
    [Events.KeyEventUnhandled, 'keyEventUnhandled', ['event']],
    [Events.ReattachMainTarget, 'reattachMainTarget', []],
    [Events.ReloadInspectedPage, 'reloadInspectedPage', ['hard']],
    [Events.RevealSourceLine, 'revealSourceLine', ['url', 'lineNumber', 'columnNumber']],
    [Events.SavedURL, 'savedURL', ['url', 'fileSystemPath']],
    [Events.SearchCompleted, 'searchCompleted', ['requestId', 'fileSystemPath', 'files']],
    [Events.SetInspectedTabId, 'setInspectedTabId', ['tabId']],
    [Events.SetUseSoftMenu, 'setUseSoftMenu', ['useSoftMenu']],
    [Events.ShowPanel, 'showPanel', ['panelName']],
];
/**
 * Enum for recordPerformanceHistogram
 * Warning: There is another definition of this enum in the DevTools code
 * base, keep them in sync:
 * front_end/devtools_compatibility.js
 * @readonly
 */
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var EnumeratedHistogram;
(function (EnumeratedHistogram) {
    EnumeratedHistogram["ActionTaken"] = "DevTools.ActionTaken";
    EnumeratedHistogram["ColorPickerFixedColor"] = "DevTools.ColorPicker.FixedColor";
    EnumeratedHistogram["PanelClosed"] = "DevTools.PanelClosed";
    EnumeratedHistogram["PanelShown"] = "DevTools.PanelShown";
    EnumeratedHistogram["SidebarPaneShown"] = "DevTools.SidebarPaneShown";
    EnumeratedHistogram["KeyboardShortcutFired"] = "DevTools.KeyboardShortcutFired";
    EnumeratedHistogram["IssueCreated"] = "DevTools.IssueCreated";
    EnumeratedHistogram["IssuesPanelIssueExpanded"] = "DevTools.IssuesPanelIssueExpanded";
    EnumeratedHistogram["IssuesPanelOpenedFrom"] = "DevTools.IssuesPanelOpenedFrom";
    EnumeratedHistogram["IssuesPanelResourceOpened"] = "DevTools.IssuesPanelResourceOpened";
    EnumeratedHistogram["KeybindSetSettingChanged"] = "DevTools.KeybindSetSettingChanged";
    EnumeratedHistogram["DualScreenDeviceEmulated"] = "DevTools.DualScreenDeviceEmulated";
    EnumeratedHistogram["ExperimentEnabledAtLaunch"] = "DevTools.ExperimentEnabledAtLaunch";
    EnumeratedHistogram["ExperimentEnabled"] = "DevTools.ExperimentEnabled";
    EnumeratedHistogram["ExperimentDisabled"] = "DevTools.ExperimentDisabled";
    EnumeratedHistogram["CssEditorOpened"] = "DevTools.CssEditorOpened";
    EnumeratedHistogram["DeveloperResourceLoaded"] = "DevTools.DeveloperResourceLoaded";
    EnumeratedHistogram["DeveloperResourceScheme"] = "DevTools.DeveloperResourceScheme";
    EnumeratedHistogram["LinearMemoryInspectorRevealedFrom"] = "DevTools.LinearMemoryInspector.RevealedFrom";
    EnumeratedHistogram["LinearMemoryInspectorTarget"] = "DevTools.LinearMemoryInspector.Target";
})(EnumeratedHistogram || (EnumeratedHistogram = {}));
//# sourceMappingURL=InspectorFrontendHostAPI.js.map