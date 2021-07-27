import * as Common from '../../../../core/common/common.js';
export declare class ContrastInfo extends Common.ObjectWrapper.ObjectWrapper {
    _isNull: boolean;
    _contrastRatio: number | null;
    _contrastRatioAPCA: number | null;
    _contrastRatioThresholds: {
        [x: string]: number;
    } | null;
    _contrastRationAPCAThreshold: number | null;
    _fgColor: Common.Color.Color | null;
    _bgColor: Common.Color.Color | null;
    _colorFormat: string | undefined;
    constructor(contrastInfo: ContrastInfoType | null);
    isNull(): boolean;
    setColor(fgColor: Common.Color.Color, colorFormat?: string): void;
    colorFormat(): string | undefined;
    color(): Common.Color.Color | null;
    contrastRatio(): number | null;
    contrastRatioAPCA(): number | null;
    contrastRatioAPCAThreshold(): number | null;
    setBgColor(bgColor: Common.Color.Color): void;
    _setBgColorInternal(bgColor: Common.Color.Color): void;
    bgColor(): Common.Color.Color | null;
    _updateContrastRatio(): void;
    contrastRatioThreshold(level: string): number | null;
}
export declare const enum Events {
    ContrastInfoUpdated = "ContrastInfoUpdated"
}
export interface ContrastInfoType {
    backgroundColors: string[] | null;
    computedFontSize: string;
    computedFontWeight: string;
}
