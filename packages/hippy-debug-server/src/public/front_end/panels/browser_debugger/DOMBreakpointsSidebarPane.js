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
import * as Common from '../../core/common/common.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as Sources from '../sources/sources.js';
const UIStrings = {
    /**
    *@description Text to indicate there are no breakpoints
    */
    noBreakpoints: 'No breakpoints',
    /**
    *@description Accessibility label for the DOM breakpoints list in the Sources panel
    */
    domBreakpointsList: 'DOM Breakpoints list',
    /**
    *@description Text with two placeholders separated by a colon
    *@example {Node removed} PH1
    *@example {div#id1} PH2
    */
    sS: '{PH1}: {PH2}',
    /**
    *@description Text exposed to screen readers on checked items.
    */
    checked: 'checked',
    /**
    *@description Accessible text exposed to screen readers when the screen reader encounters an unchecked checkbox.
    */
    unchecked: 'unchecked',
    /**
    *@description Accessibility label for hit breakpoints in the Sources panel.
    *@example {checked} PH1
    */
    sBreakpointHit: '{PH1} breakpoint hit',
    /**
    *@description Screen reader description of a hit breakpoint in the Sources panel
    */
    breakpointHit: 'breakpoint hit',
    /**
    *@description A context menu item in the DOM Breakpoints sidebar that reveals the node on which the current breakpoint is set.
    */
    revealDomNodeInElementsPanel: 'Reveal DOM node in Elements panel',
    /**
    *@description Text to remove a breakpoint
    */
    removeBreakpoint: 'Remove breakpoint',
    /**
    *@description A context menu item in the DOMBreakpoints Sidebar Pane of the JavaScript Debugging pane in the Sources panel or the DOM Breakpoints pane in the Elements panel
    */
    removeAllDomBreakpoints: 'Remove all DOM breakpoints',
    /**
    *@description Text in DOMBreakpoints Sidebar Pane of the JavaScript Debugging pane in the Sources panel or the DOM Breakpoints pane in the Elements panel
    */
    subtreeModified: 'Subtree modified',
    /**
    *@description Text in DOMBreakpoints Sidebar Pane of the JavaScript Debugging pane in the Sources panel or the DOM Breakpoints pane in the Elements panel
    */
    attributeModified: 'Attribute modified',
    /**
    *@description Text in DOMBreakpoints Sidebar Pane of the JavaScript Debugging pane in the Sources panel or the DOM Breakpoints pane in the Elements panel
    */
    nodeRemoved: 'Node removed',
    /**
    *@description Entry in context menu of the elements pane, allowing developers to select a DOM
    * breakpoint for the element that they have right-clicked on. Short for the action 'set a
    * breakpoint on this DOM Element'. A breakpoint pauses the website when the code reaches a
    * specified line, or when a specific action happen (in this case, when the DOM Element is
    * modified).
    */
    breakOn: 'Break on',
    /**
    *@description Screen reader description for removing a DOM breakpoint.
    */
    breakpointRemoved: 'Breakpoint removed',
    /**
    *@description Screen reader description for setting a DOM breakpoint.
    */
    breakpointSet: 'Breakpoint set',
};
const str_ = i18n.i18n.registerUIStrings('panels/browser_debugger/DOMBreakpointsSidebarPane.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
const i18nLazyString = i18n.i18n.getLazilyComputedLocalizedString.bind(undefined, str_);
let domBreakpointsSidebarPaneInstance;
export class DOMBreakpointsSidebarPane extends UI.Widget.VBox {
    elementToCheckboxes;
    _emptyElement;
    _breakpoints;
    _list;
    _highlightedBreakpoint;
    constructor() {
        super(true);
        this.registerRequiredCSS('panels/browser_debugger/domBreakpointsSidebarPane.css', { enableLegacyPatching: false });
        this.elementToCheckboxes = new WeakMap();
        this._emptyElement = this.contentElement.createChild('div', 'gray-info-message');
        this._emptyElement.textContent = i18nString(UIStrings.noBreakpoints);
        this._breakpoints = new UI.ListModel.ListModel();
        this._list = new UI.ListControl.ListControl(this._breakpoints, this, UI.ListControl.ListMode.NonViewport);
        this.contentElement.appendChild(this._list.element);
        this._list.element.classList.add('breakpoint-list', 'hidden');
        UI.ARIAUtils.markAsList(this._list.element);
        UI.ARIAUtils.setAccessibleName(this._list.element, i18nString(UIStrings.domBreakpointsList));
        this._emptyElement.tabIndex = -1;
        SDK.TargetManager.TargetManager.instance().addModelListener(SDK.DOMDebuggerModel.DOMDebuggerModel, SDK.DOMDebuggerModel.Events.DOMBreakpointAdded, this._breakpointAdded, this);
        SDK.TargetManager.TargetManager.instance().addModelListener(SDK.DOMDebuggerModel.DOMDebuggerModel, SDK.DOMDebuggerModel.Events.DOMBreakpointToggled, this._breakpointToggled, this);
        SDK.TargetManager.TargetManager.instance().addModelListener(SDK.DOMDebuggerModel.DOMDebuggerModel, SDK.DOMDebuggerModel.Events.DOMBreakpointsRemoved, this._breakpointsRemoved, this);
        for (const domDebuggerModel of SDK.TargetManager.TargetManager.instance().models(SDK.DOMDebuggerModel.DOMDebuggerModel)) {
            domDebuggerModel.retrieveDOMBreakpoints();
            for (const breakpoint of domDebuggerModel.domBreakpoints()) {
                this._addBreakpoint(breakpoint);
            }
        }
        this._highlightedBreakpoint = null;
        this._update();
    }
    static instance() {
        if (!domBreakpointsSidebarPaneInstance) {
            domBreakpointsSidebarPaneInstance = new DOMBreakpointsSidebarPane();
        }
        return domBreakpointsSidebarPaneInstance;
    }
    createElementForItem(item) {
        const element = document.createElement('div');
        element.classList.add('breakpoint-entry');
        element.addEventListener('contextmenu', this._contextMenu.bind(this, item), true);
        UI.ARIAUtils.markAsListitem(element);
        element.tabIndex = -1;
        const checkboxLabel = UI.UIUtils.CheckboxLabel.create(/* title */ undefined, item.enabled);
        const checkboxElement = checkboxLabel.checkboxElement;
        checkboxElement.addEventListener('click', this._checkboxClicked.bind(this, item), false);
        checkboxElement.tabIndex = -1;
        this.elementToCheckboxes.set(element, checkboxElement);
        element.appendChild(checkboxLabel);
        element.addEventListener('keydown', event => {
            if (event.key === ' ') {
                checkboxLabel.checkboxElement.click();
                event.consume(true);
            }
        });
        const labelElement = document.createElement('div');
        labelElement.classList.add('dom-breakpoint');
        element.appendChild(labelElement);
        const description = document.createElement('div');
        const breakpointTypeLabel = BreakpointTypeLabels.get(item.type);
        description.textContent = breakpointTypeLabel ? breakpointTypeLabel() : null;
        const breakpointTypeText = breakpointTypeLabel ? breakpointTypeLabel() : '';
        UI.ARIAUtils.setAccessibleName(checkboxElement, breakpointTypeText);
        const linkifiedNode = document.createElement('monospace');
        linkifiedNode.style.display = 'block';
        labelElement.appendChild(linkifiedNode);
        Common.Linkifier.Linkifier.linkify(item.node, { preventKeyboardFocus: true, tooltip: undefined }).then(linkified => {
            linkifiedNode.appendChild(linkified);
            UI.ARIAUtils.setAccessibleName(checkboxElement, i18nString(UIStrings.sS, { PH1: breakpointTypeText, PH2: linkified.deepTextContent() }));
        });
        labelElement.appendChild(description);
        const checkedStateText = item.enabled ? i18nString(UIStrings.checked) : i18nString(UIStrings.unchecked);
        if (item === this._highlightedBreakpoint) {
            element.classList.add('breakpoint-hit');
            UI.ARIAUtils.setDescription(element, i18nString(UIStrings.sBreakpointHit, { PH1: checkedStateText }));
            UI.ARIAUtils.setDescription(checkboxElement, i18nString(UIStrings.breakpointHit));
        }
        else {
            UI.ARIAUtils.setDescription(element, checkedStateText);
        }
        this._emptyElement.classList.add('hidden');
        this._list.element.classList.remove('hidden');
        return element;
    }
    heightForItem(_item) {
        return 0;
    }
    isItemSelectable(_item) {
        return true;
    }
    updateSelectedItemARIA(_fromElement, _toElement) {
        return true;
    }
    selectedItemChanged(from, to, fromElement, toElement) {
        if (fromElement) {
            fromElement.tabIndex = -1;
        }
        if (toElement) {
            this.setDefaultFocusedElement(toElement);
            toElement.tabIndex = 0;
            if (this.hasFocus()) {
                toElement.focus();
            }
        }
    }
    _breakpointAdded(event) {
        this._addBreakpoint(event.data);
    }
    _breakpointToggled(event) {
        const hadFocus = this.hasFocus();
        const breakpoint = event.data;
        this._list.refreshItem(breakpoint);
        if (hadFocus) {
            this.focus();
        }
    }
    _breakpointsRemoved(event) {
        const hadFocus = this.hasFocus();
        const breakpoints = event.data;
        let lastIndex = -1;
        for (const breakpoint of breakpoints) {
            const index = this._breakpoints.indexOf(breakpoint);
            if (index >= 0) {
                this._breakpoints.remove(index);
                lastIndex = index;
            }
        }
        if (this._breakpoints.length === 0) {
            this._emptyElement.classList.remove('hidden');
            this.setDefaultFocusedElement(this._emptyElement);
            this._list.element.classList.add('hidden');
        }
        else if (lastIndex >= 0) {
            const breakpointToSelect = this._breakpoints.at(lastIndex);
            if (breakpointToSelect) {
                this._list.selectItem(breakpointToSelect);
            }
        }
        if (hadFocus) {
            this.focus();
        }
    }
    _addBreakpoint(breakpoint) {
        this._breakpoints.insertWithComparator(breakpoint, (breakpointA, breakpointB) => {
            if (breakpointA.type > breakpointB.type) {
                return -1;
            }
            if (breakpointA.type < breakpointB.type) {
                return 1;
            }
            return 0;
        });
        if (!this._list.selectedItem() || !this.hasFocus()) {
            this._list.selectItem(this._breakpoints.at(0));
        }
    }
    _contextMenu(breakpoint, event) {
        const contextMenu = new UI.ContextMenu.ContextMenu(event);
        contextMenu.defaultSection().appendItem(i18nString(UIStrings.revealDomNodeInElementsPanel), () => Common.Revealer.reveal(breakpoint.node));
        contextMenu.defaultSection().appendItem(i18nString(UIStrings.removeBreakpoint), () => {
            breakpoint.domDebuggerModel.removeDOMBreakpoint(breakpoint.node, breakpoint.type);
        });
        contextMenu.defaultSection().appendItem(i18nString(UIStrings.removeAllDomBreakpoints), () => {
            breakpoint.domDebuggerModel.removeAllDOMBreakpoints();
        });
        contextMenu.show();
    }
    _checkboxClicked(breakpoint, event) {
        breakpoint.domDebuggerModel.toggleDOMBreakpoint(breakpoint, event.target ? event.target.checked : false);
    }
    flavorChanged(_object) {
        this._update();
    }
    _update() {
        const details = UI.Context.Context.instance().flavor(SDK.DebuggerModel.DebuggerPausedDetails);
        if (this._highlightedBreakpoint) {
            const oldHighlightedBreakpoint = this._highlightedBreakpoint;
            this._highlightedBreakpoint = null;
            this._list.refreshItem(oldHighlightedBreakpoint);
        }
        if (!details || !details.auxData || details.reason !== "DOM" /* DOM */) {
            return;
        }
        const domDebuggerModel = details.debuggerModel.target().model(SDK.DOMDebuggerModel.DOMDebuggerModel);
        if (!domDebuggerModel) {
            return;
        }
        // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = domDebuggerModel.resolveDOMBreakpointData(details.auxData);
        if (!data) {
            return;
        }
        for (const breakpoint of this._breakpoints) {
            if (breakpoint.node === data.node && breakpoint.type === data.type) {
                this._highlightedBreakpoint = breakpoint;
            }
        }
        if (this._highlightedBreakpoint) {
            this._list.refreshItem(this._highlightedBreakpoint);
        }
        UI.ViewManager.ViewManager.instance().showView('sources.domBreakpoints');
    }
}
const BreakpointTypeLabels = new Map([
    ["subtree-modified" /* SubtreeModified */, i18nLazyString(UIStrings.subtreeModified)],
    ["attribute-modified" /* AttributeModified */, i18nLazyString(UIStrings.attributeModified)],
    ["node-removed" /* NodeRemoved */, i18nLazyString(UIStrings.nodeRemoved)],
]);
let contextMenuProviderInstance;
export class ContextMenuProvider {
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!contextMenuProviderInstance || forceNew) {
            contextMenuProviderInstance = new ContextMenuProvider();
        }
        return contextMenuProviderInstance;
    }
    appendApplicableItems(event, contextMenu, object) {
        const node = object;
        if (node.pseudoType()) {
            return;
        }
        const domDebuggerModel = node.domModel().target().model(SDK.DOMDebuggerModel.DOMDebuggerModel);
        if (!domDebuggerModel) {
            return;
        }
        function toggleBreakpoint(type) {
            if (!domDebuggerModel) {
                return;
            }
            const label = Sources.DebuggerPausedMessage.BreakpointTypeNouns.get(type);
            const labelString = label ? label() : '';
            if (domDebuggerModel.hasDOMBreakpoint(node, type)) {
                domDebuggerModel.removeDOMBreakpoint(node, type);
                UI.ARIAUtils.alert(`${i18nString(UIStrings.breakpointRemoved)}: ${labelString}`);
            }
            else {
                domDebuggerModel.setDOMBreakpoint(node, type);
                UI.ARIAUtils.alert(`${i18nString(UIStrings.breakpointSet)}: ${labelString}`);
            }
        }
        const breakpointsMenu = contextMenu.debugSection().appendSubMenuItem(i18nString(UIStrings.breakOn));
        const allBreakpointTypes = {
            SubtreeModified: "subtree-modified" /* SubtreeModified */,
            AttributeModified: "attribute-modified" /* AttributeModified */,
            NodeRemoved: "node-removed" /* NodeRemoved */,
        };
        for (const type of Object.values(allBreakpointTypes)) {
            const label = Sources.DebuggerPausedMessage.BreakpointTypeNouns.get(type);
            if (label) {
                breakpointsMenu.defaultSection().appendCheckboxItem(label(), toggleBreakpoint.bind(null, type), domDebuggerModel.hasDOMBreakpoint(node, type));
            }
        }
    }
}
//# sourceMappingURL=DOMBreakpointsSidebarPane.js.map