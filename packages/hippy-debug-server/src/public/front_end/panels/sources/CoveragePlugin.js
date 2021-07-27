// Copyright 2019 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as i18n from '../../core/i18n/i18n.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Formatter from '../../models/formatter/formatter.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as Coverage from '../coverage/coverage.js';
import { Plugin } from './Plugin.js';
const UIStrings = {
    /**
    *@description Text for Coverage Status Bar Item in Sources Panel
    */
    clickToShowCoveragePanel: 'Click to show Coverage Panel',
    /**
    *@description Text for Coverage Status Bar Item in Sources Panel
    */
    showDetails: 'Show Details',
    /**
    *@description Text to show in the status bar if coverage data is available
    *@example {12.3} PH1
    */
    coverageS: 'Coverage: {PH1} %',
    /**
    *@description Text to be shown in the status bar if no coverage data is available
    */
    coverageNa: 'Coverage: n/a',
};
const str_ = i18n.i18n.registerUIStrings('panels/sources/CoveragePlugin.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class CoveragePlugin extends Plugin {
    uiSourceCode;
    originalSourceCode;
    infoInToolbar;
    model;
    coverage;
    constructor(_textEditor, uiSourceCode) {
        super();
        this.uiSourceCode = uiSourceCode;
        this.originalSourceCode =
            Formatter.SourceFormatter.SourceFormatter.instance().getOriginalUISourceCode(this.uiSourceCode);
        this.infoInToolbar = new UI.Toolbar.ToolbarButton(i18nString(UIStrings.clickToShowCoveragePanel));
        this.infoInToolbar.setSecondary();
        this.infoInToolbar.addEventListener(UI.Toolbar.ToolbarButton.Events.Click, () => {
            UI.ViewManager.ViewManager.instance().showView('coverage');
        });
        const mainTarget = SDK.TargetManager.TargetManager.instance().mainTarget();
        if (mainTarget) {
            this.model = mainTarget.model(Coverage.CoverageModel.CoverageModel);
            if (this.model) {
                this.model.addEventListener(Coverage.CoverageModel.Events.CoverageReset, this.handleReset, this);
                this.coverage = this.model.getCoverageForUrl(this.originalSourceCode.url());
                if (this.coverage) {
                    this.coverage.addEventListener(Coverage.CoverageModel.URLCoverageInfo.Events.SizesChanged, this.handleCoverageSizesChanged, this);
                }
            }
        }
        this.updateStats();
    }
    dispose() {
        if (this.coverage) {
            this.coverage.removeEventListener(Coverage.CoverageModel.URLCoverageInfo.Events.SizesChanged, this.handleCoverageSizesChanged, this);
        }
        if (this.model) {
            this.model.removeEventListener(Coverage.CoverageModel.Events.CoverageReset, this.handleReset, this);
        }
    }
    static accepts(uiSourceCode) {
        return uiSourceCode.contentType().isDocumentOrScriptOrStyleSheet();
    }
    handleReset() {
        this.coverage = null;
        this.updateStats();
    }
    handleCoverageSizesChanged() {
        this.updateStats();
    }
    updateStats() {
        if (this.coverage) {
            this.infoInToolbar.setTitle(i18nString(UIStrings.showDetails));
            this.infoInToolbar.setText(i18nString(UIStrings.coverageS, { PH1: this.coverage.usedPercentage().toFixed(1) }));
        }
        else {
            this.infoInToolbar.setTitle(i18nString(UIStrings.clickToShowCoveragePanel));
            this.infoInToolbar.setText(i18nString(UIStrings.coverageNa));
        }
    }
    async rightToolbarItems() {
        return [this.infoInToolbar];
    }
}
//# sourceMappingURL=CoveragePlugin.js.map