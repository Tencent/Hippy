import * as Common from '../common/common.js';
import type { Target } from './Target.js';
export interface RegistrationInfo {
    capabilities: number;
    autostart: boolean;
    early?: boolean;
}
declare const registeredModels: Map<new (arg1: Target) => SDKModel, RegistrationInfo>;
export declare class SDKModel extends Common.ObjectWrapper.ObjectWrapper {
    _target: Target;
    constructor(target: Target);
    target(): Target;
    /**
     * Override this method to perform tasks that are required to suspend the
     * model and that still need other models in an unsuspended state.
     */
    preSuspendModel(_reason?: string): Promise<void>;
    suspendModel(_reason?: string): Promise<void>;
    resumeModel(): Promise<void>;
    /**
     * Override this method to perform tasks that are required to after resuming
     * the model and that require all models already in an unsuspended state.
     */
    postResumeModel(): Promise<void>;
    dispose(): void;
    static register(modelClass: new (arg1: Target) => SDKModel, registrationInfo: RegistrationInfo): void;
    static get registeredModels(): typeof registeredModels;
}
export {};
