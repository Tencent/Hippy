// Copyright 2019 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../../core/i18n/i18n.js';
import * as Platform from '../../core/platform/platform.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Bindings from '../../models/bindings/bindings.js';
import * as DataGrid from '../../ui/legacy/components/data_grid/data_grid.js';
import * as UI from '../../ui/legacy/legacy.js';
import { Events } from './BackgroundServiceModel.js'; // eslint-disable-line no-unused-vars
const UIStrings = {
    /**
    *@description Text in Background Service View of the Application panel
    */
    backgroundFetch: 'Background Fetch',
    /**
    *@description Text in Background Service View of the Application panel
    */
    backgroundSync: 'Background Sync',
    /**
    *@description Text in Background Service View of the Application panel
    */
    pushMessaging: 'Push Messaging',
    /**
    *@description Text in Background Service View of the Application panel
    */
    notifications: 'Notifications',
    /**
    *@description Text in Background Service View of the Application panel
    */
    paymentHandler: 'Payment Handler',
    /**
    *@description Text in the Periodic Background Service View of the Application panel
    */
    periodicBackgroundSync: 'Periodic Background Sync',
    /**
    *@description Text to clear content
    */
    clear: 'Clear',
    /**
    *@description Tooltip text that appears when hovering over the largeicon download button in the Background Service View of the Application panel
    */
    saveEvents: 'Save events',
    /**
    *@description Text in Background Service View of the Application panel
    */
    showEventsFromOtherDomains: 'Show events from other domains',
    /**
    *@description Title of an action under the Background Services category that can be invoked through the Command Menu
    */
    stopRecordingEvents: 'Stop recording events',
    /**
    *@description Title of an action under the Background Services category that can be invoked through the Command Menu
    */
    startRecordingEvents: 'Start recording events',
    /**
    *@description Text for timestamps of items
    */
    timestamp: 'Timestamp',
    /**
    *@description Text that refers to some events
    */
    event: 'Event',
    /**
    *@description Text for the origin of something
    */
    origin: 'Origin',
    /**
    *@description Text in Background Service View of the Application panel. The Scope is a URL associated with the Service Worker, which limits which pages/sites the Service Worker operates on.
    */
    swScope: 'Service Worker Scope',
    /**
    *@description Text in Background Service View of the Application panel
    */
    instanceId: 'Instance ID',
    /**
    *@description Text in Application Panel Sidebar of the Application panel
    */
    backgroundServices: 'Background Services',
    /**
    *@description Text that is usually a hyperlink to more documentation
    */
    learnMore: 'Learn more',
    /**
    *@description Text in Background Service View of the Application panel
    */
    selectAnEntryToViewMetadata: 'Select an entry to view metadata',
    /**
    *@description Text in Background Service View of the Application panel
    *@example {Background Fetch} PH1
    */
    recordingSActivity: 'Recording {PH1} activity...',
    /**
    *@description Inform users that DevTools are recording/waiting for events in the Periodic Background Sync tool of the Application panel
    *@example {Background Fetch} PH1
    */
    devtoolsWillRecordAllSActivity: 'DevTools will record all {PH1} activity for up to 3 days, even when closed.',
    /**
    *@description Text in Background Service View of the Application panel
    *@example {record} PH1
    *@example {Ctrl + R} PH2
    */
    clickTheRecordButtonSOrHitSTo: 'Click the record button {PH1} or hit {PH2} to start recording.',
    /**
    *@description Text to show an item is empty
    */
    empty: 'empty',
    /**
    *@description Text in Background Service View of the Application panel
    */
    noMetadataForThisEvent: 'No metadata for this event',
};
const str_ = i18n.i18n.registerUIStrings('panels/application/BackgroundServiceView.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class BackgroundServiceView extends UI.Widget.VBox {
    _serviceName;
    _model;
    _serviceWorkerManager;
    _securityOriginManager;
    _recordAction;
    _recordButton;
    _originCheckbox;
    _saveButton;
    _toolbar;
    _splitWidget;
    _dataGrid;
    _previewPanel;
    _selectedEventNode;
    _preview;
    static getUIString(serviceName) {
        switch (serviceName) {
            case "backgroundFetch" /* BackgroundFetch */:
                return i18nString(UIStrings.backgroundFetch);
            case "backgroundSync" /* BackgroundSync */:
                return i18nString(UIStrings.backgroundSync);
            case "pushMessaging" /* PushMessaging */:
                return i18nString(UIStrings.pushMessaging);
            case "notifications" /* Notifications */:
                return i18nString(UIStrings.notifications);
            case "paymentHandler" /* PaymentHandler */:
                return i18nString(UIStrings.paymentHandler);
            case "periodicBackgroundSync" /* PeriodicBackgroundSync */:
                return i18nString(UIStrings.periodicBackgroundSync);
            default:
                return '';
        }
    }
    constructor(serviceName, model) {
        super(true);
        this.registerRequiredCSS('panels/application/backgroundServiceView.css', { enableLegacyPatching: false });
        this.registerRequiredCSS('ui/legacy/emptyWidget.css', { enableLegacyPatching: false });
        this._serviceName = serviceName;
        this._model = model;
        this._model.addEventListener(Events.RecordingStateChanged, this._onRecordingStateChanged, this);
        this._model.addEventListener(Events.BackgroundServiceEventReceived, this._onEventReceived, this);
        this._model.enable(this._serviceName);
        this._serviceWorkerManager = this._model.target().model(SDK.ServiceWorkerManager.ServiceWorkerManager);
        this._securityOriginManager = this._model.target().model(SDK.SecurityOriginManager.SecurityOriginManager);
        if (!this._securityOriginManager) {
            throw new Error('SecurityOriginManager instance is missing');
        }
        this._securityOriginManager.addEventListener(SDK.SecurityOriginManager.Events.MainSecurityOriginChanged, () => this._onOriginChanged());
        this._recordAction =
            UI.ActionRegistry.ActionRegistry.instance().action('background-service.toggle-recording');
        this._toolbar = new UI.Toolbar.Toolbar('background-service-toolbar', this.contentElement);
        this._setupToolbar();
        /**
         * This will contain the DataGrid for displaying events, and a panel at the bottom for showing
         * extra metadata related to the selected event.
         */
        this._splitWidget = new UI.SplitWidget.SplitWidget(/* isVertical= */ false, /* secondIsSidebar= */ true);
        this._splitWidget.show(this.contentElement);
        this._dataGrid = this._createDataGrid();
        this._previewPanel = new UI.Widget.VBox();
        this._selectedEventNode = null;
        this._preview = null;
        this._splitWidget.setMainWidget(this._dataGrid.asWidget());
        this._splitWidget.setSidebarWidget(this._previewPanel);
        this._showPreview(null);
    }
    /**
     * Creates the toolbar UI element.
     */
    async _setupToolbar() {
        this._recordButton = UI.Toolbar.Toolbar.createActionButton(this._recordAction);
        this._toolbar.appendToolbarItem(this._recordButton);
        const clearButton = new UI.Toolbar.ToolbarButton(i18nString(UIStrings.clear), 'largeicon-clear');
        clearButton.addEventListener(UI.Toolbar.ToolbarButton.Events.Click, () => this._clearEvents());
        this._toolbar.appendToolbarItem(clearButton);
        this._toolbar.appendSeparator();
        this._saveButton = new UI.Toolbar.ToolbarButton(i18nString(UIStrings.saveEvents), 'largeicon-download');
        this._saveButton.addEventListener(UI.Toolbar.ToolbarButton.Events.Click, _event => {
            this._saveToFile();
        });
        this._saveButton.setEnabled(false);
        this._toolbar.appendToolbarItem(this._saveButton);
        this._toolbar.appendSeparator();
        this._originCheckbox = new UI.Toolbar.ToolbarCheckbox(i18nString(UIStrings.showEventsFromOtherDomains), i18nString(UIStrings.showEventsFromOtherDomains), () => this._refreshView());
        this._toolbar.appendToolbarItem(this._originCheckbox);
    }
    /**
     * Displays all available events in the grid.
     */
    _refreshView() {
        this._clearView();
        const events = this._model.getEvents(this._serviceName).filter(event => this._acceptEvent(event));
        for (const event of events) {
            this._addEvent(event);
        }
    }
    /**
     * Clears the grid and panel.
     */
    _clearView() {
        this._selectedEventNode = null;
        this._dataGrid.rootNode().removeChildren();
        this._saveButton.setEnabled(false);
        this._showPreview(null);
    }
    /**
     * Called when the `Toggle Record` button is clicked.
     */
    _toggleRecording() {
        this._model.setRecording(!this._recordButton.toggled(), this._serviceName);
    }
    /**
     * Called when the `Clear` button is clicked.
     */
    _clearEvents() {
        this._model.clearEvents(this._serviceName);
        this._clearView();
    }
    _onRecordingStateChanged(event) {
        const state = event.data;
        if (state.serviceName !== this._serviceName) {
            return;
        }
        if (state.isRecording === this._recordButton.toggled()) {
            return;
        }
        this._recordButton.setToggled(state.isRecording);
        this._updateRecordButtonTooltip();
        this._showPreview(this._selectedEventNode);
    }
    _updateRecordButtonTooltip() {
        const buttonTooltip = this._recordButton.toggled() ? i18nString(UIStrings.stopRecordingEvents) :
            i18nString(UIStrings.startRecordingEvents);
        this._recordButton.setTitle(buttonTooltip, 'background-service.toggle-recording');
    }
    _onEventReceived(event) {
        const serviceEvent = event.data;
        if (!this._acceptEvent(serviceEvent)) {
            return;
        }
        this._addEvent(serviceEvent);
    }
    _onOriginChanged() {
        // No need to refresh the view if we are already showing all events.
        if (this._originCheckbox.checked()) {
            return;
        }
        this._refreshView();
    }
    _addEvent(serviceEvent) {
        const data = this._createEventData(serviceEvent);
        const dataNode = new EventDataNode(data, serviceEvent.eventMetadata);
        this._dataGrid.rootNode().appendChild(dataNode);
        if (this._dataGrid.rootNode().children.length === 1) {
            this._saveButton.setEnabled(true);
            this._showPreview(this._selectedEventNode);
        }
    }
    _createDataGrid() {
        const columns = [
            { id: 'id', title: '#', weight: 1 },
            { id: 'timestamp', title: i18nString(UIStrings.timestamp), weight: 8 },
            { id: 'eventName', title: i18nString(UIStrings.event), weight: 10 },
            { id: 'origin', title: i18nString(UIStrings.origin), weight: 10 },
            { id: 'swScope', title: i18nString(UIStrings.swScope), weight: 5 },
            { id: 'instanceId', title: i18nString(UIStrings.instanceId), weight: 10 },
        ];
        const dataGrid = new DataGrid.DataGrid.DataGridImpl({
            displayName: i18nString(UIStrings.backgroundServices),
            columns,
            editCallback: undefined,
            refreshCallback: undefined,
            deleteCallback: undefined,
        });
        dataGrid.setStriped(true);
        dataGrid.addEventListener(DataGrid.DataGrid.Events.SelectedNode, event => this._showPreview(event.data));
        return dataGrid;
    }
    /**
     * Creates the data object to pass to the DataGrid Node.
     */
    _createEventData(serviceEvent) {
        let swScope = '';
        // Try to get the scope of the Service Worker registration to be more user-friendly.
        const registration = this._serviceWorkerManager ?
            this._serviceWorkerManager.registrations().get(serviceEvent.serviceWorkerRegistrationId) :
            undefined;
        if (registration) {
            swScope = registration.scopeURL.substr(registration.securityOrigin.length);
        }
        return {
            id: this._dataGrid.rootNode().children.length + 1,
            timestamp: UI.UIUtils.formatTimestamp(serviceEvent.timestamp * 1000, /* full= */ true),
            origin: serviceEvent.origin,
            swScope,
            eventName: serviceEvent.eventName,
            instanceId: serviceEvent.instanceId,
        };
    }
    /**
     * Filtration function to know whether event should be shown or not.
     */
    _acceptEvent(event) {
        if (event.service !== this._serviceName) {
            return false;
        }
        if (this._originCheckbox.checked()) {
            return true;
        }
        // Trim the trailing '/'.
        const origin = event.origin.substr(0, event.origin.length - 1);
        return this._securityOriginManager.securityOrigins().includes(origin);
    }
    _createLearnMoreLink() {
        let url = 'https://developer.chrome.com/docs/devtools/javascript/background-services/?utm_source=devtools';
        switch (this._serviceName) {
            case "backgroundFetch" /* BackgroundFetch */:
                url += '#fetch';
                break;
            case "backgroundSync" /* BackgroundSync */:
                url += '#sync';
                break;
            case "pushMessaging" /* PushMessaging */:
                url += '#push';
                break;
            case "notifications" /* Notifications */:
                url += '#notifications';
                break;
            default:
                break;
        }
        return UI.XLink.XLink.create(url, i18nString(UIStrings.learnMore));
    }
    _showPreview(dataNode) {
        if (this._selectedEventNode && this._selectedEventNode === dataNode) {
            return;
        }
        this._selectedEventNode = dataNode;
        if (this._preview) {
            this._preview.detach();
        }
        if (this._selectedEventNode) {
            this._preview = this._selectedEventNode.createPreview();
            this._preview.show(this._previewPanel.contentElement);
            return;
        }
        this._preview = new UI.Widget.VBox();
        this._preview.contentElement.classList.add('background-service-preview', 'fill');
        const centered = this._preview.contentElement.createChild('div');
        if (this._dataGrid.rootNode().children.length) {
            // Inform users that grid entries are clickable.
            centered.createChild('p').textContent = i18nString(UIStrings.selectAnEntryToViewMetadata);
        }
        else if (this._recordButton.toggled()) {
            // Inform users that we are recording/waiting for events.
            const featureName = BackgroundServiceView.getUIString(this._serviceName);
            centered.createChild('p').textContent = i18nString(UIStrings.recordingSActivity, { PH1: featureName });
            centered.createChild('p').textContent = i18nString(UIStrings.devtoolsWillRecordAllSActivity, { PH1: featureName });
        }
        else {
            const landingRecordButton = UI.Toolbar.Toolbar.createActionButton(this._recordAction);
            const recordKey = document.createElement('b');
            recordKey.classList.add('background-service-shortcut');
            recordKey.textContent = UI.ShortcutRegistry.ShortcutRegistry.instance()
                .shortcutsForAction('background-service.toggle-recording')[0]
                .title();
            const inlineButton = UI.UIUtils.createInlineButton(landingRecordButton);
            inlineButton.classList.add('background-service-record-inline-button');
            centered.createChild('p').appendChild(i18n.i18n.getFormatLocalizedString(str_, UIStrings.clickTheRecordButtonSOrHitSTo, { PH1: inlineButton, PH2: recordKey }));
            centered.appendChild(this._createLearnMoreLink());
        }
        this._preview.show(this._previewPanel.contentElement);
    }
    /**
     * Saves all currently displayed events in a file (JSON format).
     */
    async _saveToFile() {
        const fileName = `${this._serviceName}-${Platform.DateUtilities.toISO8601Compact(new Date())}.json`;
        const stream = new Bindings.FileUtils.FileOutputStream();
        const accepted = await stream.open(fileName);
        if (!accepted) {
            return;
        }
        const events = this._model.getEvents(this._serviceName).filter(event => this._acceptEvent(event));
        await stream.write(JSON.stringify(events, undefined, 2));
        stream.close();
    }
}
export class EventDataNode extends DataGrid.DataGrid.DataGridNode {
    _eventMetadata;
    constructor(data, eventMetadata) {
        super(data);
        this._eventMetadata = eventMetadata.sort((m1, m2) => Platform.StringUtilities.compare(m1.key, m2.key));
    }
    createPreview() {
        const preview = new UI.Widget.VBox();
        preview.element.classList.add('background-service-metadata');
        for (const entry of this._eventMetadata) {
            const div = document.createElement('div');
            div.classList.add('background-service-metadata-entry');
            div.createChild('div', 'background-service-metadata-name').textContent = entry.key + ': ';
            if (entry.value) {
                div.createChild('div', 'background-service-metadata-value source-code').textContent = entry.value;
            }
            else {
                div.createChild('div', 'background-service-metadata-value background-service-empty-value').textContent =
                    i18nString(UIStrings.empty);
            }
            preview.element.appendChild(div);
        }
        if (!preview.element.children.length) {
            const div = document.createElement('div');
            div.classList.add('background-service-metadata-entry');
            div.createChild('div', 'background-service-metadata-name background-service-empty-value').textContent =
                i18nString(UIStrings.noMetadataForThisEvent);
            preview.element.appendChild(div);
        }
        return preview;
    }
}
let actionDelegateInstance;
export class ActionDelegate {
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!actionDelegateInstance || forceNew) {
            actionDelegateInstance = new ActionDelegate();
        }
        return actionDelegateInstance;
    }
    handleAction(context, actionId) {
        const view = context.flavor(BackgroundServiceView);
        switch (actionId) {
            case 'background-service.toggle-recording': {
                if (!view) {
                    throw new Error('BackgroundServiceView instance is missing');
                }
                view._toggleRecording();
                return true;
            }
        }
        return false;
    }
}
//# sourceMappingURL=BackgroundServiceView.js.map