import { ValueType } from './ValueInterpreterDisplayUtils.js';
export interface ValueInterpreterSettingsData {
    valueTypes: Set<ValueType>;
}
export declare class TypeToggleEvent extends Event {
    data: {
        type: ValueType;
        checked: boolean;
    };
    constructor(type: ValueType, checked: boolean);
}
export declare class ValueInterpreterSettings extends HTMLElement {
    static litTagName: import("../../lit-html/static.js").Static;
    private readonly shadow;
    private valueTypes;
    set data(data: ValueInterpreterSettingsData);
    private render;
    private plotTypeSelections;
    private onTypeToggle;
}
declare global {
    interface HTMLElementTagNameMap {
        'devtools-linear-memory-inspector-interpreter-settings': ValueInterpreterSettings;
    }
}
