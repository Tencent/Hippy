import type { Angle } from './CSSAngleUtils.js';
export interface CSSAngleSwatchData {
    angle: Angle;
}
export declare class CSSAngleSwatch extends HTMLElement {
    static litTagName: import("../../../lit-html/static.js").Static;
    private readonly shadow;
    private angle;
    set data(data: CSSAngleSwatchData);
    private render;
}
declare global {
    interface HTMLElementTagNameMap {
        'devtools-css-angle-swatch': CSSAngleSwatch;
    }
}
