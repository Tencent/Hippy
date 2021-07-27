import * as Common from '../../../../core/common/common.js';
import * as UI from '../../legacy.js';
export declare class SwatchPopoverHelper extends Common.ObjectWrapper.ObjectWrapper {
    _popover: UI.GlassPane.GlassPane;
    _hideProxy: () => void;
    _boundOnKeyDown: (event: KeyboardEvent) => void;
    _boundFocusOut: (event: FocusEvent) => void;
    _isHidden: boolean;
    _anchorElement: Element | null;
    _view?: UI.Widget.Widget;
    _hiddenCallback?: ((arg0: boolean) => any);
    _focusRestorer?: UI.Widget.WidgetFocusRestorer;
    constructor();
    _onFocusOut(event: FocusEvent): void;
    isShowing(): boolean;
    show(view: UI.Widget.Widget, anchorElement: Element, hiddenCallback?: ((arg0: boolean) => any)): void;
    reposition(): void;
    hide(commitEdit?: boolean): void;
    _onKeyDown(event: KeyboardEvent): void;
}
export declare enum Events {
    WillShowPopover = "WillShowPopover"
}
