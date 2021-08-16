import * as SDK from '../../../../core/sdk/sdk.js';
import * as UI from '../../legacy.js';
export declare class FontEditor extends UI.Widget.VBox {
    _selectedNode: SDK.DOMModel.DOMNode | null;
    _propertyMap: Map<string, string>;
    _fontSelectorSection: HTMLElement;
    _fontSelectors: FontEditor.FontSelectorObject[];
    _fontsList: Map<string, string[]>[] | null;
    constructor(propertyMap: Map<string, string>);
    _createFontSelectorSection(propertyValue?: string): Promise<void>;
    _createFontsList(): Promise<Map<string, string[]>[]>;
    _splitComputedFontArray(computedFontArray: string[]): string[];
    _createFontSelector(value: string, isPrimary?: boolean): Promise<void>;
    _deleteFontSelector(index: number, isGlobalValue?: boolean): void;
    _updateFontSelectorList(): void;
    _getPropertyInfo(name: string, regex: RegExp): FontEditor.PropertyInfo;
    _createSelector(field: Element, label: string, options: Map<string, string[]>[], currentValue: string): void;
    _onFontSelectorChanged(): void;
    _updatePropertyValue(propertyName: string, value: string): void;
    _resizePopout(): void;
}
declare namespace FontEditor {
    interface PropertyInfo {
        value: string | null;
        units: string | null;
    }
    interface FontSelectorObject {
        label: Element;
        input: HTMLSelectElement;
        deleteButton: UI.Toolbar.ToolbarButton;
        index: number;
    }
    interface PropertyRange {
        min: number;
        max: number;
        step: number;
    }
    interface FontPropertyInputStaticParams {
        regex: RegExp;
        units: Set<string> | null;
        keyValues: Set<string>;
        rangeMap: Map<string, FontEditor.PropertyRange>;
        defaultUnit: string | null;
    }
}
export declare enum Events {
    FontChanged = "FontChanged",
    FontEditorResized = "FontEditorResized"
}
export {};
