import * as SDK from '../../core/sdk/sdk.js';
import type * as ProtocolProxyApi from '../../generated/protocol-proxy-api.js';
import type * as Protocol from '../../generated/protocol.js';
export declare class WebAudioModel extends SDK.SDKModel.SDKModel implements ProtocolProxyApi.WebAudioDispatcher {
    _enabled: boolean;
    _agent: ProtocolProxyApi.WebAudioApi;
    constructor(target: SDK.Target.Target);
    _flushContexts(): void;
    suspendModel(): Promise<void>;
    resumeModel(): Promise<void>;
    ensureEnabled(): void;
    contextCreated({ context }: Protocol.WebAudio.ContextCreatedEvent): void;
    contextWillBeDestroyed({ contextId }: Protocol.WebAudio.ContextWillBeDestroyedEvent): void;
    contextChanged({ context }: Protocol.WebAudio.ContextChangedEvent): void;
    audioListenerCreated({ listener }: Protocol.WebAudio.AudioListenerCreatedEvent): void;
    audioListenerWillBeDestroyed({ listenerId, contextId }: Protocol.WebAudio.AudioListenerWillBeDestroyedEvent): void;
    audioNodeCreated({ node }: Protocol.WebAudio.AudioNodeCreatedEvent): void;
    audioNodeWillBeDestroyed({ contextId, nodeId }: Protocol.WebAudio.AudioNodeWillBeDestroyedEvent): void;
    audioParamCreated({ param }: Protocol.WebAudio.AudioParamCreatedEvent): void;
    audioParamWillBeDestroyed({ contextId, nodeId, paramId }: Protocol.WebAudio.AudioParamWillBeDestroyedEvent): void;
    nodesConnected({ contextId, sourceId, destinationId, sourceOutputIndex, destinationInputIndex }: Protocol.WebAudio.NodesConnectedEvent): void;
    nodesDisconnected({ contextId, sourceId, destinationId, sourceOutputIndex, destinationInputIndex }: Protocol.WebAudio.NodesDisconnectedEvent): void;
    nodeParamConnected({ contextId, sourceId, destinationId, sourceOutputIndex }: Protocol.WebAudio.NodeParamConnectedEvent): void;
    nodeParamDisconnected({ contextId, sourceId, destinationId, sourceOutputIndex }: Protocol.WebAudio.NodeParamDisconnectedEvent): void;
    requestRealtimeData(contextId: string): Promise<Protocol.WebAudio.ContextRealtimeData | null>;
}
export declare const enum Events {
    ContextCreated = "ContextCreated",
    ContextDestroyed = "ContextDestroyed",
    ContextChanged = "ContextChanged",
    ModelReset = "ModelReset",
    ModelSuspend = "ModelSuspend",
    AudioListenerCreated = "AudioListenerCreated",
    AudioListenerWillBeDestroyed = "AudioListenerWillBeDestroyed",
    AudioNodeCreated = "AudioNodeCreated",
    AudioNodeWillBeDestroyed = "AudioNodeWillBeDestroyed",
    AudioParamCreated = "AudioParamCreated",
    AudioParamWillBeDestroyed = "AudioParamWillBeDestroyed",
    NodesConnected = "NodesConnected",
    NodesDisconnected = "NodesDisconnected",
    NodeParamConnected = "NodeParamConnected",
    NodeParamDisconnected = "NodeParamDisconnected"
}
