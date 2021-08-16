import type * as Protocol from '../../generated/protocol.js';
export declare class ContextDetailBuilder {
    _fragment: DocumentFragment;
    _container: HTMLDivElement;
    constructor(context: Protocol.WebAudio.BaseAudioContext);
    _build(context: Protocol.WebAudio.BaseAudioContext): void;
    _addTitle(title: string, subtitle: string): void;
    _addEntry(entry: string, value: string | number, unit?: string | undefined): void;
    getFragment(): DocumentFragment;
}
export declare class ContextSummaryBuilder {
    _fragment: DocumentFragment;
    constructor(contextId: string, contextRealtimeData: Protocol.WebAudio.ContextRealtimeData);
    getFragment(): DocumentFragment;
}
