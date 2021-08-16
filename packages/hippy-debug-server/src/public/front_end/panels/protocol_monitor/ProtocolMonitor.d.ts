import * as ProtocolClient from '../../core/protocol_client/protocol_client.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as TextUtils from '../../models/text_utils/text_utils.js';
import * as DataGrid from '../../ui/components/data_grid/data_grid.js';
import * as UI from '../../ui/legacy/legacy.js';
export interface Message {
    id?: number;
    method: string;
    error: Object;
    result: Object;
    params: Object;
    sessionId?: string;
}
export interface LogMessage {
    id?: number;
    domain: string;
    method: string;
    params: Object;
    type: 'send' | 'recv';
}
export declare class ProtocolMonitorImpl extends UI.Widget.VBox {
    _started: boolean;
    _startTime: number;
    _dataGridRowForId: Map<number, DataGrid.DataGridUtils.Row>;
    _infoWidget: InfoWidget;
    _dataGridIntegrator: DataGrid.DataGridControllerIntegrator.DataGridControllerIntegrator;
    _filterParser: TextUtils.TextUtils.FilterParser;
    _suggestionBuilder: UI.FilterSuggestionBuilder.FilterSuggestionBuilder;
    _textFilterUI: UI.Toolbar.ToolbarInput;
    private messages;
    private isRecording;
    constructor();
    static instance(opts?: {
        forceNew: null;
    }): ProtocolMonitorImpl;
    wasShown(): void;
    _setRecording(recording: boolean): void;
    _targetToString(target: SDK.Target.Target | null): string;
    _messageReceived(message: Message, target: ProtocolClient.InspectorBackend.TargetBase | null): void;
    _messageSent(message: {
        domain: string;
        method: string;
        params: Object;
        id: number;
        sessionId?: string;
    }, target: ProtocolClient.InspectorBackend.TargetBase | null): void;
    private saveAsFile;
}
export declare class InfoWidget extends UI.Widget.VBox {
    _tabbedPane: UI.TabbedPane.TabbedPane;
    constructor();
    render(data: {
        request: DataGrid.DataGridUtils.Cell | undefined;
        response: DataGrid.DataGridUtils.Cell | undefined;
        direction: DataGrid.DataGridUtils.Cell | undefined;
    } | null): void;
}
