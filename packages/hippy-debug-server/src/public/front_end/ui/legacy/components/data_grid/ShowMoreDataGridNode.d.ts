import { DataGridNode } from './DataGrid.js';
declare type ShowMoreDataGridNodeCallback = (arg0: number, arg1: number) => Promise<void>;
export declare class ShowMoreDataGridNode extends DataGridNode<ShowMoreDataGridNode> {
    _callback: ShowMoreDataGridNodeCallback;
    _startPosition: number;
    _endPosition: number;
    _chunkSize: number;
    showNext: HTMLButtonElement;
    showAll: HTMLButtonElement;
    showLast: HTMLButtonElement;
    selectable: boolean;
    _hasCells?: boolean;
    constructor(callback: ShowMoreDataGridNodeCallback, startPosition: number, endPosition: number, chunkSize: number);
    _showNextChunk(): void;
    _showAll(): void;
    _showLastChunk(): void;
    _updateLabels(): void;
    createCells(element: Element): void;
    createCell(columnIdentifier: string): HTMLElement;
    setStartPosition(from: number): void;
    setEndPosition(to: number): void;
    nodeSelfHeight(): number;
    dispose(): void;
}
export {};
