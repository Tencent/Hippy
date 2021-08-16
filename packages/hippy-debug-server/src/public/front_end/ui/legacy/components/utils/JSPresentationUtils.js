// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/*
 * Copyright (C) 2011 Google Inc.  All rights reserved.
 * Copyright (C) 2007, 2008 Apple Inc.  All rights reserved.
 * Copyright (C) 2008 Matt Lilek <webkit@mattlilek.com>
 * Copyright (C) 2009 Joseph Pecoraro
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 * 1.  Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 * 2.  Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 * 3.  Neither the name of Apple Computer, Inc. ("Apple") nor the names of
 *     its contributors may be used to endorse or promote products derived
 *     from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE AND ITS CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL APPLE OR ITS CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
import * as Common from '../../../../core/common/common.js';
import * as i18n from '../../../../core/i18n/i18n.js';
import * as Bindings from '../../../../models/bindings/bindings.js';
import * as UI from '../../legacy.js';
import { Linkifier } from './Linkifier.js';
const UIStrings = {
    /**
    *@description Text to stop preventing the debugger from stepping into library code
    */
    removeFromIgnore: 'Remove from ignore list',
    /**
    *@description Text for scripts that should not be stepped into when debugging
    */
    addToIgnore: 'Add script to ignore list',
    /**
    * @description A context menu item to show more frames when they are available. Never 0.
    */
    showSMoreFrames: '{n, plural, =1 {Show # more frame} other {Show # more frames}}',
    /**
     *@description Text indicating that source url of a link is currently unknown
     */
    unknownSource: 'unknown',
};
const str_ = i18n.i18n.registerUIStrings('ui/legacy/components/utils/JSPresentationUtils.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
function populateContextMenu(link, event) {
    const contextMenu = new UI.ContextMenu.ContextMenu(event);
    event.consume(true);
    const uiLocation = Linkifier.uiLocation(link);
    if (uiLocation &&
        Bindings.IgnoreListManager.IgnoreListManager.instance().canIgnoreListUISourceCode(uiLocation.uiSourceCode)) {
        if (Bindings.IgnoreListManager.IgnoreListManager.instance().isIgnoreListedUISourceCode(uiLocation.uiSourceCode)) {
            contextMenu.debugSection().appendItem(i18nString(UIStrings.removeFromIgnore), () => Bindings.IgnoreListManager.IgnoreListManager.instance().unIgnoreListUISourceCode(uiLocation.uiSourceCode));
        }
        else {
            contextMenu.debugSection().appendItem(i18nString(UIStrings.addToIgnore), () => Bindings.IgnoreListManager.IgnoreListManager.instance().ignoreListUISourceCode(uiLocation.uiSourceCode));
        }
    }
    contextMenu.appendApplicableItems(event);
    contextMenu.show();
}
export function buildStackTraceRows(stackTrace, target, linkifier, tabStops, updateCallback) {
    const stackTraceRows = [];
    let regularRowCount = 0;
    if (updateCallback) {
        const throttler = new Common.Throttler.Throttler(100);
        linkifier.setLiveLocationUpdateCallback(() => throttler.schedule(async () => updateHiddenRows(updateCallback, stackTraceRows)));
    }
    function buildStackTraceRowsHelper(stackTrace, asyncFlag) {
        let asyncRow = null;
        if (asyncFlag) {
            asyncRow = {
                asyncDescription: UI.UIUtils.asyncStackTraceLabel(stackTrace.description),
                ignoreListHide: false,
                rowCountHide: false,
            };
            stackTraceRows.push(asyncRow);
        }
        let hiddenCallFrames = 0;
        for (const stackFrame of stackTrace.callFrames) {
            regularRowCount++;
            const rowCountHide = regularRowCount > 30 && stackTrace.callFrames.length > 31;
            let ignoreListHide = false;
            const functionName = UI.UIUtils.beautifyFunctionName(stackFrame.functionName);
            const link = linkifier.maybeLinkifyConsoleCallFrame(target, stackFrame, { tabStop: Boolean(tabStops), className: undefined, columnNumber: undefined, inlineFrameIndex: 0 });
            if (link) {
                link.addEventListener('contextmenu', populateContextMenu.bind(null, link));
                // TODO(crbug.com/1183325): fix race condition with uiLocation still being null here
                const uiLocation = Linkifier.uiLocation(link);
                if (uiLocation &&
                    Bindings.IgnoreListManager.IgnoreListManager.instance().isIgnoreListedUISourceCode(uiLocation.uiSourceCode)) {
                    ignoreListHide = true;
                }
                // Linkifier is using a workaround with the 'zero width space' (\u200b).
                // TODO(szuend): Remove once the Linkfier is no longer using the workaround.
                if (!link.textContent || link.textContent === '\u200b') {
                    link.textContent = i18nString(UIStrings.unknownSource);
                }
            }
            if (rowCountHide || ignoreListHide) {
                ++hiddenCallFrames;
            }
            stackTraceRows.push({ functionName, link, ignoreListHide, rowCountHide });
        }
        if (asyncFlag && asyncRow && hiddenCallFrames > 0 && hiddenCallFrames === stackTrace.callFrames.length) {
            stackTraceRows[1].rowCountHide ? asyncRow.rowCountHide = true : asyncRow.ignoreListHide = true;
        }
    }
    buildStackTraceRowsHelper(stackTrace, false);
    let asyncStackTrace = stackTrace.parent;
    while (asyncStackTrace) {
        if (asyncStackTrace.callFrames.length) {
            buildStackTraceRowsHelper(asyncStackTrace, true);
        }
        asyncStackTrace = asyncStackTrace.parent;
    }
    return stackTraceRows;
}
/**
 * @param {function(!Array<!StackTraceRegularRow|!StackTraceAsyncRow>): *} renderCallback
 * @param {!Array<!StackTraceRegularRow|!StackTraceAsyncRow>} stackTraceRows
 */
function updateHiddenRows(renderCallback, stackTraceRows) {
    let shouldHideSubCount = 0; // keeps track of number hidden (regular) rows between asyncRows
    let indexOfAsyncRow = stackTraceRows.length;
    for (let i = stackTraceRows.length - 1; i >= 0; i--) {
        const row = stackTraceRows[i];
        if ('link' in row && row.link) {
            const uiLocation = Linkifier.uiLocation(row.link);
            if (uiLocation &&
                Bindings.IgnoreListManager.IgnoreListManager.instance().isIgnoreListedUISourceCode(uiLocation.uiSourceCode)) {
                row.ignoreListHide = true;
            }
            if (row.rowCountHide || row.ignoreListHide) {
                shouldHideSubCount++;
            }
        }
        if ('asyncDescription' in row) {
            // hide current row if all (regular) rows since the previous asyncRow are hidden
            if (shouldHideSubCount > 0 && shouldHideSubCount === indexOfAsyncRow - i - 1) {
                stackTraceRows[i + 1].rowCountHide ? row.rowCountHide = true : row.ignoreListHide = true;
            }
            indexOfAsyncRow = i;
            shouldHideSubCount = 0;
        }
    }
    renderCallback(stackTraceRows);
}
export function buildStackTracePreviewContents(target, linkifier, options = {
    stackTrace: undefined,
    tabStops: undefined,
}) {
    const { stackTrace, tabStops } = options;
    const element = document.createElement('span');
    element.classList.add('monospace');
    element.style.display = 'inline-block';
    const shadowRoot = UI.Utils.createShadowRootWithCoreStyles(element, { cssFile: 'ui/legacy/components/utils/jsUtils.css', enableLegacyPatching: false, delegatesFocus: undefined });
    const contentElement = shadowRoot.createChild('table', 'stack-preview-container');
    if (!stackTrace) {
        return { element, links: [] };
    }
    const updateCallback = renderStackTraceTable.bind(null, contentElement);
    const stackTraceRows = buildStackTraceRows(stackTrace, target, linkifier, tabStops, updateCallback);
    const links = renderStackTraceTable(contentElement, stackTraceRows);
    return { element, links };
}
function renderStackTraceTable(container, stackTraceRows) {
    container.removeChildren();
    let hiddenCallFramesCount = 0;
    const links = [];
    for (const item of stackTraceRows) {
        const row = container.createChild('tr');
        if ('asyncDescription' in item) {
            row.createChild('td').textContent = '\n';
            row.createChild('td', 'stack-preview-async-description').textContent = item.asyncDescription;
            row.createChild('td');
            row.createChild('td');
        }
        else {
            row.createChild('td').textContent = '\n';
            row.createChild('td', 'function-name').textContent = item.functionName;
            row.createChild('td').textContent = ' @ ';
            if (item.link) {
                row.createChild('td').appendChild(item.link);
                links.push(item.link);
            }
            if (item.rowCountHide || item.ignoreListHide) {
                ++hiddenCallFramesCount;
            }
        }
        if (item.rowCountHide || item.ignoreListHide) {
            row.classList.add('hidden-row');
        }
        container.appendChild(row);
    }
    if (hiddenCallFramesCount) {
        const showAllRow = container.createChild('tr', 'show-all-link');
        showAllRow.createChild('td').textContent = '\n';
        const cell = showAllRow.createChild('td');
        cell.colSpan = 4;
        const showAllLink = cell.createChild('span', 'link');
        showAllLink.textContent = i18nString(UIStrings.showSMoreFrames, { n: hiddenCallFramesCount });
        showAllLink.addEventListener('click', () => {
            container.classList.add('show-hidden-rows');
        }, false);
    }
    return links;
}
//# sourceMappingURL=JSPresentationUtils.js.map