import type { Target } from './Target.js';
import { SDKModel } from './SDKModel.js';
export declare class SecurityOriginManager extends SDKModel {
    _mainSecurityOrigin: string;
    _unreachableMainSecurityOrigin: string | null;
    _securityOrigins: Set<string>;
    constructor(target: Target);
    updateSecurityOrigins(securityOrigins: Set<string>): void;
    securityOrigins(): string[];
    mainSecurityOrigin(): string;
    unreachableMainSecurityOrigin(): string | null;
    setMainSecurityOrigin(securityOrigin: string, unreachableSecurityOrigin: string): void;
}
export declare enum Events {
    SecurityOriginAdded = "SecurityOriginAdded",
    SecurityOriginRemoved = "SecurityOriginRemoved",
    MainSecurityOriginChanged = "MainSecurityOriginChanged"
}
