import * as Common from '../../core/common/common.js';
import type * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
import { ComputedStyleModel } from './ComputedStyleModel.js';
export declare class ElementsSidebarPane extends UI.Widget.VBox {
    _computedStyleModel: ComputedStyleModel;
    _updateThrottler: Common.Throttler.Throttler;
    _updateWhenVisible: boolean;
    constructor(delegatesFocus?: boolean);
    node(): SDK.DOMModel.DOMNode | null;
    cssModel(): SDK.CSSModel.CSSModel | null;
    computedStyleModel(): ComputedStyleModel;
    doUpdate(): Promise<void>;
    update(): void;
    wasShown(): void;
    onCSSModelChanged(_event: Common.EventTarget.EventTargetEvent): void;
}
