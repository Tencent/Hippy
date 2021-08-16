import * as Common from '../../core/common/common.js';
import type { Size } from './Geometry.js';
import { Icon } from './Icon.js';
import type { WidgetElement } from './Widget.js';
import { Widget } from './Widget.js';
export declare class GlassPane extends Common.ObjectWrapper.ObjectWrapper {
    _widget: Widget;
    element: WidgetElement;
    contentElement: HTMLDivElement;
    _arrowElement: Icon;
    _onMouseDownBound: (event: Event) => void;
    _onClickOutsideCallback: ((arg0: Event) => void) | null;
    _maxSize: Size | null;
    _positionX: number | null;
    _positionY: number | null;
    _anchorBox: AnchorBox | null;
    _anchorBehavior: AnchorBehavior;
    _sizeBehavior: SizeBehavior;
    _marginBehavior: MarginBehavior;
    constructor();
    isShowing(): boolean;
    registerRequiredCSS(cssFile: string, options: {
        enableLegacyPatching: false;
    }): void;
    setDefaultFocusedElement(element: Element | null): void;
    setDimmed(dimmed: boolean): void;
    setPointerEventsBehavior(pointerEventsBehavior: PointerEventsBehavior): void;
    setOutsideClickCallback(callback: ((arg0: Event) => void) | null): void;
    setMaxContentSize(size: Size | null): void;
    setSizeBehavior(sizeBehavior: SizeBehavior): void;
    setContentPosition(x: number | null, y: number | null): void;
    setContentAnchorBox(anchorBox: AnchorBox | null): void;
    setAnchorBehavior(behavior: AnchorBehavior): void;
    setMarginBehavior(behavior: MarginBehavior): void;
    show(document: Document): void;
    hide(): void;
    _onMouseDown(event: Event): void;
    positionContent(): void;
    widget(): Widget;
    static setContainer(element: Element): void;
    static container(document: Document): Element;
    static containerMoved(element: Element): void;
}
export declare enum PointerEventsBehavior {
    BlockedByGlassPane = "BlockedByGlassPane",
    PierceGlassPane = "PierceGlassPane",
    PierceContents = "PierceContents"
}
export declare enum AnchorBehavior {
    PreferTop = "PreferTop",
    PreferBottom = "PreferBottom",
    PreferLeft = "PreferLeft",
    PreferRight = "PreferRight"
}
export declare enum SizeBehavior {
    SetExactSize = "SetExactSize",
    SetExactWidthMaxHeight = "SetExactWidthMaxHeight",
    MeasureContent = "MeasureContent"
}
export declare enum MarginBehavior {
    Arrow = "Arrow",
    DefaultMargin = "DefaultMargin",
    NoMargin = "NoMargin"
}
export declare const GlassPanePanes: Set<GlassPane>;
