import * as Common from '../../core/common/common.js';
import * as Platform from '../../core/platform/platform.js';
import * as Bindings from '../bindings/bindings.js';
import * as Workspace from '../workspace/workspace.js';
import type { AutomappingStatus } from './Automapping.js';
import { Automapping } from './Automapping.js';
export declare class PersistenceImpl extends Common.ObjectWrapper.ObjectWrapper {
    _workspace: Workspace.Workspace.WorkspaceImpl;
    _breakpointManager: Bindings.BreakpointManager.BreakpointManager;
    _filePathPrefixesToBindingCount: Map<string, number>;
    _subscribedBindingEventListeners: Platform.MapUtilities.Multimap<Workspace.UISourceCode.UISourceCode, () => void>;
    _mapping: Automapping;
    constructor(workspace: Workspace.Workspace.WorkspaceImpl, breakpointManager: Bindings.BreakpointManager.BreakpointManager);
    static instance(opts?: {
        forceNew: boolean | null;
        workspace: Workspace.Workspace.WorkspaceImpl | null;
        breakpointManager: Bindings.BreakpointManager.BreakpointManager | null;
    }): PersistenceImpl;
    addNetworkInterceptor(interceptor: (arg0: Workspace.UISourceCode.UISourceCode) => boolean): void;
    refreshAutomapping(): void;
    addBinding(binding: PersistenceBinding): Promise<void>;
    addBindingForTest(binding: PersistenceBinding): Promise<void>;
    removeBinding(binding: PersistenceBinding): Promise<void>;
    removeBindingForTest(binding: PersistenceBinding): Promise<void>;
    _innerAddBinding(binding: PersistenceBinding): Promise<void>;
    _innerRemoveBinding(binding: PersistenceBinding): Promise<void>;
    _onStatusAdded(status: AutomappingStatus): Promise<void>;
    _onStatusRemoved(status: AutomappingStatus): Promise<void>;
    _onWorkingCopyChanged(event: Common.EventTarget.EventTargetEvent): void;
    _syncWorkingCopy(uiSourceCode: Workspace.UISourceCode.UISourceCode): void;
    _onWorkingCopyCommitted(event: Common.EventTarget.EventTargetEvent): void;
    syncContent(uiSourceCode: Workspace.UISourceCode.UISourceCode, newContent: string, encoded: boolean): void;
    static rewrapNodeJSContent(uiSourceCode: Workspace.UISourceCode.UISourceCode, currentContent: string, newContent: string): string;
    _contentSyncedForTest(): void;
    _moveBreakpoints(from: Workspace.UISourceCode.UISourceCode, to: Workspace.UISourceCode.UISourceCode): Promise<void>;
    hasUnsavedCommittedChanges(uiSourceCode: Workspace.UISourceCode.UISourceCode): boolean;
    binding(uiSourceCode: Workspace.UISourceCode.UISourceCode): PersistenceBinding | null;
    subscribeForBindingEvent(uiSourceCode: Workspace.UISourceCode.UISourceCode, listener: () => void): void;
    unsubscribeFromBindingEvent(uiSourceCode: Workspace.UISourceCode.UISourceCode, listener: () => void): void;
    _notifyBindingEvent(uiSourceCode: Workspace.UISourceCode.UISourceCode): void;
    fileSystem(uiSourceCode: Workspace.UISourceCode.UISourceCode): Workspace.UISourceCode.UISourceCode | null;
    network(uiSourceCode: Workspace.UISourceCode.UISourceCode): Workspace.UISourceCode.UISourceCode | null;
    _addFilePathBindingPrefixes(filePath: string): void;
    _removeFilePathBindingPrefixes(filePath: string): void;
    filePathHasBindings(filePath: string): boolean;
}
export declare const NodePrefix = "(function (exports, require, module, __filename, __dirname) { ";
export declare const NodeSuffix = "\n});";
export declare const NodeShebang = "#!/usr/bin/env node";
export declare const Events: {
    BindingCreated: symbol;
    BindingRemoved: symbol;
};
export declare class PathEncoder {
    _encoder: Common.CharacterIdMap.CharacterIdMap<string>;
    constructor();
    encode(path: string): string;
    decode(path: string): string;
}
export declare class PersistenceBinding {
    network: Workspace.UISourceCode.UISourceCode;
    fileSystem: Workspace.UISourceCode.UISourceCode;
    constructor(network: Workspace.UISourceCode.UISourceCode, fileSystem: Workspace.UISourceCode.UISourceCode);
}
