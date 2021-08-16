import type * as SDK from '../../core/sdk/sdk.js';
import type * as UI from '../../ui/legacy/legacy.js';
import type { Formatter } from './ProfileDataGrid.js';
import { ProfileDataGridNode, ProfileDataGridTree } from './ProfileDataGrid.js';
import type { TopDownProfileDataGridTree } from './TopDownProfileDataGrid.js';
export interface NodeInfo {
    ancestor: SDK.ProfileTreeModel.ProfileNode;
    focusNode: SDK.ProfileTreeModel.ProfileNode;
    totalAccountedFor: boolean;
}
export declare class BottomUpProfileDataGridNode extends ProfileDataGridNode {
    _remainingNodeInfos: NodeInfo[] | undefined;
    constructor(profileNode: SDK.ProfileTreeModel.ProfileNode, owningTree: TopDownProfileDataGridTree);
    static _sharedPopulate(container: BottomUpProfileDataGridNode | BottomUpProfileDataGridTree): void;
    _takePropertiesFromProfileDataGridNode(profileDataGridNode: ProfileDataGridNode): void;
    /**
     * When focusing, we keep just the members of the callstack.
     */
    _keepOnlyChild(child: ProfileDataGridNode): void;
    _exclude(aCallUID: string): void;
    restore(): void;
    merge(child: ProfileDataGridNode, shouldAbsorb: boolean): void;
    populateChildren(): void;
    _willHaveChildren(profileNode: SDK.ProfileTreeModel.ProfileNode): boolean;
}
export declare class BottomUpProfileDataGridTree extends ProfileDataGridTree {
    deepSearch: boolean;
    _remainingNodeInfos: NodeInfo[] | undefined;
    constructor(formatter: Formatter, searchableView: UI.SearchableView.SearchableView, rootProfileNode: SDK.ProfileTreeModel.ProfileNode, total: number);
    /**
     * When focusing, we keep the entire callstack up to this ancestor.
     */
    focus(profileDataGridNode: ProfileDataGridNode): void;
    exclude(profileDataGridNode: ProfileDataGridNode): void;
    populateChildren(): void;
}
