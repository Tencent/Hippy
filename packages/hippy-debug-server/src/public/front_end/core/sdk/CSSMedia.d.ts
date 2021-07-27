import * as TextUtils from '../../models/text_utils/text_utils.js';
import type * as Protocol from '../../generated/protocol.js';
import type { CSSModel, Edit } from './CSSModel.js';
import { CSSLocation } from './CSSModel.js';
import type { CSSStyleSheetHeader } from './CSSStyleSheetHeader.js';
export declare class CSSMediaQuery {
    _active: boolean;
    _expressions: CSSMediaQueryExpression[] | null;
    constructor(payload: Protocol.CSS.MediaQuery);
    static parsePayload(payload: Protocol.CSS.MediaQuery): CSSMediaQuery;
    active(): boolean;
    expressions(): CSSMediaQueryExpression[] | null;
}
export declare class CSSMediaQueryExpression {
    _value: number;
    _unit: string;
    _feature: string;
    _valueRange: TextUtils.TextRange.TextRange | null;
    _computedLength: number | null;
    constructor(payload: Protocol.CSS.MediaQueryExpression);
    static parsePayload(payload: Protocol.CSS.MediaQueryExpression): CSSMediaQueryExpression;
    value(): number;
    unit(): string;
    feature(): string;
    valueRange(): TextUtils.TextRange.TextRange | null;
    computedLength(): number | null;
}
export declare class CSSMedia {
    _cssModel: CSSModel;
    text?: string;
    source?: Protocol.CSS.CSSMediaSource;
    sourceURL?: string;
    range?: TextUtils.TextRange.TextRange | null;
    styleSheetId?: string;
    mediaList?: CSSMediaQuery[] | null;
    constructor(cssModel: CSSModel, payload: Protocol.CSS.CSSMedia);
    static parsePayload(cssModel: CSSModel, payload: Protocol.CSS.CSSMedia): CSSMedia;
    static parseMediaArrayPayload(cssModel: CSSModel, payload: Protocol.CSS.CSSMedia[]): CSSMedia[];
    _reinitialize(payload: Protocol.CSS.CSSMedia): void;
    rebase(edit: Edit): void;
    equal(other: CSSMedia): boolean;
    active(): boolean;
    lineNumberInSource(): number | undefined;
    columnNumberInSource(): number | undefined;
    header(): CSSStyleSheetHeader | null;
    rawLocation(): CSSLocation | null;
}
export declare const Source: {
    LINKED_SHEET: string;
    INLINE_SHEET: string;
    MEDIA_RULE: string;
    IMPORT_RULE: string;
};
