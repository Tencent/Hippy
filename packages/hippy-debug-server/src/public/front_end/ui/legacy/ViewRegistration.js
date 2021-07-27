// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Platform from '../../core/platform/platform.js';
import * as Root from '../../core/root/root.js';
import { PreRegisteredView } from './ViewManager.js';
const registeredViewExtensions = [];
const viewIdSet = new Set();
export function registerViewExtension(registration) {
    const viewId = registration.id;
    Platform.DCHECK(() => !viewIdSet.has(viewId), `Duplicate view id '${viewId}'`);
    viewIdSet.add(viewId);
    registeredViewExtensions.push(new PreRegisteredView(registration));
}
export function getRegisteredViewExtensions() {
    return registeredViewExtensions.filter(view => Root.Runtime.Runtime.isDescriptorEnabled({ experiment: view.experiment(), condition: view.condition() }));
}
export function maybeRemoveViewExtension(viewId) {
    const viewIndex = registeredViewExtensions.findIndex(view => view.viewId() === viewId);
    if (viewIndex < 0 || !viewIdSet.delete(viewId)) {
        return false;
    }
    registeredViewExtensions.splice(viewIndex, 1);
    return true;
}
const registeredLocationResolvers = [];
const viewLocationNameSet = new Set();
export function registerLocationResolver(registration) {
    const locationName = registration.name;
    if (viewLocationNameSet.has(locationName)) {
        throw new Error(`Duplicate view location name registration '${locationName}'`);
    }
    viewLocationNameSet.add(locationName);
    registeredLocationResolvers.push(registration);
}
export function getRegisteredLocationResolvers() {
    return registeredLocationResolvers;
}
// TODO(crbug.com/1181019)
export const ViewLocationCategoryValues = {
    ELEMENTS: 'Elements',
    DRAWER: 'Drawer',
    DRAWER_SIDEBAR: 'Drawer sidebar',
    PANEL: 'Panel',
    NETWORK: 'Network',
    SETTINGS: 'Settings',
    SOURCES: 'Sources',
};
//# sourceMappingURL=ViewRegistration.js.map