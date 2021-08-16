import type * as Workspace from '../workspace/workspace.js';
export interface LiveLocation {
    update(): Promise<void>;
    uiLocation(): Promise<Workspace.UISourceCode.UILocation | null>;
    dispose(): void;
    isIgnoreListed(): Promise<boolean>;
}
export declare class LiveLocationWithPool implements LiveLocation {
    _updateDelegate: ((arg0: LiveLocation) => Promise<void>) | null;
    _locationPool: LiveLocationPool;
    _updatePromise: Promise<void> | null;
    constructor(updateDelegate: (arg0: LiveLocation) => Promise<void>, locationPool: LiveLocationPool);
    update(): Promise<void>;
    uiLocation(): Promise<Workspace.UISourceCode.UILocation | null>;
    dispose(): void;
    isIgnoreListed(): Promise<boolean>;
}
export declare class LiveLocationPool {
    _locations: Set<LiveLocation>;
    constructor();
    _add(location: LiveLocation): void;
    _delete(location: LiveLocation): void;
    disposeAll(): void;
}
