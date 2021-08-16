/**
 * @interface
 */
export interface JavaScriptMetaData {
    signaturesForNativeFunction(name: string): string[][] | null;
    signaturesForInstanceMethod(name: string, receiverClassName: string): string[][] | null;
    signaturesForStaticMethod(name: string, receiverConstructorName: string): string[][] | null;
}
