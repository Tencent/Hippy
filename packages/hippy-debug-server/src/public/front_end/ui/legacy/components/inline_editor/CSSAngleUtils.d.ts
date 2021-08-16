export declare const CSSAngleRegex: RegExp;
export declare const enum AngleUnit {
    Deg = "deg",
    Grad = "grad",
    Rad = "rad",
    Turn = "turn"
}
export interface Angle {
    value: number;
    unit: AngleUnit;
}
export declare const parseText: (text: string) => Angle | null;
export declare const getAngleFromRadians: (rad: number, targetUnit: AngleUnit) => Angle;
export declare const getRadiansFromAngle: (angle: Angle) => number;
export declare const get2DTranslationsForAngle: (angle: Angle, radius: number) => {
    translateX: number;
    translateY: number;
};
export declare const roundAngleByUnit: (angle: Angle) => Angle;
export declare const getNextUnit: (currentUnit: AngleUnit) => AngleUnit;
export declare const convertAngleUnit: (angle: Angle, newUnit: AngleUnit) => Angle;
export declare const getNewAngleFromEvent: (angle: Angle, event: MouseEvent | KeyboardEvent) => Angle | undefined;
