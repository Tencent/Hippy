// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
const CHAR_MINUS = '-'.charCodeAt(0);
const CHAR_0 = '0'.charCodeAt(0);
const CHAR_9 = '9'.charCodeAt(0);
const CHAR_A = 'A'.charCodeAt(0);
const CHAR_Z = 'Z'.charCodeAt(0);
const CHAR_LOWER_A = 'a'.charCodeAt(0);
const CHAR_LOWER_Z = 'z'.charCodeAt(0);
const CHAR_DQUOTE = '"'.charCodeAt(0);
const CHAR_COLON = ':'.charCodeAt(0);
const CHAR_QUESTION_MARK = '?'.charCodeAt(0);
const CHAR_STAR = '*'.charCodeAt(0);
const CHAR_UNDERSCORE = '_'.charCodeAt(0);
const CHAR_DOT = '.'.charCodeAt(0);
const CHAR_BACKSLASH = '\\'.charCodeAt(0);
const CHAR_SLASH = '/'.charCodeAt(0);
const CHAR_PLUS = '+'.charCodeAt(0);
const CHAR_EQUALS = '='.charCodeAt(0);
const CHAR_EXCLAMATION = '!'.charCodeAt(0);
const CHAR_HASH = '#'.charCodeAt(0);
const CHAR_DOLLAR = '$'.charCodeAt(0);
const CHAR_PERCENT = '%'.charCodeAt(0);
const CHAR_AND = '&'.charCodeAt(0);
const CHAR_SQUOTE = '\''.charCodeAt(0);
const CHAR_HAT = '^'.charCodeAt(0);
const CHAR_BACKTICK = '`'.charCodeAt(0);
const CHAR_PIPE = '|'.charCodeAt(0);
const CHAR_TILDE = '~'.charCodeAt(0);
// ASCII printable range.
const CHAR_MIN_ASCII_PRINTABLE = 0x20;
const CHAR_MAX_ASCII_PRINTABLE = 0x7e;
// Note: structured headers operates over ASCII, not unicode, so these are
// all indeed supposed to return false on things outside 32-127 range regardless
// of them being other kinds of digits or letters.
function isDigit(charCode) {
    // DIGIT = %x30-39 ; 0-9 (from RFC 5234)
    if (charCode === undefined) {
        return false;
    }
    return charCode >= CHAR_0 && charCode <= CHAR_9;
}
function isAlpha(charCode) {
    // ALPHA = %x41-5A / %x61-7A   ; A-Z / a-z (from RFC 5234)
    if (charCode === undefined) {
        return false;
    }
    return (charCode >= CHAR_A && charCode <= CHAR_Z) || (charCode >= CHAR_LOWER_A && charCode <= CHAR_LOWER_Z);
}
function isLcAlpha(charCode) {
    // lcalpha = %x61-7A ; a-z
    if (charCode === undefined) {
        return false;
    }
    return (charCode >= CHAR_LOWER_A && charCode <= CHAR_LOWER_Z);
}
function isTChar(charCode) {
    if (charCode === undefined) {
        return false;
    }
    // tchar = "!" / "#" / "$" / "%" / "&" / "'" / "*" / "+" / "-" / "." /
    // "^" / "_" / "`" / "|" / "~" / DIGIT / ALPHA (from RFC 7230)
    if (isDigit(charCode) || isAlpha(charCode)) {
        return true;
    }
    switch (charCode) {
        case CHAR_EXCLAMATION:
        case CHAR_HASH:
        case CHAR_DOLLAR:
        case CHAR_PERCENT:
        case CHAR_AND:
        case CHAR_SQUOTE:
        case CHAR_STAR:
        case CHAR_PLUS:
        case CHAR_MINUS:
        case CHAR_DOT:
        case CHAR_HAT:
        case CHAR_UNDERSCORE:
        case CHAR_BACKTICK:
        case CHAR_PIPE:
        case CHAR_TILDE:
            return true;
        default:
            return false;
    }
}
class Input {
    data;
    pos;
    constructor(input) {
        this.data = input;
        this.pos = 0;
        // 4.2 step 2 is to discard any leading SP characters.
        this.skipSP();
    }
    peek() {
        return this.data[this.pos];
    }
    peekCharCode() {
        return (this.pos < this.data.length ? this.data.charCodeAt(this.pos) : undefined);
    }
    eat() {
        ++this.pos;
    }
    // Matches SP*.
    // SP = %x20, from RFC 5234
    skipSP() {
        while (this.data[this.pos] === ' ') {
            ++this.pos;
        }
    }
    // Matches OWS
    // OWS = *( SP / HTAB ) , from RFC 7230
    skipOWS() {
        while (this.data[this.pos] === ' ' || this.data[this.pos] === '\t') {
            ++this.pos;
        }
    }
    atEnd() {
        return (this.pos === this.data.length);
    }
    // 4.2 steps 6,7 --- checks for trailing characters.
    allParsed() {
        this.skipSP();
        return (this.pos === this.data.length);
    }
}
function makeError() {
    return { kind: 0 /* ERROR */ };
}
// 4.2.1. Parsing a list
function parseListInternal(input) {
    const result = { kind: 11 /* LIST */, items: [] };
    while (!input.atEnd()) {
        const piece = parseItemOrInnerList(input);
        if (piece.kind === 0 /* ERROR */) {
            return piece;
        }
        result.items.push(piece);
        input.skipOWS();
        if (input.atEnd()) {
            return result;
        }
        if (input.peek() !== ',') {
            return makeError();
        }
        input.eat();
        input.skipOWS();
        // "If input_string is empty, there is a trailing comma; fail parsing."
        if (input.atEnd()) {
            return makeError();
        }
    }
    return result; // this case corresponds to an empty list.
}
// 4.2.1.1.  Parsing an Item or Inner List
function parseItemOrInnerList(input) {
    if (input.peek() === '(') {
        return parseInnerList(input);
    }
    return parseItemInternal(input);
}
// 4.2.1.2.  Parsing an Inner List
function parseInnerList(input) {
    if (input.peek() !== '(') {
        return makeError();
    }
    input.eat();
    const items = [];
    while (!input.atEnd()) {
        input.skipSP();
        if (input.peek() === ')') {
            input.eat();
            const params = parseParameters(input);
            if (params.kind === 0 /* ERROR */) {
                return params;
            }
            return {
                kind: 12 /* INNER_LIST */,
                items: items,
                parameters: params,
            };
        }
        const item = parseItemInternal(input);
        if (item.kind === 0 /* ERROR */) {
            return item;
        }
        items.push(item);
        if (input.peek() !== ' ' && input.peek() !== ')') {
            return makeError();
        }
    }
    // Didn't see ), so error.
    return makeError();
}
// 4.2.3.  Parsing an Item
function parseItemInternal(input) {
    const bareItem = parseBareItem(input);
    if (bareItem.kind === 0 /* ERROR */) {
        return bareItem;
    }
    const params = parseParameters(input);
    if (params.kind === 0 /* ERROR */) {
        return params;
    }
    return { kind: 4 /* ITEM */, value: bareItem, parameters: params };
}
// 4.2.3.1.  Parsing a Bare Item
function parseBareItem(input) {
    const upcoming = input.peekCharCode();
    if (upcoming === CHAR_MINUS || isDigit(upcoming)) {
        return parseIntegerOrDecimal(input);
    }
    if (upcoming === CHAR_DQUOTE) {
        return parseString(input);
    }
    if (upcoming === CHAR_COLON) {
        return parseByteSequence(input);
    }
    if (upcoming === CHAR_QUESTION_MARK) {
        return parseBoolean(input);
    }
    if (upcoming === CHAR_STAR || isAlpha(upcoming)) {
        return parseToken(input);
    }
    return makeError();
}
// 4.2.3.2.  Parsing Parameters
function parseParameters(input) {
    // The main noteworthy thing here is handling of duplicates and ordering:
    //
    // "Note that Parameters are ordered as serialized"
    //
    // "If parameters already contains a name param_name (comparing
    // character-for-character), overwrite its value."
    //
    // "Note that when duplicate Parameter keys are encountered, this has the
    // effect of ignoring all but the last instance."
    const items = new Map();
    while (!input.atEnd()) {
        if (input.peek() !== ';') {
            break;
        }
        input.eat();
        input.skipSP();
        const paramName = parseKey(input);
        if (paramName.kind === 0 /* ERROR */) {
            return paramName;
        }
        let paramValue = { kind: 10 /* BOOLEAN */, value: true };
        if (input.peek() === '=') {
            input.eat();
            const parsedParamValue = parseBareItem(input);
            if (parsedParamValue.kind === 0 /* ERROR */) {
                return parsedParamValue;
            }
            paramValue = parsedParamValue;
        }
        // Delete any previous occurrence of duplicates to get the ordering right.
        if (items.has(paramName.value)) {
            items.delete(paramName.value);
        }
        items.set(paramName.value, { kind: 2 /* PARAMETER */, name: paramName, value: paramValue });
    }
    return { kind: 3 /* PARAMETERS */, items: [...items.values()] };
}
// 4.2.3.3.  Parsing a Key
function parseKey(input) {
    let outputString = '';
    const first = input.peekCharCode();
    if (first !== CHAR_STAR && !isLcAlpha(first)) {
        return makeError();
    }
    while (!input.atEnd()) {
        const upcoming = input.peekCharCode();
        if (!isLcAlpha(upcoming) && !isDigit(upcoming) && upcoming !== CHAR_UNDERSCORE && upcoming !== CHAR_MINUS &&
            upcoming !== CHAR_DOT && upcoming !== CHAR_STAR) {
            break;
        }
        outputString += input.peek();
        input.eat();
    }
    return { kind: 1 /* PARAM_NAME */, value: outputString };
}
// 4.2.4.  Parsing an Integer or Decimal
function parseIntegerOrDecimal(input) {
    let resultKind = 5 /* INTEGER */;
    let sign = 1;
    let inputNumber = '';
    if (input.peek() === '-') {
        input.eat();
        sign = -1;
    }
    // This case includes end of input.
    if (!isDigit(input.peekCharCode())) {
        return makeError();
    }
    while (!input.atEnd()) {
        const char = input.peekCharCode();
        if (char !== undefined && isDigit(char)) {
            input.eat();
            inputNumber += String.fromCodePoint(char);
        }
        else if (char === CHAR_DOT && resultKind === 5 /* INTEGER */) {
            input.eat();
            if (inputNumber.length > 12) {
                return makeError();
            }
            inputNumber += '.';
            resultKind = 6 /* DECIMAL */;
        }
        else {
            break;
        }
        if (resultKind === 5 /* INTEGER */ && inputNumber.length > 15) {
            return makeError();
        }
        if (resultKind === 6 /* DECIMAL */ && inputNumber.length > 16) {
            return makeError();
        }
    }
    if (resultKind === 5 /* INTEGER */) {
        const num = sign * Number.parseInt(inputNumber, 10);
        if (num < -999999999999999 || num > 999999999999999) {
            return makeError();
        }
        return { kind: 5 /* INTEGER */, value: num };
    }
    const afterDot = inputNumber.length - 1 - inputNumber.indexOf('.');
    if (afterDot > 3 || afterDot === 0) {
        return makeError();
    }
    return { kind: 6 /* DECIMAL */, value: sign * Number.parseFloat(inputNumber) };
}
// 4.2.5.  Parsing a String
function parseString(input) {
    let outputString = '';
    if (input.peek() !== '"') {
        return makeError();
    }
    input.eat();
    while (!input.atEnd()) {
        const char = input.peekCharCode();
        // can't happen due to atEnd(), but help the typechecker out.
        if (char === undefined) {
            return makeError();
        }
        input.eat();
        if (char === CHAR_BACKSLASH) {
            if (input.atEnd()) {
                return makeError();
            }
            const nextChar = input.peekCharCode();
            input.eat();
            if (nextChar !== CHAR_BACKSLASH && nextChar !== CHAR_DQUOTE) {
                return makeError();
            }
            outputString += String.fromCodePoint(nextChar);
        }
        else if (char === CHAR_DQUOTE) {
            return { kind: 7 /* STRING */, value: outputString };
        }
        else if (char < CHAR_MIN_ASCII_PRINTABLE || char > CHAR_MAX_ASCII_PRINTABLE) {
            return makeError();
        }
        else {
            outputString += String.fromCodePoint(char);
        }
    }
    // No closing quote.
    return makeError();
}
// 4.2.6.  Parsing a Token
function parseToken(input) {
    const first = input.peekCharCode();
    if (first !== CHAR_STAR && !isAlpha(first)) {
        return makeError();
    }
    let outputString = '';
    while (!input.atEnd()) {
        const upcoming = input.peekCharCode();
        if (upcoming === undefined || !isTChar(upcoming) && upcoming !== CHAR_COLON && upcoming !== CHAR_SLASH) {
            break;
        }
        input.eat();
        outputString += String.fromCodePoint(upcoming);
    }
    return { kind: 8 /* TOKEN */, value: outputString };
}
// 4.2.7.  Parsing a Byte Sequence
function parseByteSequence(input) {
    let outputString = '';
    if (input.peek() !== ':') {
        return makeError();
    }
    input.eat();
    while (!input.atEnd()) {
        const char = input.peekCharCode();
        // can't happen due to atEnd(), but help the typechecker out.
        if (char === undefined) {
            return makeError();
        }
        input.eat();
        if (char === CHAR_COLON) {
            return { kind: 9 /* BINARY */, value: outputString };
        }
        if (isDigit(char) || isAlpha(char) || char === CHAR_PLUS || char === CHAR_SLASH || char === CHAR_EQUALS) {
            outputString += String.fromCodePoint(char);
        }
        else {
            return makeError();
        }
    }
    // No closing :
    return makeError();
}
// 4.2.8.  Parsing a Boolean
function parseBoolean(input) {
    if (input.peek() !== '?') {
        return makeError();
    }
    input.eat();
    if (input.peek() === '0') {
        input.eat();
        return { kind: 10 /* BOOLEAN */, value: false };
    }
    if (input.peek() === '1') {
        input.eat();
        return { kind: 10 /* BOOLEAN */, value: true };
    }
    return makeError();
}
export function parseItem(input) {
    const i = new Input(input);
    const result = parseItemInternal(i);
    if (!i.allParsed()) {
        return makeError();
    }
    return result;
}
export function parseList(input) {
    // No need to look for trailing stuff here since parseListInternal does it already.
    return parseListInternal(new Input(input));
}
// 4.1.3.  Serializing an Item
export function serializeItem(input) {
    const bareItemVal = serializeBareItem(input.value);
    if (bareItemVal.kind === 0 /* ERROR */) {
        return bareItemVal;
    }
    const paramVal = serializeParameters(input.parameters);
    if (paramVal.kind === 0 /* ERROR */) {
        return paramVal;
    }
    return { kind: 13 /* SERIALIZATION_RESULT */, value: bareItemVal.value + paramVal.value };
}
// 4.1.1.  Serializing a List
export function serializeList(input) {
    const outputPieces = [];
    for (let i = 0; i < input.items.length; ++i) {
        const item = input.items[i];
        if (item.kind === 12 /* INNER_LIST */) {
            const itemResult = serializeInnerList(item);
            if (itemResult.kind === 0 /* ERROR */) {
                return itemResult;
            }
            outputPieces.push(itemResult.value);
        }
        else {
            const itemResult = serializeItem(item);
            if (itemResult.kind === 0 /* ERROR */) {
                return itemResult;
            }
            outputPieces.push(itemResult.value);
        }
    }
    const output = outputPieces.join(', ');
    return { kind: 13 /* SERIALIZATION_RESULT */, value: output };
}
// 4.1.1.1.  Serializing an Inner List
function serializeInnerList(input) {
    const outputPieces = [];
    for (let i = 0; i < input.items.length; ++i) {
        const itemResult = serializeItem(input.items[i]);
        if (itemResult.kind === 0 /* ERROR */) {
            return itemResult;
        }
        outputPieces.push(itemResult.value);
    }
    let output = '(' + outputPieces.join(' ') + ')';
    const paramResult = serializeParameters(input.parameters);
    if (paramResult.kind === 0 /* ERROR */) {
        return paramResult;
    }
    output += paramResult.value;
    return { kind: 13 /* SERIALIZATION_RESULT */, value: output };
}
// 4.1.1.2.  Serializing Parameters
function serializeParameters(input) {
    let output = '';
    for (const item of input.items) {
        output += ';';
        const nameResult = serializeKey(item.name);
        if (nameResult.kind === 0 /* ERROR */) {
            return nameResult;
        }
        output += nameResult.value;
        const itemVal = item.value;
        if (itemVal.kind !== 10 /* BOOLEAN */ || !itemVal.value) {
            output += '=';
            const itemValResult = serializeBareItem(itemVal);
            if (itemValResult.kind === 0 /* ERROR */) {
                return itemValResult;
            }
            output += itemValResult.value;
        }
    }
    return { kind: 13 /* SERIALIZATION_RESULT */, value: output };
}
// 4.1.1.3.  Serializing a Key
function serializeKey(input) {
    if (input.value.length === 0) {
        return makeError();
    }
    const firstChar = input.value.charCodeAt(0);
    if (!isLcAlpha(firstChar) && firstChar !== CHAR_STAR) {
        return makeError();
    }
    for (let i = 1; i < input.value.length; ++i) {
        const char = input.value.charCodeAt(i);
        if (!isLcAlpha(char) && !isDigit(char) && char !== CHAR_UNDERSCORE && char !== CHAR_MINUS && char !== CHAR_DOT &&
            char !== CHAR_STAR) {
            return makeError();
        }
    }
    return { kind: 13 /* SERIALIZATION_RESULT */, value: input.value };
}
// 4.1.3.1.  Serializing a Bare Item
function serializeBareItem(input) {
    if (input.kind === 5 /* INTEGER */) {
        return serializeInteger(input);
    }
    if (input.kind === 6 /* DECIMAL */) {
        return serializeDecimal(input);
    }
    if (input.kind === 7 /* STRING */) {
        return serializeString(input);
    }
    if (input.kind === 8 /* TOKEN */) {
        return serializeToken(input);
    }
    if (input.kind === 10 /* BOOLEAN */) {
        return serializeBoolean(input);
    }
    if (input.kind === 9 /* BINARY */) {
        return serializeByteSequence(input);
    }
    return makeError();
}
// 4.1.4.  Serializing an Integer
function serializeInteger(input) {
    if (input.value < -999999999999999 || input.value > 999999999999999 || !Number.isInteger(input.value)) {
        return makeError();
    }
    return { kind: 13 /* SERIALIZATION_RESULT */, value: input.value.toString(10) };
}
// 4.1.5.  Serializing a Decimal
function serializeDecimal(_input) {
    throw 'Unimplemented';
}
// 4.1.6.  Serializing a String
function serializeString(input) {
    // Only printable ASCII strings are supported by the spec.
    for (let i = 0; i < input.value.length; ++i) {
        const char = input.value.charCodeAt(i);
        if (char < CHAR_MIN_ASCII_PRINTABLE || char > CHAR_MAX_ASCII_PRINTABLE) {
            return makeError();
        }
    }
    let output = '"';
    for (let i = 0; i < input.value.length; ++i) {
        const charStr = input.value[i];
        if (charStr === '"' || charStr === '\\') {
            output += '\\';
        }
        output += charStr;
    }
    output += '"';
    return { kind: 13 /* SERIALIZATION_RESULT */, value: output };
}
// 4.1.7.  Serializing a Token
function serializeToken(input) {
    if (input.value.length === 0) {
        return makeError();
    }
    const firstChar = input.value.charCodeAt(0);
    if (!isAlpha(firstChar) && firstChar !== CHAR_STAR) {
        return makeError();
    }
    for (let i = 1; i < input.value.length; ++i) {
        const char = input.value.charCodeAt(i);
        if (!isTChar(char) && char !== CHAR_COLON && char !== CHAR_SLASH) {
            return makeError();
        }
    }
    return { kind: 13 /* SERIALIZATION_RESULT */, value: input.value };
}
// 4.1.8.  Serializing a Byte Sequence
function serializeByteSequence(_input) {
    throw 'Unimplemented';
}
// 4.1.9.  Serializing a Boolean
function serializeBoolean(input) {
    return { kind: 13 /* SERIALIZATION_RESULT */, value: input.value ? '?1' : '?0' };
}
//# sourceMappingURL=StructuredHeaders.js.map