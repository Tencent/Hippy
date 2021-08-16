import * as Common from '../../core/common/common.js';
import type * as TextUtils from '../../models/text_utils/text_utils.js';
import * as SourceFrame from '../../ui/legacy/components/source_frame/source_frame.js';
import * as UI from '../../ui/legacy/legacy.js';
export declare class BinaryResourceView extends UI.Widget.VBox {
    _binaryResourceViewFactory: SourceFrame.BinaryResourceViewFactory.BinaryResourceViewFactory;
    _toolbar: UI.Toolbar.Toolbar;
    _binaryViewObjects: BinaryViewObject[];
    _binaryViewTypeSetting: Common.Settings.Setting<string>;
    _binaryViewTypeCombobox: UI.Toolbar.ToolbarComboBox;
    _copiedText: UI.Toolbar.ToolbarText;
    _addFadeoutSettimeoutId: number | null;
    _lastView: UI.Widget.Widget | null;
    constructor(base64content: string, contentUrl: string, resourceType: Common.ResourceType.ResourceType);
    _getCurrentViewObject(): BinaryViewObject | null;
    _copySelectedViewToClipboard(): Promise<void>;
    wasShown(): void;
    _updateView(): void;
    _binaryViewTypeChanged(): void;
    addCopyToContextMenu(contextMenu: UI.ContextMenu.ContextMenu, submenuItemText: string): void;
}
export declare class BinaryViewObject {
    type: string;
    label: string;
    copiedMessage: string;
    content: () => Promise<TextUtils.ContentProvider.DeferredContent>;
    _createViewFn: () => UI.Widget.Widget;
    _view: UI.Widget.Widget | null;
    constructor(type: string, label: string, copiedMessage: string, createViewFn: () => UI.Widget.Widget, deferredContent: () => Promise<TextUtils.ContentProvider.DeferredContent>);
    getView(): UI.Widget.Widget;
}
