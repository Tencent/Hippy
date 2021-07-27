import * as SDK from '../../../../core/sdk/sdk.js';
import type * as ProtocolProxyApi from '../../../../generated/protocol-proxy-api.js';
import type * as Protocol from '../../../../generated/protocol.js';
export declare class TargetDetachedDialog extends SDK.SDKModel.SDKModel implements ProtocolProxyApi.InspectorDispatcher {
    _hideCrashedDialog: (() => void) | null;
    constructor(target: SDK.Target.Target);
    detached({ reason }: Protocol.Inspector.DetachedEvent): void;
    static webSocketConnectionLost(): void;
    targetCrashed(): void;
    /** ;
     */
    targetReloadedAfterCrash(): void;
}
