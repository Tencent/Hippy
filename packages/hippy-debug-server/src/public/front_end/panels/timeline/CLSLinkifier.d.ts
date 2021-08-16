import type * as Common from '../../core/common/common.js';
interface Color {
    r: number;
    g: number;
    b: number;
    a: number;
}
export declare class CLSRect {
    x: number;
    y: number;
    width: number;
    height: number;
    color: Color;
    outlineColor: Color;
    constructor([x, y, width, height]: [number, number, number, number]);
}
export declare class Linkifier implements Common.Linkifier.Linkifier {
    static instance(opts?: {
        forceNew: boolean | null;
    }): Linkifier;
    linkify(object: Object, _options?: Common.Linkifier.Options): Node;
}
export {};
