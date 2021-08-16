// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as i18n from '../../../../core/i18n/i18n.js';
const UIStrings = {
    /**
    *@description Text in Network Priorities of the Performance panel
    */
    lowest: 'Lowest',
    /**
    *@description Text in Network Priorities of the Performance panel
    */
    low: 'Low',
    /**
    *@description Text in Network Priorities of the Performance panel
    */
    medium: 'Medium',
    /**
    *@description Text in Network Priorities of the Performance panel
    */
    high: 'High',
    /**
    *@description Text in Network Priorities of the Performance panel
    */
    highest: 'Highest',
};
const str_ = i18n.i18n.registerUIStrings('ui/legacy/components/perf_ui/NetworkPriorities.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export function uiLabelForNetworkPriority(priority) {
    return priorityUILabelMap().get(priority) || '';
}
const uiLabelToPriorityMapInstance = new Map();
export function uiLabelToNetworkPriority(priorityLabel) {
    if (uiLabelToPriorityMapInstance.size === 0) {
        priorityUILabelMap().forEach((value, key) => uiLabelToPriorityMapInstance.set(value, key));
    }
    return uiLabelToPriorityMapInstance.get(priorityLabel) || '';
}
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
// eslint-disable-next-line @typescript-eslint/naming-convention
let _priorityUILabelMapInstance;
export function priorityUILabelMap() {
    if (_priorityUILabelMapInstance) {
        return _priorityUILabelMapInstance;
    }
    const map = new Map();
    map.set("VeryLow" /* VeryLow */, i18nString(UIStrings.lowest));
    map.set("Low" /* Low */, i18nString(UIStrings.low));
    map.set("Medium" /* Medium */, i18nString(UIStrings.medium));
    map.set("High" /* High */, i18nString(UIStrings.high));
    map.set("VeryHigh" /* VeryHigh */, i18nString(UIStrings.highest));
    _priorityUILabelMapInstance = map;
    return map;
}
const networkPriorityWeights = new Map();
export function networkPriorityWeight(priority) {
    if (networkPriorityWeights.size === 0) {
        networkPriorityWeights.set("VeryLow" /* VeryLow */, 1);
        networkPriorityWeights.set("Low" /* Low */, 2);
        networkPriorityWeights.set("Medium" /* Medium */, 3);
        networkPriorityWeights.set("High" /* High */, 4);
        networkPriorityWeights.set("VeryHigh" /* VeryHigh */, 5);
    }
    return networkPriorityWeights.get(priority) || 0;
}
//# sourceMappingURL=NetworkPriorities.js.map