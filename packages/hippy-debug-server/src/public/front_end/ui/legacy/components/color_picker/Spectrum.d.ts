import * as Common from '../../../../core/common/common.js';
import * as SDK from '../../../../core/sdk/sdk.js';
import * as UI from '../../legacy.js';
import { ContrastDetails } from './ContrastDetails.js';
import type { ContrastInfo } from './ContrastInfo.js';
import { ContrastOverlay } from './ContrastOverlay.js';
export declare class Spectrum extends UI.Widget.VBox {
    _colorElement: HTMLElement;
    _colorDragElement: HTMLElement;
    _dragX: number;
    _dragY: number;
    _colorPickerButton: UI.Toolbar.ToolbarToggle;
    _swatch: Swatch;
    _hueElement: HTMLElement;
    _hueSlider: HTMLElement;
    _alphaElement: HTMLElement;
    _alphaElementBackground: HTMLElement;
    _alphaSlider: HTMLElement;
    _displayContainer: HTMLElement;
    _textValues: HTMLInputElement[];
    _textLabels: HTMLElement;
    _hexContainer: HTMLElement;
    _hexValue: HTMLInputElement;
    _contrastInfo: ContrastInfo | undefined;
    _contrastOverlay: ContrastOverlay | undefined;
    _contrastDetails: ContrastDetails | undefined;
    _contrastDetailsBackgroundColorPickedToggledBound: ((event: {
        data: unknown;
    }) => void) | undefined;
    _palettes: Map<string, Palette>;
    _palettePanel: HTMLElement;
    _palettePanelShowing: boolean;
    _paletteSectionContainer: HTMLElement;
    _paletteContainer: HTMLElement;
    _shadesContainer: HTMLElement;
    _deleteIconToolbar: UI.Toolbar.Toolbar;
    _deleteButton: UI.Toolbar.ToolbarButton;
    _addColorToolbar: UI.Toolbar.Toolbar;
    _colorPickedBound: (event: Common.EventTarget.EventTargetEvent) => void;
    _hsv: number[];
    _hueAlphaWidth: number;
    dragWidth: number;
    dragHeight: number;
    _colorDragElementHeight: number;
    slideHelperWidth: number;
    _numPaletteRowsShown: number;
    _selectedColorPalette: Common.Settings.Setting<string>;
    _customPaletteSetting: Common.Settings.Setting<Palette>;
    _colorOffset?: {
        left: number;
        top: number;
    };
    _closeButton?: UI.Toolbar.ToolbarButton;
    _paletteContainerMutable?: boolean;
    _shadesCloseHandler?: (() => void);
    _dragElement?: HTMLElement;
    _dragHotSpotX?: number;
    _dragHotSpotY?: number;
    _originalFormat?: string;
    _colorName?: string;
    _colorString?: string;
    _colorFormat?: string;
    constructor(contrastInfo?: ContrastInfo | null);
    _dragStart(this: Spectrum, callback: (arg0: Event) => void, event: Event): boolean;
    _contrastDetailsBackgroundColorPickedToggled(event: {
        data: unknown;
    }): void;
    _contrastPanelExpanded(): void;
    _updatePalettePanel(): void;
    _togglePalettePanel(show: boolean): void;
    _onCloseBtnKeydown(event: Event): void;
    _onSliderKeydown(sliderNewPosition: (arg0: Event) => void, event: Event): void;
    /**
     * (Suppress warning about preventScroll)
     */
    _focus(): void;
    _createPaletteColor(colorText: string, colorName?: string, animationDelay?: number): HTMLElement;
    _showPalette(palette: Palette, animate: boolean, _event?: Event): void;
    _showLightnessShades(colorElement: HTMLElement, colorText: string, _event: Event): void;
    _slotIndexForEvent(event: Event): number;
    _isDraggingToBin(event: Event): boolean;
    _paletteDragStart(event: Event): boolean;
    _paletteDrag(event: Event): void;
    _paletteDragEnd(e: Event): void;
    _loadPalettes(): void;
    addPalette(palette: Palette): void;
    _createPreviewPaletteElement(palette: Palette): Element;
    _paletteSelected(palette: Palette): void;
    _resizeForSelectedPalette(force?: boolean): void;
    _paletteColorSelected(colorText: string, colorName: string | undefined, matchUserFormat: boolean): void;
    _onPaletteColorKeydown(colorIndex: number, event: Event): void;
    _onShadeColorKeydown(colorElement: HTMLElement, event: Event): void;
    _onAddColorMousedown(): void;
    _onAddColorKeydown(event: Event): void;
    _addColorToCustomPalette(): void;
    _showPaletteColorContextMenu(colorIndex: number, event: Event): void;
    _deletePaletteColors(colorIndex: number, toRight: boolean): void;
    setColor(color: Common.Color.Color, colorFormat: string): void;
    colorSelected(color: Common.Color.Color): void;
    _innerSetColor(hsva: number[] | undefined, colorString: string | undefined, colorName: string | undefined, colorFormat: string | undefined, changeSource: string): void;
    _color(): Common.Color.Color;
    colorName(): string | undefined;
    colorString(): string;
    _updateHelperLocations(): void;
    _updateInput(): void;
    _updateUI(): void;
    _formatViewSwitch(): void;
    /**
     * If the pasted input is parsable as a color, applies it converting to the current user format
     */
    _pasted(/** @type {!ClipboardEvent} */ event: ClipboardEvent): void;
    _inputChanged(event: Event): void;
    wasShown(): void;
    willHide(): void;
    _toggleColorPicker(enabled?: boolean, _event?: Common.EventTarget.EventTargetEvent): void;
    _colorPicked(event: Common.EventTarget.EventTargetEvent): void;
}
export declare const ChangeSource: {
    Input: string;
    Model: string;
    Other: string;
};
export declare enum Events {
    ColorChanged = "ColorChanged",
    SizeChanged = "SizeChanged"
}
export declare class PaletteGenerator {
    _callback: (arg0: Palette) => void;
    _frequencyMap: Map<string, number>;
    constructor(callback: (arg0: Palette) => void);
    _frequencyComparator(a: string, b: string): number;
    _finish(): void;
    _processStylesheet(stylesheet: SDK.CSSStyleSheetHeader.CSSStyleSheetHeader): Promise<void>;
}
export declare const MaterialPaletteShades: {
    [x: string]: string[];
};
export declare const MaterialPalette: {
    title: string;
    mutable: boolean;
    matchUserFormat: boolean;
    colors: string[];
    colorNames: never[];
};
export declare class Swatch {
    _colorString: string | null;
    _swatchInnerElement: HTMLElement;
    _swatchOverlayElement: HTMLElement;
    _swatchCopyIcon: UI.Icon.Icon;
    constructor(parentElement: HTMLElement);
    setColor(color: Common.Color.Color, colorString?: string): void;
    _onCopyText(event: Event): void;
    _onCopyIconMouseout(): void;
}
export interface Palette {
    title: string;
    colors: string[];
    colorNames: string[];
    mutable: boolean;
    matchUserFormat?: boolean;
}
