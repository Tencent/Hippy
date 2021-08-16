import * as SDK from '../../core/sdk/sdk.js';
import * as Components from '../../ui/legacy/components/utils/utils.js';
import * as UI from '../../ui/legacy/legacy.js';
export declare class EventListenersView extends UI.Widget.VBox {
    _changeCallback: () => void;
    _enableDefaultTreeFocus: boolean;
    _treeOutline: UI.TreeOutline.TreeOutlineInShadow;
    _emptyHolder: HTMLDivElement;
    _linkifier: Components.Linkifier.Linkifier;
    _treeItemMap: Map<string, EventListenersTreeElement>;
    constructor(changeCallback: () => void, enableDefaultTreeFocus?: boolean | undefined);
    focus(): void;
    addObjects(objects: (SDK.RemoteObject.RemoteObject | null)[]): Promise<void>;
    _addObject(object: SDK.RemoteObject.RemoteObject): Promise<void>;
    _addObjectEventListeners(object: SDK.RemoteObject.RemoteObject, eventListeners: SDK.DOMDebuggerModel.EventListener[] | null): void;
    showFrameworkListeners(showFramework: boolean, showPassive: boolean, showBlocking: boolean): void;
    _getOrCreateTreeElementForType(type: string): EventListenersTreeElement;
    addEmptyHolderIfNeeded(): void;
    reset(): void;
    _eventListenersArrivedForTest(): void;
}
export declare class EventListenersTreeElement extends UI.TreeOutline.TreeElement {
    toggleOnClick: boolean;
    _linkifier: Components.Linkifier.Linkifier;
    _changeCallback: () => void;
    constructor(type: string, linkifier: Components.Linkifier.Linkifier, changeCallback: () => void);
    static comparator(element1: UI.TreeOutline.TreeElement, element2: UI.TreeOutline.TreeElement): number;
    addObjectEventListener(eventListener: SDK.DOMDebuggerModel.EventListener, object: SDK.RemoteObject.RemoteObject): void;
}
export declare class ObjectEventListenerBar extends UI.TreeOutline.TreeElement {
    _eventListener: SDK.DOMDebuggerModel.EventListener;
    editable: boolean;
    _changeCallback: () => void;
    _valueTitle?: Element;
    constructor(eventListener: SDK.DOMDebuggerModel.EventListener, object: SDK.RemoteObject.RemoteObject, linkifier: Components.Linkifier.Linkifier, changeCallback: () => void);
    onpopulate(): Promise<void>;
    _setTitle(object: SDK.RemoteObject.RemoteObject, linkifier: Components.Linkifier.Linkifier): void;
    _removeListener(): void;
    _togglePassiveListener(): void;
    _removeListenerBar(): void;
    eventListener(): SDK.DOMDebuggerModel.EventListener;
    onenter(): boolean;
}
