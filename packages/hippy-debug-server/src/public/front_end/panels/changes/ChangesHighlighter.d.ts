import type { Row } from './ChangesView.js';
interface ParserConfig {
    diffRows: Array<Row>;
    baselineLines: Array<string>;
    currentLines: Array<string>;
    mimeType: string;
}
export declare function ChangesHighlighter(config: Object, parserConfig: ParserConfig): {
    startState: () => DiffState;
    token: (arg0: typeof CodeMirror.StringStream, arg1: DiffState) => string;
    blankLine: (arg0: DiffState) => string;
    copyState: (arg0: DiffState) => DiffState;
};
export interface DiffState {
    rowNumber: number;
    diffTokenIndex: number;
    currentLineNumber: number;
    baselineLineNumber: number;
    currentSyntaxState: Object;
    baselineSyntaxState: Object;
    syntaxPosition: number;
    diffPosition: number;
    syntaxStyle: string;
    diffStyle: string;
}
export {};
