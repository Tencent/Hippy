import * as UI from '../../legacy.js';
import { ColorSwatch } from './ColorSwatch.js';
import type { CSSShadowModel } from './CSSShadowModel.js';
export declare class BezierSwatch extends HTMLSpanElement {
    _iconElement: UI.Icon.Icon;
    _textElement: HTMLElement;
    constructor();
    static create(): BezierSwatch;
    bezierText(): string;
    setBezierText(text: string): void;
    hideText(hide: boolean): void;
    iconElement(): HTMLSpanElement;
    static _constructor: (() => Element) | null;
}
export declare class CSSShadowSwatch extends HTMLSpanElement {
    _iconElement: UI.Icon.Icon;
    _contentElement: HTMLElement;
    _colorSwatch: ColorSwatch | null;
    _model?: CSSShadowModel;
    constructor();
    static create(): CSSShadowSwatch;
    model(): CSSShadowModel;
    setCSSShadow(model: CSSShadowModel): void;
    hideText(hide: boolean): void;
    iconElement(): HTMLSpanElement;
    colorSwatch(): ColorSwatch | null;
    static _constructor: (() => Element) | null;
}
