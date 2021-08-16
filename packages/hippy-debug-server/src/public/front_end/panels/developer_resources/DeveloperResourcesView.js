// Copyright (c) 2016 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
import { DeveloperResourcesListView } from './DeveloperResourcesListView.js';
const UIStrings = {
    /**
    *@description Placeholder for a search field in a toolbar
    */
    enterTextToSearchTheUrlAndError: 'Enter text to search the URL and Error columns',
    /**
    * @description Tooltip for a checkbox in the toolbar of the developer resources view. The
    * inspected target is the webpage that DevTools is debugging/inspecting/attached to.
    */
    loadHttpsDeveloperResources: 'Load `HTTP(S)` developer resources through the inspected target',
    /**
    * @description Text for a checkbox in the toolbar of the developer resources view. The target is
    * the webpage that DevTools is debugging/inspecting/attached to. This setting makes it so
    * developer resources are requested from the webpage itself, and not from the DevTools
    * application.
    */
    enableLoadingThroughTarget: 'Enable loading through target',
    /**
     *@description Text for resources load status
     *@example {1} PH1
     *@example {1} PH2
     */
    resourcesCurrentlyLoading: '{PH1} resources, {PH2} currently loading',
    /**
     * @description Status text that appears to tell the developer how many resources were loaded in
     * total. Resources are files related to the webpage.
     */
    resources: '{n, plural, =1 {# resource} other {# resources}}',
};
const str_ = i18n.i18n.registerUIStrings('panels/developer_resources/DeveloperResourcesView.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
let developerResourcesViewInstance;
export class DeveloperResourcesView extends UI.Widget.VBox {
    _textFilterRegExp;
    _filterInput;
    _coverageResultsElement;
    _listView;
    _statusToolbarElement;
    _statusMessageElement;
    _throttler;
    _loader;
    constructor() {
        super(true);
        this.registerRequiredCSS('panels/developer_resources/developerResourcesView.css', { enableLegacyPatching: false });
        const toolbarContainer = this.contentElement.createChild('div', 'developer-resource-view-toolbar-container');
        const toolbar = new UI.Toolbar.Toolbar('developer-resource-view-toolbar', toolbarContainer);
        this._textFilterRegExp = null;
        const accessiblePlaceholder = ''; // Indicates that ToobarInput should use the placeholder as ARIA label.
        this._filterInput =
            new UI.Toolbar.ToolbarInput(i18nString(UIStrings.enterTextToSearchTheUrlAndError), accessiblePlaceholder, 1);
        this._filterInput.addEventListener(UI.Toolbar.ToolbarInput.Event.TextChanged, this._onFilterChanged, this);
        toolbar.appendToolbarItem(this._filterInput);
        const loadThroughTarget = SDK.PageResourceLoader.getLoadThroughTargetSetting();
        const loadThroughTargetCheckbox = new UI.Toolbar.ToolbarSettingCheckbox(loadThroughTarget, i18nString(UIStrings.loadHttpsDeveloperResources), i18nString(UIStrings.enableLoadingThroughTarget));
        toolbar.appendToolbarItem(loadThroughTargetCheckbox);
        this._coverageResultsElement = this.contentElement.createChild('div', 'developer-resource-view-results');
        this._listView = new DeveloperResourcesListView(this._isVisible.bind(this));
        this._listView.show(this._coverageResultsElement);
        this._statusToolbarElement = this.contentElement.createChild('div', 'developer-resource-view-toolbar-summary');
        this._statusMessageElement = this._statusToolbarElement.createChild('div', 'developer-resource-view-message');
        this._throttler = new Common.Throttler.Throttler(100);
        this._loader = SDK.PageResourceLoader.PageResourceLoader.instance();
        this._loader.addEventListener(SDK.PageResourceLoader.Events.Update, this._onUpdate, this);
        this._onUpdate();
    }
    static instance() {
        if (!developerResourcesViewInstance) {
            developerResourcesViewInstance = new DeveloperResourcesView();
        }
        return developerResourcesViewInstance;
    }
    _onUpdate() {
        this._throttler.schedule(this._update.bind(this));
    }
    async _update() {
        this._listView.reset();
        this._listView.update(this._loader.getResourcesLoaded().values());
        this._updateStats();
    }
    _updateStats() {
        const { loading, resources } = this._loader.getNumberOfResources();
        if (loading > 0) {
            this._statusMessageElement.textContent =
                i18nString(UIStrings.resourcesCurrentlyLoading, { PH1: resources, PH2: loading });
        }
        else {
            this._statusMessageElement.textContent = i18nString(UIStrings.resources, { n: resources });
        }
    }
    _isVisible(item) {
        return !this._textFilterRegExp || this._textFilterRegExp.test(item.url) ||
            this._textFilterRegExp.test(item.errorMessage || '');
    }
    /**
     *
     */
    _onFilterChanged() {
        if (!this._listView) {
            return;
        }
        const text = this._filterInput.value();
        this._textFilterRegExp = text ? createPlainTextSearchRegex(text, 'i') : null;
        this._listView.updateFilterAndHighlight(this._textFilterRegExp);
        this._updateStats();
    }
}
//# sourceMappingURL=DeveloperResourcesView.js.map