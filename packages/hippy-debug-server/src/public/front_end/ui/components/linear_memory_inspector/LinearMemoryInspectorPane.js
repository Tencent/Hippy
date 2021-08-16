// Copyright (c) 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../../../core/i18n/i18n.js';
import * as UI from '../../legacy/legacy.js';
import { LinearMemoryInspector } from './LinearMemoryInspector.js'; // eslint-disable-line no-unused-vars
import { LinearMemoryInspectorController } from './LinearMemoryInspectorController.js'; // eslint-disable-line no-unused-vars
const UIStrings = {
    /**
    *@description Label in the Linear Memory Inspector tool that serves as a placeholder if no inspections are open (i.e. nothing to see here).
    *             Inspection hereby refers to viewing, navigating and understanding the memory through this tool.
    */
    noOpenInspections: 'No open inspections',
};
const str_ = i18n.i18n.registerUIStrings('ui/components/linear_memory_inspector/LinearMemoryInspectorPane.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
let inspectorInstance;
let wrapperInstance;
export class Wrapper extends UI.Widget.VBox {
    view;
    constructor() {
        super();
        this.view = LinearMemoryInspectorPaneImpl.instance();
    }
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!wrapperInstance || forceNew) {
            wrapperInstance = new Wrapper();
        }
        return wrapperInstance;
    }
    wasShown() {
        this.view.show(this.contentElement);
    }
}
export class LinearMemoryInspectorPaneImpl extends UI.Widget.VBox {
    _tabbedPane;
    _tabIdToInspectorView;
    constructor() {
        super(false);
        const placeholder = document.createElement('div');
        placeholder.textContent = i18nString(UIStrings.noOpenInspections);
        placeholder.style.display = 'flex';
        this._tabbedPane = new UI.TabbedPane.TabbedPane();
        this._tabbedPane.setPlaceholderElement(placeholder);
        this._tabbedPane.setCloseableTabs(true);
        this._tabbedPane.setAllowTabReorder(true, true);
        this._tabbedPane.addEventListener(UI.TabbedPane.Events.TabClosed, this._tabClosed, this);
        this._tabbedPane.show(this.contentElement);
        this._tabIdToInspectorView = new Map();
    }
    static instance() {
        if (!inspectorInstance) {
            inspectorInstance = new LinearMemoryInspectorPaneImpl();
        }
        return inspectorInstance;
    }
    create(tabId, title, arrayWrapper, address) {
        const inspectorView = new LinearMemoryInspectorView(arrayWrapper, address);
        this._tabIdToInspectorView.set(tabId, inspectorView);
        this._tabbedPane.appendTab(tabId, title, inspectorView, undefined, false, true);
        this._tabbedPane.selectTab(tabId);
    }
    close(tabId) {
        this._tabbedPane.closeTab(tabId, false);
    }
    reveal(tabId, address) {
        const view = this._tabIdToInspectorView.get(tabId);
        if (!view) {
            throw new Error(`No linear memory inspector view for given tab id: ${tabId}`);
        }
        if (address !== undefined) {
            view.updateAddress(address);
        }
        this.refreshView(tabId);
        this._tabbedPane.selectTab(tabId);
    }
    refreshView(tabId) {
        const view = this._tabIdToInspectorView.get(tabId);
        if (!view) {
            throw new Error(`View for specified tab id does not exist: ${tabId}`);
        }
        view.refreshData();
    }
    _tabClosed(event) {
        const tabId = event.data.tabId;
        this._tabIdToInspectorView.delete(tabId);
        this.dispatchEventToListeners('view-closed', tabId);
    }
}
class LinearMemoryInspectorView extends UI.Widget.VBox {
    _memoryWrapper;
    _address;
    _inspector;
    firstTimeOpen;
    constructor(memoryWrapper, address = 0) {
        super(false);
        if (address < 0 || address >= memoryWrapper.length()) {
            throw new Error('Requested address is out of bounds.');
        }
        this._memoryWrapper = memoryWrapper;
        this._address = address;
        this._inspector = new LinearMemoryInspector();
        this._inspector.addEventListener('memoryrequest', (event) => {
            // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this._memoryRequested(event);
        });
        this._inspector.addEventListener('addresschanged', (event) => {
            // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.updateAddress(event.data);
        });
        this._inspector.addEventListener('settingschanged', (event) => {
            // Stop event from bubbling up, since no element further up needs the event.
            event.stopPropagation();
            // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.saveSettings(event.data);
        });
        this.contentElement.appendChild(this._inspector);
        this.firstTimeOpen = true;
    }
    wasShown() {
        this.refreshData();
    }
    saveSettings(settings) {
        LinearMemoryInspectorController.instance().saveSettings(settings);
    }
    updateAddress(address) {
        if (address < 0 || address >= this._memoryWrapper.length()) {
            throw new Error('Requested address is out of bounds.');
        }
        this._address = address;
    }
    refreshData() {
        LinearMemoryInspectorController.getMemoryForAddress(this._memoryWrapper, this._address).then(({ memory, offset }) => {
            let valueTypes;
            let valueTypeModes;
            let endianness;
            if (this.firstTimeOpen) {
                const settings = LinearMemoryInspectorController.instance().loadSettings();
                valueTypes = settings.valueTypes;
                valueTypeModes = settings.modes;
                endianness = settings.endianness;
                this.firstTimeOpen = false;
            }
            this._inspector.data = {
                memory,
                address: this._address,
                memoryOffset: offset,
                outerMemoryLength: this._memoryWrapper.length(),
                valueTypes,
                valueTypeModes,
                endianness,
            };
        });
    }
    _memoryRequested(event) {
        const { start, end, address } = event.data;
        if (address < start || address >= end) {
            throw new Error('Requested address is out of bounds.');
        }
        LinearMemoryInspectorController.getMemoryRange(this._memoryWrapper, start, end).then(memory => {
            this._inspector.data = {
                memory: memory,
                address: address,
                memoryOffset: start,
                outerMemoryLength: this._memoryWrapper.length(),
            };
        });
    }
}
//# sourceMappingURL=LinearMemoryInspectorPane.js.map