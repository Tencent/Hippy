import type * as Bindings from '../../models/bindings/bindings.js';
import * as Common from '../../core/common/common.js';
import type * as UI from '../../ui/legacy/legacy.js';
import type * as Protocol from '../../generated/protocol.js';
export declare class ProfileHeader extends Common.ObjectWrapper.ObjectWrapper {
    _profileType: ProfileType;
    title: string;
    uid: number;
    _fromFile: boolean;
    tempFile: Bindings.TempFile.TempFile | null;
    constructor(profileType: ProfileType, title: string);
    setTitle(title: string): void;
    profileType(): ProfileType;
    updateStatus(subtitle: string | null, wait?: boolean): void;
    /**
     * Must be implemented by subclasses.
     */
    createSidebarTreeElement(_dataDisplayDelegate: DataDisplayDelegate): UI.TreeOutline.TreeElement;
    createView(_dataDisplayDelegate: DataDisplayDelegate): UI.Widget.Widget;
    removeTempFile(): void;
    dispose(): void;
    canSaveToFile(): boolean;
    saveToFile(): void;
    loadFromFile(_file: File): Promise<Error | DOMError | null>;
    fromFile(): boolean;
    setFromFile(): void;
    setProfile(_profile: Protocol.Profiler.Profile): void;
}
export declare class StatusUpdate {
    subtitle: string | null;
    wait: boolean | undefined;
    constructor(subtitle: string | null, wait: boolean | undefined);
}
export declare enum Events {
    UpdateStatus = "UpdateStatus",
    ProfileReceived = "ProfileReceived",
    ProfileTitleChanged = "ProfileTitleChanged"
}
export declare abstract class ProfileType extends Common.ObjectWrapper.ObjectWrapper {
    _id: string;
    _name: string;
    _profiles: ProfileHeader[];
    _profileBeingRecorded: ProfileHeader | null;
    _nextProfileUid: number;
    constructor(id: string, name: string);
    typeName(): string;
    nextProfileUid(): number;
    incrementProfileUid(): number;
    hasTemporaryView(): boolean;
    fileExtension(): string | null;
    get buttonTooltip(): string;
    get id(): string;
    get treeItemTitle(): string;
    get name(): string;
    buttonClicked(): boolean;
    get description(): string;
    isInstantProfile(): boolean;
    isEnabled(): boolean;
    getProfiles(): ProfileHeader[];
    customContent(): Element | null;
    setCustomContentEnabled(_enable: boolean): void;
    getProfile(uid: number): ProfileHeader | null;
    loadFromFile(file: File): Promise<Error | DOMError | null>;
    abstract createProfileLoadedFromFile(title: string): ProfileHeader;
    addProfile(profile: ProfileHeader): void;
    removeProfile(profile: ProfileHeader): void;
    _clearTempStorage(): void;
    profileBeingRecorded(): ProfileHeader | null;
    setProfileBeingRecorded(profile: ProfileHeader | null): void;
    profileBeingRecordedRemoved(): void;
    reset(): void;
    _disposeProfile(profile: ProfileHeader): void;
}
export declare enum ProfileEvents {
    AddProfileHeader = "add-profile-header",
    ProfileComplete = "profile-complete",
    RemoveProfileHeader = "remove-profile-header",
    ViewUpdated = "view-updated"
}
export interface DataDisplayDelegate {
    showProfile(profile: ProfileHeader | null): UI.Widget.Widget | null;
    showObject(snapshotObjectId: string, perspectiveName: string): void;
    linkifyObject(nodeIndex: number): Promise<Element | null>;
}
