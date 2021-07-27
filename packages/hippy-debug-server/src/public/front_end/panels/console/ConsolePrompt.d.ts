import * as Common from '../../core/common/common.js';
import * as TextUtils from '../../models/text_utils/text_utils.js';
import * as ObjectUI from '../../ui/legacy/components/object_ui/object_ui.js';
import * as UI from '../../ui/legacy/legacy.js';
export declare class ConsolePrompt extends UI.Widget.Widget {
    _addCompletionsFromHistory: boolean;
    _history: ConsoleHistoryManager;
    _initialText: string;
    _editor: UI.TextEditor.TextEditor | null;
    _eagerPreviewElement: HTMLDivElement;
    _textChangeThrottler: Common.Throttler.Throttler;
    _formatter: ObjectUI.RemoteObjectPreviewFormatter.RemoteObjectPreviewFormatter;
    _requestPreviewBound: () => Promise<void>;
    _innerPreviewElement: HTMLElement;
    _promptIcon: UI.Icon.Icon;
    _iconThrottler: Common.Throttler.Throttler;
    _eagerEvalSetting: Common.Settings.Setting<boolean>;
    _previewRequestForTest: Promise<void> | null;
    _defaultAutocompleteConfig: UI.TextEditor.AutocompleteConfig | null;
    _highlightingNode: boolean;
    constructor();
    _eagerSettingChanged(): void;
    belowEditorElement(): Element;
    _onTextChanged(): void;
    _requestPreview(): Promise<void>;
    willHide(): void;
    history(): ConsoleHistoryManager;
    clearAutocomplete(): void;
    _isCaretAtEndOfPrompt(): boolean;
    moveCaretToEndOfPrompt(): void;
    setText(text: string): void;
    text(): string;
    setAddCompletionsFromHistory(value: boolean): void;
    _editorKeyDown(event: Event): void;
    _enterWillEvaluate(): Promise<boolean>;
    _updatePromptIcon(): void;
    _enterKeyPressed(event: KeyboardEvent): Promise<void>;
    _appendCommand(text: string, useCommandLineAPI: boolean): Promise<void>;
    _enterProcessedForTest(): void;
    _historyCompletions(prefix: string, force?: boolean): UI.SuggestBox.Suggestions;
    focus(): void;
    _wordsWithQuery(queryRange: TextUtils.TextRange.TextRange, substituteRange: TextUtils.TextRange.TextRange, force?: boolean): Promise<UI.SuggestBox.Suggestions>;
    _editorSetForTest(): void;
}
export declare class ConsoleHistoryManager {
    _data: string[];
    _historyOffset: number;
    _uncommittedIsTop?: boolean;
    constructor();
    historyData(): string[];
    setHistoryData(data: string[]): void;
    /**
     * Pushes a committed text into the history.
     */
    pushHistoryItem(text: string): void;
    /**
     * Pushes the current (uncommitted) text into the history.
     */
    _pushCurrentText(currentText: string): void;
    previous(currentText: string): string | undefined;
    next(): string | undefined;
    _currentHistoryItem(): string | undefined;
}
export declare const enum Events {
    TextChanged = "TextChanged"
}
