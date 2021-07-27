// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
// This enum-like const object serves as the authoritative registry for all the
// adorners available.
export const AdornerRegistry = {
    GRID: {
        name: 'grid',
        category: "Layout" /* LAYOUT */,
        enabledByDefault: true,
    },
    FLEX: {
        name: 'flex',
        category: "Layout" /* LAYOUT */,
        enabledByDefault: true,
    },
    AD: {
        name: 'ad',
        category: "Security" /* SECURITY */,
        enabledByDefault: true,
    },
    SCROLL_SNAP: {
        name: 'scroll-snap',
        category: "Layout" /* LAYOUT */,
        enabledByDefault: true,
    },
};
export const DefaultAdornerSettings = Object.values(AdornerRegistry).map(({ name, enabledByDefault }) => ({
    adorner: name,
    isEnabled: enabledByDefault,
}));
export class AdornerManager {
    adornerSettings = new Map();
    settingStore;
    constructor(settingStore) {
        this.settingStore = settingStore;
        this.syncSettings();
    }
    updateSettings(settings) {
        this.adornerSettings = settings;
        this.persistCurrentSettings();
    }
    getSettings() {
        return this.adornerSettings;
    }
    isAdornerEnabled(adornerText) {
        return this.adornerSettings.get(adornerText) || false;
    }
    persistCurrentSettings() {
        const settingList = [];
        for (const [adorner, isEnabled] of this.adornerSettings) {
            settingList.push({ adorner, isEnabled });
        }
        this.settingStore.set(settingList);
    }
    loadSettings() {
        const settingList = this.settingStore.get();
        for (const setting of settingList) {
            this.adornerSettings.set(setting.adorner, setting.isEnabled);
        }
    }
    syncSettings() {
        this.loadSettings();
        // Prune outdated adorners and add new ones to the persistence.
        const outdatedAdorners = new Set(this.adornerSettings.keys());
        for (const { adorner, isEnabled } of DefaultAdornerSettings) {
            outdatedAdorners.delete(adorner);
            if (!this.adornerSettings.has(adorner)) {
                this.adornerSettings.set(adorner, isEnabled);
            }
        }
        for (const outdatedAdorner of outdatedAdorners) {
            this.adornerSettings.delete(outdatedAdorner);
        }
        this.persistCurrentSettings();
    }
}
//# sourceMappingURL=AdornerManager.js.map