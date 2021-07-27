import * as SDK from '../../core/sdk/sdk.js';
import type * as ProtocolProxyApi from '../../generated/protocol-proxy-api.js';
import * as Protocol from '../../generated/protocol.js';
export declare class InputModel extends SDK.SDKModel.SDKModel {
    _inputAgent: ProtocolProxyApi.InputApi;
    _activeTouchOffsetTop: number | null;
    _activeTouchParams: Protocol.Input.EmulateTouchFromMouseEventRequest | null;
    constructor(target: SDK.Target.Target);
    emitKeyEvent(event: Event): void;
    emitTouchFromMouseEvent(event: Event, offsetTop: number, zoom: number): void;
    cancelTouch(): void;
    _modifiersForEvent(event: KeyboardEvent): number;
}
