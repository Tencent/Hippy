/*
 * Copyright (C) 2011 Google Inc. All rights reserved.
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
import * as Platform from '../../../../core/platform/platform.js';
import * as SDK from '../../../../core/sdk/sdk.js';
import * as UI from '../../legacy.js';
import * as Components from '../utils/utils.js';
import { CustomPreviewComponent } from './CustomPreviewComponent.js';
import { ObjectPropertiesSection } from './ObjectPropertiesSection.js';
export class ObjectPopoverHelper {
    _linkifier;
    _resultHighlightedAsDOM;
    constructor(linkifier, resultHighlightedAsDOM) {
        this._linkifier = linkifier;
        this._resultHighlightedAsDOM = resultHighlightedAsDOM;
    }
    dispose() {
        if (this._resultHighlightedAsDOM) {
            SDK.OverlayModel.OverlayModel.hideDOMNodeHighlight();
        }
        if (this._linkifier) {
            this._linkifier.dispose();
        }
    }
    static async buildObjectPopover(result, popover) {
        const description = Platform.StringUtilities.trimEndWithMaxLength(result.description || '', MaxPopoverTextLength);
        let popoverContentElement = null;
        if (result.type === 'object') {
            let linkifier = null;
            let resultHighlightedAsDOM = false;
            if (result.subtype === 'node') {
                SDK.OverlayModel.OverlayModel.highlightObjectAsDOMNode(result);
                resultHighlightedAsDOM = true;
            }
            if (result.customPreview()) {
                const customPreviewComponent = new CustomPreviewComponent(result);
                customPreviewComponent.expandIfPossible();
                popoverContentElement = customPreviewComponent.element;
            }
            else {
                popoverContentElement = document.createElement('div');
                popoverContentElement.classList.add('object-popover-content');
                UI.Utils.appendStyle(popoverContentElement, 'ui/legacy/components/object_ui/objectPopover.css', { enableLegacyPatching: false });
                const titleElement = popoverContentElement.createChild('div', 'monospace object-popover-title');
                titleElement.createChild('span').textContent = description;
                linkifier = new Components.Linkifier.Linkifier();
                const section = new ObjectPropertiesSection(result, '', linkifier, undefined, undefined, undefined, true /* showOverflow */);
                section.element.classList.add('object-popover-tree');
                section.titleLessMode();
                popoverContentElement.appendChild(section.element);
            }
            popoverContentElement.dataset.stableNameForTest = 'object-popover-content';
            popover.setMaxContentSize(new UI.Geometry.Size(300, 250));
            popover.setSizeBehavior(UI.GlassPane.SizeBehavior.SetExactSize);
            popover.contentElement.appendChild(popoverContentElement);
            return new ObjectPopoverHelper(linkifier, resultHighlightedAsDOM);
        }
        popoverContentElement = document.createElement('span');
        popoverContentElement.dataset.stableNameForTest = 'object-popover-content';
        UI.Utils.appendStyle(popoverContentElement, 'ui/legacy/components/object_ui/objectValue.css', { enableLegacyPatching: false });
        UI.Utils.appendStyle(popoverContentElement, 'ui/legacy/components/object_ui/objectPopover.css', { enableLegacyPatching: false });
        const valueElement = popoverContentElement.createChild('span', 'monospace object-value-' + result.type);
        valueElement.style.whiteSpace = 'pre';
        if (result.type === 'string') {
            UI.UIUtils.createTextChildren(valueElement, `"${description}"`);
        }
        else if (result.type !== 'function') {
            valueElement.textContent = description;
        }
        if (result.type !== 'function') {
            popover.contentElement.appendChild(popoverContentElement);
            return new ObjectPopoverHelper(null, false);
        }
        ObjectPropertiesSection.formatObjectAsFunction(result, valueElement, true);
        const response = await result.debuggerModel().functionDetailsPromise(result);
        if (!response) {
            return null;
        }
        const container = document.createElement('div');
        container.classList.add('object-popover-container');
        const title = container.createChild('div', 'function-popover-title source-code');
        const functionName = title.createChild('span', 'function-name');
        functionName.textContent = UI.UIUtils.beautifyFunctionName(response.functionName);
        const rawLocation = response.location;
        const linkContainer = title.createChild('div', 'function-title-link-container');
        const script = rawLocation && rawLocation.script();
        const sourceURL = script && script.sourceURL;
        let linkifier = null;
        if (sourceURL) {
            linkifier = new Components.Linkifier.Linkifier(undefined, undefined, popover.positionContent.bind(popover));
            linkContainer.appendChild(linkifier.linkifyRawLocation(rawLocation, sourceURL));
        }
        container.appendChild(popoverContentElement);
        popover.contentElement.appendChild(container);
        return new ObjectPopoverHelper(linkifier, false);
    }
}
const MaxPopoverTextLength = 10000;
//# sourceMappingURL=ObjectPopoverHelper.js.map