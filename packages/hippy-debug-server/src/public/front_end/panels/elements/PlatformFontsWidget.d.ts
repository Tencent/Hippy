import type * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
import type * as Protocol from '../../generated/protocol.js';
import type { ComputedStyleModel } from './ComputedStyleModel.js';
export declare class PlatformFontsWidget extends UI.ThrottledWidget.ThrottledWidget {
    _sharedModel: ComputedStyleModel;
    _sectionTitle: HTMLDivElement;
    _fontStatsSection: HTMLElement;
    constructor(sharedModel: ComputedStyleModel);
    doUpdate(): Promise<any>;
    _refreshUI(node: SDK.DOMModel.DOMNode, platformFonts: Protocol.CSS.PlatformFontUsage[] | null): void;
}
