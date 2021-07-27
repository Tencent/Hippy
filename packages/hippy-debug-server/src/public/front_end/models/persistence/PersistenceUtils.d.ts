import * as Common from '../../core/common/common.js';
import * as Components from '../../ui/legacy/components/utils/utils.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as Workspace from '../workspace/workspace.js';
import { PersistenceImpl } from './PersistenceImpl.js';
export declare class PersistenceUtils {
    static tooltipForUISourceCode(uiSourceCode: Workspace.UISourceCode.UISourceCode): string;
    static iconForUISourceCode(uiSourceCode: Workspace.UISourceCode.UISourceCode): UI.Icon.Icon | null;
}
export declare class LinkDecorator extends Common.ObjectWrapper.ObjectWrapper implements Components.Linkifier.LinkDecorator {
    constructor(persistence: PersistenceImpl);
    _bindingChanged(event: Common.EventTarget.EventTargetEvent): void;
    linkIcon(uiSourceCode: Workspace.UISourceCode.UISourceCode): UI.Icon.Icon | null;
}
