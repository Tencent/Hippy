import type { Suggestion } from './SuggestBox.js';
export declare class FilterSuggestionBuilder {
    _keys: string[];
    _valueSorter: ((arg0: string, arg1: Array<string>) => void) | ((key: string, result: string[]) => string[]);
    _valuesMap: Map<string, Set<string>>;
    constructor(keys: string[], valueSorter?: ((arg0: string, arg1: Array<string>) => void));
    completions(expression: string, prefix: string, force?: boolean): Promise<Suggestion[]>;
    addItem(key: string, value?: string | null): void;
    clear(): void;
}
