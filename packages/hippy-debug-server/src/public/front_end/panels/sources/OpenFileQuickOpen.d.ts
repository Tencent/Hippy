import type * as Workspace from '../../models/workspace/workspace.js';
import { FilteredUISourceCodeListProvider } from './FilteredUISourceCodeListProvider.js';
export declare class OpenFileQuickOpen extends FilteredUISourceCodeListProvider {
    static instance(opts?: {
        forceNew: boolean | null;
    }): OpenFileQuickOpen;
    attach(): void;
    uiSourceCodeSelected(uiSourceCode: Workspace.UISourceCode.UISourceCode | null, lineNumber?: number, columnNumber?: number): void;
    filterProject(project: Workspace.Workspace.Project): boolean;
    renderAsTwoRows(): boolean;
}
