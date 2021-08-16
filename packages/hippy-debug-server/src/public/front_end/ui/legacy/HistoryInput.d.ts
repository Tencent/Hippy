export declare class HistoryInput extends HTMLInputElement {
    _history: string[];
    _historyPosition: number;
    constructor();
    static create(): HistoryInput;
    _onInput(_event: Event): void;
    _onKeyDown(ev: Event): void;
    _saveToHistory(): void;
}
