import * as UI from '../../ui/legacy/legacy.js';
import type { Database } from './DatabaseModel.js';
export declare class DatabaseQueryView extends UI.Widget.VBox {
    database: Database;
    _queryWrapper: HTMLElement;
    _promptContainer: HTMLElement;
    _promptElement: HTMLElement;
    _prompt: UI.TextPrompt.TextPrompt;
    _proxyElement: Element;
    _queryResults: HTMLElement[];
    _virtualSelectedIndex: number;
    _lastSelectedElement: Element | null;
    _selectionTimeout: number;
    constructor(database: Database);
    _messagesClicked(): void;
    _onKeyDown(event: KeyboardEvent): void;
    _onFocusIn(event: FocusEvent): void;
    _onFocusOut(event: FocusEvent): void;
    _isOutsideViewport(element: Element | null): boolean;
    _updateFocusedItem(): void;
    completions(_expression: string, prefix: string, _force?: boolean): Promise<UI.SuggestBox.Suggestions>;
    _selectStart(_event: Event): void;
    _promptKeyDown(event: KeyboardEvent): void;
    _enterKeyPressed(event: KeyboardEvent): Promise<void>;
    _queryFinished(query: string, columnNames: string[], values: any[]): void;
    _appendViewQueryResult(query: string, view: UI.Widget.Widget | null): void;
    _appendErrorQueryResult(query: string, errorText: string): void;
    _scrollResultIntoView(): void;
    _appendQueryResult(query: string): HTMLDivElement;
}
export declare enum Events {
    SchemaUpdated = "SchemaUpdated"
}
export declare const SQL_BUILT_INS: string[];
