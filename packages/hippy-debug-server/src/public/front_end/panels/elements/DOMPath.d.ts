import * as SDK from '../../core/sdk/sdk.js';
export declare const fullQualifiedSelector: (node: SDK.DOMModel.DOMNode, justSelector?: boolean | undefined) => string;
export declare const cssPath: (node: SDK.DOMModel.DOMNode, optimized?: boolean | undefined) => string;
export declare const canGetJSPath: (node: SDK.DOMModel.DOMNode) => boolean;
export declare const jsPath: (node: SDK.DOMModel.DOMNode, optimized?: boolean | undefined) => string;
export declare const _cssPathStep: (node: SDK.DOMModel.DOMNode, optimized: boolean, isTargetNode: boolean) => Step | null;
export declare const xPath: (node: SDK.DOMModel.DOMNode, optimized?: boolean | undefined) => string;
export declare const _xPathValue: (node: SDK.DOMModel.DOMNode, optimized?: boolean | undefined) => Step | null;
export declare const _xPathIndex: (node: SDK.DOMModel.DOMNode) => number;
export declare class Step {
    value: string;
    optimized: boolean;
    constructor(value: string, optimized: boolean);
    toString(): string;
}
