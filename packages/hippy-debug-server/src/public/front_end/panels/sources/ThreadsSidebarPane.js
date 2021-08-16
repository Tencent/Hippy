// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../../core/i18n/i18n.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
const UIStrings = {
    /**
    *@description Text in Threads Sidebar Pane of the Sources panel
    */
    paused: 'paused',
};
const str_ = i18n.i18n.registerUIStrings('panels/sources/ThreadsSidebarPane.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
let threadsSidebarPaneInstance;
export class ThreadsSidebarPane extends UI.Widget.VBox {
    _items;
    _list;
    _selectedModel;
    constructor() {
        super(true);
        this.registerRequiredCSS('panels/sources/threadsSidebarPane.css', { enableLegacyPatching: false });
        this._items = new UI.ListModel.ListModel();
        this._list = new UI.ListControl.ListControl(this._items, this, UI.ListControl.ListMode.NonViewport);
        const currentTarget = UI.Context.Context.instance().flavor(SDK.Target.Target);
        this._selectedModel = currentTarget !== null ? currentTarget.model(SDK.DebuggerModel.DebuggerModel) : null;
        this.contentElement.appendChild(this._list.element);
        UI.Context.Context.instance().addFlavorChangeListener(SDK.Target.Target, this._targetFlavorChanged, this);
        SDK.TargetManager.TargetManager.instance().observeModels(SDK.DebuggerModel.DebuggerModel, this);
    }
    static instance() {
        if (!threadsSidebarPaneInstance) {
            threadsSidebarPaneInstance = new ThreadsSidebarPane();
        }
        return threadsSidebarPaneInstance;
    }
    static shouldBeShown() {
        return SDK.TargetManager.TargetManager.instance().models(SDK.DebuggerModel.DebuggerModel).length >= 2;
    }
    createElementForItem(debuggerModel) {
        const element = document.createElement('div');
        element.classList.add('thread-item');
        const title = element.createChild('div', 'thread-item-title');
        const pausedState = element.createChild('div', 'thread-item-paused-state');
        element.appendChild(UI.Icon.Icon.create('smallicon-thick-right-arrow', 'selected-thread-icon'));
        element.tabIndex = -1;
        self.onInvokeElement(element, event => {
            UI.Context.Context.instance().setFlavor(SDK.Target.Target, debuggerModel.target());
            event.consume(true);
        });
        const isSelected = UI.Context.Context.instance().flavor(SDK.Target.Target) === debuggerModel.target();
        element.classList.toggle('selected', isSelected);
        UI.ARIAUtils.setSelected(element, isSelected);
        function updateTitle() {
            const executionContext = debuggerModel.runtimeModel().defaultExecutionContext();
            title.textContent =
                executionContext && executionContext.label() ? executionContext.label() : debuggerModel.target().name();
        }
        function updatePausedState() {
            pausedState.textContent = debuggerModel.isPaused() ? i18nString(UIStrings.paused) : '';
        }
        function targetNameChanged(event) {
            const target = event.data;
            if (target === debuggerModel.target()) {
                updateTitle();
            }
        }
        debuggerModel.addEventListener(SDK.DebuggerModel.Events.DebuggerPaused, updatePausedState);
        debuggerModel.addEventListener(SDK.DebuggerModel.Events.DebuggerResumed, updatePausedState);
        debuggerModel.runtimeModel().addEventListener(SDK.RuntimeModel.Events.ExecutionContextChanged, updateTitle);
        SDK.TargetManager.TargetManager.instance().addEventListener(SDK.TargetManager.Events.NameChanged, targetNameChanged);
        updatePausedState();
        updateTitle();
        return element;
    }
    heightForItem(_debuggerModel) {
        console.assert(false); // Should not be called.
        return 0;
    }
    isItemSelectable(_debuggerModel) {
        return true;
    }
    selectedItemChanged(_from, _to, fromElement, toElement) {
        const fromEle = fromElement;
        if (fromEle) {
            fromEle.tabIndex = -1;
        }
        const toEle = toElement;
        if (toEle) {
            this.setDefaultFocusedElement(toEle);
            toEle.tabIndex = 0;
            if (this.hasFocus()) {
                toEle.focus();
            }
        }
    }
    updateSelectedItemARIA(_fromElement, _toElement) {
        return false;
    }
    modelAdded(debuggerModel) {
        this._items.insert(this._items.length, debuggerModel);
        const currentTarget = UI.Context.Context.instance().flavor(SDK.Target.Target);
        if (currentTarget === debuggerModel.target()) {
            this._list.selectItem(debuggerModel);
        }
    }
    modelRemoved(debuggerModel) {
        this._items.remove(this._items.indexOf(debuggerModel));
    }
    _targetFlavorChanged(event) {
        const hadFocus = this.hasFocus();
        const target = event.data;
        const debuggerModel = target.model(SDK.DebuggerModel.DebuggerModel);
        this._list.selectItem(debuggerModel);
        if (debuggerModel) {
            this._list.refreshItem(debuggerModel);
        }
        if (this._selectedModel !== null) {
            this._list.refreshItem(this._selectedModel);
        }
        this._selectedModel = debuggerModel;
        if (hadFocus) {
            this.focus();
        }
    }
}
//# sourceMappingURL=ThreadsSidebarPane.js.map