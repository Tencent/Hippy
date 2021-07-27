// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../../core/i18n/i18n.js';
import { AffectedResourcesView } from './AffectedResourcesView.js';
const UIStrings = {
    /**
    *@description Noun for singular or plural network requests. Label for the affected resources section in the issue view.
    */
    nRequests: '{n, plural, =1 {# request} other {# requests}}',
    /**
    *@description Noun for a singular network request. Label for a column in the affected resources table in the issue view.
    */
    requestC: 'Request',
    /**
    *@description Noun for a singular parent frame. Label for a column in the affected resources table in the issue view.
    */
    parentFrame: 'Parent Frame',
    /**
    *@description Noun for a singular resource that was blocked (an example for a blocked resource would be a frame). Label for a column in the affected resources table in the issue view.
    */
    blockedResource: 'Blocked Resource',
};
const str_ = i18n.i18n.registerUIStrings('panels/issues/AffectedBlockedByResponseView.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class AffectedBlockedByResponseView extends AffectedResourcesView {
    issue;
    constructor(parent, issue) {
        super(parent);
        this.issue = issue;
    }
    appendDetails(details) {
        const header = document.createElement('tr');
        this.appendColumnTitle(header, i18nString(UIStrings.requestC));
        this.appendColumnTitle(header, i18nString(UIStrings.parentFrame));
        this.appendColumnTitle(header, i18nString(UIStrings.blockedResource));
        this.affectedResources.appendChild(header);
        let count = 0;
        for (const detail of details) {
            this.appendDetail(detail);
            count++;
        }
        this.updateAffectedResourceCount(count);
    }
    getResourceNameWithCount(count) {
        return i18nString(UIStrings.nRequests, { n: count });
    }
    appendDetail(details) {
        const element = document.createElement('tr');
        element.classList.add('affected-resource-row');
        const requestCell = this.createRequestCell(details.request);
        element.appendChild(requestCell);
        if (details.parentFrame) {
            const frameUrl = this.createFrameCell(details.parentFrame.frameId, this.issue);
            element.appendChild(frameUrl);
        }
        else {
            element.appendChild(document.createElement('td'));
        }
        if (details.blockedFrame) {
            const frameUrl = this.createFrameCell(details.blockedFrame.frameId, this.issue);
            element.appendChild(frameUrl);
        }
        else {
            element.appendChild(document.createElement('td'));
        }
        this.affectedResources.appendChild(element);
    }
    update() {
        this.clear();
        this.appendDetails(this.issue.getBlockedByResponseDetails());
    }
}
//# sourceMappingURL=AffectedBlockedByResponseView.js.map