import type * as SDK from '../../../../core/sdk/sdk.js';
import type * as Protocol from '../../../../generated/protocol.js';
import { Linkifier } from './Linkifier.js';
export declare function buildStackTraceRows(stackTrace: Protocol.Runtime.StackTrace, target: SDK.Target.Target | null, linkifier: Linkifier, tabStops: boolean | undefined, updateCallback?: (arg0: (StackTraceRegularRow | StackTraceAsyncRow)[]) => void): (StackTraceRegularRow | StackTraceAsyncRow)[];
export declare function buildStackTracePreviewContents(target: SDK.Target.Target | null, linkifier: Linkifier, options?: Options): {
    element: HTMLElement;
    links: HTMLElement[];
};
export interface Options {
    stackTrace: Protocol.Runtime.StackTrace | undefined;
    tabStops: boolean | undefined;
}
export interface StackTraceRegularRow {
    functionName: string;
    ignoreListHide: boolean;
    link: HTMLElement | null;
    rowCountHide: boolean;
}
export interface StackTraceAsyncRow {
    asyncDescription: string;
    ignoreListHide: boolean;
    rowCountHide: boolean;
}
