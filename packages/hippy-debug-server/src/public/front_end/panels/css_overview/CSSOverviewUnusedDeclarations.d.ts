export interface UnusedDeclaration {
    declaration: string;
    nodeId: number;
}
export declare class CSSOverviewUnusedDeclarations {
    static _add(target: Map<string, UnusedDeclaration[]>, key: string, item: {
        declaration: string;
        nodeId: number;
    }): void;
    static checkForUnusedPositionValues(unusedDeclarations: Map<string, UnusedDeclaration[]>, nodeId: number, strings: string[], positionIdx: number, topIdx: number, leftIdx: number, rightIdx: number, bottomIdx: number): void;
    static checkForUnusedWidthAndHeightValues(unusedDeclarations: Map<string, UnusedDeclaration[]>, nodeId: number, strings: string[], displayIdx: number, widthIdx: number, heightIdx: number): void;
    static checkForInvalidVerticalAlignment(unusedDeclarations: Map<string, UnusedDeclaration[]>, nodeId: number, strings: string[], displayIdx: number, verticalAlignIdx: number): void;
}
