import type * as Common from '../../core/common/common.js';
/**
 * @interface
 */
export interface ChunkedReader {
    fileSize(): number;
    loadedSize(): number;
    fileName(): string;
    cancel(): void;
    error(): DOMError | null;
}
export declare class ChunkedFileReader implements ChunkedReader {
    _file: File | null;
    _fileSize: number;
    _loadedSize: number;
    _streamReader: ReadableStreamReader<Uint8Array> | null;
    _chunkSize: number;
    _chunkTransferredCallback: ((arg0: ChunkedReader) => void) | undefined;
    _decoder: TextDecoder;
    _isCanceled: boolean;
    _error: DOMError | null;
    _transferFinished: (arg0: boolean) => void;
    _output?: Common.StringOutputStream.OutputStream;
    _reader?: FileReader | null;
    constructor(file: File, chunkSize: number, chunkTransferredCallback?: ((arg0: ChunkedReader) => void));
    read(output: Common.StringOutputStream.OutputStream): Promise<boolean>;
    cancel(): void;
    loadedSize(): number;
    fileSize(): number;
    fileName(): string;
    error(): DOMError | null;
    _decompressStream(stream: ReadableStream): ReadableStream;
    _onChunkLoaded(event: Event): void;
    _decodeChunkBuffer(buffer: ArrayBuffer, endOfFile: boolean): Promise<void>;
    _finishRead(): void;
    _loadChunk(): Promise<void>;
    _onError(event: Event): void;
}
export declare class FileOutputStream implements Common.StringOutputStream.OutputStream {
    _writeCallbacks: (() => void)[];
    _fileName: string;
    _closed?: boolean;
    constructor();
    open(fileName: string): Promise<boolean>;
    write(data: string): Promise<void>;
    close(): Promise<void>;
    _onAppendDone(event: Common.EventTarget.EventTargetEvent): void;
}
