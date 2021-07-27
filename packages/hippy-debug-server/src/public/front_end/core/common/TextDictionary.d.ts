import { Trie } from './Trie.js';
export declare class TextDictionary {
    _words: Map<string, number>;
    _index: Trie;
    constructor();
    addWord(word: string): void;
    removeWord(word: string): void;
    wordsWithPrefix(prefix: string): string[];
    hasWord(word: string): boolean;
    wordCount(word: string): number;
    reset(): void;
}
