// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../../core/i18n/i18n.js';
import * as Platform from '../../core/platform/platform.js';
import * as SDK from '../../core/sdk/sdk.js';
import { AffectedElementsView } from './AffectedElementsView.js';
export class AffectedElementsWithLowContrastView extends AffectedElementsView {
    aggregateIssue;
    runningUpdatePromise = Promise.resolve();
    constructor(parent, issue) {
        super(parent, issue);
        this.aggregateIssue = issue;
    }
    update() {
        // Ensure that doUpdate is invoked atomically by serializing the update calls
        // because it's not re-entrace safe.
        this.runningUpdatePromise = this.runningUpdatePromise.then(this.doUpdate.bind(this));
    }
    async doUpdate() {
        this.clear();
        await this.appendLowContrastElements(this.aggregateIssue.getLowContrastIssues());
    }
    async appendLowContrastElement(issue) {
        const row = document.createElement('tr');
        row.classList.add('affected-resource-low-contrast');
        const details = issue.details();
        // TODO: Use the correct target once we report LowContrastIssues for frames
        // besides the main frame.
        const target = SDK.TargetManager.TargetManager.instance().mainTarget();
        row.appendChild(await this.renderElementCell({ nodeName: details.violatingNodeSelector, backendNodeId: details.violatingNodeId, target }));
        this.appendIssueDetailCell(row, String(Platform.NumberUtilities.floor(details.contrastRatio, 2)));
        this.appendIssueDetailCell(row, String(details.thresholdAA));
        this.appendIssueDetailCell(row, String(details.thresholdAAA));
        this.appendIssueDetailCell(row, details.fontSize);
        this.appendIssueDetailCell(row, details.fontWeight);
        this.affectedResources.appendChild(row);
    }
    async appendLowContrastElements(issues) {
        const header = document.createElement('tr');
        this.appendColumnTitle(header, i18nString(UIStrings.element));
        this.appendColumnTitle(header, i18nString(UIStrings.contrastRatio));
        this.appendColumnTitle(header, i18nString(UIStrings.minimumAA));
        this.appendColumnTitle(header, i18nString(UIStrings.minimumAAA));
        this.appendColumnTitle(header, i18nString(UIStrings.textSize));
        this.appendColumnTitle(header, i18nString(UIStrings.textWeight));
        this.affectedResources.appendChild(header);
        let count = 0;
        for (const lowContrastIssue of issues) {
            count++;
            await this.appendLowContrastElement(lowContrastIssue);
        }
        this.updateAffectedResourceCount(count);
    }
}
const UIStrings = {
    /**
    *@description Column title for the element column in the low contrast issue view
    */
    element: 'Element',
    /**
    *@description Column title for the contrast ratio column in the low contrast issue view
    */
    contrastRatio: 'Contrast ratio',
    /**
    *@description Column title for the minimum AA contrast ratio column in the low contrast issue view
    */
    minimumAA: 'Minimum AA ratio',
    /**
    *@description Column title for the minimum AAA contrast ratio column in the low contrast issue view
    */
    minimumAAA: 'Minimum AAA ratio',
    /**
    *@description Column title for the text size column in the low contrast issue view
    */
    textSize: 'Text size',
    /**
    *@description Column title for the text weight column in the low contrast issue view
    */
    textWeight: 'Text weight',
};
const str_ = i18n.i18n.registerUIStrings('panels/issues/AffectedElementsWithLowContrastView.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
//# sourceMappingURL=AffectedElementsWithLowContrastView.js.map