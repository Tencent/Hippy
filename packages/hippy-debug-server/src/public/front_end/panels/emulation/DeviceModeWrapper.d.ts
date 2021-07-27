import type * as Common from '../../core/common/common.js';
import * as UI from '../../ui/legacy/legacy.js';
import type * as Protocol from '../../generated/protocol.js';
import { DeviceModeView } from './DeviceModeView.js';
import type { InspectedPagePlaceholder } from './InspectedPagePlaceholder.js';
export declare class DeviceModeWrapper extends UI.Widget.VBox {
    _inspectedPagePlaceholder: InspectedPagePlaceholder;
    _deviceModeView: DeviceModeView | null;
    _toggleDeviceModeAction: UI.ActionRegistration.Action | null;
    _showDeviceModeSetting: Common.Settings.Setting<boolean>;
    private constructor();
    static instance(opts?: {
        forceNew: boolean | null;
        inspectedPagePlaceholder: InspectedPagePlaceholder | null;
    }): DeviceModeWrapper;
    _toggleDeviceMode(): void;
    _captureScreenshot(fullSize?: boolean, clip?: Protocol.Page.Viewport): boolean;
    _screenshotRequestedFromOverlay(event: {
        data: Protocol.Page.Viewport;
    }): void;
    _update(force: boolean): void;
}
export declare class ActionDelegate implements UI.ActionRegistration.ActionDelegate {
    handleAction(context: UI.Context.Context, actionId: string): boolean;
    static instance(opts?: {
        forceNew: boolean | null;
    }): ActionDelegate;
}
