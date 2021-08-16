import * as Common from '../common/common.js';
import * as ProtocolClient from '../protocol_client/protocol_client.js';
export declare class MainConnection implements ProtocolClient.InspectorBackend.Connection {
    _onMessage: ((arg0: (Object | string)) => void) | null;
    _onDisconnect: ((arg0: string) => void) | null;
    _messageBuffer: string;
    _messageSize: number;
    _eventListeners: Common.EventTarget.EventDescriptor[];
    constructor();
    setOnMessage(onMessage: (arg0: (Object | string)) => void): void;
    setOnDisconnect(onDisconnect: (arg0: string) => void): void;
    sendRawMessage(message: string): void;
    _dispatchMessage(event: Common.EventTarget.EventTargetEvent): void;
    _dispatchMessageChunk(event: Common.EventTarget.EventTargetEvent): void;
    disconnect(): Promise<void>;
}
export declare class WebSocketConnection implements ProtocolClient.InspectorBackend.Connection {
    _socket: WebSocket | null;
    _onMessage: ((arg0: (Object | string)) => void) | null;
    _onDisconnect: ((arg0: string) => void) | null;
    _onWebSocketDisconnect: (() => void) | null;
    _connected: boolean;
    _messages: string[];
    constructor(url: string, onWebSocketDisconnect: () => void);
    setOnMessage(onMessage: (arg0: (Object | string)) => void): void;
    setOnDisconnect(onDisconnect: (arg0: string) => void): void;
    _onError(): void;
    _onOpen(): void;
    _onClose(): void;
    _close(callback?: (() => void)): void;
    sendRawMessage(message: string): void;
    disconnect(): Promise<void>;
}
export declare class StubConnection implements ProtocolClient.InspectorBackend.Connection {
    _onMessage: ((arg0: (Object | string)) => void) | null;
    _onDisconnect: ((arg0: string) => void) | null;
    constructor();
    setOnMessage(onMessage: (arg0: (Object | string)) => void): void;
    setOnDisconnect(onDisconnect: (arg0: string) => void): void;
    sendRawMessage(message: string): void;
    _respondWithError(message: string): void;
    disconnect(): Promise<void>;
}
export declare class ParallelConnection implements ProtocolClient.InspectorBackend.Connection {
    _connection: ProtocolClient.InspectorBackend.Connection;
    _sessionId: string;
    _onMessage: ((arg0: Object) => void) | null;
    _onDisconnect: ((arg0: string) => void) | null;
    constructor(connection: ProtocolClient.InspectorBackend.Connection, sessionId: string);
    setOnMessage(onMessage: (arg0: Object) => void): void;
    setOnDisconnect(onDisconnect: (arg0: string) => void): void;
    sendRawMessage(message: string): void;
    disconnect(): Promise<void>;
}
export declare function initMainConnection(createMainTarget: () => Promise<void>, websocketConnectionLost: () => void): Promise<void>;
export declare function _createMainConnection(websocketConnectionLost: () => void): ProtocolClient.InspectorBackend.Connection;
