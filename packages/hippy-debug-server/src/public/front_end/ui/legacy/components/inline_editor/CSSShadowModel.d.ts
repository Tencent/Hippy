import * as Common from '../../../../core/common/common.js';
export declare class CSSShadowModel {
    _isBoxShadow: boolean;
    _inset: boolean;
    _offsetX: CSSLength;
    _offsetY: CSSLength;
    _blurRadius: CSSLength;
    _spreadRadius: CSSLength;
    _color: Common.Color.Color;
    _format: Part[];
    _important: boolean;
    constructor(isBoxShadow: boolean);
    static parseTextShadow(text: string): CSSShadowModel[];
    static parseBoxShadow(text: string): CSSShadowModel[];
    static _parseShadow(text: string, isBoxShadow: boolean): CSSShadowModel[];
    setInset(inset: boolean): void;
    setOffsetX(offsetX: CSSLength): void;
    setOffsetY(offsetY: CSSLength): void;
    setBlurRadius(blurRadius: CSSLength): void;
    setSpreadRadius(spreadRadius: CSSLength): void;
    setColor(color: Common.Color.Color): void;
    isBoxShadow(): boolean;
    inset(): boolean;
    offsetX(): CSSLength;
    offsetY(): CSSLength;
    blurRadius(): CSSLength;
    spreadRadius(): CSSLength;
    color(): Common.Color.Color;
    asCSSText(): string;
}
declare const enum Part {
    Inset = "I",
    OffsetX = "X",
    OffsetY = "Y",
    BlurRadius = "B",
    SpreadRadius = "S",
    Color = "C",
    Important = "M"
}
export declare class CSSLength {
    amount: number;
    unit: string;
    constructor(amount: number, unit: string);
    static parse(text: string): CSSLength | null;
    static zero(): CSSLength;
    asCSSText(): string;
    static Regex: RegExp;
}
export {};
