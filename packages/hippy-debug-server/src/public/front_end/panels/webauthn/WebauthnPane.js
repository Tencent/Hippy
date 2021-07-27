// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as Host from '../../core/host/host.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as DataGrid from '../../ui/legacy/components/data_grid/data_grid.js';
import * as UI from '../../ui/legacy/legacy.js';
const UIStrings = {
    /**
    *@description Label for button that allows user to download the private key related to a credential.
    */
    export: 'Export',
    /**
    *@description Label for an item to remove something
    */
    remove: 'Remove',
    /**
    *@description Label for empty credentials table.
    *@example {navigator.credentials.create()} PH1
    */
    noCredentialsTryCallingSFromYour: 'No credentials. Try calling {PH1} from your website.',
    /**
    *@description Label for checkbox to toggle the virtual authenticator environment allowing user to interact with software-based virtual authenticators.
    */
    enableVirtualAuthenticator: 'Enable virtual authenticator environment',
    /**
    *@description Label for ID field for credentials.
    */
    id: 'ID',
    /**
    *@description Label for field that describes whether a credential is a resident credential.
    */
    isResident: 'Is Resident',
    /**
    *@description Label for credential field that represents the Relying Party ID that the credential is scoped to.
    */
    rpId: 'RP ID',
    /**
    *@description Label for a column in a table. A field/unique ID that represents the user a credential is mapped to.
    */
    userHandle: 'User Handle',
    /**
    *@description Label for signature counter field for credentials which represents the number of successful assertions.
    * See https://w3c.github.io/webauthn/#signature-counter.
    */
    signCount: 'Signature Count',
    /**
    *@description Label for column with actions for credentials.
    */
    actions: 'Actions',
    /**
    *@description Title for the table that holds the credentials that a authenticator has registered.
    */
    credentials: 'Credentials',
    /**
    *@description Label for the learn more link that is shown before the virtual environment is enabled.
    */
    useWebauthnForPhishingresistant: 'Use WebAuthn for phishing-resistant authentication',
    /**
    *@description Text that is usually a hyperlink to more documentation
    */
    learnMore: 'Learn more',
    /**
    *@description Title for section of interface that allows user to add a new virtual authenticator.
    */
    newAuthenticator: 'New authenticator',
    /**
    *@description Text for security or network protocol
    */
    protocol: 'Protocol',
    /**
    *@description Label for input to select which transport option to use on virtual authenticators, e.g. USB or Bluetooth.
    */
    transport: 'Transport',
    /**
    *@description Label for checkbox that toggles resident key support on virtual authenticators.
    */
    supportsResidentKeys: 'Supports resident keys',
    /**
    *@description Text to add something
    */
    add: 'Add',
    /**
    *@description Label for button to add a new virtual authenticator.
    */
    addAuthenticator: 'Add authenticator',
    /**
    *@description Label for radio button that toggles whether an authenticator is active.
    */
    active: 'Active',
    /**
    *@description Title for button that enables user to customize name of authenticator.
    */
    editName: 'Edit name',
    /**
    *@description Title for button that enables user to save name of authenticator after editing it.
    */
    saveName: 'Save name',
    /**
    *@description Title for a user-added virtual authenticator which is uniquely identified with its AUTHENTICATORID.
    *@example {8c7873be-0b13-4996-a794-1521331bbd96} PH1
    */
    authenticatorS: 'Authenticator {PH1}',
    /**
    *@description Name for generated file which user can download. A private key is a secret code which enables encoding and decoding of a credential. .pem is the file extension.
    */
    privateKeypem: 'Private key.pem',
    /**
    *@description Label for field that holds an authenticator's universally unique identifier (UUID).
    */
    uuid: 'UUID',
    /**
    *@description Label for checkbox that toggles user verification support on virtual authenticators.
    */
    supportsUserVerification: 'Supports user verification',
    /**
    *@description Text in Timeline indicating that input has happened recently
    */
    yes: 'Yes',
    /**
    *@description Text in Timeline indicating that input has not happened recently
    */
    no: 'No',
    /**
    *@description Title of radio button that sets an authenticator as active.
    *@example {Authenticator ABCDEF} PH1
    */
    setSAsTheActiveAuthenticator: 'Set {PH1} as the active authenticator',
};
const str_ = i18n.i18n.registerUIStrings('panels/webauthn/WebauthnPane.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
const TIMEOUT = 1000;
class DataGridNode extends DataGrid.DataGrid.DataGridNode {
    constructor(credential) {
        super(credential);
    }
    nodeSelfHeight() {
        return 24;
    }
    createCell(columnId) {
        const cell = super.createCell(columnId);
        UI.Tooltip.Tooltip.install(cell, cell.textContent || '');
        if (columnId !== 'actions') {
            return cell;
        }
        const exportButton = UI.UIUtils.createTextButton(i18nString(UIStrings.export), () => {
            if (this.dataGrid) {
                this.dataGrid.dispatchEventToListeners("ExportCredential" /* ExportCredential */, this.data);
            }
        });
        cell.appendChild(exportButton);
        const removeButton = UI.UIUtils.createTextButton(i18nString(UIStrings.remove), () => {
            if (this.dataGrid) {
                this.dataGrid.dispatchEventToListeners("RemoveCredential" /* RemoveCredential */, this.data);
            }
        });
        cell.appendChild(removeButton);
        return cell;
    }
}
class EmptyDataGridNode extends DataGrid.DataGrid.DataGridNode {
    createCells(element) {
        element.removeChildren();
        const td = this.createTDWithClass(DataGrid.DataGrid.Align.Center);
        if (this.dataGrid) {
            td.colSpan = this.dataGrid.visibleColumnsArray.length;
        }
        const code = document.createElement('span', { is: 'source-code' });
        code.textContent = 'navigator.credentials.create()';
        code.classList.add('code');
        const message = i18n.i18n.getFormatLocalizedString(str_, UIStrings.noCredentialsTryCallingSFromYour, { PH1: code });
        td.appendChild(message);
        element.appendChild(td);
    }
}
let webauthnPaneImplInstance;
// We extrapolate this variable as otherwise git detects a private key, even though we
// perform string manipulation. If we extract the name, then the regex doesn't match
// and we can upload as expected.
const PRIVATE_NAME = 'PRIVATE';
const PRIVATE_KEY_HEADER = `-----BEGIN ${PRIVATE_NAME} KEY-----
`;
const PRIVATE_KEY_FOOTER = `-----END ${PRIVATE_NAME} KEY-----`;
const PROTOCOL_AUTHENTICATOR_VALUES = {
    Ctap2: "ctap2" /* Ctap2 */,
    U2f: "u2f" /* U2f */,
};
export class WebauthnPaneImpl extends UI.Widget.VBox {
    _enabled;
    _activeAuthId;
    _hasBeenEnabled;
    _dataGrids;
    // @ts-ignore
    _enableCheckbox;
    _availableAuthenticatorSetting;
    _model;
    _authenticatorsView;
    _topToolbarContainer;
    _topToolbar;
    _learnMoreView;
    _newAuthenticatorSection;
    _newAuthenticatorForm;
    _protocolSelect;
    _transportSelect;
    _residentKeyCheckboxLabel;
    _residentKeyCheckbox;
    _userVerificationCheckboxLabel;
    _userVerificationCheckbox;
    _addAuthenticatorButton;
    _isEnabling;
    constructor() {
        super(true);
        this.registerRequiredCSS('panels/webauthn/webauthnPane.css', { enableLegacyPatching: false });
        this.contentElement.classList.add('webauthn-pane');
        this._enabled = false;
        this._activeAuthId = null;
        this._hasBeenEnabled = false;
        this._dataGrids = new Map();
        this._availableAuthenticatorSetting =
            Common.Settings.Settings.instance().createSetting('webauthnAuthenticators', []);
        const mainTarget = SDK.TargetManager.TargetManager.instance().mainTarget();
        if (mainTarget) {
            this._model = mainTarget.model(SDK.WebAuthnModel.WebAuthnModel);
        }
        this._createToolbar();
        this._authenticatorsView = this.contentElement.createChild('div', 'authenticators-view');
        this._createNewAuthenticatorSection();
        this._updateVisibility(false);
    }
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!webauthnPaneImplInstance || forceNew) {
            webauthnPaneImplInstance = new WebauthnPaneImpl();
        }
        return webauthnPaneImplInstance;
    }
    async _loadInitialAuthenticators() {
        let activeAuthenticatorId = null;
        const availableAuthenticators = this._availableAuthenticatorSetting.get();
        for (const options of availableAuthenticators) {
            if (!this._model) {
                continue;
            }
            const authenticatorId = await this._model.addAuthenticator(options);
            this._addAuthenticatorSection(authenticatorId, options);
            // Update the authenticatorIds in the options.
            options.authenticatorId = authenticatorId;
            if (options.active) {
                activeAuthenticatorId = authenticatorId;
            }
        }
        // Update the settings to reflect the new authenticatorIds.
        this._availableAuthenticatorSetting.set(availableAuthenticators);
        if (activeAuthenticatorId) {
            this._setActiveAuthenticator(activeAuthenticatorId);
        }
    }
    async ownerViewDisposed() {
        if (this._enableCheckbox) {
            this._enableCheckbox.setChecked(false);
        }
        await this._setVirtualAuthEnvEnabled(false);
    }
    _createToolbar() {
        this._topToolbarContainer = this.contentElement.createChild('div', 'webauthn-toolbar-container');
        this._topToolbar = new UI.Toolbar.Toolbar('webauthn-toolbar', this._topToolbarContainer);
        const enableCheckboxTitle = i18nString(UIStrings.enableVirtualAuthenticator);
        this._enableCheckbox =
            new UI.Toolbar.ToolbarCheckbox(enableCheckboxTitle, enableCheckboxTitle, this._handleCheckboxToggle.bind(this));
        this._topToolbar.appendToolbarItem(this._enableCheckbox);
    }
    _createCredentialsDataGrid(authenticatorId) {
        const columns = [
            {
                id: 'credentialId',
                title: i18nString(UIStrings.id),
                longText: true,
                weight: 24,
            },
            {
                id: 'isResidentCredential',
                title: i18nString(UIStrings.isResident),
                dataType: DataGrid.DataGrid.DataType.Boolean,
                weight: 10,
            },
            {
                id: 'rpId',
                title: i18nString(UIStrings.rpId),
            },
            {
                id: 'userHandle',
                title: i18nString(UIStrings.userHandle),
            },
            {
                id: 'signCount',
                title: i18nString(UIStrings.signCount),
            },
            { id: 'actions', title: i18nString(UIStrings.actions) },
        ];
        const dataGridConfig = {
            displayName: i18nString(UIStrings.credentials),
            columns,
            editCallback: undefined,
            deleteCallback: undefined,
            refreshCallback: undefined,
        };
        const dataGrid = new DataGrid.DataGrid.DataGridImpl(dataGridConfig);
        dataGrid.renderInline();
        dataGrid.setStriped(true);
        dataGrid.addEventListener("ExportCredential" /* ExportCredential */, this._handleExportCredential, this);
        dataGrid.addEventListener("RemoveCredential" /* RemoveCredential */, this._handleRemoveCredential.bind(this, authenticatorId));
        this._dataGrids.set(authenticatorId, dataGrid);
        return dataGrid;
    }
    _handleExportCredential(e) {
        this._exportCredential(e.data);
    }
    _handleRemoveCredential(authenticatorId, e) {
        this._removeCredential(authenticatorId, e.data.credentialId);
    }
    async _updateCredentials(authenticatorId) {
        const dataGrid = this._dataGrids.get(authenticatorId);
        if (!dataGrid) {
            return;
        }
        if (this._model) {
            const credentials = await this._model.getCredentials(authenticatorId);
            dataGrid.rootNode().removeChildren();
            for (const credential of credentials) {
                const node = new DataGridNode(credential);
                dataGrid.rootNode().appendChild(node);
            }
            this._maybeAddEmptyNode(dataGrid);
        }
        // TODO(crbug.com/1112528): Add back-end events for credential creation and removal to avoid polling.
        setTimeout(this._updateCredentials.bind(this, authenticatorId), TIMEOUT);
    }
    _maybeAddEmptyNode(dataGrid) {
        if (dataGrid.rootNode().children.length) {
            return;
        }
        const node = new EmptyDataGridNode();
        dataGrid.rootNode().appendChild(node);
    }
    async _setVirtualAuthEnvEnabled(enable) {
        await this._isEnabling;
        this._isEnabling = new Promise(async (resolve) => {
            if (enable && !this._hasBeenEnabled) {
                // Ensures metric is only tracked once per session.
                Host.userMetrics.actionTaken(Host.UserMetrics.Action.VirtualAuthenticatorEnvironmentEnabled);
                this._hasBeenEnabled = true;
            }
            this._enabled = enable;
            if (this._model) {
                await this._model.setVirtualAuthEnvEnabled(enable);
            }
            if (enable) {
                await this._loadInitialAuthenticators();
            }
            else {
                this._removeAuthenticatorSections();
            }
            this._updateVisibility(enable);
            this._isEnabling = undefined;
            resolve();
        });
    }
    _updateVisibility(enabled) {
        this.contentElement.classList.toggle('enabled', enabled);
    }
    _removeAuthenticatorSections() {
        this._authenticatorsView.innerHTML = '';
        this._dataGrids.clear();
    }
    _handleCheckboxToggle(e) {
        this._setVirtualAuthEnvEnabled(e.target.checked);
    }
    _updateEnabledTransportOptions(enabledOptions) {
        if (!this._transportSelect) {
            return;
        }
        const prevValue = this._transportSelect.value;
        this._transportSelect.removeChildren();
        for (const option of enabledOptions) {
            this._transportSelect.appendChild(new Option(option, option));
        }
        // Make sure the currently selected value stays the same.
        this._transportSelect.value = prevValue;
        // If the new set does not include the previous value.
        if (!this._transportSelect.value) {
            // Select the first available value.
            this._transportSelect.selectedIndex = 0;
        }
    }
    _updateNewAuthenticatorSectionOptions() {
        if (!this._protocolSelect || !this._residentKeyCheckbox || !this._userVerificationCheckbox) {
            return;
        }
        if (this._protocolSelect.value === "ctap2" /* Ctap2 */) {
            this._residentKeyCheckbox.disabled = false;
            this._userVerificationCheckbox.disabled = false;
            this._updateEnabledTransportOptions([
                "usb" /* Usb */,
                "ble" /* Ble */,
                "nfc" /* Nfc */,
                "internal" /* Internal */,
            ]);
        }
        else {
            this._residentKeyCheckbox.checked = false;
            this._residentKeyCheckbox.disabled = true;
            this._userVerificationCheckbox.checked = false;
            this._userVerificationCheckbox.disabled = true;
            this._updateEnabledTransportOptions([
                "usb" /* Usb */,
                "ble" /* Ble */,
                "nfc" /* Nfc */,
            ]);
        }
    }
    _createNewAuthenticatorSection() {
        this._learnMoreView = this.contentElement.createChild('div', 'learn-more');
        this._learnMoreView.appendChild(UI.Fragment.html `
  <div>
  ${i18nString(UIStrings.useWebauthnForPhishingresistant)}<br /><br />
  ${UI.XLink.XLink.create('https://developers.google.com/web/updates/2018/05/webauthn', i18nString(UIStrings.learnMore))}
  </div>
  `);
        this._newAuthenticatorSection = this.contentElement.createChild('div', 'new-authenticator-container');
        const newAuthenticatorTitle = UI.UIUtils.createLabel(i18nString(UIStrings.newAuthenticator), 'new-authenticator-title');
        this._newAuthenticatorSection.appendChild(newAuthenticatorTitle);
        this._newAuthenticatorForm = this._newAuthenticatorSection.createChild('div', 'new-authenticator-form');
        const protocolGroup = this._newAuthenticatorForm.createChild('div', 'authenticator-option');
        const transportGroup = this._newAuthenticatorForm.createChild('div', 'authenticator-option');
        const residentKeyGroup = this._newAuthenticatorForm.createChild('div', 'authenticator-option');
        const userVerificationGroup = this._newAuthenticatorForm.createChild('div', 'authenticator-option');
        const addButtonGroup = this._newAuthenticatorForm.createChild('div', 'authenticator-option');
        const protocolSelectTitle = UI.UIUtils.createLabel(i18nString(UIStrings.protocol), 'authenticator-option-label');
        protocolGroup.appendChild(protocolSelectTitle);
        this._protocolSelect = protocolGroup.createChild('select', 'chrome-select');
        UI.ARIAUtils.bindLabelToControl(protocolSelectTitle, this._protocolSelect);
        Object.values(PROTOCOL_AUTHENTICATOR_VALUES)
            .sort()
            .forEach((option) => {
            if (this._protocolSelect) {
                this._protocolSelect.appendChild(new Option(option, option));
            }
        });
        if (this._protocolSelect) {
            this._protocolSelect.value = "ctap2" /* Ctap2 */;
        }
        const transportSelectTitle = UI.UIUtils.createLabel(i18nString(UIStrings.transport), 'authenticator-option-label');
        transportGroup.appendChild(transportSelectTitle);
        this._transportSelect = transportGroup.createChild('select', 'chrome-select');
        UI.ARIAUtils.bindLabelToControl(transportSelectTitle, this._transportSelect);
        // transportSelect will be populated in _updateNewAuthenticatorSectionOptions.
        this._residentKeyCheckboxLabel = UI.UIUtils.CheckboxLabel.create(i18nString(UIStrings.supportsResidentKeys), false);
        this._residentKeyCheckboxLabel.textElement.classList.add('authenticator-option-label');
        residentKeyGroup.appendChild(this._residentKeyCheckboxLabel.textElement);
        this._residentKeyCheckbox = this._residentKeyCheckboxLabel.checkboxElement;
        this._residentKeyCheckbox.checked = false;
        this._residentKeyCheckbox.classList.add('authenticator-option-checkbox');
        residentKeyGroup.appendChild(this._residentKeyCheckboxLabel);
        this._userVerificationCheckboxLabel = UI.UIUtils.CheckboxLabel.create('Supports user verification', false);
        this._userVerificationCheckboxLabel.textElement.classList.add('authenticator-option-label');
        userVerificationGroup.appendChild(this._userVerificationCheckboxLabel.textElement);
        this._userVerificationCheckbox = this._userVerificationCheckboxLabel.checkboxElement;
        this._userVerificationCheckbox.checked = false;
        this._userVerificationCheckbox.classList.add('authenticator-option-checkbox');
        userVerificationGroup.appendChild(this._userVerificationCheckboxLabel);
        this._addAuthenticatorButton =
            UI.UIUtils.createTextButton(i18nString(UIStrings.add), this._handleAddAuthenticatorButton.bind(this), '');
        addButtonGroup.createChild('div', 'authenticator-option-label');
        addButtonGroup.appendChild(this._addAuthenticatorButton);
        const addAuthenticatorTitle = UI.UIUtils.createLabel(i18nString(UIStrings.addAuthenticator), '');
        UI.ARIAUtils.bindLabelToControl(addAuthenticatorTitle, this._addAuthenticatorButton);
        this._updateNewAuthenticatorSectionOptions();
        if (this._protocolSelect) {
            this._protocolSelect.addEventListener('change', this._updateNewAuthenticatorSectionOptions.bind(this));
        }
    }
    async _handleAddAuthenticatorButton() {
        const options = this._createOptionsFromCurrentInputs();
        if (this._model) {
            const authenticatorId = await this._model.addAuthenticator(options);
            const availableAuthenticators = this._availableAuthenticatorSetting.get();
            availableAuthenticators.push({ authenticatorId, active: true, ...options });
            this._availableAuthenticatorSetting.set(availableAuthenticators.map(a => ({ ...a, active: a.authenticatorId === authenticatorId })));
            const section = await this._addAuthenticatorSection(authenticatorId, options);
            const mediaQueryList = window.matchMedia('(prefers-reduced-motion: reduce)');
            const prefersReducedMotion = mediaQueryList.matches;
            section.scrollIntoView({ block: 'start', behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        }
    }
    async _addAuthenticatorSection(authenticatorId, options) {
        const section = document.createElement('div');
        section.classList.add('authenticator-section');
        section.setAttribute('data-authenticator-id', authenticatorId);
        this._authenticatorsView.appendChild(section);
        const headerElement = section.createChild('div', 'authenticator-section-header');
        const titleElement = headerElement.createChild('div', 'authenticator-section-title');
        UI.ARIAUtils.markAsHeading(titleElement, 2);
        await this._clearActiveAuthenticator();
        const activeButtonContainer = headerElement.createChild('div', 'active-button-container');
        const activeLabel = UI.UIUtils.createRadioLabel(`active-authenticator-${authenticatorId}`, i18nString(UIStrings.active));
        activeLabel.radioElement.addEventListener('click', this._setActiveAuthenticator.bind(this, authenticatorId));
        activeButtonContainer.appendChild(activeLabel);
        /** @type {!HTMLInputElement} */ activeLabel.radioElement.checked = true;
        this._activeAuthId = authenticatorId; // Newly added authenticator is automatically set as active.
        const removeButton = headerElement.createChild('button', 'text-button');
        removeButton.textContent = i18nString(UIStrings.remove);
        removeButton.addEventListener('click', this._removeAuthenticator.bind(this, authenticatorId));
        const toolbar = new UI.Toolbar.Toolbar('edit-name-toolbar', titleElement);
        const editName = new UI.Toolbar.ToolbarButton(i18nString(UIStrings.editName), 'largeicon-edit');
        const saveName = new UI.Toolbar.ToolbarButton(i18nString(UIStrings.saveName), 'largeicon-checkmark');
        saveName.setVisible(false);
        const nameField = titleElement.createChild('input', 'authenticator-name-field');
        nameField.disabled = true;
        const userFriendlyName = authenticatorId.slice(-5); // User friendly name defaults to last 5 chars of UUID.
        nameField.value = i18nString(UIStrings.authenticatorS, { PH1: userFriendlyName });
        this._updateActiveLabelTitle(activeLabel, nameField.value);
        editName.addEventListener(UI.Toolbar.ToolbarButton.Events.Click, () => this._handleEditNameButton(titleElement, nameField, editName, saveName));
        saveName.addEventListener(UI.Toolbar.ToolbarButton.Events.Click, () => this._handleSaveNameButton(titleElement, nameField, editName, saveName, activeLabel));
        nameField.addEventListener('focusout', () => this._handleSaveNameButton(titleElement, nameField, editName, saveName, activeLabel));
        nameField.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                this._handleSaveNameButton(titleElement, nameField, editName, saveName, activeLabel);
            }
        });
        toolbar.appendToolbarItem(editName);
        toolbar.appendToolbarItem(saveName);
        this._createAuthenticatorFields(section, authenticatorId, options);
        const label = document.createElementWithClass('div', 'credentials-title');
        label.textContent = i18nString(UIStrings.credentials);
        section.appendChild(label);
        const dataGrid = this._createCredentialsDataGrid(authenticatorId);
        dataGrid.asWidget().show(section);
        this._updateCredentials(authenticatorId);
        return section;
    }
    _exportCredential(credential) {
        let pem = PRIVATE_KEY_HEADER;
        for (let i = 0; i < credential.privateKey.length; i += 64) {
            pem += credential.privateKey.substring(i, i + 64) + '\n';
        }
        pem += PRIVATE_KEY_FOOTER;
        const link = document.createElement('a');
        link.download = i18nString(UIStrings.privateKeypem);
        link.href = 'data:application/x-pem-file,' + encodeURIComponent(pem);
        link.click();
    }
    async _removeCredential(authenticatorId, credentialId) {
        const dataGrid = this._dataGrids.get(authenticatorId);
        if (!dataGrid) {
            return;
        }
        // @ts-ignore dataGrid node type is indeterminate.
        dataGrid.rootNode()
            .children
            .find((n) => n.data.credentialId === credentialId)
            .remove();
        this._maybeAddEmptyNode(dataGrid);
        if (this._model) {
            await this._model.removeCredential(authenticatorId, credentialId);
        }
    }
    /**
     * Creates the fields describing the authenticator in the front end.
     */
    _createAuthenticatorFields(section, authenticatorId, options) {
        const sectionFields = section.createChild('div', 'authenticator-fields');
        const uuidField = sectionFields.createChild('div', 'authenticator-field');
        const protocolField = sectionFields.createChild('div', 'authenticator-field');
        const transportField = sectionFields.createChild('div', 'authenticator-field');
        const srkField = sectionFields.createChild('div', 'authenticator-field');
        const suvField = sectionFields.createChild('div', 'authenticator-field');
        uuidField.appendChild(UI.UIUtils.createLabel(i18nString(UIStrings.uuid), 'authenticator-option-label'));
        protocolField.appendChild(UI.UIUtils.createLabel(i18nString(UIStrings.protocol), 'authenticator-option-label'));
        transportField.appendChild(UI.UIUtils.createLabel(i18nString(UIStrings.transport), 'authenticator-option-label'));
        srkField.appendChild(UI.UIUtils.createLabel(i18nString(UIStrings.supportsResidentKeys), 'authenticator-option-label'));
        suvField.appendChild(UI.UIUtils.createLabel(i18nString(UIStrings.supportsUserVerification), 'authenticator-option-label'));
        uuidField.createChild('div', 'authenticator-field-value').textContent = authenticatorId;
        protocolField.createChild('div', 'authenticator-field-value').textContent = options.protocol;
        transportField.createChild('div', 'authenticator-field-value').textContent = options.transport;
        srkField.createChild('div', 'authenticator-field-value').textContent =
            options.hasResidentKey ? i18nString(UIStrings.yes) : i18nString(UIStrings.no);
        suvField.createChild('div', 'authenticator-field-value').textContent =
            options.hasUserVerification ? i18nString(UIStrings.yes) : i18nString(UIStrings.no);
    }
    _handleEditNameButton(titleElement, nameField, editName, saveName) {
        nameField.disabled = false;
        titleElement.classList.add('editing-name');
        nameField.focus();
        saveName.setVisible(true);
        editName.setVisible(false);
    }
    _handleSaveNameButton(titleElement, nameField, editName, saveName, activeLabel) {
        nameField.disabled = true;
        titleElement.classList.remove('editing-name');
        editName.setVisible(true);
        saveName.setVisible(false);
        this._updateActiveLabelTitle(activeLabel, nameField.value);
    }
    _updateActiveLabelTitle(activeLabel, authenticatorName) {
        UI.Tooltip.Tooltip.install(activeLabel.radioElement, i18nString(UIStrings.setSAsTheActiveAuthenticator, { PH1: authenticatorName }));
    }
    /**
     * Removes both the authenticator and its respective UI element.
     */
    _removeAuthenticator(authenticatorId) {
        if (this._authenticatorsView) {
            const child = this._authenticatorsView.querySelector(`[data-authenticator-id=${CSS.escape(authenticatorId)}]`);
            if (child) {
                child.remove();
            }
        }
        this._dataGrids.delete(authenticatorId);
        if (this._model) {
            this._model.removeAuthenticator(authenticatorId);
        }
        // Update available authenticator setting.
        const prevAvailableAuthenticators = this._availableAuthenticatorSetting.get();
        const newAvailableAuthenticators = prevAvailableAuthenticators.filter(a => a.authenticatorId !== authenticatorId);
        this._availableAuthenticatorSetting.set(newAvailableAuthenticators);
        if (this._activeAuthId === authenticatorId) {
            const availableAuthenticatorIds = Array.from(this._dataGrids.keys());
            if (availableAuthenticatorIds.length) {
                this._setActiveAuthenticator(availableAuthenticatorIds[0]);
            }
            else {
                this._activeAuthId = null;
            }
        }
    }
    _createOptionsFromCurrentInputs() {
        // TODO(crbug.com/1034663): Add optionality for isUserVerified param.
        if (!this._protocolSelect || !this._transportSelect || !this._residentKeyCheckbox ||
            !this._userVerificationCheckbox) {
            throw new Error('Unable to create options from current inputs');
        }
        /**
         * @type {!Protocol.WebAuthn.VirtualAuthenticatorOptions}
         */
        const options = {
            protocol: this._protocolSelect.options[this._protocolSelect.selectedIndex].value,
            transport: this._transportSelect.options[this._transportSelect.selectedIndex].value,
            hasResidentKey: this._residentKeyCheckbox.checked,
            hasUserVerification: this._userVerificationCheckbox.checked,
            automaticPresenceSimulation: true,
            isUserVerified: true,
        };
        return options;
    }
    /**
     * Sets the given authenticator as active.
     * Note that a newly added authenticator will automatically be set as active.
     */
    async _setActiveAuthenticator(authenticatorId) {
        await this._clearActiveAuthenticator();
        if (this._model) {
            await this._model.setAutomaticPresenceSimulation(authenticatorId, true);
        }
        this._activeAuthId = authenticatorId;
        const prevAvailableAuthenticators = this._availableAuthenticatorSetting.get();
        const newAvailableAuthenticators = prevAvailableAuthenticators.map(a => ({ ...a, active: a.authenticatorId === authenticatorId }));
        this._availableAuthenticatorSetting.set(newAvailableAuthenticators);
        this._updateActiveButtons();
    }
    _updateActiveButtons() {
        const authenticators = this._authenticatorsView.getElementsByClassName('authenticator-section');
        Array.from(authenticators).forEach((authenticator) => {
            const button = authenticator.querySelector('input.dt-radio-button');
            if (!button) {
                return;
            }
            button.checked =
                /** @type {!HTMLElement} */ authenticator.dataset.authenticatorId === this._activeAuthId;
        });
    }
    async _clearActiveAuthenticator() {
        if (this._activeAuthId && this._model) {
            await this._model.setAutomaticPresenceSimulation(this._activeAuthId, false);
        }
        this._activeAuthId = null;
        this._updateActiveButtons();
    }
}
//# sourceMappingURL=WebauthnPane.js.map