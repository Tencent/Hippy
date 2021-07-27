export declare class TimelineGrid {
    element: HTMLDivElement;
    _dividersElement: HTMLElement;
    _gridHeaderElement: HTMLDivElement;
    _eventDividersElement: HTMLElement;
    _dividersLabelBarElement: HTMLElement;
    constructor();
    static calculateGridOffsets(calculator: Calculator, freeZoneAtLeft?: number): DividersData;
    static drawCanvasGrid(context: CanvasRenderingContext2D, dividersData: DividersData): void;
    static drawCanvasHeaders(context: CanvasRenderingContext2D, dividersData: DividersData, formatTimeFunction: (arg0: number) => string, paddingTop: number, headerHeight: number, freeZoneAtLeft?: number): void;
    get dividersElement(): HTMLElement;
    get dividersLabelBarElement(): HTMLElement;
    removeDividers(): void;
    updateDividers(calculator: Calculator, freeZoneAtLeft?: number): boolean;
    addEventDivider(divider: Element): void;
    addEventDividers(dividers: Element[]): void;
    removeEventDividers(): void;
    hideEventDividers(): void;
    showEventDividers(): void;
    hideDividers(): void;
    showDividers(): void;
    setScrollTop(scrollTop: number): void;
}
export interface Calculator {
    computePosition(time: number): number;
    formatValue(time: number, precision?: number): string;
    minimumBoundary(): number;
    zeroTime(): number;
    maximumBoundary(): number;
    boundarySpan(): number;
}
export interface DividersData {
    offsets: {
        position: number;
        time: number;
    }[];
    precision: number;
}
