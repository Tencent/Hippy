import type { NameValue } from './NetworkRequest.js';
export declare class ServerTiming {
    metric: string;
    value: number | null;
    description: string | null;
    constructor(metric: string, value: number | null, description: string | null);
    static parseHeaders(headers: NameValue[]): ServerTiming[] | null;
    /**
     * TODO(crbug.com/1011811): Instead of using !Object<string, *> we should have a proper type
     *                          with name, desc and dur properties.
     */
    static createFromHeaderValue(valueString: string): {
        [x: string]: any;
    }[];
    static getParserForParameter(paramName: string): ((arg0: {
        [x: string]: any;
    }, arg1: string | null) => void) | null;
    static showWarning(msg: string): void;
}
