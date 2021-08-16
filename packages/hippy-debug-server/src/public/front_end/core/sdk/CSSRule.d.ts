import * as Protocol from '../../generated/protocol.js';
import * as TextUtils from '../../models/text_utils/text_utils.js';
import { CSSMedia } from './CSSMedia.js';
import type { CSSModel, Edit } from './CSSModel.js';
import { CSSStyleDeclaration } from './CSSStyleDeclaration.js';
import type { CSSStyleSheetHeader } from './CSSStyleSheetHeader.js';
export declare class CSSRule {
    _cssModel: CSSModel;
    styleSheetId: string | undefined;
    sourceURL: string | undefined;
    origin: Protocol.CSS.StyleSheetOrigin;
    style: CSSStyleDeclaration;
    constructor(cssModel: CSSModel, payload: {
        style: Protocol.CSS.CSSStyle;
        styleSheetId: (string | undefined);
        origin: Protocol.CSS.StyleSheetOrigin;
    });
    rebase(edit: Edit): void;
    resourceURL(): string;
    isUserAgent(): boolean;
    isInjected(): boolean;
    isViaInspector(): boolean;
    isRegular(): boolean;
    cssModel(): CSSModel;
    _getStyleSheetHeader(styleSheetId: string): CSSStyleSheetHeader;
}
declare class CSSValue {
    text: string;
    range: TextUtils.TextRange.TextRange | undefined;
    constructor(payload: Protocol.CSS.Value);
    rebase(edit: Edit): void;
}
export declare class CSSStyleRule extends CSSRule {
    selectors: CSSValue[];
    media: CSSMedia[];
    wasUsed: boolean;
    constructor(cssModel: CSSModel, payload: Protocol.CSS.CSSRule, wasUsed?: boolean);
    static createDummyRule(cssModel: CSSModel, selectorText: string): CSSStyleRule;
    _reinitializeSelectors(selectorList: Protocol.CSS.SelectorList): void;
    setSelectorText(newSelector: string): Promise<boolean>;
    selectorText(): string;
    selectorRange(): TextUtils.TextRange.TextRange | null;
    lineNumberInSource(selectorIndex: number): number;
    columnNumberInSource(selectorIndex: number): number | undefined;
    rebase(edit: Edit): void;
}
export declare class CSSKeyframesRule {
    _cssModel: CSSModel;
    _animationName: CSSValue;
    _keyframes: CSSKeyframeRule[];
    constructor(cssModel: CSSModel, payload: Protocol.CSS.CSSKeyframesRule);
    name(): CSSValue;
    keyframes(): CSSKeyframeRule[];
}
export declare class CSSKeyframeRule extends CSSRule {
    _keyText: CSSValue;
    constructor(cssModel: CSSModel, payload: Protocol.CSS.CSSKeyframeRule);
    key(): CSSValue;
    _reinitializeKey(payload: Protocol.CSS.Value): void;
    rebase(edit: Edit): void;
    setKeyText(newKeyText: string): Promise<boolean>;
}
export {};
