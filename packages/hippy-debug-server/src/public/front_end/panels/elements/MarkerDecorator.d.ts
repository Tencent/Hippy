import type * as Platform from '../../core/platform/platform.js';
import type * as SDK from '../../core/sdk/sdk.js';
export interface MarkerDecorator {
    decorate(node: SDK.DOMModel.DOMNode): {
        title: string;
        color: string;
    } | null;
}
export declare class GenericDecorator implements MarkerDecorator {
    _title: string;
    _color: string;
    constructor(extension: {
        marker: string;
        title: () => string;
        color: string;
    });
    decorate(_node: SDK.DOMModel.DOMNode): {
        title: string;
        color: string;
    } | null;
}
export declare function getRegisteredDecorators(): MarkerDecoratorRegistration[];
export interface MarkerDecoratorRegistration {
    decorator: () => MarkerDecorator;
    marker: string;
    color?: string;
    title?: (() => Platform.UIString.LocalizedString);
}
