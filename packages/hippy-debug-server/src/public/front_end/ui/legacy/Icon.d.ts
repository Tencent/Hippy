export declare class Icon extends HTMLSpanElement {
    _descriptor: Descriptor | null;
    _spriteSheet: SpriteSheet | null;
    _iconType: string;
    constructor();
    static create(iconType?: string, className?: string): Icon;
    setIconType(iconType: string): void;
    _toggleClasses(value: boolean): void;
    _propertyValue(): string;
}
export interface Descriptor {
    position: string;
    spritesheet: string;
    isMask?: boolean;
    coordinates?: {
        x: number;
        y: number;
    };
    invert?: boolean;
}
export interface SpriteSheet {
    cellWidth: number;
    cellHeight: number;
    padding: number;
}
