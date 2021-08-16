export interface Item {
    title: string;
    subtitle?: string;
    line: number;
    column: number;
}
export declare function htmlOutline(content: string, chunkCallback: (arg0: {
    chunk: Array<Item>;
    isLastChunk: boolean;
}) => void): void;
