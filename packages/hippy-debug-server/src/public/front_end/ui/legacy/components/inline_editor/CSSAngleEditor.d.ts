import type { Angle } from './CSSAngleUtils.js';
export interface CSSAngleEditorData {
    angle: Angle;
    onAngleUpdate: (angle: Angle) => void;
    background: string;
}
export declare class CSSAngleEditor extends HTMLElement {
    static litTagName: import("../../../lit-html/static.js").Static;
    private readonly shadow;
    private angle;
    private onAngleUpdate?;
    private background;
    private clockRadius;
    private dialTemplates?;
    private mousemoveThrottler;
    private mousemoveListener;
    connectedCallback(): void;
    set data(data: CSSAngleEditorData);
    private updateAngleFromMousePosition;
    private onEditorMousedown;
    private onMousemove;
    private onEditorWheel;
    private render;
    private renderDials;
}
declare global {
    interface HTMLElementTagNameMap {
        'devtools-css-angle-editor': CSSAngleEditor;
    }
}
