import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Protocol from '../../generated/protocol.js';
import * as DataGrid from '../../ui/legacy/components/data_grid/data_grid.js';
import * as UI from '../../ui/legacy/legacy.js';
declare class DataGridNode extends DataGrid.DataGrid.DataGridNode<DataGridNode> {
    constructor(credential: Protocol.WebAuthn.Credential);
    nodeSelfHeight(): number;
    createCell(columnId: string): HTMLElement;
}
declare type AvailableAuthenticatorOptions = Protocol.WebAuthn.VirtualAuthenticatorOptions & {
    active: boolean;
    authenticatorId: Protocol.WebAuthn.AuthenticatorId;
};
export declare class WebauthnPaneImpl extends UI.Widget.VBox {
    _enabled: boolean;
    _activeAuthId: string | null;
    _hasBeenEnabled: boolean;
    _dataGrids: Map<string, DataGrid.DataGrid.DataGridImpl<DataGridNode>>;
    _enableCheckbox: UI.Toolbar.ToolbarCheckbox;
    _availableAuthenticatorSetting: Common.Settings.Setting<AvailableAuthenticatorOptions[]>;
    _model: SDK.WebAuthnModel.WebAuthnModel | null | undefined;
    _authenticatorsView: HTMLElement;
    _topToolbarContainer: HTMLElement | undefined;
    _topToolbar: UI.Toolbar.Toolbar | undefined;
    _learnMoreView: HTMLElement | undefined;
    _newAuthenticatorSection: HTMLElement | undefined;
    _newAuthenticatorForm: HTMLElement | undefined;
    _protocolSelect: HTMLSelectElement | undefined;
    _transportSelect: HTMLSelectElement | undefined;
    _residentKeyCheckboxLabel: UI.UIUtils.CheckboxLabel | undefined;
    _residentKeyCheckbox: HTMLInputElement | undefined;
    _userVerificationCheckboxLabel: UI.UIUtils.CheckboxLabel | undefined;
    _userVerificationCheckbox: HTMLInputElement | undefined;
    _addAuthenticatorButton: HTMLButtonElement | undefined;
    _isEnabling?: Promise<void>;
    constructor();
    static instance(opts?: {
        forceNew: null;
    }): WebauthnPaneImpl;
    _loadInitialAuthenticators(): Promise<void>;
    ownerViewDisposed(): Promise<void>;
    _createToolbar(): void;
    _createCredentialsDataGrid(authenticatorId: string): DataGrid.DataGrid.DataGridImpl<DataGridNode>;
    _handleExportCredential(e: {
        data: Protocol.WebAuthn.Credential;
    }): void;
    _handleRemoveCredential(authenticatorId: string, e: {
        data: Protocol.WebAuthn.Credential;
    }): void;
    _updateCredentials(authenticatorId: string): Promise<void>;
    _maybeAddEmptyNode(dataGrid: DataGrid.DataGrid.DataGridImpl<DataGridNode>): void;
    _setVirtualAuthEnvEnabled(enable: boolean): Promise<void>;
    _updateVisibility(enabled: boolean): void;
    _removeAuthenticatorSections(): void;
    _handleCheckboxToggle(e: MouseEvent): void;
    _updateEnabledTransportOptions(enabledOptions: Protocol.WebAuthn.AuthenticatorTransport[]): void;
    _updateNewAuthenticatorSectionOptions(): void;
    _createNewAuthenticatorSection(): void;
    _handleAddAuthenticatorButton(): Promise<void>;
    _addAuthenticatorSection(authenticatorId: string, options: Protocol.WebAuthn.VirtualAuthenticatorOptions): Promise<HTMLDivElement>;
    _exportCredential(credential: Protocol.WebAuthn.Credential): void;
    _removeCredential(authenticatorId: string, credentialId: string): Promise<void>;
    /**
     * Creates the fields describing the authenticator in the front end.
     */
    _createAuthenticatorFields(section: Element, authenticatorId: string, options: Protocol.WebAuthn.VirtualAuthenticatorOptions): void;
    _handleEditNameButton(titleElement: Element, nameField: HTMLInputElement, editName: UI.Toolbar.ToolbarButton, saveName: UI.Toolbar.ToolbarButton): void;
    _handleSaveNameButton(titleElement: Element, nameField: HTMLInputElement, editName: UI.Toolbar.ToolbarItem, saveName: UI.Toolbar.ToolbarItem, activeLabel: UI.UIUtils.DevToolsRadioButton): void;
    _updateActiveLabelTitle(activeLabel: UI.UIUtils.DevToolsRadioButton, authenticatorName: string): void;
    /**
     * Removes both the authenticator and its respective UI element.
     */
    _removeAuthenticator(authenticatorId: string): void;
    _createOptionsFromCurrentInputs(): Protocol.WebAuthn.VirtualAuthenticatorOptions;
    /**
     * Sets the given authenticator as active.
     * Note that a newly added authenticator will automatically be set as active.
     */
    _setActiveAuthenticator(authenticatorId: string): Promise<void>;
    _updateActiveButtons(): void;
    _clearActiveAuthenticator(): Promise<void>;
}
export {};
