import type { Action } from './ActionRegistration.js';
import { Context } from './Context.js';
export declare class ActionRegistry {
    _actionsById: Map<string, Action>;
    private constructor();
    static instance(opts?: {
        forceNew: boolean | null;
    }): ActionRegistry;
    static removeInstance(): void;
    _registerActions(): void;
    availableActions(): Action[];
    actions(): Action[];
    applicableActions(actionIds: string[], context: Context): Action[];
    action(actionId: string): Action | null;
}
