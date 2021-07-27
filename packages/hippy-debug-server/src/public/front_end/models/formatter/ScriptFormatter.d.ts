import * as Common from '../../core/common/common.js';
import type { FormatResult } from './FormatterWorkerPool.js';
export declare class FormatterInterface {
    static format(contentType: Common.ResourceType.ResourceType, mimeType: string, content: string, callback: (arg0: string, arg1: FormatterSourceMapping) => Promise<void>): void;
    static locationToPosition(lineEndings: number[], lineNumber: number, columnNumber: number): number;
    static positionToLocation(lineEndings: number[], position: number): number[];
}
export declare class ScriptFormatter extends FormatterInterface {
    _mimeType: string;
    _originalContent: string;
    _callback: (arg0: string, arg1: FormatterSourceMapping) => Promise<void>;
    constructor(mimeType: string, content: string, callback: (arg0: string, arg1: FormatterSourceMapping) => Promise<void>);
    _initialize(): Promise<void>;
    _didFormatContent(formatResult: FormatResult): void;
}
export declare abstract class FormatterSourceMapping {
    abstract originalToFormatted(lineNumber: number, columnNumber?: number): number[];
    abstract formattedToOriginal(lineNumber: number, columnNumber?: number): number[];
}
