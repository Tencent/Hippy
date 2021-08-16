import * as Common from '../../core/common/common.js';
import * as Workspace from '../../models/workspace/workspace.js';
import * as UI from '../../ui/legacy/legacy.js';
import type { NavigatorUISourceCodeTreeNode } from './NavigatorView.js';
import { NavigatorView } from './NavigatorView.js';
export declare class NetworkNavigatorView extends NavigatorView {
    private constructor();
    static instance(opts?: {
        forceNew: boolean | null;
    }): NetworkNavigatorView;
    acceptProject(project: Workspace.Workspace.Project): boolean;
    _inspectedURLChanged(event: Common.EventTarget.EventTargetEvent): void;
    uiSourceCodeAdded(uiSourceCode: Workspace.UISourceCode.UISourceCode): void;
}
export declare class FilesNavigatorView extends NavigatorView {
    private constructor();
    static instance(): FilesNavigatorView;
    acceptProject(project: Workspace.Workspace.Project): boolean;
    handleContextMenu(event: Event): void;
}
export declare class OverridesNavigatorView extends NavigatorView {
    _toolbar: UI.Toolbar.Toolbar;
    private constructor();
    static instance(opts?: {
        forceNew: boolean | null;
    }): OverridesNavigatorView;
    _onProjectAddOrRemoved(event: Common.EventTarget.EventTargetEvent): void;
    _updateProjectAndUI(): void;
    _updateUI(): void;
    _setupNewWorkspace(): Promise<void>;
    acceptProject(project: Workspace.Workspace.Project): boolean;
}
export declare class ContentScriptsNavigatorView extends NavigatorView {
    private constructor();
    static instance(opts?: {
        forceNew: boolean | null;
    }): ContentScriptsNavigatorView;
    acceptProject(project: Workspace.Workspace.Project): boolean;
}
export declare class SnippetsNavigatorView extends NavigatorView {
    constructor();
    static instance(): SnippetsNavigatorView;
    acceptProject(project: Workspace.Workspace.Project): boolean;
    handleContextMenu(event: Event): void;
    handleFileContextMenu(event: Event, node: NavigatorUISourceCodeTreeNode): void;
    _handleSaveAs(uiSourceCode: Workspace.UISourceCode.UISourceCode): Promise<void>;
}
export declare class RecordingsNavigatorView extends NavigatorView {
    private constructor();
    static instance(): RecordingsNavigatorView;
    acceptProject(project: Workspace.Workspace.Project): boolean;
    handleContextMenu(event: Event): void;
    handleFileContextMenu(event: Event, node: NavigatorUISourceCodeTreeNode): void;
    _handleSaveAs(uiSourceCode: Workspace.UISourceCode.UISourceCode): Promise<void>;
}
export declare class ActionDelegate implements UI.ActionRegistration.ActionDelegate {
    static instance(opts?: {
        forceNew: boolean | null;
    }): ActionDelegate;
    handleAction(context: UI.Context.Context, actionId: string): boolean;
}
