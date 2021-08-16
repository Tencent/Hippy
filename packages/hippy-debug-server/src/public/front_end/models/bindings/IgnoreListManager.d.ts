import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Workspace from '../workspace/workspace.js';
import type { DebuggerWorkspaceBinding } from './DebuggerWorkspaceBinding.js';
export declare class IgnoreListManager implements SDK.TargetManager.SDKModelObserver<SDK.DebuggerModel.DebuggerModel> {
    _debuggerWorkspaceBinding: DebuggerWorkspaceBinding;
    _listeners: Set<() => void>;
    _isIgnoreListedURLCache: Map<string, boolean>;
    private constructor();
    static instance(opts?: {
        forceNew: boolean | null;
        debuggerWorkspaceBinding: DebuggerWorkspaceBinding | null;
    }): IgnoreListManager;
    addChangeListener(listener: () => void): void;
    removeChangeListener(listener: () => void): void;
    modelAdded(debuggerModel: SDK.DebuggerModel.DebuggerModel): void;
    modelRemoved(debuggerModel: SDK.DebuggerModel.DebuggerModel): void;
    _clearCacheIfNeeded(): void;
    _getSkipStackFramesPatternSetting(): Common.Settings.RegExpSetting;
    _setIgnoreListPatterns(debuggerModel: SDK.DebuggerModel.DebuggerModel): Promise<boolean>;
    isIgnoreListedUISourceCode(uiSourceCode: Workspace.UISourceCode.UISourceCode): boolean;
    isIgnoreListedURL(url: string, isContentScript?: boolean): boolean;
    _sourceMapAttached(event: Common.EventTarget.EventTargetEvent): void;
    _sourceMapDetached(event: Common.EventTarget.EventTargetEvent): void;
    _updateScriptRanges(script: SDK.Script.Script, sourceMap: SDK.SourceMap.SourceMap | null): Promise<void>;
    _uiSourceCodeURL(uiSourceCode: Workspace.UISourceCode.UISourceCode): string | null;
    canIgnoreListUISourceCode(uiSourceCode: Workspace.UISourceCode.UISourceCode): boolean;
    ignoreListUISourceCode(uiSourceCode: Workspace.UISourceCode.UISourceCode): void;
    unIgnoreListUISourceCode(uiSourceCode: Workspace.UISourceCode.UISourceCode): void;
    ignoreListContentScripts(): void;
    unIgnoreListContentScripts(): void;
    _ignoreListURL(url: string): void;
    _unIgnoreListURL(url: string): void;
    _patternChanged(): Promise<void>;
    _patternChangeFinishedForTests(): void;
    _urlToRegExpString(url: string): string;
}
export interface SourceRange {
    lineNumber: number;
    columnNumber: number;
}
