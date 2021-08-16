import type * as ProtocolClient from '../protocol_client/protocol_client.js';
import type * as ProtocolProxyApi from '../../generated/protocol-proxy-api.js';
import type * as Protocol from '../../generated/protocol.js';
import type { Target } from './Target.js';
import { SDKModel } from './SDKModel.js';
import { TargetManager } from './TargetManager.js';
export declare class ChildTargetManager extends SDKModel implements ProtocolProxyApi.TargetDispatcher {
    _targetManager: TargetManager;
    _parentTarget: Target;
    _targetAgent: ProtocolProxyApi.TargetApi;
    _targetInfos: Map<string, Protocol.Target.TargetInfo>;
    _childTargets: Map<string, Target>;
    _parallelConnections: Map<string, ProtocolClient.InspectorBackend.Connection>;
    _parentTargetId: string | null;
    constructor(parentTarget: Target);
    static install(attachCallback?: ((arg0: {
        target: Target;
        waitingForDebugger: boolean;
    }) => Promise<void>)): void;
    childTargets(): Target[];
    suspendModel(): Promise<void>;
    resumeModel(): Promise<void>;
    dispose(): void;
    targetCreated({ targetInfo }: Protocol.Target.TargetCreatedEvent): void;
    targetInfoChanged({ targetInfo }: Protocol.Target.TargetInfoChangedEvent): void;
    targetDestroyed({ targetId }: Protocol.Target.TargetDestroyedEvent): void;
    targetCrashed({ targetId, status, errorCode }: Protocol.Target.TargetCrashedEvent): void;
    _fireAvailableTargetsChanged(): void;
    _getParentTargetId(): Promise<string>;
    attachedToTarget({ sessionId, targetInfo, waitingForDebugger }: Protocol.Target.AttachedToTargetEvent): void;
    detachedFromTarget({ sessionId }: Protocol.Target.DetachedFromTargetEvent): void;
    receivedMessageFromTarget({}: Protocol.Target.ReceivedMessageFromTargetEvent): void;
    createParallelConnection(onMessage: (arg0: (Object | string)) => void): Promise<ProtocolClient.InspectorBackend.Connection>;
    _createParallelConnectionAndSessionForTarget(target: Target, targetId: string): Promise<{
        connection: ProtocolClient.InspectorBackend.Connection;
        sessionId: string;
    }>;
    targetInfos(): Protocol.Target.TargetInfo[];
}
export declare enum Events {
    TargetCreated = "TargetCreated",
    TargetDestroyed = "TargetDestroyed",
    TargetInfoChanged = "TargetInfoChanged"
}
