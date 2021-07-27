// Copyright (c) 2015 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as Platform from '../../core/platform/platform.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Bindings from '../../models/bindings/bindings.js';
import * as TextUtils from '../../models/text_utils/text_utils.js';
import * as Workspace from '../../models/workspace/workspace.js';
import * as UI from '../../ui/legacy/legacy.js';
const UIStrings = {
    /**
    *@description Text to indicate there are no breakpoints
    */
    noBreakpoints: 'No breakpoints',
    /**
    *@description Text exposed to screen readers on checked items.
    */
    checked: 'checked',
    /**
    *@description Accessible text exposed to screen readers when the screen reader encounters an unchecked checkbox.
    */
    unchecked: 'unchecked',
    /**
    *@description Accessible text for a breakpoint collection with a combination of checked states.
    */
    mixed: 'mixed',
    /**
    *@description Accessibility label for hit breakpoints in the Sources panel.
    *@example {checked} PH1
    */
    sBreakpointHit: '{PH1} breakpoint hit',
    /**
    *@description Text in Debugger Plugin of the Sources panel
    */
    removeAllBreakpointsInLine: 'Remove all breakpoints in line',
    /**
    *@description Text to remove a breakpoint
    */
    removeBreakpoint: 'Remove breakpoint',
    /**
    *@description Context menu item that reveals the source code location of a breakpoint in the Sources panel.
    */
    revealLocation: 'Reveal location',
    /**
    *@description Text in Java Script Breakpoints Sidebar Pane of the Sources panel
    */
    deactivateBreakpoints: 'Deactivate breakpoints',
    /**
    *@description Text in Java Script Breakpoints Sidebar Pane of the Sources panel
    */
    activateBreakpoints: 'Activate breakpoints',
    /**
    *@description Text in Java Script Breakpoints Sidebar Pane of the Sources panel
    */
    enableAllBreakpoints: 'Enable all breakpoints',
    /**
    *@description Text in Java Script Breakpoints Sidebar Pane of the Sources panel
    */
    enableBreakpointsInFile: 'Enable breakpoints in file',
    /**
    *@description Text in Java Script Breakpoints Sidebar Pane of the Sources panel
    */
    disableAllBreakpoints: 'Disable all breakpoints',
    /**
    *@description Text in Java Script Breakpoints Sidebar Pane of the Sources panel
    */
    disableBreakpointsInFile: 'Disable breakpoints in file',
    /**
    *@description Text to remove all breakpoints
    */
    removeAllBreakpoints: 'Remove all breakpoints',
    /**
    *@description Text in Java Script Breakpoints Sidebar Pane of the Sources panel
    */
    removeOtherBreakpoints: 'Remove other breakpoints',
};
const str_ = i18n.i18n.registerUIStrings('panels/sources/JavaScriptBreakpointsSidebarPane.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
let javaScriptBreakpointsSidebarPaneInstance;
export class JavaScriptBreakpointsSidebarPane extends UI.ThrottledWidget.ThrottledWidget {
    _breakpointManager;
    _breakpoints;
    _list;
    _emptyElement;
    constructor() {
        super(true);
        this.registerRequiredCSS('panels/sources/javaScriptBreakpointsSidebarPane.css', { enableLegacyPatching: false });
        this._breakpointManager = Bindings.BreakpointManager.BreakpointManager.instance();
        this._breakpointManager.addEventListener(Bindings.BreakpointManager.Events.BreakpointAdded, this.update, this);
        this._breakpointManager.addEventListener(Bindings.BreakpointManager.Events.BreakpointRemoved, this.update, this);
        Common.Settings.Settings.instance().moduleSetting('breakpointsActive').addChangeListener(this.update, this);
        this._breakpoints = new UI.ListModel.ListModel();
        this._list = new UI.ListControl.ListControl(this._breakpoints, this, UI.ListControl.ListMode.NonViewport);
        UI.ARIAUtils.markAsList(this._list.element);
        this.contentElement.appendChild(this._list.element);
        this._emptyElement = this.contentElement.createChild('div', 'gray-info-message');
        this._emptyElement.textContent = i18nString(UIStrings.noBreakpoints);
        this._emptyElement.tabIndex = -1;
        this.update();
    }
    static instance() {
        if (!javaScriptBreakpointsSidebarPaneInstance) {
            javaScriptBreakpointsSidebarPaneInstance = new JavaScriptBreakpointsSidebarPane();
        }
        return javaScriptBreakpointsSidebarPaneInstance;
    }
    _getBreakpointLocations() {
        const locations = this._breakpointManager.allBreakpointLocations().filter(breakpointLocation => breakpointLocation.uiLocation.uiSourceCode.project().type() !== Workspace.Workspace.projectTypes.Debugger);
        locations.sort((item1, item2) => item1.uiLocation.compareTo(item2.uiLocation));
        const result = [];
        let lastBreakpoint = null;
        let lastLocation = null;
        for (const location of locations) {
            if (location.breakpoint !== lastBreakpoint || (lastLocation && location.uiLocation.compareTo(lastLocation))) {
                result.push(location);
                lastBreakpoint = location.breakpoint;
                lastLocation = location.uiLocation;
            }
        }
        return result;
    }
    _hideList() {
        this._list.element.classList.add('hidden');
        this._emptyElement.classList.remove('hidden');
    }
    _ensureListShown() {
        this._list.element.classList.remove('hidden');
        this._emptyElement.classList.add('hidden');
    }
    _groupBreakpointLocationsById(breakpointLocations) {
        const map = new Platform.MapUtilities.Multimap();
        for (const breakpointLocation of breakpointLocations) {
            const uiLocation = breakpointLocation.uiLocation;
            map.set(uiLocation.id(), breakpointLocation);
        }
        const arr = [];
        for (const id of map.keysArray()) {
            const locations = Array.from(map.get(id));
            if (locations.length) {
                arr.push(locations);
            }
        }
        return arr;
    }
    _getLocationIdsByLineId(breakpointLocations) {
        const result = new Platform.MapUtilities.Multimap();
        for (const breakpointLocation of breakpointLocations) {
            const uiLocation = breakpointLocation.uiLocation;
            result.set(uiLocation.lineId(), uiLocation.id());
        }
        return result;
    }
    async _getSelectedUILocation() {
        const details = UI.Context.Context.instance().flavor(SDK.DebuggerModel.DebuggerPausedDetails);
        if (details && details.callFrames.length) {
            return await Bindings.DebuggerWorkspaceBinding.DebuggerWorkspaceBinding.instance().rawLocationToUILocation(details.callFrames[0].location());
        }
        return null;
    }
    _getContent(locations) {
        // Use a cache to share the Text objects between all breakpoints. This way
        // we share the cached line ending information that Text calculates. This
        // was very slow to calculate with a lot of breakpoints in the same very
        // large source file.
        const contentToTextMap = new Map();
        return Promise.all(locations.map(async ([{ uiLocation: { uiSourceCode } }]) => {
            if (uiSourceCode.mimeType() === 'application/wasm') {
                // We could mirror the logic from `SourceFrame._ensureContentLoaded()` here
                // (and if so, ideally share that code somewhere), but that's quite heavy
                // logic just to display a single Wasm instruction. Also not really clear
                // how much value this would add. So let's keep it simple for now and don't
                // display anything additional for Wasm breakpoints, and if there's demand
                // to display some text preview, we could look into selectively disassemb-
                // ling the part of the text that we need here.
                // Relevant crbug: https://crbug.com/1090256
                return new TextUtils.Text.Text('');
            }
            const { content } = await uiSourceCode.requestContent();
            const contentText = content || '';
            if (contentToTextMap.has(contentText)) {
                return contentToTextMap.get(contentText);
            }
            const text = new TextUtils.Text.Text(contentText);
            contentToTextMap.set(contentText, text);
            return text;
        }));
    }
    async doUpdate() {
        const hadFocus = this.hasFocus();
        const breakpointLocations = this._getBreakpointLocations();
        if (!breakpointLocations.length) {
            this._hideList();
            this._setBreakpointItems([]);
            return this._didUpdateForTest();
        }
        this._ensureListShown();
        const locationsGroupedById = this._groupBreakpointLocationsById(breakpointLocations);
        const locationIdsByLineId = this._getLocationIdsByLineId(breakpointLocations);
        const content = await this._getContent(locationsGroupedById);
        const selectedUILocation = await this._getSelectedUILocation();
        const breakpoints = [];
        for (let idx = 0; idx < locationsGroupedById.length; idx++) {
            const locations = locationsGroupedById[idx];
            const breakpointLocation = locations[0];
            const uiLocation = breakpointLocation.uiLocation;
            const isSelected = selectedUILocation !== null &&
                locations.some(location => location.uiLocation.id() === selectedUILocation.id());
            // Wasm disassembly bytecode offsets are stored as column numbers,
            // so this showColumn setting doesn't make sense for WebAssembly.
            const showColumn = uiLocation.uiSourceCode.mimeType() !== 'application/wasm' &&
                locationIdsByLineId.get(uiLocation.lineId()).size > 1;
            const text = content[idx];
            breakpoints.push(new BreakpointItem(locations, text, isSelected, showColumn));
        }
        if (breakpoints.some(breakpoint => breakpoint.isSelected)) {
            UI.ViewManager.ViewManager.instance().showView('sources.jsBreakpoints');
        }
        this._list.element.classList.toggle('breakpoints-list-deactivated', !Common.Settings.Settings.instance().moduleSetting('breakpointsActive').get());
        this._setBreakpointItems(breakpoints);
        if (hadFocus) {
            this.focus();
        }
        return this._didUpdateForTest();
    }
    /**
     * If the number of breakpoint items is the same,
     * we expect only minor changes and it implies that only
     * few items should be updated
     */
    _setBreakpointItems(breakpointItems) {
        if (this._breakpoints.length === breakpointItems.length) {
            for (let i = 0; i < this._breakpoints.length; i++) {
                if (!this._breakpoints.at(i).isSimilar(breakpointItems[i])) {
                    this._breakpoints.replace(i, breakpointItems[i], /** keepSelectedIndex= */ true);
                }
            }
        }
        else {
            this._breakpoints.replaceAll(breakpointItems);
        }
        if (!this._list.selectedItem() && this._breakpoints.at(0)) {
            this._list.selectItem(this._breakpoints.at(0));
        }
    }
    createElementForItem(item) {
        const element = document.createElement('div');
        element.classList.add('breakpoint-entry');
        UI.ARIAUtils.markAsListitem(element);
        element.tabIndex = this._list.selectedItem() === item ? 0 : -1;
        element.addEventListener('contextmenu', this._breakpointContextMenu.bind(this), true);
        element.addEventListener('click', this._revealLocation.bind(this, element), false);
        const checkboxLabel = UI.UIUtils.CheckboxLabel.create('');
        const uiLocation = item.locations[0].uiLocation;
        const hasEnabled = item.locations.some(location => location.breakpoint.enabled());
        const hasDisabled = item.locations.some(location => !location.breakpoint.enabled());
        checkboxLabel.textElement.textContent = uiLocation.linkText() +
            (item.showColumn && typeof uiLocation.columnNumber === 'number' ? ':' + (uiLocation.columnNumber + 1) : '');
        checkboxLabel.checkboxElement.checked = hasEnabled;
        checkboxLabel.checkboxElement.indeterminate = hasEnabled && hasDisabled;
        checkboxLabel.checkboxElement.tabIndex = -1;
        checkboxLabel.addEventListener('click', this._breakpointCheckboxClicked.bind(this), false);
        element.appendChild(checkboxLabel);
        let checkedDescription = hasEnabled ? i18nString(UIStrings.checked) : i18nString(UIStrings.unchecked);
        if (hasEnabled && hasDisabled) {
            checkedDescription = i18nString(UIStrings.mixed);
        }
        if (item.isSelected) {
            UI.ARIAUtils.setDescription(element, i18nString(UIStrings.sBreakpointHit, { PH1: checkedDescription }));
            element.classList.add('breakpoint-hit');
            this.setDefaultFocusedElement(element);
        }
        else {
            UI.ARIAUtils.setDescription(element, checkedDescription);
        }
        element.addEventListener('keydown', event => {
            if (event.key === ' ') {
                checkboxLabel.checkboxElement.click();
                event.consume(true);
            }
        });
        const snippetElement = element.createChild('div', 'source-text monospace');
        const lineNumber = uiLocation.lineNumber;
        if (item.text && lineNumber < item.text.lineCount()) {
            const lineText = item.text.lineAt(lineNumber);
            const maxSnippetLength = 200;
            snippetElement.textContent = Platform.StringUtilities.trimEndWithMaxLength(lineText.substring(item.showColumn ? (uiLocation.columnNumber || 0) : 0), maxSnippetLength);
        }
        elementToBreakpointMap.set(element, item.locations);
        elementToUILocationMap.set(element, uiLocation);
        return element;
    }
    heightForItem(_item) {
        return 0;
    }
    isItemSelectable(_item) {
        return true;
    }
    selectedItemChanged(_from, _to, fromElement, toElement) {
        if (fromElement) {
            fromElement.tabIndex = -1;
        }
        if (toElement) {
            toElement.tabIndex = 0;
            this.setDefaultFocusedElement(toElement);
            if (this.hasFocus()) {
                toElement.focus();
            }
        }
    }
    updateSelectedItemARIA(_fromElement, _toElement) {
        return true;
    }
    _breakpointLocations(event) {
        if (event.target instanceof Element) {
            return this._breakpointLocationsForElement(event.target);
        }
        return [];
    }
    _breakpointLocationsForElement(element) {
        const node = element.enclosingNodeOrSelfWithClass('breakpoint-entry');
        if (!node) {
            return [];
        }
        return elementToBreakpointMap.get(node) || [];
    }
    _breakpointCheckboxClicked(event) {
        const hadFocus = this.hasFocus();
        const breakpoints = this._breakpointLocations(event).map(breakpointLocation => breakpointLocation.breakpoint);
        const newState = event.target.checkboxElement.checked;
        for (const breakpoint of breakpoints) {
            breakpoint.setEnabled(newState);
            const item = this._breakpoints.find(breakpointItem => breakpointItem.locations.some(loc => loc.breakpoint === breakpoint));
            if (item) {
                this._list.selectItem(item);
                this._list.refreshItem(item);
            }
        }
        if (hadFocus) {
            this.focus();
        }
        event.consume();
    }
    _revealLocation(element) {
        const uiLocations = this._breakpointLocationsForElement(element).map(breakpointLocation => breakpointLocation.uiLocation);
        let uiLocation = null;
        for (const uiLocationCandidate of uiLocations) {
            if (!uiLocation || uiLocationCandidate.compareTo(uiLocation) < 0) {
                uiLocation = uiLocationCandidate;
            }
        }
        if (uiLocation) {
            Common.Revealer.reveal(uiLocation);
        }
    }
    _breakpointContextMenu(event) {
        const breakpoints = this._breakpointLocations(event).map(breakpointLocation => breakpointLocation.breakpoint);
        const contextMenu = new UI.ContextMenu.ContextMenu(event);
        const removeEntryTitle = breakpoints.length > 1 ? i18nString(UIStrings.removeAllBreakpointsInLine) :
            i18nString(UIStrings.removeBreakpoint);
        contextMenu.defaultSection().appendItem(removeEntryTitle, () => breakpoints.map(breakpoint => breakpoint.remove(false /* keepInStorage */)));
        if (event.target instanceof Element) {
            contextMenu.defaultSection().appendItem(i18nString(UIStrings.revealLocation), this._revealLocation.bind(this, event.target));
        }
        const breakpointActive = Common.Settings.Settings.instance().moduleSetting('breakpointsActive').get();
        const breakpointActiveTitle = breakpointActive ? i18nString(UIStrings.deactivateBreakpoints) : i18nString(UIStrings.activateBreakpoints);
        contextMenu.defaultSection().appendItem(breakpointActiveTitle, () => Common.Settings.Settings.instance().moduleSetting('breakpointsActive').set(!breakpointActive));
        if (breakpoints.some(breakpoint => !breakpoint.enabled())) {
            const enableTitle = i18nString(UIStrings.enableAllBreakpoints);
            contextMenu.defaultSection().appendItem(enableTitle, this._toggleAllBreakpoints.bind(this, true));
            if (event.target instanceof Element) {
                const enableInFileTitle = i18nString(UIStrings.enableBreakpointsInFile);
                contextMenu.defaultSection().appendItem(enableInFileTitle, this._toggleAllBreakpointsInFile.bind(this, event.target, true));
            }
        }
        if (breakpoints.some(breakpoint => breakpoint.enabled())) {
            const disableTitle = i18nString(UIStrings.disableAllBreakpoints);
            contextMenu.defaultSection().appendItem(disableTitle, this._toggleAllBreakpoints.bind(this, false));
            if (event.target instanceof Element) {
                const disableInFileTitle = i18nString(UIStrings.disableBreakpointsInFile);
                contextMenu.defaultSection().appendItem(disableInFileTitle, this._toggleAllBreakpointsInFile.bind(this, event.target, false));
            }
        }
        const removeAllTitle = i18nString(UIStrings.removeAllBreakpoints);
        contextMenu.defaultSection().appendItem(removeAllTitle, this._removeAllBreakpoints.bind(this));
        const removeOtherTitle = i18nString(UIStrings.removeOtherBreakpoints);
        contextMenu.defaultSection().appendItem(removeOtherTitle, this._removeOtherBreakpoints.bind(this, new Set(breakpoints)));
        contextMenu.show();
    }
    _toggleAllBreakpointsInFile(element, toggleState) {
        const breakpointLocations = this._getBreakpointLocations();
        const selectedBreakpointLocations = this._breakpointLocationsForElement(element);
        breakpointLocations.forEach(breakpointLocation => {
            const matchesLocation = selectedBreakpointLocations.some(selectedBreakpointLocation => selectedBreakpointLocation.breakpoint.url() === breakpointLocation.breakpoint.url());
            if (matchesLocation) {
                breakpointLocation.breakpoint.setEnabled(toggleState);
            }
        });
    }
    _toggleAllBreakpoints(toggleState) {
        for (const breakpointLocation of this._breakpointManager.allBreakpointLocations()) {
            breakpointLocation.breakpoint.setEnabled(toggleState);
        }
    }
    _removeAllBreakpoints() {
        for (const breakpointLocation of this._breakpointManager.allBreakpointLocations()) {
            breakpointLocation.breakpoint.remove(false /* keepInStorage */);
        }
    }
    _removeOtherBreakpoints(selectedBreakpoints) {
        for (const breakpointLocation of this._breakpointManager.allBreakpointLocations()) {
            if (!selectedBreakpoints.has(breakpointLocation.breakpoint)) {
                breakpointLocation.breakpoint.remove(false /* keepInStorage */);
            }
        }
    }
    flavorChanged(_object) {
        this.update();
    }
    _didUpdateForTest() {
    }
}
class BreakpointItem {
    locations;
    text;
    isSelected;
    showColumn;
    constructor(locations, text, isSelected, showColumn) {
        this.locations = locations;
        this.text = text;
        this.isSelected = isSelected;
        this.showColumn = showColumn;
    }
    /**
     * Checks if this item has not changed compared with the other
     * Used to cache model items between re-renders
     */
    isSimilar(other) {
        return this.locations.length === other.locations.length &&
            this.locations.every((l, idx) => l.uiLocation === other.locations[idx].uiLocation) &&
            this.locations.every((l, idx) => l.breakpoint === other.locations[idx].breakpoint) &&
            ((this.text === other.text) || (this.text && other.text && this.text.value() === other.text.value())) &&
            this.isSelected === other.isSelected && this.showColumn === other.showColumn;
    }
}
const elementToUILocationMap = new WeakMap();
export function retrieveLocationForElement(element) {
    return elementToUILocationMap.get(element);
}
const elementToBreakpointMap = new WeakMap();
//# sourceMappingURL=JavaScriptBreakpointsSidebarPane.js.map