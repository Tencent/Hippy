import type { ChunkCallback } from './FormatterWorker.js';
export interface Item {
    title: string;
    subtitle?: string;
    line: number;
    column: number;
}
export declare function javaScriptOutline(content: string, chunkCallback: ChunkCallback): void;
