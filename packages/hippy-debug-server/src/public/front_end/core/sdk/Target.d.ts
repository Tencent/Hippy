import * as ProtocolClient from '../protocol_client/protocol_client.js';
import type * as Protocol from '../../generated/protocol.js';
import type { TargetManager } from './TargetManager.js';
import { SDKModel } from './SDKModel.js';
export declare class Target extends ProtocolClient.InspectorBackend.TargetBase {
    _targetManager: TargetManager;
    _name: string;
    _inspectedURL: string;
    _inspectedURLName: string;
    _capabilitiesMask: number;
    _type: Type;
    _parentTarget: Target | null;
    _id: string;
    _modelByConstructor: Map<new (arg1: Target) => SDKModel, SDKModel>;
    _isSuspended: boolean;
    _targetInfo: Protocol.Target.TargetInfo | undefined;
    _creatingModels?: boolean;
    constructor(targetManager: TargetManager, id: string, name: string, type: Type, parentTarget: Target | null, sessionId: string, suspended: boolean, connection: ProtocolClient.InspectorBackend.Connection | null, targetInfo?: Protocol.Target.TargetInfo);
    createModels(required: Set<new (arg1: Target) => SDKModel>): void;
    id(): string;
    name(): string;
    type(): Type;
    markAsNodeJSForTest(): void;
    targetManager(): TargetManager;
    hasAllCapabilities(capabilitiesMask: number): boolean;
    decorateLabel(label: string): string;
    parentTarget(): Target | null;
    dispose(reason: string): void;
    model<T extends SDKModel>(modelClass: new (arg1: Target) => T): T | null;
    models(): Map<new (arg1: Target) => SDKModel, SDKModel>;
    inspectedURL(): string;
    setInspectedURL(inspectedURL: string): void;
    suspend(reason?: string): Promise<void>;
    resume(): Promise<void>;
    suspended(): boolean;
    updateTargetInfo(targetInfo: Protocol.Target.TargetInfo): void;
    targetInfo(): Protocol.Target.TargetInfo | undefined;
}
export declare enum Type {
    Frame = "frame",
    ServiceWorker = "service-worker",
    Worker = "worker",
    Node = "node",
    Browser = "browser"
}
export declare enum Capability {
    Browser = 1,
    DOM = 2,
    JS = 4,
    Log = 8,
    Network = 16,
    Target = 32,
    ScreenCapture = 64,
    Tracing = 128,
    Emulation = 256,
    Security = 512,
    Input = 1024,
    Inspector = 2048,
    DeviceEmulation = 4096,
    Storage = 8192,
    ServiceWorker = 16384,
    Audits = 32768,
    WebAuthn = 65536,
    IO = 131072,
    Media = 262144,
    None = 0
}
