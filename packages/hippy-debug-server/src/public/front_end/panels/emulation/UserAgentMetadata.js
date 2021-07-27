// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
//
// Helper functions for working with UserAgentMetadata protocol objects, in
// particular their plain string representation.
import { parseList, serializeItem, serializeList } from './StructuredHeaders.js';
/* Returned string is for error, either parseErrorString or structErrorString.
 */
export function parseBrandsList(stringForm, parseErrorString, structErrorString) {
    const brandList = [];
    const parseResult = parseList(stringForm);
    if (parseResult.kind === 0 /* ERROR */) {
        return parseErrorString;
    }
    for (const listItem of parseResult.items) {
        if (listItem.kind !== 4 /* ITEM */) {
            return structErrorString;
        }
        const bareItem = listItem.value;
        if (bareItem.kind !== 7 /* STRING */) {
            return structErrorString;
        }
        if (listItem.parameters.items.length !== 1) {
            return structErrorString;
        }
        const param = listItem.parameters.items[0];
        if (param.name.value !== 'v') {
            return structErrorString;
        }
        const paramValue = param.value;
        if (paramValue.kind !== 7 /* STRING */) {
            return structErrorString;
        }
        brandList.push({ brand: bareItem.value, version: paramValue.value });
    }
    return brandList;
}
export function serializeBrandsList(brands) {
    const shList = { kind: 11 /* LIST */, items: [] };
    const vParamName = { kind: 1 /* PARAM_NAME */, value: 'v' };
    for (const brand of brands) {
        const nameString = { kind: 7 /* STRING */, value: brand.brand };
        const verString = { kind: 7 /* STRING */, value: brand.version };
        const verParams = {
            kind: 3 /* PARAMETERS */,
            items: [{ kind: 2 /* PARAMETER */, name: vParamName, value: verString }],
        };
        const shItem = { kind: 4 /* ITEM */, value: nameString, parameters: verParams };
        shList.items.push(shItem);
    }
    const serializeResult = serializeList(shList);
    return serializeResult.kind === 0 /* ERROR */ ? '' : serializeResult.value;
}
/*
 * This checks whether the value provided is representable as a structured headers string,
 * which is the validity requirement for the fields in UserAgentMetadata that are not the brand list
 * or mobile bool.
 *
 * errorMessage will be passed through on failure.
 */
export function validateAsStructuredHeadersString(value, errorString) {
    const parsedResult = serializeItem({
        kind: 4 /* ITEM */,
        value: { kind: 7 /* STRING */, value: value },
        parameters: { kind: 3 /* PARAMETERS */, items: [] },
    });
    if (parsedResult.kind === 0 /* ERROR */) {
        return { valid: false, errorMessage: errorString };
    }
    return { valid: true, errorMessage: undefined };
}
//# sourceMappingURL=UserAgentMetadata.js.map