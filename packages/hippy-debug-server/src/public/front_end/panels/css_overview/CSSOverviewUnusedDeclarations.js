// Copyright 2019 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as i18n from '../../core/i18n/i18n.js';
const UIStrings = {
    /**
    *@description Label to explain why top values are ignored
    */
    topAppliedToAStatically: '`Top` applied to a statically positioned element',
    /**
    *@description Label to explain why left (opposite to right) values are ignored.
    */
    leftAppliedToAStatically: '`Left` applied to a statically positioned element',
    /**
    *@description Label to explain why right values are ignored
    */
    rightAppliedToAStatically: '`Right` applied to a statically positioned element',
    /**
    *@description Label to explain why bottom values are ignored
    */
    bottomAppliedToAStatically: '`Bottom` applied to a statically positioned element',
    /**
    *@description Label to explain why width values are ignored
    */
    widthAppliedToAnInlineElement: '`Width` applied to an inline element',
    /**
    *@description Label to explain why height values are ignored
    */
    heightAppliedToAnInlineElement: '`Height` applied to an inline element',
    /**
    *@description Label to explain why vertical-align values are ignored
    */
    verticalAlignmentAppliedTo: 'Vertical alignment applied to element which is neither `inline` nor `table-cell`',
};
const str_ = i18n.i18n.registerUIStrings('panels/css_overview/CSSOverviewUnusedDeclarations.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class CSSOverviewUnusedDeclarations {
    static _add(target, key, item) {
        const values = target.get(key) || [];
        values.push(item);
        target.set(key, values);
    }
    static checkForUnusedPositionValues(unusedDeclarations, nodeId, strings, positionIdx, topIdx, leftIdx, rightIdx, bottomIdx) {
        if (strings[positionIdx] !== 'static') {
            return;
        }
        if (strings[topIdx] !== 'auto') {
            const reason = i18nString(UIStrings.topAppliedToAStatically);
            this._add(unusedDeclarations, reason, {
                declaration: `top: ${strings[topIdx]}`,
                nodeId,
            });
        }
        if (strings[leftIdx] !== 'auto') {
            const reason = i18nString(UIStrings.leftAppliedToAStatically);
            this._add(unusedDeclarations, reason, {
                declaration: `left: ${strings[leftIdx]}`,
                nodeId,
            });
        }
        if (strings[rightIdx] !== 'auto') {
            const reason = i18nString(UIStrings.rightAppliedToAStatically);
            this._add(unusedDeclarations, reason, {
                declaration: `right: ${strings[rightIdx]}`,
                nodeId,
            });
        }
        if (strings[bottomIdx] !== 'auto') {
            const reason = i18nString(UIStrings.bottomAppliedToAStatically);
            this._add(unusedDeclarations, reason, {
                declaration: `bottom: ${strings[bottomIdx]}`,
                nodeId,
            });
        }
    }
    static checkForUnusedWidthAndHeightValues(unusedDeclarations, nodeId, strings, displayIdx, widthIdx, heightIdx) {
        if (strings[displayIdx] !== 'inline') {
            return;
        }
        if (strings[widthIdx] !== 'auto') {
            const reason = i18nString(UIStrings.widthAppliedToAnInlineElement);
            this._add(unusedDeclarations, reason, {
                declaration: `width: ${strings[widthIdx]}`,
                nodeId,
            });
        }
        if (strings[heightIdx] !== 'auto') {
            const reason = i18nString(UIStrings.heightAppliedToAnInlineElement);
            this._add(unusedDeclarations, reason, {
                declaration: `height: ${strings[heightIdx]}`,
                nodeId,
            });
        }
    }
    static checkForInvalidVerticalAlignment(unusedDeclarations, nodeId, strings, displayIdx, verticalAlignIdx) {
        if (!strings[displayIdx] || strings[displayIdx] === 'inline' || strings[displayIdx].startsWith('table')) {
            return;
        }
        if (strings[verticalAlignIdx] !== 'baseline') {
            const reason = i18nString(UIStrings.verticalAlignmentAppliedTo);
            this._add(unusedDeclarations, reason, {
                declaration: `vertical-align: ${strings[verticalAlignIdx]}`,
                nodeId,
            });
        }
    }
}
//# sourceMappingURL=CSSOverviewUnusedDeclarations.js.map