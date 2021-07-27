import * as Common from '../common/common.js';
export declare const ResourceLoader: {};
export declare const streamWrite: (id: number, chunk: string) => void;
export interface LoadErrorDescription {
    statusCode: number;
    netError?: number;
    netErrorName?: string;
    urlValid?: boolean;
    message?: string;
}
export declare let load: (url: string, headers: {
    [x: string]: string;
} | null, callback: (arg0: boolean, arg1: {
    [x: string]: string;
}, arg2: string, arg3: LoadErrorDescription) => void) => void;
export declare function setLoadForTest(newLoad: (arg0: string, arg1: {
    [x: string]: string;
} | null, arg2: (arg0: boolean, arg1: {
    [x: string]: string;
}, arg2: string, arg3: LoadErrorDescription) => void) => void): void;
export declare function netErrorToMessage(netError: number | undefined, httpStatusCode: number | undefined, netErrorName: string | undefined): string | null;
export declare const loadAsStream: (url: string, headers: {
    [x: string]: string;
} | null, stream: Common.StringOutputStream.OutputStream, callback?: ((arg0: boolean, arg1: {
    [x: string]: string;
}, arg2: LoadErrorDescription) => void) | undefined) => void;
