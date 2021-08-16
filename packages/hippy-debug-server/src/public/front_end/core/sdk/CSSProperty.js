// Copyright 2016 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as TextUtils from '../../models/text_utils/text_utils.js';
import * as Common from '../common/common.js';
import * as HostModule from '../host/host.js';
import * as Platform from '../platform/platform.js';
import { cssMetadata, GridAreaRowRegex } from './CSSMetadata.js';
export class CSSProperty {
    ownerStyle;
    index;
    name;
    value;
    important;
    disabled;
    parsedOk;
    implicit;
    text;
    range;
    _active;
    _nameRange;
    _valueRange;
    _invalidProperty;
    _invalidString;
    constructor(ownerStyle, index, name, value, important, disabled, parsedOk, implicit, text, range) {
        this.ownerStyle = ownerStyle;
        this.index = index;
        this.name = name;
        this.value = value;
        this.important = important;
        this.disabled = disabled;
        this.parsedOk = parsedOk;
        this.implicit = implicit; // A longhand, implicitly set by missing values of shorthand.
        this.text = text;
        this.range = range ? TextUtils.TextRange.TextRange.fromObject(range) : null;
        this._active = true;
        this._nameRange = null;
        this._valueRange = null;
        this._invalidProperty = null;
    }
    static parsePayload(ownerStyle, index, payload) {
        // The following default field values are used in the payload:
        // important: false
        // parsedOk: true
        // implicit: false
        // disabled: false
        const result = new CSSProperty(ownerStyle, index, payload.name, payload.value, payload.important || false, payload.disabled || false, ('parsedOk' in payload) ? Boolean(payload.parsedOk) : true, Boolean(payload.implicit), payload.text, payload.range);
        return result;
    }
    _ensureRanges() {
        if (this._nameRange && this._valueRange) {
            return;
        }
        const range = this.range;
        const text = this.text ? new TextUtils.Text.Text(this.text) : null;
        if (!range || !text) {
            return;
        }
        const nameIndex = text.value().indexOf(this.name);
        const valueIndex = text.value().lastIndexOf(this.value);
        if (nameIndex === -1 || valueIndex === -1 || nameIndex > valueIndex) {
            return;
        }
        const nameSourceRange = new TextUtils.TextRange.SourceRange(nameIndex, this.name.length);
        const valueSourceRange = new TextUtils.TextRange.SourceRange(valueIndex, this.value.length);
        this._nameRange = rebase(text.toTextRange(nameSourceRange), range.startLine, range.startColumn);
        this._valueRange = rebase(text.toTextRange(valueSourceRange), range.startLine, range.startColumn);
        function rebase(oneLineRange, lineOffset, columnOffset) {
            if (oneLineRange.startLine === 0) {
                oneLineRange.startColumn += columnOffset;
                oneLineRange.endColumn += columnOffset;
            }
            oneLineRange.startLine += lineOffset;
            oneLineRange.endLine += lineOffset;
            return oneLineRange;
        }
    }
    nameRange() {
        this._ensureRanges();
        return this._nameRange;
    }
    valueRange() {
        this._ensureRanges();
        return this._valueRange;
    }
    rebase(edit) {
        if (this.ownerStyle.styleSheetId !== edit.styleSheetId) {
            return;
        }
        if (this.range) {
            this.range = this.range.rebaseAfterTextEdit(edit.oldRange, edit.newRange);
        }
    }
    setActive(active) {
        this._active = active;
    }
    get propertyText() {
        if (this.text !== undefined) {
            return this.text;
        }
        if (this.name === '') {
            return '';
        }
        return this.name + ': ' + this.value + (this.important ? ' !important' : '') + ';';
    }
    activeInStyle() {
        return this._active;
    }
    trimmedValueWithoutImportant() {
        const important = '!important';
        return this.value.endsWith(important) ? this.value.slice(0, -important.length).trim() : this.value.trim();
    }
    async setText(propertyText, majorChange, overwrite) {
        if (!this.ownerStyle) {
            return Promise.reject(new Error('No ownerStyle for property'));
        }
        if (!this.ownerStyle.styleSheetId) {
            return Promise.reject(new Error('No owner style id'));
        }
        if (!this.range || !this.ownerStyle.range) {
            return Promise.reject(new Error('Style not editable'));
        }
        if (majorChange) {
            HostModule.userMetrics.actionTaken(HostModule.UserMetrics.Action.StyleRuleEdited);
            if (this.name.startsWith('--')) {
                HostModule.userMetrics.actionTaken(HostModule.UserMetrics.Action.CustomPropertyEdited);
            }
        }
        if (overwrite && propertyText === this.propertyText) {
            this.ownerStyle.cssModel().domModel().markUndoableState(!majorChange);
            return Promise.resolve(true);
        }
        const range = this.range.relativeTo(this.ownerStyle.range.startLine, this.ownerStyle.range.startColumn);
        const indentation = this.ownerStyle.cssText ?
            this._detectIndentation(this.ownerStyle.cssText) :
            Common.Settings.Settings.instance().moduleSetting('textEditorIndent').get();
        const endIndentation = this.ownerStyle.cssText ? indentation.substring(0, this.ownerStyle.range.endColumn) : '';
        const text = new TextUtils.Text.Text(this.ownerStyle.cssText || '');
        const newStyleText = text.replaceRange(range, Platform.StringUtilities.sprintf(';%s;', propertyText));
        const tokenizerFactory = TextUtils.CodeMirrorUtils.TokenizerFactory.instance();
        const styleText = CSSProperty._formatStyle(newStyleText, indentation, endIndentation, tokenizerFactory);
        return this.ownerStyle.setText(styleText, majorChange);
    }
    static _formatStyle(styleText, indentation, endIndentation, 
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tokenizerFactory, codeMirrorMode) {
        const doubleIndent = indentation.substring(endIndentation.length) + indentation;
        if (indentation) {
            indentation = '\n' + indentation;
        }
        let result = '';
        let propertyName = '';
        let propertyText = '';
        let insideProperty = false;
        let needsSemi = false;
        const tokenize = tokenizerFactory.createTokenizer('text/css', codeMirrorMode);
        tokenize('*{' + styleText + '}', processToken);
        if (insideProperty) {
            result += propertyText;
        }
        result = result.substring(2, result.length - 1).trimRight();
        return result + (indentation ? '\n' + endIndentation : '');
        function processToken(token, tokenType, _column, _newColumn) {
            if (!insideProperty) {
                const disabledProperty = tokenType && tokenType.includes('css-comment') && isDisabledProperty(token);
                const isPropertyStart = tokenType &&
                    (tokenType.includes('css-string') || tokenType.includes('css-meta') || tokenType.includes('css-property') ||
                        tokenType.includes('css-variable-2'));
                if (disabledProperty) {
                    result = result.trimRight() + indentation + token;
                }
                else if (isPropertyStart) {
                    insideProperty = true;
                    propertyText = token;
                }
                else if (token !== ';' || needsSemi) {
                    result += token;
                    if (token.trim() && !(tokenType && tokenType.includes('css-comment'))) {
                        needsSemi = token !== ';';
                    }
                }
                if (token === '{' && !tokenType) {
                    needsSemi = false;
                }
                return;
            }
            if (token === '}' || token === ';') {
                // While `propertyText` can generally be trimmed, doing so
                // breaks valid CSS declarations such as `--foo:  ;` which would
                // then produce invalid CSS of the form `--foo:;`. This
                // implementation takes special care to restore a single
                // whitespace token in this edge case. https://crbug.com/1071296
                const trimmedPropertyText = propertyText.trim();
                result = result.trimRight() + indentation + trimmedPropertyText +
                    (trimmedPropertyText.endsWith(':') ? ' ' : '') + ';';
                needsSemi = false;
                insideProperty = false;
                propertyName = '';
                if (token === '}') {
                    result += '}';
                }
            }
            else {
                if (cssMetadata().isGridAreaDefiningProperty(propertyName)) {
                    const rowResult = GridAreaRowRegex.exec(token);
                    if (rowResult && rowResult.index === 0 && !propertyText.trimRight().endsWith(']')) {
                        propertyText = propertyText.trimRight() + '\n' + doubleIndent;
                    }
                }
                if (!propertyName && token === ':') {
                    propertyName = propertyText;
                }
                propertyText += token;
            }
        }
        function isDisabledProperty(text) {
            const colon = text.indexOf(':');
            if (colon === -1) {
                return false;
            }
            const propertyName = text.substring(2, colon).trim();
            return cssMetadata().isCSSPropertyName(propertyName);
        }
    }
    _detectIndentation(text) {
        const lines = text.split('\n');
        if (lines.length < 2) {
            return '';
        }
        return TextUtils.TextUtils.Utils.lineIndent(lines[1]);
    }
    setValue(newValue, majorChange, overwrite, userCallback) {
        const text = this.name + ': ' + newValue + (this.important ? ' !important' : '') + ';';
        this.setText(text, majorChange, overwrite).then(userCallback);
    }
    setDisabled(disabled) {
        if (!this.ownerStyle) {
            return Promise.resolve(false);
        }
        if (disabled === this.disabled) {
            return Promise.resolve(true);
        }
        if (!this.text) {
            return Promise.resolve(true);
        }
        const propertyText = this.text.trim();
        const text = disabled ? '/* ' + propertyText + ' */' : this.text.substring(2, propertyText.length - 2).trim();
        return this.setText(text, true, true);
    }
    /**
     * This stores the warning string when a CSS Property is improperly parsed.
     */
    setDisplayedStringForInvalidProperty(invalidString) {
        this._invalidString = invalidString;
    }
    /**
     * Retrieve the warning string for a screen reader to announce when editing the property.
     */
    getInvalidStringForInvalidProperty() {
        return this._invalidString;
    }
}
//# sourceMappingURL=CSSProperty.js.map