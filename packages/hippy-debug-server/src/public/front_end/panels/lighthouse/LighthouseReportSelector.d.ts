import * as UI from '../../ui/legacy/legacy.js';
import type * as ReportRenderer from './LighthouseReporterTypes.js';
export declare class ReportSelector {
    _renderNewLighthouseView: () => void;
    _newLighthouseItem: HTMLOptionElement;
    _comboBox: UI.Toolbar.ToolbarComboBox;
    _itemByOptionElement: Map<Element, Item>;
    constructor(renderNewLighthouseView: () => void);
    _setEmptyState(): void;
    _handleChange(_event: Event): void;
    _selectedItem(): Item;
    hasCurrentSelection(): boolean;
    hasItems(): boolean;
    comboBox(): UI.Toolbar.ToolbarComboBox;
    prepend(item: Item): void;
    clearAll(): void;
    selectNewReport(): void;
}
export declare class Item {
    _lighthouseResult: ReportRenderer.ReportJSON;
    _renderReport: () => void;
    _showLandingCallback: () => void;
    _element: HTMLOptionElement;
    constructor(lighthouseResult: ReportRenderer.ReportJSON, renderReport: () => void, showLandingCallback: () => void);
    select(): void;
    optionElement(): Element;
    delete(): void;
}
