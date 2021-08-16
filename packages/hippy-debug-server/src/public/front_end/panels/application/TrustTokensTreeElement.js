// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../../core/i18n/i18n.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
import { ApplicationPanelTreeElement } from './ApplicationPanelTreeElement.js';
import * as ApplicationComponents from './components/components.js';
const UIStrings = {
    /**
    *@description Hover text for an info icon in the Trust Token panel
    */
    trustTokens: 'Trust Tokens',
};
const str_ = i18n.i18n.registerUIStrings('panels/application/TrustTokensTreeElement.ts', UIStrings);
export const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
/** Fetch the Trust Token data regularly from the backend while the panel is open */
const REFRESH_INTERVAL_MS = 1000;
export class TrustTokensTreeElement extends ApplicationPanelTreeElement {
    view;
    constructor(storagePanel) {
        super(storagePanel, i18nString(UIStrings.trustTokens), false);
        const icon = UI.Icon.Icon.create('mediumicon-database', 'resource-tree-item');
        this.setLeadingIcons([icon]);
    }
    get itemURL() {
        return 'trustTokens://';
    }
    onselect(selectedByUser) {
        super.onselect(selectedByUser);
        if (!this.view) {
            this.view = new TrustTokensViewWidgetWrapper();
        }
        this.showView(this.view);
        return false;
    }
}
export class TrustTokensViewWidgetWrapper extends UI.ThrottledWidget.ThrottledWidget {
    trustTokensView = new ApplicationComponents.TrustTokensView.TrustTokensView();
    constructor() {
        super(/* isWebComponent */ false, REFRESH_INTERVAL_MS);
        this.contentElement.appendChild(this.trustTokensView);
        this.update();
    }
    async doUpdate() {
        const mainTarget = SDK.TargetManager.TargetManager.instance().mainTarget();
        if (!mainTarget) {
            return;
        }
        const { tokens } = await mainTarget.storageAgent().invoke_getTrustTokens();
        this.trustTokensView.data = {
            tokens,
            deleteClickHandler: (issuer) => {
                mainTarget.storageAgent().invoke_clearTrustTokens({ issuerOrigin: issuer });
            },
        };
        this.update();
    }
}
//# sourceMappingURL=TrustTokensTreeElement.js.map