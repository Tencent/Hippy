import type { ValueType, ValueTypeMode } from './ValueInterpreterDisplayUtils.js';
import { Endianness } from './ValueInterpreterDisplayUtils.js';
export declare class EndiannessChangedEvent extends Event {
    data: Endianness;
    constructor(endianness: Endianness);
}
export declare class ValueTypeToggledEvent extends Event {
    data: {
        type: ValueType;
        checked: boolean;
    };
    constructor(type: ValueType, checked: boolean);
}
export interface LinearMemoryValueInterpreterData {
    value: ArrayBuffer;
    valueTypes: Set<ValueType>;
    endianness: Endianness;
    valueTypeModes?: Map<ValueType, ValueTypeMode>;
    memoryLength: number;
}
export declare class LinearMemoryValueInterpreter extends HTMLElement {
    static litTagName: import("../../lit-html/static.js").Static;
    private readonly shadow;
    private endianness;
    private buffer;
    private valueTypes;
    private valueTypeModeConfig;
    private memoryLength;
    private showSettings;
    constructor();
    set data(data: LinearMemoryValueInterpreterData);
    private render;
    private onEndiannessChange;
    private renderEndiannessSetting;
    private onSettingsToggle;
    private onTypeToggle;
}
declare global {
    interface HTMLElementTagNameMap {
        'devtools-linear-memory-inspector-interpreter': LinearMemoryValueInterpreter;
    }
}
