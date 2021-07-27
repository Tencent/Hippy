import type * as Protocol from '../../generated/protocol.js';
export declare class CSSFontFace {
    _fontFamily: string;
    _fontVariationAxes: Protocol.CSS.FontVariationAxis[];
    _fontVariationAxesByTag: Map<string, Protocol.CSS.FontVariationAxis>;
    constructor(payload: Protocol.CSS.FontFace);
    getFontFamily(): string;
    getVariationAxisByTag(tag: string): Protocol.CSS.FontVariationAxis | undefined;
}
