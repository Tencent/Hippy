export interface LinearMemoryViewerData {
    memory: Uint8Array;
    address: number;
    memoryOffset: number;
    focus: boolean;
}
export declare class ByteSelectedEvent extends Event {
    data: number;
    constructor(address: number);
}
export declare class ResizeEvent extends Event {
    data: number;
    constructor(numBytesPerPage: number);
}
export declare class LinearMemoryViewer extends HTMLElement {
    static litTagName: import("../../lit-html/static.js").Static;
    private static readonly BYTE_GROUP_MARGIN;
    private static readonly BYTE_GROUP_SIZE;
    private readonly shadow;
    private readonly resizeObserver;
    private isObservingResize;
    private memory;
    private address;
    private memoryOffset;
    private numRows;
    private numBytesInRow;
    private focusOnByte;
    private lastKeyUpdateSent;
    set data(data: LinearMemoryViewerData);
    connectedCallback(): void;
    disconnectedCallback(): void;
    private update;
    private focusOnView;
    private resize;
    /** Recomputes the number of rows and (byte) columns that fit into the current view. */
    private updateDimensions;
    private engageResizeObserver;
    private render;
    private onKeyDown;
    private renderView;
    private renderRow;
    private renderByteValues;
    private renderCharacterValues;
    private toAscii;
    private onSelectedByte;
}
declare global {
    interface HTMLElementTagNameMap {
        'devtools-linear-memory-inspector-viewer': LinearMemoryViewer;
    }
}
