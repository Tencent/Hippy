import * as UI from '../../ui/legacy/legacy.js';
import { ProfilesPanel } from './ProfilesPanel.js';
export declare class HeapProfilerPanel extends ProfilesPanel implements UI.ContextMenu.Provider, UI.ActionRegistration.ActionDelegate {
    constructor();
    static instance(): HeapProfilerPanel;
    appendApplicableItems(event: Event, contextMenu: UI.ContextMenu.ContextMenu, target: Object): void;
    handleAction(_context: UI.Context.Context, _actionId: string): boolean;
    wasShown(): void;
    willHide(): void;
    showObject(snapshotObjectId: string, perspectiveName: string): void;
}
