// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../../core/common/common.js';
export class ProfileHeader extends Common.ObjectWrapper.ObjectWrapper {
    _profileType;
    title;
    uid;
    _fromFile;
    tempFile;
    constructor(profileType, title) {
        super();
        this._profileType = profileType;
        this.title = title;
        this.uid = profileType.incrementProfileUid();
        this._fromFile = false;
        this.tempFile = null;
    }
    setTitle(title) {
        this.title = title;
        this.dispatchEventToListeners(Events.ProfileTitleChanged, this);
    }
    profileType() {
        return this._profileType;
    }
    updateStatus(subtitle, wait) {
        this.dispatchEventToListeners(Events.UpdateStatus, new StatusUpdate(subtitle, wait));
    }
    /**
     * Must be implemented by subclasses.
     */
    createSidebarTreeElement(_dataDisplayDelegate) {
        throw new Error('Not implemented.');
    }
    createView(_dataDisplayDelegate) {
        throw new Error('Not implemented.');
    }
    removeTempFile() {
        if (this.tempFile) {
            this.tempFile.remove();
        }
    }
    dispose() {
    }
    canSaveToFile() {
        return false;
    }
    saveToFile() {
        throw new Error('Not implemented.');
    }
    loadFromFile(_file) {
        throw new Error('Not implemented.');
    }
    fromFile() {
        return this._fromFile;
    }
    setFromFile() {
        this._fromFile = true;
    }
    setProfile(_profile) {
    }
}
export class StatusUpdate {
    subtitle;
    wait;
    constructor(subtitle, wait) {
        this.subtitle = subtitle;
        this.wait = wait;
    }
}
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var Events;
(function (Events) {
    Events["UpdateStatus"] = "UpdateStatus";
    Events["ProfileReceived"] = "ProfileReceived";
    Events["ProfileTitleChanged"] = "ProfileTitleChanged";
})(Events || (Events = {}));
export class ProfileType extends Common.ObjectWrapper.ObjectWrapper {
    _id;
    _name;
    _profiles;
    _profileBeingRecorded;
    _nextProfileUid;
    constructor(id, name) {
        super();
        this._id = id;
        this._name = name;
        this._profiles = [];
        this._profileBeingRecorded = null;
        this._nextProfileUid = 1;
        if (!window.opener) {
            window.addEventListener('unload', this._clearTempStorage.bind(this), false);
        }
    }
    typeName() {
        return '';
    }
    nextProfileUid() {
        return this._nextProfileUid;
    }
    incrementProfileUid() {
        return this._nextProfileUid++;
    }
    hasTemporaryView() {
        return false;
    }
    fileExtension() {
        return null;
    }
    get buttonTooltip() {
        return '';
    }
    get id() {
        return this._id;
    }
    get treeItemTitle() {
        return this._name;
    }
    get name() {
        return this._name;
    }
    buttonClicked() {
        return false;
    }
    get description() {
        return '';
    }
    isInstantProfile() {
        return false;
    }
    isEnabled() {
        return true;
    }
    getProfiles() {
        function isFinished(profile) {
            return this._profileBeingRecorded !== profile;
        }
        return this._profiles.filter(isFinished.bind(this));
    }
    customContent() {
        return null;
    }
    setCustomContentEnabled(_enable) {
    }
    getProfile(uid) {
        for (let i = 0; i < this._profiles.length; ++i) {
            if (this._profiles[i].uid === uid) {
                return this._profiles[i];
            }
        }
        return null;
    }
    loadFromFile(file) {
        let name = file.name;
        const fileExtension = this.fileExtension();
        if (fileExtension && name.endsWith(fileExtension)) {
            name = name.substr(0, name.length - fileExtension.length);
        }
        const profile = this.createProfileLoadedFromFile(name);
        profile.setFromFile();
        this.setProfileBeingRecorded(profile);
        this.addProfile(profile);
        return profile.loadFromFile(file);
    }
    addProfile(profile) {
        this._profiles.push(profile);
        this.dispatchEventToListeners(ProfileEvents.AddProfileHeader, profile);
    }
    removeProfile(profile) {
        const index = this._profiles.indexOf(profile);
        if (index === -1) {
            return;
        }
        this._profiles.splice(index, 1);
        this._disposeProfile(profile);
    }
    _clearTempStorage() {
        for (let i = 0; i < this._profiles.length; ++i) {
            this._profiles[i].removeTempFile();
        }
    }
    profileBeingRecorded() {
        return this._profileBeingRecorded;
    }
    setProfileBeingRecorded(profile) {
        this._profileBeingRecorded = profile;
    }
    profileBeingRecordedRemoved() {
    }
    reset() {
        for (const profile of this._profiles.slice()) {
            this._disposeProfile(profile);
        }
        this._profiles = [];
        this._nextProfileUid = 1;
    }
    _disposeProfile(profile) {
        this.dispatchEventToListeners(ProfileEvents.RemoveProfileHeader, profile);
        profile.dispose();
        if (this._profileBeingRecorded === profile) {
            this.profileBeingRecordedRemoved();
            this.setProfileBeingRecorded(null);
        }
    }
}
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var ProfileEvents;
(function (ProfileEvents) {
    ProfileEvents["AddProfileHeader"] = "add-profile-header";
    ProfileEvents["ProfileComplete"] = "profile-complete";
    ProfileEvents["RemoveProfileHeader"] = "remove-profile-header";
    ProfileEvents["ViewUpdated"] = "view-updated";
})(ProfileEvents || (ProfileEvents = {}));
//# sourceMappingURL=ProfileHeader.js.map