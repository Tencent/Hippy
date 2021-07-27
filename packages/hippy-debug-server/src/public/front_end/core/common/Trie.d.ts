export declare class Trie {
    _size: number;
    _root: number;
    _edges: {
        [x: string]: number;
    }[];
    _isWord: boolean[];
    _wordsInSubtree: number[];
    _freeNodes: number[];
    constructor();
    add(word: string): void;
    remove(word: string): boolean;
    has(word: string): boolean;
    words(prefix?: string): string[];
    _dfs(node: number, prefix: string, results: string[]): void;
    longestPrefix(word: string, fullWordOnly: boolean): string;
    clear(): void;
}
