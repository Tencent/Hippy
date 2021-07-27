import { Provider } from './FilteredListWidget.js';
export declare class HelpQuickOpen extends Provider {
    _providers: {
        prefix: string;
        title: string;
    }[];
    private constructor();
    static instance(opts?: {
        forceNew: boolean | null;
    }): HelpQuickOpen;
    _addProvider(extension: {
        prefix: string;
        title?: () => string;
    }): void;
    itemCount(): number;
    itemKeyAt(itemIndex: number): string;
    itemScoreAt(itemIndex: number, _query: string): number;
    renderItem(itemIndex: number, _query: string, titleElement: Element, _subtitleElement: Element): void;
    selectItem(itemIndex: number | null, _promptValue: string): void;
    renderAsTwoRows(): boolean;
}
