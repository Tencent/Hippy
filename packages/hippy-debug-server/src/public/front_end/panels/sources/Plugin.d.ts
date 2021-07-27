import type * as Workspace from '../../models/workspace/workspace.js';
import type * as UI from '../../ui/legacy/legacy.js';
export declare class Plugin {
    static accepts(_uiSourceCode: Workspace.UISourceCode.UISourceCode): boolean;
    wasShown(): void;
    willHide(): void;
    rightToolbarItems(): Promise<UI.Toolbar.ToolbarItem[]>;
    /**
     *
     * TODO(szuend): It is OK to asyncify this function (similar to {rightToolbarItems}),
     *               but it is currently not strictly necessary.
     */
    leftToolbarItems(): UI.Toolbar.ToolbarItem[];
    populateLineGutterContextMenu(_contextMenu: UI.ContextMenu.ContextMenu, _lineNumber: number): Promise<void>;
    populateTextAreaContextMenu(_contextMenu: UI.ContextMenu.ContextMenu, _lineNumber: number, _columnNumber: number): Promise<void>;
    dispose(): void;
}
