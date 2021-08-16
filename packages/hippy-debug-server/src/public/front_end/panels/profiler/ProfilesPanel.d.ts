import * as Common from '../../core/common/common.js';
import * as UI from '../../ui/legacy/legacy.js';
import type { DataDisplayDelegate, ProfileHeader, ProfileType } from './ProfileHeader.js';
import { ProfileLauncherView } from './ProfileLauncherView.js';
import { ProfileSidebarTreeElement } from './ProfileSidebarTreeElement.js';
export declare class ProfilesPanel extends UI.Panel.PanelWithSidebar implements DataDisplayDelegate {
    _profileTypes: ProfileType[];
    profilesItemTreeElement: ProfilesSidebarTreeElement;
    _sidebarTree: UI.TreeOutline.TreeOutlineInShadow;
    profileViews: HTMLDivElement;
    _toolbarElement: HTMLDivElement;
    _toggleRecordAction: UI.ActionRegistration.Action;
    _toggleRecordButton: UI.Toolbar.ToolbarButton;
    clearResultsButton: UI.Toolbar.ToolbarButton;
    _profileViewToolbar: UI.Toolbar.Toolbar;
    _profileGroups: {};
    _launcherView: ProfileLauncherView;
    visibleView: UI.Widget.Widget | undefined;
    _profileToView: {
        profile: ProfileHeader;
        view: UI.Widget.Widget;
    }[];
    _typeIdToSidebarSection: {
        [x: string]: ProfileTypeSidebarSection;
    };
    _fileSelectorElement: HTMLInputElement;
    _selectedProfileType?: ProfileType;
    constructor(name: string, profileTypes: ProfileType[], recordingActionId: string);
    _onKeyDown(ev: Event): void;
    searchableView(): UI.SearchableView.SearchableView | null;
    _createFileSelectorElement(): void;
    _findProfileTypeByExtension(fileName: string): ProfileType | null;
    _loadFromFile(file: File): Promise<void>;
    toggleRecord(): boolean;
    _onSuspendStateChanged(): void;
    _updateToggleRecordAction(toggled: boolean): void;
    _profileBeingRecordedRemoved(): void;
    _onProfileTypeSelected(event: Common.EventTarget.EventTargetEvent): void;
    _updateProfileTypeSpecificUI(): void;
    _reset(): void;
    _showLauncherView(): void;
    _registerProfileType(profileType: ProfileType): void;
    _handleContextMenuEvent(event: Event): void;
    showLoadFromFileDialog(): void;
    _addProfileHeader(profile: ProfileHeader): void;
    _removeProfileHeader(profile: ProfileHeader): void;
    showProfile(profile: ProfileHeader | null): UI.Widget.Widget | null;
    showObject(_snapshotObjectId: string, _perspectiveName: string): void;
    linkifyObject(_nodeIndex: number): Promise<Element | null>;
    viewForProfile(profile: ProfileHeader): UI.Widget.Widget;
    _indexOfViewForProfile(profile: ProfileHeader): number;
    closeVisibleView(): void;
    focus(): void;
}
export declare class ProfileTypeSidebarSection extends UI.TreeOutline.TreeElement {
    _dataDisplayDelegate: DataDisplayDelegate;
    _profileTreeElements: ProfileSidebarTreeElement[];
    _profileGroups: {
        [x: string]: ProfileGroup;
    };
    constructor(dataDisplayDelegate: DataDisplayDelegate, profileType: ProfileType);
    addProfileHeader(profile: ProfileHeader): void;
    removeProfileHeader(profile: ProfileHeader): boolean;
    sidebarElementForProfile(profile: ProfileHeader): ProfileSidebarTreeElement | null;
    _sidebarElementIndex(profile: ProfileHeader): number;
    onattach(): void;
}
export declare class ProfileGroup {
    profileSidebarTreeElements: ProfileSidebarTreeElement[];
    sidebarTreeElement: ProfileGroupSidebarTreeElement | null;
    constructor();
}
export declare class ProfileGroupSidebarTreeElement extends UI.TreeOutline.TreeElement {
    _dataDisplayDelegate: DataDisplayDelegate;
    _profileTitle: string;
    toggleOnClick: boolean;
    constructor(dataDisplayDelegate: DataDisplayDelegate, title: string);
    onselect(): boolean;
    onattach(): void;
}
export declare class ProfilesSidebarTreeElement extends UI.TreeOutline.TreeElement {
    _panel: ProfilesPanel;
    constructor(panel: ProfilesPanel);
    onselect(): boolean;
    onattach(): void;
}
export declare class JSProfilerPanel extends ProfilesPanel implements UI.ActionRegistration.ActionDelegate {
    constructor();
    static instance(opts?: {
        forceNew: boolean | null;
    }): JSProfilerPanel;
    wasShown(): void;
    willHide(): void;
    handleAction(_context: UI.Context.Context, _actionId: string): boolean;
}
