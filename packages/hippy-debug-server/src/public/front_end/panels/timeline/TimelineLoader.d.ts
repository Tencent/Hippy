import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Bindings from '../../models/bindings/bindings.js';
import * as TextUtils from '../../models/text_utils/text_utils.js';
export declare class TimelineLoader implements Common.StringOutputStream.OutputStream {
    _client: Client | null;
    _backingStorage: Bindings.TempFile.TempFileBackingStorage;
    _tracingModel: SDK.TracingModel.TracingModel | null;
    _canceledCallback: (() => void) | null;
    _state: State;
    _buffer: string;
    _firstRawChunk: boolean;
    _firstChunk: boolean;
    _loadedBytes: number;
    _totalSize: number;
    _jsonTokenizer: TextUtils.TextUtils.BalancedJSONTokenizer;
    constructor(client: Client);
    static loadFromFile(file: File, client: Client): TimelineLoader;
    static loadFromEvents(events: SDK.TracingManager.EventPayload[], client: Client): TimelineLoader;
    static loadFromURL(url: string, client: Client): TimelineLoader;
    cancel(): void;
    write(chunk: string): Promise<void>;
    _writeBalancedJSON(data: string): void;
    _reportErrorAndCancelLoading(message?: string): void;
    _looksLikeAppVersion(item: any): boolean;
    close(): Promise<void>;
    _finalizeTrace(): void;
    _parseCPUProfileFormat(text: string): void;
}
export declare const TransferChunkLengthBytes = 5000000;
/**
 * @interface
 */
export interface Client {
    loadingStarted(): void;
    loadingProgress(progress?: number): void;
    processingStarted(): void;
    loadingComplete(tracingModel: SDK.TracingModel.TracingModel | null): void;
}
export declare enum State {
    Initial = "Initial",
    LookingForEvents = "LookingForEvents",
    ReadingEvents = "ReadingEvents",
    SkippingTail = "SkippingTail",
    LoadingCPUProfileFormat = "LoadingCPUProfileFormat"
}
