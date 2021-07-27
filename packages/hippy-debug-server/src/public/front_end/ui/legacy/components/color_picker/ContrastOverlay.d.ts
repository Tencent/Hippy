import * as Common from '../../../../core/common/common.js';
import type { ContrastInfo } from './ContrastInfo.js';
export declare class ContrastOverlay {
    _contrastInfo: ContrastInfo;
    _visible: boolean;
    _contrastRatioSVG: Element;
    _contrastRatioLines: Map<string, Element>;
    _width: number;
    _height: number;
    _contrastRatioLineBuilder: ContrastRatioLineBuilder;
    _contrastRatioLinesThrottler: Common.Throttler.Throttler;
    _drawContrastRatioLinesBound: () => Promise<void>;
    constructor(contrastInfo: ContrastInfo, colorElement: Element);
    _update(): void;
    setDimensions(width: number, height: number): void;
    setVisible(visible: boolean): void;
    _drawContrastRatioLines(): Promise<void>;
}
export declare class ContrastRatioLineBuilder {
    _contrastInfo: ContrastInfo;
    constructor(contrastInfo: ContrastInfo);
    drawContrastRatioLine(width: number, height: number, level: string): string | null;
}
