export declare function rangeOfWord(rootNode: Node, offset: number, stopCharacters: string, stayWithinNode: Node, direction?: string): Range;
export declare const originalAppendChild: <T extends Node>(newChild: T) => T;
export declare const originalInsertBefore: <T extends Node>(newChild: T, refChild: Node | null) => T;
export declare const originalRemoveChild: <T extends Node>(oldChild: T) => T;
export declare const originalRemoveChildren: () => void;
