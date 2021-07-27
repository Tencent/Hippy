import * as UI from '../../ui/legacy/legacy.js';
export declare class ComboBoxOfCheckBoxes extends UI.Toolbar.ToolbarButton {
    private options;
    private headers;
    private onOptionClicked;
    constructor(title: string);
    addOption(option: string, value: string, defaultEnabled: boolean): void;
    setOptionEnabled(index: number, enabled: boolean): void;
    addHeader(headerName: string, callback: (() => void)): void;
    setOnOptionClicked(onOptionClicked: (() => void)): void;
    getOptions(): Array<MenuOption>;
    private showLevelContextMenu;
}
interface MenuOption {
    title: string;
    value: string;
    default: boolean;
    enabled: boolean;
}
export {};
