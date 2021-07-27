import * as Formatter from '../../models/formatter/formatter.js';
import type * as Workspace from '../../models/workspace/workspace.js';
import * as QuickOpen from '../../ui/legacy/components/quick_open/quick_open.js';
export declare class OutlineQuickOpen extends QuickOpen.FilteredListWidget.Provider {
    _items: Formatter.FormatterWorkerPool.OutlineItem[];
    _active: boolean;
    private constructor();
    static instance(opts?: {
        forceNew: boolean | null;
    }): OutlineQuickOpen;
    attach(): void;
    _didBuildOutlineChunk(isLastChunk: boolean, items: Formatter.FormatterWorkerPool.OutlineItem[]): void;
    itemCount(): number;
    itemKeyAt(itemIndex: number): string;
    itemScoreAt(itemIndex: number, query: string): number;
    renderItem(itemIndex: number, query: string, titleElement: Element, subtitleElement: Element): void;
    selectItem(itemIndex: number | null, _promptValue: string): void;
    _currentUISourceCode(): Workspace.UISourceCode.UISourceCode | null;
    notFoundText(): string;
}
