import type * as Workspace from '../../models/workspace/workspace.js';
import * as QuickOpen from '../../ui/legacy/components/quick_open/quick_open.js';
import type { UISourceCodeFrame } from './UISourceCodeFrame.js';
export declare class GoToLineQuickOpen extends QuickOpen.FilteredListWidget.Provider {
    static instance(opts?: {
        forceNew: boolean | null;
    }): GoToLineQuickOpen;
    selectItem(itemIndex: number | null, promptValue: string): void;
    notFoundText(query: string): string;
    _parsePosition(query: string): {
        line: number;
        column: number;
    } | null;
    _currentUISourceCode(): Workspace.UISourceCode.UISourceCode | null;
    _currentSourceFrame(): UISourceCodeFrame | null;
}
