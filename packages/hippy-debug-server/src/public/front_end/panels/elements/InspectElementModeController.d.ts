import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Protocol from '../../generated/protocol.js';
import * as UI from '../../ui/legacy/legacy.js';
export declare class InspectElementModeController implements SDK.TargetManager.SDKModelObserver<SDK.OverlayModel.OverlayModel> {
    _toggleSearchAction: UI.ActionRegistration.Action | null;
    _mode: Protocol.Overlay.InspectMode;
    _showDetailedInspectTooltipSetting: Common.Settings.Setting<boolean>;
    constructor();
    static instance({ forceNew }?: {
        forceNew: boolean;
    }): InspectElementModeController;
    modelAdded(overlayModel: SDK.OverlayModel.OverlayModel): void;
    modelRemoved(_overlayModel: SDK.OverlayModel.OverlayModel): void;
    _isInInspectElementMode(): boolean;
    _toggleInspectMode(): void;
    _captureScreenshotMode(): void;
    _setMode(mode: Protocol.Overlay.InspectMode): void;
    _suspendStateChanged(): void;
    _inspectNode(node: SDK.DOMModel.DOMNode): void;
    _showDetailedInspectTooltipChanged(): void;
}
export declare class ToggleSearchActionDelegate implements UI.ActionRegistration.ActionDelegate {
    handleAction(context: UI.Context.Context, actionId: string): boolean;
    static instance(opts?: {
        forceNew: boolean | null;
    } | undefined): ToggleSearchActionDelegate;
}
