import * as Common from '../../core/common/common.js';
import * as ColorPicker from '../../ui/legacy/components/color_picker/color_picker.js';
import * as InlineEditor from '../../ui/legacy/components/inline_editor/inline_editor.js';
import type { StylePropertyTreeElement } from './StylePropertyTreeElement.js';
import type { StylePropertiesSection, StylesSidebarPane } from './StylesSidebarPane.js';
export declare class BezierPopoverIcon {
    _treeElement: StylePropertyTreeElement;
    _swatchPopoverHelper: InlineEditor.SwatchPopoverHelper.SwatchPopoverHelper;
    _swatch: InlineEditor.Swatches.BezierSwatch;
    _boundBezierChanged: (event: Common.EventTarget.EventTargetEvent) => void;
    _boundOnScroll: (event: Event) => void;
    _bezierEditor?: InlineEditor.BezierEditor.BezierEditor;
    _scrollerElement?: Element;
    _originalPropertyText?: string | null;
    constructor(treeElement: StylePropertyTreeElement, swatchPopoverHelper: InlineEditor.SwatchPopoverHelper.SwatchPopoverHelper, swatch: InlineEditor.Swatches.BezierSwatch);
    _iconClick(event: Event): void;
    _bezierChanged(event: Common.EventTarget.EventTargetEvent): void;
    _onScroll(_event: Event): void;
    _onPopoverHidden(commitEdit: boolean): void;
}
export declare class ColorSwatchPopoverIcon {
    _treeElement: StylePropertyTreeElement;
    _swatchPopoverHelper: InlineEditor.SwatchPopoverHelper.SwatchPopoverHelper;
    _swatch: InlineEditor.ColorSwatch.ColorSwatch;
    _contrastInfo: ColorPicker.ContrastInfo.ContrastInfo | null;
    _boundSpectrumChanged: (event: Common.EventTarget.EventTargetEvent) => void;
    _boundOnScroll: (event: Event) => void;
    _spectrum?: ColorPicker.Spectrum.Spectrum;
    _scrollerElement?: Element;
    _originalPropertyText?: string | null;
    constructor(treeElement: StylePropertyTreeElement, swatchPopoverHelper: InlineEditor.SwatchPopoverHelper.SwatchPopoverHelper, swatch: InlineEditor.ColorSwatch.ColorSwatch);
    _generateCSSVariablesPalette(): ColorPicker.Spectrum.Palette;
    setContrastInfo(contrastInfo: ColorPicker.ContrastInfo.ContrastInfo): void;
    _iconClick(event: Event): void;
    showPopover(): void;
    _spectrumResized(_event: Common.EventTarget.EventTargetEvent): void;
    _spectrumChanged(event: Common.EventTarget.EventTargetEvent): void;
    _onScroll(_event: Event): void;
    _onPopoverHidden(commitEdit: boolean): void;
}
export declare class ShadowSwatchPopoverHelper {
    _treeElement: StylePropertyTreeElement;
    _swatchPopoverHelper: InlineEditor.SwatchPopoverHelper.SwatchPopoverHelper;
    _shadowSwatch: InlineEditor.Swatches.CSSShadowSwatch;
    _iconElement: HTMLSpanElement;
    _boundShadowChanged: (event: Common.EventTarget.EventTargetEvent) => void;
    _boundOnScroll: (event: Event) => void;
    _cssShadowEditor?: InlineEditor.CSSShadowEditor.CSSShadowEditor;
    _scrollerElement?: Element;
    _originalPropertyText?: string | null;
    constructor(treeElement: StylePropertyTreeElement, swatchPopoverHelper: InlineEditor.SwatchPopoverHelper.SwatchPopoverHelper, shadowSwatch: InlineEditor.Swatches.CSSShadowSwatch);
    _iconClick(event: Event): void;
    showPopover(): void;
    _shadowChanged(event: Common.EventTarget.EventTargetEvent): void;
    _onScroll(_event: Event): void;
    _onPopoverHidden(commitEdit: boolean): void;
}
export declare class FontEditorSectionManager {
    _treeElementMap: Map<string, StylePropertyTreeElement>;
    _swatchPopoverHelper: InlineEditor.SwatchPopoverHelper.SwatchPopoverHelper;
    _section: StylePropertiesSection;
    _parentPane: StylesSidebarPane | null;
    _fontEditor: InlineEditor.FontEditor.FontEditor | null;
    _scrollerElement: Element | null;
    _boundFontChanged: (event: Common.EventTarget.EventTargetEvent) => void;
    _boundOnScroll: () => void;
    _boundResized: () => void;
    constructor(swatchPopoverHelper: InlineEditor.SwatchPopoverHelper.SwatchPopoverHelper, section: StylePropertiesSection);
    _fontChanged(event: Common.EventTarget.EventTargetEvent): void;
    _updateFontProperty(propertyName: string, value: string, treeElement?: StylePropertyTreeElement): Promise<void>;
    _fontEditorResized(): void;
    _fixIndex(removedIndex: number): void;
    _createPropertyValueMap(): Map<string, string>;
    registerFontProperty(treeElement: StylePropertyTreeElement): void;
    showPopover(iconElement: Element, parentPane: StylesSidebarPane): Promise<void>;
    _onScroll(): void;
    _onPopoverHidden(): void;
    static readonly _treeElementSymbol: unique symbol;
}
