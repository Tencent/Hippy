import * as SDK from '../../../../core/sdk/sdk.js';
import * as TextUtils from '../../../../models/text_utils/text_utils.js';
import * as UI from '../../legacy.js';
export declare class JavaScriptAutocomplete {
    _expressionCache: Map<string, {
        date: number;
        value: Promise<Array<CompletionGroup>>;
    }>;
    private constructor();
    static instance(): JavaScriptAutocomplete;
    _clearCache(): void;
    completionsForTextInCurrentContext(fullText: string, query: string, force?: boolean): Promise<UI.SuggestBox.Suggestions>;
    argumentsHint(fullText: string): Promise<{
        args: Array<Array<string>>;
        argumentIndex: number;
    } | null | undefined>;
    _argumentsForFunction(functionObject: SDK.RemoteObject.RemoteObject, receiverObjGetter: () => Promise<SDK.RemoteObject.RemoteObject | null>, parsedFunctionName?: string): Promise<string[][]>;
    _mapCompletions(text: string, query: string): Promise<UI.SuggestBox.Suggestions>;
    _completionsForExpression(fullText: string, query: string, force?: boolean): Promise<UI.SuggestBox.Suggestions>;
    _receivedPropertyNames(propertyGroups: CompletionGroup[] | null, dotNotation: boolean, bracketNotation: boolean, expressionString: string, query: string): UI.SuggestBox.Suggestions;
    _completionsForQuery(dotNotation: boolean, bracketNotation: boolean, expressionString: string, query: string, propertyGroups: CompletionGroup[]): UI.SuggestBox.Suggestions;
    _itemComparator(a: string, b: string): number;
    static isExpressionComplete(expression: string): Promise<boolean>;
}
export declare class JavaScriptAutocompleteConfig {
    _editor: UI.TextEditor.TextEditor;
    constructor(editor: UI.TextEditor.TextEditor);
    static createConfigForEditor(editor: UI.TextEditor.TextEditor): UI.SuggestBox.AutocompleteConfig;
    _substituteRange(lineNumber: number, columnNumber: number): TextUtils.TextRange.TextRange | null;
    _suggestionsCallback(queryRange: TextUtils.TextRange.TextRange, substituteRange: TextUtils.TextRange.TextRange, force?: boolean): Promise<UI.SuggestBox.Suggestions>;
    _tooltipCallback(lineNumber: number, columnNumber: number): Promise<Element | null>;
}
export interface CompletionGroup {
    title?: string;
    items: string[];
}
