import type { Setting } from './LayoutPaneUtils.js';
import { LayoutElement } from './LayoutPaneUtils.js';
export { LayoutElement };
export declare class SettingChangedEvent extends Event {
    data: {
        setting: string;
        value: string | boolean;
    };
    constructor(setting: string, value: string | boolean);
}
export interface LayoutPaneData {
    settings: Setting[];
    gridElements: LayoutElement[];
    flexContainerElements?: LayoutElement[];
}
export declare class LayoutPane extends HTMLElement {
    private readonly shadow;
    private settings;
    private gridElements;
    private flexContainerElements?;
    constructor();
    set data(data: LayoutPaneData);
    private onSummaryKeyDown;
    private render;
    private getEnumSettings;
    private getBooleanSettings;
    private onBooleanSettingChange;
    private onEnumSettingChange;
    private onElementToggle;
    private onElementClick;
    private onColorChange;
    private onElementMouseEnter;
    private onElementMouseLeave;
    private renderElement;
    private renderBooleanSetting;
    private renderEnumSetting;
}
declare global {
    interface HTMLElementTagNameMap {
        'devtools-layout-pane': LayoutPane;
    }
}
