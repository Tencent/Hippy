import type * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as ObjectUI from '../../ui/legacy/components/object_ui/object_ui.js';
import * as UI from '../../ui/legacy/legacy.js';
export declare class PropertiesWidget extends UI.ThrottledWidget.ThrottledWidget {
    _node: SDK.DOMModel.DOMNode | null;
    _treeOutline: ObjectUI.ObjectPropertiesSection.ObjectPropertiesSectionsTreeOutline;
    _expandController: ObjectUI.ObjectPropertiesSection.ObjectPropertiesSectionsTreeExpandController;
    _lastRequestedNode?: SDK.DOMModel.DOMNode;
    constructor();
    static instance(opts?: {
        forceNew: boolean | null;
    } | undefined): PropertiesWidget;
    _setNode(event: Common.EventTarget.EventTargetEvent): void;
    doUpdate(): Promise<void>;
    _createSectionTreeElement(property: SDK.RemoteObject.RemoteObject, title: string): ObjectUI.ObjectPropertiesSection.RootElement;
    _onNodeChange(event: Common.EventTarget.EventTargetEvent): void;
}
export declare const _objectGroupName = "properties-sidebar-pane";
