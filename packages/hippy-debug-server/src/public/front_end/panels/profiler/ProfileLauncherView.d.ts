import * as Common from '../../core/common/common.js';
import * as UI from '../../ui/legacy/legacy.js';
import type { ProfileType } from './ProfileHeader.js';
import type { ProfilesPanel } from './ProfilesPanel.js';
export declare class ProfileLauncherView extends UI.Widget.VBox {
    _panel: ProfilesPanel;
    _contentElement: HTMLElement;
    _selectedProfileTypeSetting: Common.Settings.Setting<string>;
    _profileTypeHeaderElement: HTMLElement;
    _profileTypeSelectorForm: HTMLElement;
    _controlButton: HTMLButtonElement;
    _loadButton: HTMLButtonElement;
    _recordButtonEnabled: boolean;
    _typeIdToOptionElementAndProfileType: Map<string, {
        optionElement: HTMLInputElement;
        profileType: ProfileType;
    }>;
    _isProfiling?: boolean;
    _isInstantProfile?: boolean;
    _isEnabled?: boolean;
    constructor(profilesPanel: ProfilesPanel);
    _loadButtonClicked(): void;
    _updateControls(): void;
    profileStarted(): void;
    profileFinished(): void;
    updateProfileType(profileType: ProfileType, recordButtonEnabled: boolean): void;
    addProfileType(profileType: ProfileType): void;
    restoreSelectedProfileType(): void;
    _controlButtonClicked(): void;
    _profileTypeChanged(profileType: ProfileType): void;
}
export declare enum Events {
    ProfileTypeSelected = "ProfileTypeSelected"
}
