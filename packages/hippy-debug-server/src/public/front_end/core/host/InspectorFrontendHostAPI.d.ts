export declare enum Events {
    AppendedToURL = "appendedToURL",
    CanceledSaveURL = "canceledSaveURL",
    ContextMenuCleared = "contextMenuCleared",
    ContextMenuItemSelected = "contextMenuItemSelected",
    DeviceCountUpdated = "deviceCountUpdated",
    DevicesDiscoveryConfigChanged = "devicesDiscoveryConfigChanged",
    DevicesPortForwardingStatusChanged = "devicesPortForwardingStatusChanged",
    DevicesUpdated = "devicesUpdated",
    DispatchMessage = "dispatchMessage",
    DispatchMessageChunk = "dispatchMessageChunk",
    EnterInspectElementMode = "enterInspectElementMode",
    EyeDropperPickedColor = "eyeDropperPickedColor",
    FileSystemsLoaded = "fileSystemsLoaded",
    FileSystemRemoved = "fileSystemRemoved",
    FileSystemAdded = "fileSystemAdded",
    FileSystemFilesChangedAddedRemoved = "FileSystemFilesChangedAddedRemoved",
    IndexingTotalWorkCalculated = "indexingTotalWorkCalculated",
    IndexingWorked = "indexingWorked",
    IndexingDone = "indexingDone",
    KeyEventUnhandled = "keyEventUnhandled",
    ReattachMainTarget = "reattachMainTarget",
    ReloadInspectedPage = "reloadInspectedPage",
    RevealSourceLine = "revealSourceLine",
    SavedURL = "savedURL",
    SearchCompleted = "searchCompleted",
    SetInspectedTabId = "setInspectedTabId",
    SetUseSoftMenu = "setUseSoftMenu",
    ShowPanel = "showPanel"
}
export declare const EventDescriptors: (string | string[])[][];
export interface InspectorFrontendHostAPI {
    addFileSystem(type?: string): void;
    loadCompleted(): void;
    indexPath(requestId: number, fileSystemPath: string, excludedFolders: string): void;
    /**
     * Requests inspected page to be placed atop of the inspector frontend with specified bounds.
     */
    setInspectedPageBounds(bounds: {
        x: number;
        y: number;
        width: number;
        height: number;
    }): void;
    showCertificateViewer(certChain: string[]): void;
    setWhitelistedShortcuts(shortcuts: string): void;
    setEyeDropperActive(active: boolean): void;
    inspectElementCompleted(): void;
    openInNewTab(url: string): void;
    showItemInFolder(fileSystemPath: string): void;
    removeFileSystem(fileSystemPath: string): void;
    requestFileSystems(): void;
    save(url: string, content: string, forceSaveAs: boolean): void;
    append(url: string, content: string): void;
    close(url: string): void;
    searchInPath(requestId: number, fileSystemPath: string, query: string): void;
    stopIndexing(requestId: number): void;
    bringToFront(): void;
    closeWindow(): void;
    copyText(text: string | null | undefined): void;
    inspectedURLChanged(url: string): void;
    isolatedFileSystem(fileSystemId: string, registeredName: string): FileSystem | null;
    loadNetworkResource(url: string, headers: string, streamId: number, callback: (arg0: LoadNetworkResourceResult) => void): void;
    getPreferences(callback: (arg0: {
        [x: string]: string;
    }) => void): void;
    setPreference(name: string, value: string): void;
    removePreference(name: string): void;
    clearPreferences(): void;
    upgradeDraggedFileSystemPermissions(fileSystem: FileSystem): void;
    platform(): string;
    recordEnumeratedHistogram(actionName: EnumeratedHistogram, actionCode: number, bucketSize: number): void;
    recordPerformanceHistogram(histogramName: string, duration: number): void;
    recordUserMetricsAction(umaName: string): void;
    sendMessageToBackend(message: string): void;
    setDevicesDiscoveryConfig(config: Adb.Config): void;
    setDevicesUpdatesEnabled(enabled: boolean): void;
    performActionOnRemotePage(pageId: string, action: string): void;
    openRemotePage(browserId: string, url: string): void;
    openNodeFrontend(): void;
    setInjectedScriptForOrigin(origin: string, script: string): void;
    setIsDocked(isDocked: boolean, callback: () => void): void;
    showSurvey(trigger: string, callback: (arg0: ShowSurveyResult) => void): void;
    canShowSurvey(trigger: string, callback: (arg0: CanShowSurveyResult) => void): void;
    zoomFactor(): number;
    zoomIn(): void;
    zoomOut(): void;
    resetZoom(): void;
    showContextMenuAtPoint(x: number, y: number, items: ContextMenuDescriptor[], document: Document): void;
    reattach(callback: () => void): void;
    readyForTest(): void;
    connectionReady(): void;
    setOpenNewWindowForPopups(value: boolean): void;
    isHostedMode(): boolean;
    setAddExtensionCallback(callback: (arg0: ExtensionDescriptor) => void): void;
}
export interface ContextMenuDescriptor {
    type: string;
    id?: number;
    label?: string;
    enabled?: boolean;
    checked?: boolean;
    subItems?: ContextMenuDescriptor[];
}
export interface LoadNetworkResourceResult {
    statusCode: number;
    headers?: {
        [x: string]: string;
    };
    netError?: number;
    netErrorName?: string;
    urlValid?: boolean;
    messageOverride?: string;
}
export interface ExtensionDescriptor {
    startPage: string;
    name: string;
    exposeExperimentalAPIs: boolean;
}
export interface ShowSurveyResult {
    surveyShown: boolean;
}
export interface CanShowSurveyResult {
    canShowSurvey: boolean;
}
/**
 * Enum for recordPerformanceHistogram
 * Warning: There is another definition of this enum in the DevTools code
 * base, keep them in sync:
 * front_end/devtools_compatibility.js
 * @readonly
 */
export declare enum EnumeratedHistogram {
    ActionTaken = "DevTools.ActionTaken",
    ColorPickerFixedColor = "DevTools.ColorPicker.FixedColor",
    PanelClosed = "DevTools.PanelClosed",
    PanelShown = "DevTools.PanelShown",
    SidebarPaneShown = "DevTools.SidebarPaneShown",
    KeyboardShortcutFired = "DevTools.KeyboardShortcutFired",
    IssueCreated = "DevTools.IssueCreated",
    IssuesPanelIssueExpanded = "DevTools.IssuesPanelIssueExpanded",
    IssuesPanelOpenedFrom = "DevTools.IssuesPanelOpenedFrom",
    IssuesPanelResourceOpened = "DevTools.IssuesPanelResourceOpened",
    KeybindSetSettingChanged = "DevTools.KeybindSetSettingChanged",
    DualScreenDeviceEmulated = "DevTools.DualScreenDeviceEmulated",
    ExperimentEnabledAtLaunch = "DevTools.ExperimentEnabledAtLaunch",
    ExperimentEnabled = "DevTools.ExperimentEnabled",
    ExperimentDisabled = "DevTools.ExperimentDisabled",
    CssEditorOpened = "DevTools.CssEditorOpened",
    DeveloperResourceLoaded = "DevTools.DeveloperResourceLoaded",
    DeveloperResourceScheme = "DevTools.DeveloperResourceScheme",
    LinearMemoryInspectorRevealedFrom = "DevTools.LinearMemoryInspector.RevealedFrom",
    LinearMemoryInspectorTarget = "DevTools.LinearMemoryInspector.Target"
}
