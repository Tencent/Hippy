import * as Common from '../../core/common/common.js';
import { Constraints } from './Geometry.js';
import { SimpleResizerWidget } from './ResizerWidget.js';
import { ToolbarButton } from './Toolbar.js';
import { Widget } from './Widget.js';
export declare class SplitWidget extends Widget {
    _sidebarElement: HTMLElement;
    _mainElement: HTMLElement;
    _resizerElement: HTMLElement;
    _resizerElementSize: number | null;
    _resizerWidget: SimpleResizerWidget;
    _defaultSidebarWidth: number;
    _defaultSidebarHeight: number;
    _constraintsInDip: boolean;
    _resizeStartSizeDIP: number;
    _setting: Common.Settings.Setting<any> | null;
    _totalSizeCSS: number;
    _totalSizeOtherDimensionCSS: number;
    _mainWidget: Widget | null;
    _sidebarWidget: Widget | null;
    _animationFrameHandle: number;
    _animationCallback: (() => void) | null;
    _showSidebarButtonTitle: Common.UIString.LocalizedString;
    _hideSidebarButtonTitle: Common.UIString.LocalizedString;
    _showHideSidebarButton: ToolbarButton | null;
    _isVertical: boolean;
    _sidebarMinimized: boolean;
    _detaching: boolean;
    _sidebarSizeDIP: number;
    _savedSidebarSizeDIP: number;
    _secondIsSidebar: boolean;
    _shouldSaveShowMode: boolean;
    _savedVerticalMainSize: number | null;
    _savedHorizontalMainSize: number | null;
    _showMode: string;
    _savedShowMode: string;
    constructor(isVertical: boolean, secondIsSidebar: boolean, settingName?: string, defaultSidebarWidth?: number, defaultSidebarHeight?: number, constraintsInDip?: boolean);
    isVertical(): boolean;
    setVertical(isVertical: boolean): void;
    _innerSetVertical(isVertical: boolean): void;
    _updateLayout(animate?: boolean): void;
    setMainWidget(widget: Widget): void;
    setSidebarWidget(widget: Widget): void;
    mainWidget(): Widget | null;
    sidebarWidget(): Widget | null;
    sidebarElement(): HTMLElement;
    childWasDetached(widget: Widget): void;
    isSidebarSecond(): boolean;
    enableShowModeSaving(): void;
    showMode(): string;
    setSecondIsSidebar(secondIsSidebar: boolean): void;
    sidebarSide(): string | null;
    resizerElement(): Element;
    hideMain(animate?: boolean): void;
    hideSidebar(animate?: boolean): void;
    setSidebarMinimized(minimized: boolean): void;
    isSidebarMinimized(): boolean;
    _showOnly(sideToShow: Widget | null, sideToHide: Widget | null, shadowToShow: Element, shadowToHide: Element, animate?: boolean): void;
    _showFinishedForTest(): void;
    _removeAllLayoutProperties(): void;
    showBoth(animate?: boolean): void;
    setResizable(resizable: boolean): void;
    isResizable(): boolean;
    setSidebarSize(size: number): void;
    sidebarSize(): number;
    /**
     * Returns total size in DIP.
     */
    _totalSizeDIP(): number;
    _updateShowMode(showMode: string): void;
    _innerSetSidebarSizeDIP(sizeDIP: number, animate: boolean, userAction?: boolean): void;
    _animate(reverse: boolean, callback?: (() => void)): void;
    _cancelAnimation(): void;
    _applyConstraints(sidebarSize: number, userAction?: boolean): number;
    wasShown(): void;
    willHide(): void;
    onResize(): void;
    onLayout(): void;
    calculateConstraints(): Constraints;
    _onResizeStart(_event: Common.EventTarget.EventTargetEvent): void;
    _onResizeUpdate(event: Common.EventTarget.EventTargetEvent): void;
    _onResizeEnd(_event: Common.EventTarget.EventTargetEvent): void;
    hideDefaultResizer(noSplitter?: boolean): void;
    installResizer(resizerElement: Element): void;
    uninstallResizer(resizerElement: Element): void;
    hasCustomResizer(): boolean;
    toggleResizer(resizer: Element, on: boolean): void;
    _settingForOrientation(): SettingForOrientation | null;
    _preferredSidebarSizeDIP(): number;
    _restoreSidebarSizeFromSettings(): void;
    _restoreAndApplyShowModeFromSettings(): void;
    _saveShowModeToSettings(): void;
    _saveSetting(): void;
    _forceUpdateLayout(): void;
    _onZoomChanged(_event: Common.EventTarget.EventTargetEvent): void;
    createShowHideSidebarButton(showTitle: Common.UIString.LocalizedString, hideTitle: Common.UIString.LocalizedString): ToolbarButton;
    _updateShowHideSidebarButton(): void;
}
export declare enum ShowMode {
    Both = "Both",
    OnlyMain = "OnlyMain",
    OnlySidebar = "OnlySidebar"
}
export declare enum Events {
    SidebarSizeChanged = "SidebarSizeChanged",
    ShowModeChanged = "ShowModeChanged"
}
export interface SettingForOrientation {
    showMode: string;
    size: number;
}
