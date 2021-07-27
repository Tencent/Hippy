import * as SDK from '../../../../core/sdk/sdk.js';
import * as UI from '../../legacy.js';
import * as Components from '../utils/utils.js';
export declare class ObjectPopoverHelper {
    _linkifier: Components.Linkifier.Linkifier | null;
    _resultHighlightedAsDOM: boolean;
    constructor(linkifier: Components.Linkifier.Linkifier | null, resultHighlightedAsDOM: boolean);
    dispose(): void;
    static buildObjectPopover(result: SDK.RemoteObject.RemoteObject, popover: UI.GlassPane.GlassPane): Promise<ObjectPopoverHelper | null>;
}
