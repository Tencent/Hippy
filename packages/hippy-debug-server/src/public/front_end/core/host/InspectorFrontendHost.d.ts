import * as Common from '../common/common.js';
import type { CanShowSurveyResult, ContextMenuDescriptor, EnumeratedHistogram, ExtensionDescriptor, InspectorFrontendHostAPI, LoadNetworkResourceResult, ShowSurveyResult } from './InspectorFrontendHostAPI.js';
export declare class InspectorFrontendHostStub implements InspectorFrontendHostAPI {
    _urlsBeingSaved: Map<string, string[]>;
    events: Common.EventTarget.EventTarget;
    _windowVisible?: boolean;
    constructor();
    platform(): string;
    loadCompleted(): void;
    bringToFront(): void;
    closeWindow(): void;
    setIsDocked(isDocked: boolean, callback: () => void): void;
    showSurvey(trigger: string, callback: (arg0: ShowSurveyResult) => void): void;
    canShowSurvey(trigger: string, callback: (arg0: CanShowSurveyResult) => void): void;
    /**
     * Requests inspected page to be placed atop of the inspector frontend with specified bounds.
     */
    setInspectedPageBounds(bounds: {
        x: number;
        y: number;
        width: number;
        height: number;
    }): void;
    inspectElementCompleted(): void;
    setInjectedScriptForOrigin(origin: string, script: string): void;
    inspectedURLChanged(url: string): void;
    copyText(text: string | null | undefined): void;
    openInNewTab(url: string): void;
    showItemInFolder(fileSystemPath: string): void;
    save(url: string, content: string, forceSaveAs: boolean): void;
    append(url: string, content: string): void;
    close(url: string): void;
    sendMessageToBackend(message: string): void;
    recordEnumeratedHistogram(actionName: EnumeratedHistogram, actionCode: number, bucketSize: number): void;
    recordPerformanceHistogram(histogramName: string, duration: number): void;
    recordUserMetricsAction(umaName: string): void;
    requestFileSystems(): void;
    addFileSystem(type?: string): void;
    removeFileSystem(fileSystemPath: string): void;
    isolatedFileSystem(fileSystemId: string, registeredName: string): FileSystem | null;
    loadNetworkResource(url: string, headers: string, streamId: number, callback: (arg0: LoadNetworkResourceResult) => void): void;
    getPreferences(callback: (arg0: {
        [x: string]: string;
    }) => void): void;
    setPreference(name: string, value: string): void;
    removePreference(name: string): void;
    clearPreferences(): void;
    upgradeDraggedFileSystemPermissions(fileSystem: FileSystem): void;
    indexPath(requestId: number, fileSystemPath: string, excludedFolders: string): void;
    stopIndexing(requestId: number): void;
    searchInPath(requestId: number, fileSystemPath: string, query: string): void;
    zoomFactor(): number;
    zoomIn(): void;
    zoomOut(): void;
    resetZoom(): void;
    setWhitelistedShortcuts(shortcuts: string): void;
    setEyeDropperActive(active: boolean): void;
    showCertificateViewer(certChain: string[]): void;
    reattach(callback: () => void): void;
    readyForTest(): void;
    connectionReady(): void;
    setOpenNewWindowForPopups(value: boolean): void;
    setDevicesDiscoveryConfig(config: Adb.Config): void;
    setDevicesUpdatesEnabled(enabled: boolean): void;
    performActionOnRemotePage(pageId: string, action: string): void;
    openRemotePage(browserId: string, url: string): void;
    openNodeFrontend(): void;
    showContextMenuAtPoint(x: number, y: number, items: ContextMenuDescriptor[], document: Document): void;
    isHostedMode(): boolean;
    setAddExtensionCallback(callback: (arg0: ExtensionDescriptor) => void): void;
}
export declare let InspectorFrontendHostInstance: InspectorFrontendHostStub;
export declare function isUnderTest(prefs?: {
    [x: string]: string;
}): boolean;
