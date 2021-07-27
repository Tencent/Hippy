import * as SDK from '../../../../core/sdk/sdk.js';
export interface PrecomputedFeatures {
    renderedWidth: number;
    renderedHeight: number;
    currentSrc?: string;
}
export declare class ImagePreview {
    static build(target: SDK.Target.Target, originalImageURL: string, showDimensions: boolean, options?: {
        precomputedFeatures: (PrecomputedFeatures | undefined);
        imageAltText: (string | undefined);
    } | undefined): Promise<Element | null>;
    static loadDimensionsForNode(node: SDK.DOMModel.DOMNode): Promise<PrecomputedFeatures | undefined>;
    static defaultAltTextForImageURL(url: string): string;
}
