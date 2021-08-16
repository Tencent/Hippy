import { GlassPane } from './GlassPane.js';
export declare class PopoverHelper {
    _disableOnClick: boolean;
    _hasPadding: boolean;
    _getRequest: (arg0: MouseEvent) => PopoverRequest | null;
    _scheduledRequest: PopoverRequest | null;
    _hidePopoverCallback: (() => void) | null;
    _container: Element;
    _showTimeout: number;
    _hideTimeout: number;
    _hidePopoverTimer: number | null;
    _showPopoverTimer: number | null;
    _boundMouseDown: (event: Event) => void;
    _boundMouseMove: (ev: Event) => void;
    _boundMouseOut: (event: Event) => void;
    constructor(container: Element, getRequest: (arg0: MouseEvent) => PopoverRequest | null);
    setTimeout(showTimeout: number, hideTimeout?: number): void;
    setHasPadding(hasPadding: boolean): void;
    setDisableOnClick(disableOnClick: boolean): void;
    _eventInScheduledContent(ev: Event): boolean;
    _mouseDown(event: Event): void;
    _mouseMove(ev: Event): void;
    _popoverMouseMove(_event: Event): void;
    _popoverMouseOut(popover: GlassPane, ev: Event): void;
    _mouseOut(event: Event): void;
    _startHidePopoverTimer(timeout: number): void;
    _startShowPopoverTimer(event: MouseEvent, timeout: number): void;
    _stopShowPopoverTimer(): void;
    isPopoverVisible(): boolean;
    hidePopover(): void;
    _hidePopover(): void;
    _showPopover(document: Document): void;
    _stopHidePopoverTimer(): void;
    dispose(): void;
}
export interface PopoverRequest {
    box: AnchorBox;
    show: (arg0: GlassPane) => Promise<boolean>;
    hide?: (() => void);
}
