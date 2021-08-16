import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
import { Events, LighthouseController } from './LighthouseController.js';
import { ProtocolService } from './LighthouseProtocolService.js';
import type * as ReportRenderer from './LighthouseReporterTypes.js';
import { ReportSelector } from './LighthouseReportSelector.js';
import { StartView } from './LighthouseStartView.js';
import { StatusView } from './LighthouseStatusView.js';
export declare class LighthousePanel extends UI.Panel.Panel {
    _protocolService: ProtocolService;
    _controller: LighthouseController;
    _startView: StartView;
    _statusView: StatusView;
    _warningText: null;
    _unauditableExplanation: null;
    _cachedRenderedReports: Map<ReportRenderer.ReportJSON, HTMLElement>;
    _dropTarget: UI.DropTarget.DropTarget;
    _auditResultsElement: HTMLElement;
    _clearButton: UI.Toolbar.ToolbarButton;
    _newButton: UI.Toolbar.ToolbarButton;
    _reportSelector: ReportSelector;
    _settingsPane: UI.Widget.Widget;
    _rightToolbar: UI.Toolbar.Toolbar;
    _showSettingsPaneSetting: Common.Settings.Setting<boolean>;
    _stateBefore?: {
        emulation: {
            enabled: boolean;
            outlineEnabled: boolean;
            toolbarControlsEnabled: boolean;
        };
        network: {
            conditions: SDK.NetworkManager.Conditions;
        };
    };
    _isLHAttached?: boolean;
    private constructor();
    static instance(opts?: {
        forceNew: null;
    }): LighthousePanel;
    static getEvents(): typeof Events;
    _refreshWarningsUI(evt: Common.EventTarget.EventTargetEvent): void;
    _refreshStartAuditUI(evt: Common.EventTarget.EventTargetEvent): void;
    _refreshStatusUI(evt: Common.EventTarget.EventTargetEvent): void;
    _refreshToolbarUI(): void;
    _clearAll(): void;
    _renderToolbar(): void;
    _updateSettingsPaneVisibility(): void;
    _toggleSettingsDisplay(show: boolean): void;
    _renderStartView(): void;
    _renderStatusView(inspectedURL: string): void;
    _beforePrint(): void;
    _afterPrint(): void;
    _renderReport(lighthouseResult: ReportRenderer.ReportJSON, artifacts?: ReportRenderer.RunnerResultArtifacts): void;
    _waitForMainTargetLoad(): Promise<void>;
    _buildReportUI(lighthouseResult: ReportRenderer.ReportJSON, artifacts?: ReportRenderer.RunnerResultArtifacts): void;
    _handleDrop(dataTransfer: DataTransfer): void;
    _loadedFromFile(report: string): void;
    _startLighthouse(_event: Common.EventTarget.EventTargetEvent): Promise<void>;
    _cancelLighthouse(): Promise<void>;
    /**
     * We set the device emulation on the DevTools-side for two reasons:
     * 1. To workaround some odd device metrics emulation bugs like occuluding viewports
     * 2. To get the attractive device outline
     *
     * We also set flags.internalDisableDeviceScreenEmulation = true to let LH only apply UA emulation
     */
    _setupEmulationAndProtocolConnection(): Promise<void>;
    _resetEmulationAndProtocolConnection(): Promise<void>;
}
