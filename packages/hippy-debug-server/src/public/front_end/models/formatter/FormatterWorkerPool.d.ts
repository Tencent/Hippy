import * as Common from '../../core/common/common.js';
import * as FormatterActions from '../../entrypoints/formatter_worker/FormatterActions.js';
export declare class FormatterWorkerPool {
    _taskQueue: Task[];
    _workerTasks: Map<Common.Worker.WorkerWrapper, Task | null>;
    constructor();
    static instance(): FormatterWorkerPool;
    _createWorker(): Common.Worker.WorkerWrapper;
    _processNextTask(): void;
    _onWorkerMessage(worker: Common.Worker.WorkerWrapper, event: MessageEvent<any>): void;
    _onWorkerError(worker: Common.Worker.WorkerWrapper, event: Event): void;
    _runChunkedTask(methodName: string, params: {
        [x: string]: string;
    }, callback: (arg0: boolean, arg1: any) => void): void;
    _runTask(methodName: FormatterActions.FormatterActions, params: {
        [x: string]: string;
    }): Promise<any>;
    format(mimeType: string, content: string, indentString: string): Promise<FormatResult>;
    javaScriptIdentifiers(content: string): Promise<{
        name: string;
        offset: number;
    }[]>;
    evaluatableJavaScriptSubstring(content: string): Promise<string>;
    parseCSS(content: string, callback: (arg0: boolean, arg1: Array<CSSRule>) => void): void;
    outlineForMimetype(content: string, mimeType: string, callback: (arg0: boolean, arg1: Array<OutlineItem>) => void): boolean;
    findLastExpression(content: string): Promise<string | null>;
    findLastFunctionCall(content: string): Promise<{
        baseExpression: string;
        receiver: string;
        argumentIndex: number;
        functionName: string;
    } | null>;
    argumentsList(content: string): Promise<string[]>;
}
declare class Task {
    method: string;
    params: {
        [x: string]: string;
    };
    callback: (arg0: MessageEvent | null) => void;
    isChunked: boolean | undefined;
    constructor(method: string, params: {
        [x: string]: string;
    }, callback: (arg0: MessageEvent | null) => void, isChunked?: boolean);
}
export interface FormatResult {
    content: string;
    mapping: FormatMapping;
}
interface CSSProperty {
    name: string;
    nameRange: TextRange;
    value: string;
    valueRange: TextRange;
    range: TextRange;
    disabled?: boolean;
}
export declare function formatterWorkerPool(): FormatterWorkerPool;
export interface OutlineItem {
    line: number;
    column: number;
    title: string;
    subtitle?: string;
}
export interface FormatMapping {
    original: number[];
    formatted: number[];
}
export interface CSSStyleRule {
    selectorText: string;
    styleRange: TextRange;
    lineNumber: number;
    columnNumber: number;
    properties: CSSProperty[];
}
export interface CSSAtRule {
    atRule: string;
    lineNumber: number;
    columnNumber: number;
}
export declare type CSSRule = CSSStyleRule | CSSAtRule;
export interface TextRange {
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
}
export {};
