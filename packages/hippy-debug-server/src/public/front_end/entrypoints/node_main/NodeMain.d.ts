import * as Common from '../../core/common/common.js';
import type * as ProtocolProxyApi from '../../generated/protocol-proxy-api.js';
import type * as Protocol from '../../generated/protocol.js';
import type * as ProtocolClient from '../../core/protocol_client/protocol_client.js';
import * as SDK from '../../core/sdk/sdk.js';
export declare class NodeMainImpl extends Common.ObjectWrapper.ObjectWrapper implements Common.Runnable.Runnable {
    static instance(opts?: {
        forceNew: boolean | null;
    }): NodeMainImpl;
    run(): Promise<void>;
}
export declare class NodeChildTargetManager extends SDK.SDKModel.SDKModel implements ProtocolProxyApi.TargetDispatcher {
    _targetManager: SDK.TargetManager.TargetManager;
    _parentTarget: SDK.Target.Target;
    _targetAgent: ProtocolProxyApi.TargetApi;
    _childTargets: Map<string, SDK.Target.Target>;
    _childConnections: Map<string, NodeConnection>;
    constructor(parentTarget: SDK.Target.Target);
    _devicesDiscoveryConfigChanged(event: Common.EventTarget.EventTargetEvent): void;
    dispose(): void;
    targetCreated({ targetInfo }: Protocol.Target.TargetCreatedEvent): void;
    targetInfoChanged(_event: Protocol.Target.TargetInfoChangedEvent): void;
    targetDestroyed(_event: Protocol.Target.TargetDestroyedEvent): void;
    attachedToTarget({ sessionId, targetInfo }: Protocol.Target.AttachedToTargetEvent): void;
    detachedFromTarget({ sessionId }: Protocol.Target.DetachedFromTargetEvent): void;
    receivedMessageFromTarget({ sessionId, message }: Protocol.Target.ReceivedMessageFromTargetEvent): void;
    targetCrashed(_event: Protocol.Target.TargetCrashedEvent): void;
}
export declare class NodeConnection implements ProtocolClient.InspectorBackend.Connection {
    _targetAgent: ProtocolProxyApi.TargetApi;
    _sessionId: string;
    _onMessage: ((arg0: (Object | string)) => void) | null;
    _onDisconnect: ((arg0: string) => void) | null;
    constructor(targetAgent: ProtocolProxyApi.TargetApi, sessionId: string);
    setOnMessage(onMessage: (arg0: (Object | string)) => void): void;
    setOnDisconnect(onDisconnect: (arg0: string) => void): void;
    sendRawMessage(message: string): void;
    disconnect(): Promise<void>;
}
