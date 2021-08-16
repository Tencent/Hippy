import * as SDK from '../../../core/sdk/sdk.js';
import * as UI from '../../../ui/legacy/legacy.js';
export declare class FrameDetailsView extends UI.ThrottledWidget.ThrottledWidget {
    private readonly reportView;
    private readonly frame;
    constructor(frame: SDK.ResourceTreeModel.ResourceTreeFrame);
    doUpdate(): Promise<void>;
}
export interface FrameDetailsReportViewData {
    frame: SDK.ResourceTreeModel.ResourceTreeFrame;
}
export declare class FrameDetailsReportView extends HTMLElement {
    private readonly shadow;
    private frame?;
    private protocolMonitorExperimentEnabled;
    private showPermissionsDisallowedDetails;
    connectedCallback(): void;
    set data(data: FrameDetailsReportViewData);
    private render;
    private renderPermissionPolicy;
    private renderDocumentSection;
    private maybeRenderSourcesLinkForURL;
    private maybeRenderNetworkLinkForURL;
    private renderIconLink;
    private uiSourceCodeForFrame;
    private maybeRenderUnreachableURL;
    private renderNetworkLinkForUnreachableURL;
    private maybeRenderOrigin;
    private renderOwnerElement;
    private maybeRenderCreationStacktrace;
    private maybeRenderAdStatus;
    private renderIsolationSection;
    private maybeRenderSecureContextExplanation;
    private getSecureContextExplanation;
    private maybeRenderCoopCoepStatus;
    private maybeRenderCrossOriginStatus;
    private renderApiAvailabilitySection;
    private renderSharedArrayBufferAvailability;
    private renderMeasureMemoryAvailability;
    private renderAdditionalInfoSection;
}
declare global {
    interface HTMLElementTagNameMap {
        'devtools-resources-frame-details-view': FrameDetailsReportView;
    }
}
