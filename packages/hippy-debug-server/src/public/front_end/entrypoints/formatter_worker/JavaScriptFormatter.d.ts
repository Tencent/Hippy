import * as Acorn from '../../third_party/acorn/acorn.js';
import type { TokenOrComment } from './AcornTokenizer.js';
import { AcornTokenizer } from './AcornTokenizer.js';
import type { FormattedContentBuilder } from './FormattedContentBuilder.js';
export declare class JavaScriptFormatter {
    _builder: FormattedContentBuilder;
    _tokenizer: AcornTokenizer;
    _content: string;
    _fromOffset: number;
    _lastLineNumber: number;
    _toOffset?: number;
    constructor(builder: FormattedContentBuilder);
    format(text: string, lineEndings: number[], fromOffset: number, toOffset: number): void;
    _push(token: Acorn.Token | Acorn.Comment | null, format: string): void;
    _beforeVisit(node: Acorn.ESTree.Node): undefined;
    _afterVisit(node: Acorn.ESTree.Node): void;
    _inForLoopHeader(node: Acorn.ESTree.Node): boolean;
    _formatToken(node: Acorn.ESTree.Node, tokenOrComment: TokenOrComment): string;
    _finishNode(node: Acorn.ESTree.Node): string;
}
