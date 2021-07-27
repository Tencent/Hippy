import type * as UI from '../../legacy.js';
export declare class GCActionDelegate implements UI.ActionRegistration.ActionDelegate {
    static instance(opts?: {
        forceNew: boolean | null;
    }): GCActionDelegate;
    handleAction(_context: UI.Context.Context, _actionId: string): boolean;
}
