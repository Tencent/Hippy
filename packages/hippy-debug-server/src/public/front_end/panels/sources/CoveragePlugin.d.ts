import type * as Workspace from '../../models/workspace/workspace.js';
import type * as SourceFrame from '../../ui/legacy/components/source_frame/source_frame.js';
import * as UI from '../../ui/legacy/legacy.js';
import { Plugin } from './Plugin.js';
export declare class CoveragePlugin extends Plugin {
    private uiSourceCode;
    private originalSourceCode;
    private infoInToolbar;
    private model;
    private coverage;
    constructor(_textEditor: SourceFrame.SourcesTextEditor.SourcesTextEditor, uiSourceCode: Workspace.UISourceCode.UISourceCode);
    dispose(): void;
    static accepts(uiSourceCode: Workspace.UISourceCode.UISourceCode): boolean;
    private handleReset;
    private handleCoverageSizesChanged;
    private updateStats;
    rightToolbarItems(): Promise<UI.Toolbar.ToolbarItem[]>;
}
