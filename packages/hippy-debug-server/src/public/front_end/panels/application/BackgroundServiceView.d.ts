import type * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as DataGrid from '../../ui/legacy/components/data_grid/data_grid.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as Protocol from '../../generated/protocol.js';
import type { BackgroundServiceModel } from './BackgroundServiceModel.js';
export declare class BackgroundServiceView extends UI.Widget.VBox {
    _serviceName: Protocol.BackgroundService.ServiceName;
    _model: BackgroundServiceModel;
    _serviceWorkerManager: SDK.ServiceWorkerManager.ServiceWorkerManager | null;
    _securityOriginManager: SDK.SecurityOriginManager.SecurityOriginManager;
    _recordAction: UI.ActionRegistration.Action;
    _recordButton: UI.Toolbar.ToolbarToggle;
    _originCheckbox: UI.Toolbar.ToolbarCheckbox;
    _saveButton: UI.Toolbar.ToolbarButton;
    _toolbar: UI.Toolbar.Toolbar;
    _splitWidget: UI.SplitWidget.SplitWidget;
    _dataGrid: DataGrid.DataGrid.DataGridImpl<EventData>;
    _previewPanel: UI.Widget.VBox;
    _selectedEventNode: EventDataNode | null;
    _preview: UI.Widget.Widget | null;
    static getUIString(serviceName: string): string;
    constructor(serviceName: Protocol.BackgroundService.ServiceName, model: BackgroundServiceModel);
    /**
     * Creates the toolbar UI element.
     */
    _setupToolbar(): Promise<void>;
    /**
     * Displays all available events in the grid.
     */
    _refreshView(): void;
    /**
     * Clears the grid and panel.
     */
    _clearView(): void;
    /**
     * Called when the `Toggle Record` button is clicked.
     */
    _toggleRecording(): void;
    /**
     * Called when the `Clear` button is clicked.
     */
    _clearEvents(): void;
    _onRecordingStateChanged(event: Common.EventTarget.EventTargetEvent): void;
    _updateRecordButtonTooltip(): void;
    _onEventReceived(event: Common.EventTarget.EventTargetEvent): void;
    _onOriginChanged(): void;
    _addEvent(serviceEvent: Protocol.BackgroundService.BackgroundServiceEvent): void;
    _createDataGrid(): DataGrid.DataGrid.DataGridImpl<EventData>;
    /**
     * Creates the data object to pass to the DataGrid Node.
     */
    _createEventData(serviceEvent: Protocol.BackgroundService.BackgroundServiceEvent): EventData;
    /**
     * Filtration function to know whether event should be shown or not.
     */
    _acceptEvent(event: Protocol.BackgroundService.BackgroundServiceEvent): boolean;
    _createLearnMoreLink(): Element;
    _showPreview(dataNode: EventDataNode | null): void;
    /**
     * Saves all currently displayed events in a file (JSON format).
     */
    _saveToFile(): Promise<void>;
}
export declare class EventDataNode extends DataGrid.DataGrid.DataGridNode<EventData> {
    _eventMetadata: Protocol.BackgroundService.EventMetadata[];
    constructor(data: EventData, eventMetadata: Protocol.BackgroundService.EventMetadata[]);
    createPreview(): UI.Widget.VBox;
}
export declare class ActionDelegate implements UI.ActionRegistration.ActionDelegate {
    static instance(opts?: {
        forceNew: boolean | null;
    }): ActionDelegate;
    handleAction(context: UI.Context.Context, actionId: string): boolean;
}
export interface RecordingState {
    isRecording: boolean;
    serviceName: Protocol.BackgroundService.ServiceName;
}
export interface EventData {
    id: number;
    timestamp: string;
    origin: string;
    swScope: string;
    eventName: string;
    instanceId: string;
}
