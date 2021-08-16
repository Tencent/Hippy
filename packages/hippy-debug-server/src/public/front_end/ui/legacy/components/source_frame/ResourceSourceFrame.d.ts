import type * as TextUtils from '../../../../models/text_utils/text_utils.js';
import * as UI from '../../legacy.js';
import { SourceFrameImpl } from './SourceFrame.js';
export declare class ResourceSourceFrame extends SourceFrameImpl {
    _resource: TextUtils.ContentProvider.ContentProvider;
    constructor(resource: TextUtils.ContentProvider.ContentProvider, autoPrettyPrint?: boolean, codeMirrorOptions?: UI.TextEditor.Options);
    static createSearchableView(resource: TextUtils.ContentProvider.ContentProvider, highlighterType: string, autoPrettyPrint?: boolean): UI.Widget.Widget;
    get resource(): TextUtils.ContentProvider.ContentProvider;
    populateTextAreaContextMenu(contextMenu: UI.ContextMenu.ContextMenu, _lineNumber: number, _columnNumber: number): Promise<void>;
}
export declare class SearchableContainer extends UI.Widget.VBox {
    _sourceFrame: ResourceSourceFrame;
    constructor(resource: TextUtils.ContentProvider.ContentProvider, highlighterType: string, autoPrettyPrint?: boolean);
    revealPosition(lineNumber: number, columnNumber?: number): Promise<void>;
}
