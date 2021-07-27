// Copyright (c) 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../../../core/i18n/i18n.js';
import * as Platform from '../../../core/platform/platform.js';
const UIStrings = {
    /**
    *@description Text that is shown in the LinearMemoryInspector if a value could not be correctly formatted
    *             for the requested mode (e.g. we do not floats to be represented as hexadecimal numbers).
    *             Abbreviation stands for 'not applicable'.
    */
    notApplicable: 'N/A',
};
const str_ = i18n.i18n.registerUIStrings('ui/components/linear_memory_inspector/ValueInterpreterDisplayUtils.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export const VALUE_INTEPRETER_MAX_NUM_BYTES = 8;
export function getDefaultValueTypeMapping() {
    return new Map(DEFAULT_MODE_MAPPING);
}
const DEFAULT_MODE_MAPPING = new Map([
    ["Integer 8-bit" /* Int8 */, "dec" /* Decimal */],
    ["Integer 16-bit" /* Int16 */, "dec" /* Decimal */],
    ["Integer 32-bit" /* Int32 */, "dec" /* Decimal */],
    ["Integer 64-bit" /* Int64 */, "dec" /* Decimal */],
    ["Float 32-bit" /* Float32 */, "dec" /* Decimal */],
    ["Float 64-bit" /* Float64 */, "dec" /* Decimal */],
    ["Pointer 32-bit" /* Pointer32 */, "hex" /* Hexadecimal */],
    ["Pointer 64-bit" /* Pointer64 */, "hex" /* Hexadecimal */],
]);
export const VALUE_TYPE_MODE_LIST = [
    "dec" /* Decimal */,
    "hex" /* Hexadecimal */,
    "oct" /* Octal */,
    "sci" /* Scientific */,
];
export function valueTypeToLocalizedString(valueType) {
    return i18n.i18n.lockedString(valueType);
}
export function isValidMode(type, mode) {
    switch (type) {
        case "Integer 8-bit" /* Int8 */:
        case "Integer 16-bit" /* Int16 */:
        case "Integer 32-bit" /* Int32 */:
        case "Integer 64-bit" /* Int64 */:
            return mode === "dec" /* Decimal */ || mode === "hex" /* Hexadecimal */ || mode === "oct" /* Octal */;
        case "Float 32-bit" /* Float32 */:
        case "Float 64-bit" /* Float64 */:
            return mode === "sci" /* Scientific */ || mode === "dec" /* Decimal */;
        case "Pointer 32-bit" /* Pointer32 */: // fallthrough
        case "Pointer 64-bit" /* Pointer64 */:
            return mode === "hex" /* Hexadecimal */;
        default:
            return Platform.assertNever(type, `Unknown value type: ${type}`);
    }
}
export function isNumber(type) {
    switch (type) {
        case "Integer 8-bit" /* Int8 */:
        case "Integer 16-bit" /* Int16 */:
        case "Integer 32-bit" /* Int32 */:
        case "Integer 64-bit" /* Int64 */:
        case "Float 32-bit" /* Float32 */:
        case "Float 64-bit" /* Float64 */:
            return true;
        default:
            return false;
    }
}
export function getPointerAddress(type, buffer, endianness) {
    if (!isPointer(type)) {
        console.error(`Requesting address of a non-pointer type: ${type}.\n`);
        return NaN;
    }
    try {
        const dataView = new DataView(buffer);
        const isLittleEndian = endianness === "Little Endian" /* Little */;
        return type === "Pointer 32-bit" /* Pointer32 */ ? dataView.getUint32(0, isLittleEndian) :
            dataView.getBigUint64(0, isLittleEndian);
    }
    catch (e) {
        return NaN;
    }
}
export function isPointer(type) {
    return type === "Pointer 32-bit" /* Pointer32 */ || type === "Pointer 64-bit" /* Pointer64 */;
}
export function format(formatData) {
    if (!formatData.mode) {
        console.error(`No known way of showing value for ${formatData.type}`);
        return i18nString(UIStrings.notApplicable);
    }
    const valueView = new DataView(formatData.buffer);
    const isLittleEndian = formatData.endianness === "Little Endian" /* Little */;
    let value;
    try {
        switch (formatData.type) {
            case "Integer 8-bit" /* Int8 */:
                value = formatData.signed ? valueView.getInt8(0) : valueView.getUint8(0);
                return formatInteger(value, formatData.mode);
            case "Integer 16-bit" /* Int16 */:
                value = formatData.signed ? valueView.getInt16(0, isLittleEndian) : valueView.getUint16(0, isLittleEndian);
                return formatInteger(value, formatData.mode);
            case "Integer 32-bit" /* Int32 */:
                value = formatData.signed ? valueView.getInt32(0, isLittleEndian) : valueView.getUint32(0, isLittleEndian);
                return formatInteger(value, formatData.mode);
            case "Integer 64-bit" /* Int64 */:
                value =
                    formatData.signed ? valueView.getBigInt64(0, isLittleEndian) : valueView.getBigUint64(0, isLittleEndian);
                return formatInteger(value, formatData.mode);
            case "Float 32-bit" /* Float32 */:
                value = valueView.getFloat32(0, isLittleEndian);
                return formatFloat(value, formatData.mode);
            case "Float 64-bit" /* Float64 */:
                value = valueView.getFloat64(0, isLittleEndian);
                return formatFloat(value, formatData.mode);
            case "Pointer 32-bit" /* Pointer32 */:
                value = valueView.getUint32(0, isLittleEndian);
                return formatInteger(value, "hex" /* Hexadecimal */);
            case "Pointer 64-bit" /* Pointer64 */:
                value = valueView.getBigUint64(0, isLittleEndian);
                return formatInteger(value, "hex" /* Hexadecimal */);
            default:
                return Platform.assertNever(formatData.type, `Unknown value type: ${formatData.type}`);
        }
    }
    catch (e) {
        return i18nString(UIStrings.notApplicable);
    }
}
export function formatFloat(value, mode) {
    switch (mode) {
        case "dec" /* Decimal */:
            return value.toFixed(2).toString();
        case "sci" /* Scientific */:
            return value.toExponential(2).toString();
        default:
            throw new Error(`Unknown mode for floats: ${mode}.`);
    }
}
export function formatInteger(value, mode) {
    switch (mode) {
        case "dec" /* Decimal */:
            return value.toString();
        case "hex" /* Hexadecimal */:
            if (value < 0) {
                return i18nString(UIStrings.notApplicable);
            }
            return '0x' + value.toString(16).toUpperCase();
        case "oct" /* Octal */:
            if (value < 0) {
                return i18nString(UIStrings.notApplicable);
            }
            return value.toString(8);
        default:
            throw new Error(`Unknown mode for integers: ${mode}.`);
    }
}
//# sourceMappingURL=ValueInterpreterDisplayUtils.js.map