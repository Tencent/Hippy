/*
 * Copyright (C) 2013 Google Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as Platform from '../../core/platform/platform.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as TextUtils from '../../models/text_utils/text_utils.js';
import * as ColorPicker from '../../ui/legacy/components/color_picker/color_picker.js';
import * as InlineEditor from '../../ui/legacy/components/inline_editor/inline_editor.js';
import * as SourceFrame from '../../ui/legacy/components/source_frame/source_frame.js';
import * as UI from '../../ui/legacy/legacy.js';
import { Plugin } from './Plugin.js';
const UIStrings = {
    /**
    *@description Swatch icon element title in CSSPlugin of the Sources panel
    */
    openColorPicker: 'Open color picker.',
    /**
    *@description Text to open the cubic bezier editor
    */
    openCubicBezierEditor: 'Open cubic bezier editor.',
};
const str_ = i18n.i18n.registerUIStrings('panels/sources/CSSPlugin.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class CSSPlugin extends Plugin {
    _textEditor;
    _swatchPopoverHelper;
    _muteSwatchProcessing;
    _hadSwatchChange;
    _bezierEditor;
    _editedSwatchTextRange;
    _spectrum;
    _currentSwatch;
    _boundHandleKeyDown;
    constructor(textEditor) {
        super();
        this._textEditor = textEditor;
        this._swatchPopoverHelper = new InlineEditor.SwatchPopoverHelper.SwatchPopoverHelper();
        this._muteSwatchProcessing = false;
        this._hadSwatchChange = false;
        this._bezierEditor = null;
        this._editedSwatchTextRange = null;
        this._spectrum = null;
        this._currentSwatch = null;
        this._textEditor.configureAutocomplete({
            suggestionsCallback: this._cssSuggestions.bind(this),
            isWordChar: this._isWordChar.bind(this),
            anchorBehavior: undefined,
            substituteRangeCallback: undefined,
            tooltipCallback: undefined,
        });
        this._textEditor.addEventListener(SourceFrame.SourcesTextEditor.Events.ScrollChanged, this._textEditorScrolled, this);
        this._textEditor.addEventListener(UI.TextEditor.Events.TextChanged, this._onTextChanged, this);
        this._updateSwatches(0, this._textEditor.linesCount - 1);
        this._boundHandleKeyDown = null;
        this._registerShortcuts();
    }
    static accepts(uiSourceCode) {
        return uiSourceCode.contentType().isStyleSheet();
    }
    _registerShortcuts() {
        this._boundHandleKeyDown =
            UI.ShortcutRegistry.ShortcutRegistry.instance().addShortcutListener(this._textEditor.element, {
                'sources.increment-css': this._handleUnitModification.bind(this, 1),
                'sources.increment-css-by-ten': this._handleUnitModification.bind(this, 10),
                'sources.decrement-css': this._handleUnitModification.bind(this, -1),
                'sources.decrement-css-by-ten': this._handleUnitModification.bind(this, -10),
            });
    }
    _textEditorScrolled() {
        if (this._swatchPopoverHelper.isShowing()) {
            this._swatchPopoverHelper.hide(true);
        }
    }
    _modifyUnit(unit, change) {
        const unitValue = parseInt(unit, 10);
        if (isNaN(unitValue)) {
            return null;
        }
        const tail = unit.substring((unitValue).toString().length);
        return Platform.StringUtilities.sprintf('%d%s', unitValue + change, tail);
    }
    async _handleUnitModification(change) {
        const selection = this._textEditor.selection().normalize();
        let token = this._textEditor.tokenAtTextPosition(selection.startLine, selection.startColumn);
        if (!token) {
            if (selection.startColumn > 0) {
                token = this._textEditor.tokenAtTextPosition(selection.startLine, selection.startColumn - 1);
            }
            if (!token) {
                return false;
            }
        }
        if (token.type !== 'css-number') {
            return false;
        }
        const cssUnitRange = new TextUtils.TextRange.TextRange(selection.startLine, token.startColumn, selection.startLine, token.endColumn);
        const cssUnitText = this._textEditor.text(cssUnitRange);
        const newUnitText = this._modifyUnit(cssUnitText, change);
        if (!newUnitText) {
            return false;
        }
        this._textEditor.editRange(cssUnitRange, newUnitText);
        selection.startColumn = token.startColumn;
        selection.endColumn = selection.startColumn + newUnitText.length;
        this._textEditor.setSelection(selection);
        return true;
    }
    _updateSwatches(startLine, endLine) {
        const swatches = [];
        const swatchPositions = [];
        const regexes = [SDK.CSSMetadata.VariableRegex, SDK.CSSMetadata.URLRegex, UI.Geometry.CubicBezier.Regex, Common.Color.Regex];
        const handlers = new Map();
        handlers.set(Common.Color.Regex, this._createColorSwatch.bind(this));
        handlers.set(UI.Geometry.CubicBezier.Regex, this._createBezierSwatch.bind(this));
        for (let lineNumber = startLine; lineNumber <= endLine; lineNumber++) {
            const line = this._textEditor.line(lineNumber).substring(0, maxSwatchProcessingLength);
            const results = TextUtils.TextUtils.Utils.splitStringByRegexes(line, regexes);
            for (let i = 0; i < results.length; i++) {
                const result = results[i];
                const handler = handlers.get(regexes[result.regexIndex]);
                if (result.regexIndex === -1 || !handler) {
                    continue;
                }
                const delimiters = /[\s:;,(){}]/;
                const positionBefore = result.position - 1;
                const positionAfter = result.position + result.value.length;
                if (positionBefore >= 0 && !delimiters.test(line.charAt(positionBefore)) ||
                    positionAfter < line.length && !delimiters.test(line.charAt(positionAfter))) {
                    continue;
                }
                const swatch = handler(result.value);
                if (!swatch) {
                    continue;
                }
                swatches.push(swatch);
                swatchPositions.push(TextUtils.TextRange.TextRange.createFromLocation(lineNumber, result.position));
            }
        }
        this._textEditor.operation(putSwatchesInline.bind(this));
        function putSwatchesInline() {
            const clearRange = new TextUtils.TextRange.TextRange(startLine, 0, endLine, this._textEditor.line(endLine).length);
            this._textEditor.bookmarks(clearRange, SwatchBookmark).forEach(marker => marker.clear());
            for (let i = 0; i < swatches.length; i++) {
                const swatch = swatches[i];
                const swatchPosition = swatchPositions[i];
                const bookmark = this._textEditor.addBookmark(swatchPosition.startLine, swatchPosition.startColumn, swatch, SwatchBookmark);
                swatchToBookmark.set(swatch, bookmark);
            }
        }
    }
    _createColorSwatch(text) {
        const color = Common.Color.Color.parse(text);
        if (!color) {
            return null;
        }
        const swatch = new InlineEditor.ColorSwatch.ColorSwatch();
        swatch.renderColor(color, false, i18nString(UIStrings.openColorPicker));
        const value = swatch.createChild('span');
        value.textContent = text;
        value.setAttribute('hidden', 'true');
        swatch.addEventListener('swatch-click', this._swatchIconClicked.bind(this, swatch), false);
        return swatch;
    }
    _createBezierSwatch(text) {
        if (!UI.Geometry.CubicBezier.parse(text)) {
            return null;
        }
        const swatch = InlineEditor.Swatches.BezierSwatch.create();
        swatch.setBezierText(text);
        UI.Tooltip.Tooltip.install(swatch.iconElement(), i18nString(UIStrings.openCubicBezierEditor));
        swatch.iconElement().addEventListener('click', this._swatchIconClicked.bind(this, swatch), false);
        swatch.hideText(true);
        return swatch;
    }
    _swatchIconClicked(swatch, event) {
        event.consume(true);
        this._hadSwatchChange = false;
        this._muteSwatchProcessing = true;
        const bookmark = swatchToBookmark.get(swatch);
        if (!bookmark) {
            return;
        }
        const swatchPosition = bookmark.position();
        if (!swatchPosition) {
            return;
        }
        this._textEditor.setSelection(swatchPosition);
        this._editedSwatchTextRange = swatchPosition.clone();
        if (this._editedSwatchTextRange) {
            this._editedSwatchTextRange.endColumn += (swatch.textContent || '').length;
        }
        this._currentSwatch = swatch;
        if (InlineEditor.ColorSwatch.ColorSwatch.isColorSwatch(swatch)) {
            this._showSpectrum(swatch);
        }
        else if (swatch instanceof InlineEditor.Swatches.BezierSwatch) {
            this._showBezierEditor(swatch);
        }
    }
    _showSpectrum(swatch) {
        if (!this._spectrum) {
            this._spectrum = new ColorPicker.Spectrum.Spectrum();
            this._spectrum.addEventListener(ColorPicker.Spectrum.Events.SizeChanged, this._spectrumResized, this);
            this._spectrum.addEventListener(ColorPicker.Spectrum.Events.ColorChanged, this._spectrumChanged, this);
        }
        this._spectrum.setColor(swatch.getColor(), swatch.getFormat() || '');
        this._swatchPopoverHelper.show(this._spectrum, swatch, this._swatchPopoverHidden.bind(this));
    }
    _spectrumResized(_event) {
        this._swatchPopoverHelper.reposition();
    }
    _spectrumChanged(event) {
        const colorString = event.data;
        const color = Common.Color.Color.parse(colorString);
        if (!color || !this._currentSwatch) {
            return;
        }
        if (InlineEditor.ColorSwatch.ColorSwatch.isColorSwatch(this._currentSwatch)) {
            const swatch = this._currentSwatch;
            swatch.renderColor(color);
        }
        this._changeSwatchText(colorString);
    }
    _showBezierEditor(swatch) {
        const cubicBezier = UI.Geometry.CubicBezier.parse(swatch.bezierText()) ||
            UI.Geometry.CubicBezier.parse('linear');
        if (!this._bezierEditor) {
            this._bezierEditor = new InlineEditor.BezierEditor.BezierEditor(cubicBezier);
            this._bezierEditor.addEventListener(InlineEditor.BezierEditor.Events.BezierChanged, this._bezierChanged, this);
        }
        else {
            this._bezierEditor.setBezier(cubicBezier);
        }
        this._swatchPopoverHelper.show(this._bezierEditor, swatch.iconElement(), this._swatchPopoverHidden.bind(this));
    }
    _bezierChanged(event) {
        const bezierString = event.data;
        if (this._currentSwatch instanceof InlineEditor.Swatches.BezierSwatch) {
            this._currentSwatch.setBezierText(bezierString);
        }
        this._changeSwatchText(bezierString);
    }
    _changeSwatchText(text) {
        this._hadSwatchChange = true;
        const editedRange = this._editedSwatchTextRange;
        this._textEditor.editRange(editedRange, text, '*swatch-text-changed');
        editedRange.endColumn = editedRange.startColumn + text.length;
    }
    _swatchPopoverHidden(commitEdit) {
        this._muteSwatchProcessing = false;
        if (!commitEdit && this._hadSwatchChange) {
            this._textEditor.undo();
        }
    }
    _onTextChanged(event) {
        if (!this._muteSwatchProcessing) {
            this._updateSwatches(event.data.newRange.startLine, event.data.newRange.endLine);
        }
    }
    _isWordChar(char) {
        return TextUtils.TextUtils.Utils.isWordChar(char) || char === '.' || char === '-' || char === '$';
    }
    _cssSuggestions(prefixRange, _substituteRange) {
        const prefix = this._textEditor.text(prefixRange);
        if (prefix.startsWith('$')) {
            return null;
        }
        const propertyToken = this._backtrackPropertyToken(prefixRange.startLine, prefixRange.startColumn - 1);
        if (!propertyToken) {
            return null;
        }
        const line = this._textEditor.line(prefixRange.startLine);
        const tokenContent = line.substring(propertyToken.startColumn, propertyToken.endColumn);
        const propertyValues = SDK.CSSMetadata.cssMetadata().propertyValues(tokenContent);
        return Promise.resolve(propertyValues.filter(value => value.startsWith(prefix)).map(value => {
            return {
                text: value,
                title: undefined,
                subtitle: undefined,
                iconType: undefined,
                priority: undefined,
                isSecondary: undefined,
                subtitleRenderer: undefined,
                selectionRange: undefined,
                hideGhostText: undefined,
                iconElement: undefined,
            };
        }));
    }
    _backtrackPropertyToken(lineNumber, columnNumber) {
        const backtrackDepth = 10;
        let tokenPosition = columnNumber;
        const line = this._textEditor.line(lineNumber);
        let seenColon = false;
        for (let i = 0; i < backtrackDepth && tokenPosition >= 0; ++i) {
            const token = this._textEditor.tokenAtTextPosition(lineNumber, tokenPosition);
            if (!token) {
                return null;
            }
            if (token.type === 'css-property') {
                return seenColon ? token : null;
            }
            if (token.type && !(token.type.indexOf('whitespace') !== -1 || token.type.startsWith('css-comment'))) {
                return null;
            }
            if (!token.type && line.substring(token.startColumn, token.endColumn) === ':') {
                if (!seenColon) {
                    seenColon = true;
                }
                else {
                    return null;
                }
            }
            tokenPosition = token.startColumn - 1;
        }
        return null;
    }
    dispose() {
        if (this._swatchPopoverHelper.isShowing()) {
            this._swatchPopoverHelper.hide(true);
        }
        this._textEditor.removeEventListener(SourceFrame.SourcesTextEditor.Events.ScrollChanged, this._textEditorScrolled, this);
        this._textEditor.removeEventListener(UI.TextEditor.Events.TextChanged, this._onTextChanged, this);
        this._textEditor.bookmarks(this._textEditor.fullRange(), SwatchBookmark).forEach(marker => marker.clear());
        this._textEditor.element.removeEventListener('keydown', this._boundHandleKeyDown);
    }
}
export const maxSwatchProcessingLength = 300;
export const SwatchBookmark = Symbol('swatch');
const swatchToBookmark = new WeakMap();
//# sourceMappingURL=CSSPlugin.js.map