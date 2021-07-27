import * as Common from '../../core/common/common.js';
import * as TextUtils from '../../models/text_utils/text_utils.js';
import type { SuggestBoxDelegate, Suggestion } from './SuggestBox.js';
import { SuggestBox } from './SuggestBox.js';
import { ElementFocusRestorer } from './UIUtils.js';
export declare class TextPrompt extends Common.ObjectWrapper.ObjectWrapper implements SuggestBoxDelegate {
    _proxyElement: HTMLElement | undefined;
    _proxyElementDisplay: string;
    _autocompletionTimeout: number;
    _title: string;
    _queryRange: TextUtils.TextRange.TextRange | null;
    _previousText: string;
    _currentSuggestion: Suggestion | null;
    _completionRequestId: number;
    _ghostTextElement: HTMLSpanElement;
    _leftParenthesesIndices: number[];
    _loadCompletions: (this: null, arg1: string, arg2: string, arg3?: boolean | undefined) => Promise<Suggestion[]>;
    _completionStopCharacters: string;
    _usesSuggestionBuilder: boolean;
    _element?: Element;
    _boundOnKeyDown?: ((ev: Event) => void);
    _boundOnInput?: ((ev: Event) => void);
    _boundOnMouseWheel?: ((event: Event) => void);
    _boundClearAutocomplete?: (() => void);
    _contentElement?: HTMLElement;
    _suggestBox?: SuggestBox;
    _isEditing?: boolean;
    _focusRestorer?: ElementFocusRestorer;
    _blurListener?: ((arg0: Event) => void);
    _oldTabIndex?: number;
    _completeTimeout?: number;
    _disableDefaultSuggestionForEmptyInput?: boolean;
    constructor();
    initialize(completions: (this: null, arg1: string, arg2: string, arg3?: boolean | undefined) => Promise<Suggestion[]>, stopCharacters?: string, usesSuggestionBuilder?: boolean): void;
    setAutocompletionTimeout(timeout: number): void;
    renderAsBlock(): void;
    /**
     * Clients should never attach any event listeners to the |element|. Instead,
     * they should use the result of this method to attach listeners for bubbling events.
     */
    attach(element: Element): Element;
    /**
     * Clients should never attach any event listeners to the |element|. Instead,
     * they should use the result of this method to attach listeners for bubbling events
     * or the |blurListener| parameter to register a "blur" event listener on the |element|
     * (since the "blur" event does not bubble.)
     */
    attachAndStartEditing(element: Element, blurListener: (arg0: Event) => void): Element;
    _attachInternal(element: Element): Element;
    element(): HTMLElement;
    detach(): void;
    textWithCurrentSuggestion(): string;
    text(): string;
    setText(text: string): void;
    setSelectedRange(startIndex: number, endIndex: number): void;
    focus(): void;
    title(): string;
    setTitle(title: string): void;
    setPlaceholder(placeholder: string, ariaPlaceholder?: string): void;
    setEnabled(enabled: boolean): void;
    _removeFromElement(): void;
    _startEditing(blurListener?: ((arg0: Event) => void)): void;
    _stopEditing(): void;
    onMouseWheel(_event: Event): void;
    onKeyDown(ev: Event): void;
    _acceptSuggestionOnStopCharacters(key: string): boolean;
    onInput(ev: Event): void;
    acceptAutoComplete(): boolean;
    clearAutocomplete(): void;
    _refreshGhostText(): void;
    _clearAutocompleteTimeout(): void;
    autoCompleteSoon(force?: boolean): void;
    complete(force?: boolean): Promise<void>;
    disableDefaultSuggestionForEmptyInput(): void;
    _boxForAnchorAtStart(selection: Selection, textRange: Range): AnchorBox;
    additionalCompletions(_query: string): Suggestion[];
    _completionsReady(completionRequestId: number, selection: Selection, originalWordQueryRange: Range, force: boolean, completions: Suggestion[]): void;
    applySuggestion(suggestion: Suggestion | null, isIntermediateSuggestion?: boolean): void;
    acceptSuggestion(): void;
    _acceptSuggestionInternal(): boolean;
    ariaControlledBy(): Element;
    setDOMSelection(startColumn: number, endColumn: number): void;
    isSuggestBoxVisible(): boolean;
    isCaretInsidePrompt(): boolean;
    _isCaretAtEndOfPrompt(): boolean;
    moveCaretToEndOfPrompt(): void;
    /** -1 if no caret can be found in text prompt
       */
    _getCaretPosition(): number;
    tabKeyPressed(_event: Event): boolean;
    proxyElementForTests(): Element | null;
    /**
     * Try matching the most recent open parenthesis with the given right
     * parenthesis, and closes the matched left parenthesis if found.
     * Return the result of the matching.
     */
    _tryMatchingLeftParenthesis(rightParenthesisIndex: number): boolean;
    _updateLeftParenthesesIndices(): void;
}
export declare enum Events {
    TextChanged = "TextChanged"
}
