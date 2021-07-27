import type * as Common from '../../core/common/common.js';
export declare class JavaScriptMetadataImpl implements Common.JavaScriptMetaData.JavaScriptMetaData {
    _uniqueFunctions: Map<string, string[][]>;
    _instanceMethods: Map<string, Map<string, string[][]>>;
    _staticMethods: Map<string, Map<string, string[][]>>;
    static instance(opts?: {
        forceNew: boolean | null;
    }): JavaScriptMetadataImpl;
    constructor();
    signaturesForNativeFunction(name: string): string[][] | null;
    signaturesForInstanceMethod(name: string, receiverClassName: string): string[][] | null;
    signaturesForStaticMethod(name: string, receiverConstructorName: string): string[][] | null;
}
