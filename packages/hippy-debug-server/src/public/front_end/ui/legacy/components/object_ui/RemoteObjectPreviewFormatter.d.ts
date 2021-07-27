import * as Protocol from '../../../../generated/protocol.js';
export declare class RemoteObjectPreviewFormatter {
    static _objectPropertyComparator(a: Protocol.Runtime.PropertyPreview, b: Protocol.Runtime.PropertyPreview): number;
    appendObjectPreview(parentElement: DocumentFragment | Element, preview: Protocol.Runtime.ObjectPreview, isEntry: boolean): void;
    _abbreviateFullQualifiedClassName(description: string): string;
    _appendObjectPropertiesPreview(parentElement: Element, preview: Protocol.Runtime.ObjectPreview): void;
    _appendArrayPropertiesPreview(parentElement: Element, preview: Protocol.Runtime.ObjectPreview): void;
    _appendEntriesPreview(parentElement: Element, preview: Protocol.Runtime.ObjectPreview): void;
    _renderDisplayName(name: string): Element;
    _renderPropertyPreviewOrAccessor(propertyPath: Protocol.Runtime.PropertyPreview[]): Element;
    renderPropertyPreview(type: string, subtype?: string, className?: string | null, description?: string): HTMLElement;
}
export declare const createSpansForNodeTitle: (container: Element, nodeTitle: string) => void;
export declare const createSpanForTrustedType: (span: Element, description: string, className: string) => void;
