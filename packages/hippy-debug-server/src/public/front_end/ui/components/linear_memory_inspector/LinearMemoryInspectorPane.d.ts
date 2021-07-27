import type * as Common from '../../../core/common/common.js';
import * as UI from '../../legacy/legacy.js';
import type { Settings } from './LinearMemoryInspector.js';
import { LinearMemoryInspector } from './LinearMemoryInspector.js';
import type { LazyUint8Array } from './LinearMemoryInspectorController.js';
export declare class Wrapper extends UI.Widget.VBox {
    view: LinearMemoryInspectorPaneImpl;
    private constructor();
    static instance(opts?: {
        forceNew: boolean | null;
    }): Wrapper;
    wasShown(): void;
}
export declare class LinearMemoryInspectorPaneImpl extends UI.Widget.VBox {
    _tabbedPane: UI.TabbedPane.TabbedPane;
    _tabIdToInspectorView: Map<string, LinearMemoryInspectorView>;
    constructor();
    static instance(): LinearMemoryInspectorPaneImpl;
    create(tabId: string, title: string, arrayWrapper: LazyUint8Array, address?: number): void;
    close(tabId: string): void;
    reveal(tabId: string, address?: number): void;
    refreshView(tabId: string): void;
    _tabClosed(event: Common.EventTarget.EventTargetEvent): void;
}
declare class LinearMemoryInspectorView extends UI.Widget.VBox {
    _memoryWrapper: LazyUint8Array;
    _address: number;
    _inspector: LinearMemoryInspector;
    firstTimeOpen: boolean;
    constructor(memoryWrapper: LazyUint8Array, address?: number | undefined);
    wasShown(): void;
    saveSettings(settings: Settings): void;
    updateAddress(address: number): void;
    refreshData(): void;
    _memoryRequested(event: Common.EventTarget.EventTargetEvent): void;
}
export {};
