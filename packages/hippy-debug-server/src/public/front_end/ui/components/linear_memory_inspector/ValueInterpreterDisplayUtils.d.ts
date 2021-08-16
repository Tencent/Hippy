export declare const VALUE_INTEPRETER_MAX_NUM_BYTES = 8;
export declare const enum ValueType {
    Int8 = "Integer 8-bit",
    Int16 = "Integer 16-bit",
    Int32 = "Integer 32-bit",
    Int64 = "Integer 64-bit",
    Float32 = "Float 32-bit",
    Float64 = "Float 64-bit",
    Pointer32 = "Pointer 32-bit",
    Pointer64 = "Pointer 64-bit"
}
export declare const enum Endianness {
    Little = "Little Endian",
    Big = "Big Endian"
}
export declare const enum ValueTypeMode {
    Decimal = "dec",
    Hexadecimal = "hex",
    Octal = "oct",
    Scientific = "sci"
}
export declare function getDefaultValueTypeMapping(): Map<ValueType, ValueTypeMode>;
export declare const VALUE_TYPE_MODE_LIST: ValueTypeMode[];
export declare function valueTypeToLocalizedString(valueType: ValueType): string;
export declare function isValidMode(type: ValueType, mode: ValueTypeMode): boolean;
export declare function isNumber(type: ValueType): boolean;
export declare function getPointerAddress(type: ValueType, buffer: ArrayBuffer, endianness: Endianness): number | bigint;
export declare function isPointer(type: ValueType): boolean;
export interface FormatData {
    buffer: ArrayBuffer;
    type: ValueType;
    endianness: Endianness;
    signed: boolean;
    mode?: ValueTypeMode;
}
export declare function format(formatData: FormatData): string;
export declare function formatFloat(value: number, mode: ValueTypeMode): string;
export declare function formatInteger(value: number | bigint, mode: ValueTypeMode): string;
