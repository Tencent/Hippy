// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
export const HEXADECIMAL_REGEXP = /^0x[a-fA-F0-9]+$/;
export const DECIMAL_REGEXP = /^0$|[1-9]\d*$/;
export function toHexString(data) {
    const hex = data.number.toString(16).padStart(data.pad, '0');
    const upperHex = hex.toUpperCase();
    return data.prefix ? '0x' + upperHex : upperHex;
}
export function formatAddress(address) {
    return toHexString({ number: address, pad: 8, prefix: true });
}
export function parseAddress(address) {
    const hexMatch = address.match(HEXADECIMAL_REGEXP);
    const decMatch = address.match(DECIMAL_REGEXP);
    let newAddress = undefined;
    if (hexMatch && hexMatch[0].length === address.length) {
        newAddress = parseInt(address, 16);
    }
    else if (decMatch && decMatch[0].length === address.length) {
        newAddress = parseInt(address, 10);
    }
    return newAddress;
}
//# sourceMappingURL=LinearMemoryInspectorUtils.js.map