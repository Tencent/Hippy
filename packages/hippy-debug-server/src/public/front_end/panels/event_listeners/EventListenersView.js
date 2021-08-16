// Copyright 2015 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as ObjectUI from '../../ui/legacy/components/object_ui/object_ui.js';
import * as Components from '../../ui/legacy/components/utils/utils.js';
import * as UI from '../../ui/legacy/legacy.js';
import { frameworkEventListeners } from './EventListenersUtils.js';
const UIStrings = {
    /**
    *@description Empty holder text content in Event Listeners View of the Event Listener Debugging pane in the Sources panel
    */
    noEventListeners: 'No event listeners',
    /**
    *@description Label for an item to remove something
    */
    remove: 'Remove',
    /**
    *@description Delete button title in Event Listeners View of the Event Listener Debugging pane in the Sources panel
    */
    deleteEventListener: 'Delete event listener',
    /**
    *@description Passive button text content in Event Listeners View of the Event Listener Debugging pane in the Sources panel
    */
    togglePassive: 'Toggle Passive',
    /**
    *@description Passive button title in Event Listeners View of the Event Listener Debugging pane in the Sources panel
    */
    toggleWhetherEventListenerIs: 'Toggle whether event listener is passive or blocking',
    /**
    *@description A context menu item to reveal a node in the DOM tree of the Elements Panel
    */
    revealInElementsPanel: 'Reveal in Elements panel',
    /**
    *@description Text in Event Listeners Widget of the Elements panel
    */
    passive: 'Passive',
};
const str_ = i18n.i18n.registerUIStrings('panels/event_listeners/EventListenersView.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class EventListenersView extends UI.Widget.VBox {
    _changeCallback;
    _enableDefaultTreeFocus;
    _treeOutline;
    _emptyHolder;
    _linkifier;
    _treeItemMap;
    constructor(changeCallback, enableDefaultTreeFocus = false) {
        super();
        this._changeCallback = changeCallback;
        this._enableDefaultTreeFocus = enableDefaultTreeFocus;
        this._treeOutline = new UI.TreeOutline.TreeOutlineInShadow();
        this._treeOutline.hideOverflow();
        this._treeOutline.registerRequiredCSS('ui/legacy/components/object_ui/objectValue.css', { enableLegacyPatching: false });
        this._treeOutline.registerRequiredCSS('panels/event_listeners/eventListenersView.css', { enableLegacyPatching: false });
        this._treeOutline.setComparator(EventListenersTreeElement.comparator);
        this._treeOutline.element.classList.add('monospace');
        this._treeOutline.setShowSelectionOnKeyboardFocus(true);
        this._treeOutline.setFocusable(true);
        this.element.appendChild(this._treeOutline.element);
        this._emptyHolder = document.createElement('div');
        this._emptyHolder.classList.add('gray-info-message');
        this._emptyHolder.textContent = i18nString(UIStrings.noEventListeners);
        this._emptyHolder.tabIndex = -1;
        this._linkifier = new Components.Linkifier.Linkifier();
        this._treeItemMap = new Map();
    }
    focus() {
        if (!this._enableDefaultTreeFocus) {
            return;
        }
        if (!this._emptyHolder.parentNode) {
            this._treeOutline.forceSelect();
        }
        else {
            this._emptyHolder.focus();
        }
    }
    async addObjects(objects) {
        this.reset();
        await Promise.all(objects.map(obj => obj ? this._addObject(obj) : Promise.resolve()));
        this.addEmptyHolderIfNeeded();
        this._eventListenersArrivedForTest();
    }
    _addObject(object) {
        let eventListeners;
        let frameworkEventListenersObject = null;
        const promises = [];
        const domDebuggerModel = object.runtimeModel().target().model(SDK.DOMDebuggerModel.DOMDebuggerModel);
        // TODO(kozyatinskiy): figure out how this should work for |window| when there is no DOMDebugger.
        if (domDebuggerModel) {
            promises.push(domDebuggerModel.eventListeners(object).then(storeEventListeners));
        }
        promises.push(frameworkEventListeners(object).then(storeFrameworkEventListenersObject));
        return Promise.all(promises).then(markInternalEventListeners).then(addEventListeners.bind(this));
        function storeEventListeners(result) {
            eventListeners = result;
        }
        function storeFrameworkEventListenersObject(result) {
            frameworkEventListenersObject = result;
        }
        function markInternalEventListeners() {
            if (!frameworkEventListenersObject) {
                return Promise.resolve();
            }
            if (!frameworkEventListenersObject.internalHandlers) {
                return Promise.resolve();
            }
            return frameworkEventListenersObject.internalHandlers.object()
                .callFunctionJSON(isInternalEventListener, eventListeners.map(handlerArgument))
                .then(setIsInternal);
            function handlerArgument(listener) {
                return SDK.RemoteObject.RemoteObject.toCallArgument(listener.handler());
            }
            function isInternalEventListener() {
                const isInternal = [];
                const internalHandlersSet = new Set(this);
                for (const handler of arguments) {
                    isInternal.push(internalHandlersSet.has(handler));
                }
                return isInternal;
            }
            function setIsInternal(isInternal) {
                for (let i = 0; i < eventListeners.length; ++i) {
                    if (isInternal[i]) {
                        eventListeners[i].markAsFramework();
                    }
                }
            }
        }
        function addEventListeners() {
            this._addObjectEventListeners(object, eventListeners);
            if (frameworkEventListenersObject) {
                this._addObjectEventListeners(object, frameworkEventListenersObject.eventListeners);
            }
        }
    }
    _addObjectEventListeners(object, eventListeners) {
        if (!eventListeners) {
            return;
        }
        for (const eventListener of eventListeners) {
            const treeItem = this._getOrCreateTreeElementForType(eventListener.type());
            treeItem.addObjectEventListener(eventListener, object);
        }
    }
    showFrameworkListeners(showFramework, showPassive, showBlocking) {
        const eventTypes = this._treeOutline.rootElement().children();
        for (const eventType of eventTypes) {
            let hiddenEventType = true;
            for (const listenerElement of eventType.children()) {
                const objectListenerElement = listenerElement;
                const listenerOrigin = objectListenerElement.eventListener().origin();
                let hidden = false;
                if (listenerOrigin === SDK.DOMDebuggerModel.EventListener.Origin.FrameworkUser && !showFramework) {
                    hidden = true;
                }
                if (listenerOrigin === SDK.DOMDebuggerModel.EventListener.Origin.Framework && showFramework) {
                    hidden = true;
                }
                if (!showPassive && objectListenerElement.eventListener().passive()) {
                    hidden = true;
                }
                if (!showBlocking && !objectListenerElement.eventListener().passive()) {
                    hidden = true;
                }
                objectListenerElement.hidden = hidden;
                hiddenEventType = hiddenEventType && hidden;
            }
            eventType.hidden = hiddenEventType;
        }
    }
    _getOrCreateTreeElementForType(type) {
        let treeItem = this._treeItemMap.get(type);
        if (!treeItem) {
            treeItem = new EventListenersTreeElement(type, this._linkifier, this._changeCallback);
            this._treeItemMap.set(type, treeItem);
            treeItem.hidden = true;
            this._treeOutline.appendChild(treeItem);
        }
        this._emptyHolder.remove();
        return treeItem;
    }
    addEmptyHolderIfNeeded() {
        let allHidden = true;
        let firstVisibleChild = null;
        for (const eventType of this._treeOutline.rootElement().children()) {
            eventType.hidden = !eventType.firstChild();
            allHidden = allHidden && eventType.hidden;
            if (!firstVisibleChild && !eventType.hidden) {
                firstVisibleChild = eventType;
            }
        }
        if (allHidden && !this._emptyHolder.parentNode) {
            this.element.appendChild(this._emptyHolder);
        }
        if (firstVisibleChild) {
            firstVisibleChild.select(true /* omitFocus */);
        }
    }
    reset() {
        const eventTypes = this._treeOutline.rootElement().children();
        for (const eventType of eventTypes) {
            eventType.removeChildren();
        }
        this._linkifier.reset();
    }
    _eventListenersArrivedForTest() {
    }
}
export class EventListenersTreeElement extends UI.TreeOutline.TreeElement {
    toggleOnClick;
    _linkifier;
    _changeCallback;
    constructor(type, linkifier, changeCallback) {
        super(type);
        this.toggleOnClick = true;
        this._linkifier = linkifier;
        this._changeCallback = changeCallback;
        UI.ARIAUtils.setAccessibleName(this.listItemElement, `${type}, event listener`);
    }
    static comparator(element1, element2) {
        if (element1.title === element2.title) {
            return 0;
        }
        return element1.title > element2.title ? 1 : -1;
    }
    addObjectEventListener(eventListener, object) {
        const treeElement = new ObjectEventListenerBar(eventListener, object, this._linkifier, this._changeCallback);
        this.appendChild(treeElement);
    }
}
export class ObjectEventListenerBar extends UI.TreeOutline.TreeElement {
    _eventListener;
    editable;
    _changeCallback;
    _valueTitle;
    constructor(eventListener, object, linkifier, changeCallback) {
        super('', true);
        this._eventListener = eventListener;
        this.editable = false;
        this._setTitle(object, linkifier);
        this._changeCallback = changeCallback;
    }
    async onpopulate() {
        const properties = [];
        const eventListener = this._eventListener;
        const runtimeModel = eventListener.domDebuggerModel().runtimeModel();
        properties.push(runtimeModel.createRemotePropertyFromPrimitiveValue('useCapture', eventListener.useCapture()));
        properties.push(runtimeModel.createRemotePropertyFromPrimitiveValue('passive', eventListener.passive()));
        properties.push(runtimeModel.createRemotePropertyFromPrimitiveValue('once', eventListener.once()));
        if (typeof eventListener.handler() !== 'undefined') {
            properties.push(new SDK.RemoteObject.RemoteObjectProperty('handler', eventListener.handler()));
        }
        ObjectUI.ObjectPropertiesSection.ObjectPropertyTreeElement.populateWithProperties(this, properties, [], true, null);
    }
    _setTitle(object, linkifier) {
        const title = this.listItemElement.createChild('span', 'event-listener-details');
        const subtitle = this.listItemElement.createChild('span', 'event-listener-tree-subtitle');
        const linkElement = linkifier.linkifyRawLocation(this._eventListener.location(), this._eventListener.sourceURL());
        subtitle.appendChild(linkElement);
        const propertyValue = ObjectUI.ObjectPropertiesSection.ObjectPropertiesSection.createPropertyValue(object, /* wasThrown */ false, /* showPreview */ false);
        this._valueTitle = propertyValue.element;
        title.appendChild(this._valueTitle);
        if (this._eventListener.canRemove()) {
            const deleteButton = title.createChild('span', 'event-listener-button');
            deleteButton.textContent = i18nString(UIStrings.remove);
            UI.Tooltip.Tooltip.install(deleteButton, i18nString(UIStrings.deleteEventListener));
            deleteButton.addEventListener('click', event => {
                this._removeListener();
                event.consume();
            }, false);
            title.appendChild(deleteButton);
        }
        if (this._eventListener.isScrollBlockingType() && this._eventListener.canTogglePassive()) {
            const passiveButton = title.createChild('span', 'event-listener-button');
            passiveButton.textContent = i18nString(UIStrings.togglePassive);
            UI.Tooltip.Tooltip.install(passiveButton, i18nString(UIStrings.toggleWhetherEventListenerIs));
            passiveButton.addEventListener('click', event => {
                this._togglePassiveListener();
                event.consume();
            }, false);
            title.appendChild(passiveButton);
        }
        this.listItemElement.addEventListener('contextmenu', event => {
            const menu = new UI.ContextMenu.ContextMenu(event);
            if (event.target !== linkElement) {
                menu.appendApplicableItems(linkElement);
            }
            if (object.subtype === 'node') {
                menu.defaultSection().appendItem(i18nString(UIStrings.revealInElementsPanel), () => Common.Revealer.reveal(object));
            }
            menu.defaultSection().appendItem(i18nString(UIStrings.deleteEventListener), this._removeListener.bind(this), !this._eventListener.canRemove());
            menu.defaultSection().appendCheckboxItem(i18nString(UIStrings.passive), this._togglePassiveListener.bind(this), this._eventListener.passive(), !this._eventListener.canTogglePassive());
            menu.show();
        });
    }
    _removeListener() {
        this._removeListenerBar();
        this._eventListener.remove();
    }
    _togglePassiveListener() {
        this._eventListener.togglePassive().then(() => this._changeCallback());
    }
    _removeListenerBar() {
        const parent = this.parent;
        if (!parent) {
            return;
        }
        parent.removeChild(this);
        if (!parent.childCount()) {
            parent.collapse();
        }
        let allHidden = true;
        for (const child of parent.children()) {
            if (!child.hidden) {
                allHidden = false;
            }
        }
        parent.hidden = allHidden;
    }
    eventListener() {
        return this._eventListener;
    }
    onenter() {
        if (this._valueTitle) {
            this._valueTitle.click();
            return true;
        }
        return false;
    }
}
//# sourceMappingURL=EventListenersView.js.map