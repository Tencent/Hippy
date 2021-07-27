import * as UI from '../../legacy.js';
export declare class BezierUI {
    width: number;
    height: number;
    marginTop: number;
    radius: number;
    linearLine: boolean;
    constructor(width: number, height: number, marginTop: number, controlPointRadius: number, linearLine: boolean);
    static drawVelocityChart(bezier: UI.Geometry.CubicBezier, path: Element, width: number): void;
    curveWidth(): number;
    curveHeight(): number;
    _drawLine(parentElement: Element, className: string, x1: number, y1: number, x2: number, y2: number): void;
    _drawControlPoints(parentElement: Element, startX: number, startY: number, controlX: number, controlY: number): void;
    drawCurve(bezier: UI.Geometry.CubicBezier | null, svg: Element): void;
}
export declare const Height = 26;
