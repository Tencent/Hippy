import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
import { ElementsTreeElement } from './ElementsTreeElement.js';
import { ElementsTreeOutline } from './ElementsTreeOutline.js';
export declare class ElementsTreeElementHighlighter {
    _throttler: Common.Throttler.Throttler;
    _treeOutline: ElementsTreeOutline;
    _currentHighlightedElement: ElementsTreeElement | null;
    _alreadyExpandedParentElement: UI.TreeOutline.TreeElement | ElementsTreeElement | null | undefined;
    _pendingHighlightNode: SDK.DOMModel.DOMNode | null;
    _isModifyingTreeOutline: boolean;
    constructor(treeOutline: ElementsTreeOutline);
    _highlightNode(event: Common.EventTarget.EventTargetEvent): void;
    _highlightNodeInternal(node: SDK.DOMModel.DOMNode | null): void;
    _clearState(): void;
}
