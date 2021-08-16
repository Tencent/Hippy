import * as SDK from '../../core/sdk/sdk.js';
import type * as IssuesManager from '../../models/issues_manager/issues_manager.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as Network from '../network/network.js';
import type * as Protocol from '../../generated/protocol.js';
import type { IssueView } from './IssueView.js';
export declare const enum AffectedItem {
    Cookie = "Cookie",
    Directive = "Directive",
    Element = "Element",
    LearnMore = "LearnMore",
    Request = "Request",
    Source = "Source"
}
export declare const extractShortPath: (path: string) => string;
export interface CreateRequestCellOptions {
    linkToPreflight?: boolean;
    highlightHeader?: {
        section: Network.NetworkSearchScope.UIHeaderSection;
        name: string;
    };
}
/**
 * The base class for all affected resource views. It provides basic scaffolding
 * as well as machinery for resolving request and frame ids to SDK objects.
 */
export declare abstract class AffectedResourcesView extends UI.TreeOutline.TreeElement {
    private readonly parentView;
    protected affectedResourcesCountElement: HTMLElement;
    protected affectedResources: HTMLElement;
    private affectedResourcesCount;
    private networkListener;
    private frameListeners;
    private unresolvedRequestIds;
    private unresolvedFrameIds;
    /**
     * @param resourceName - Singular and plural of the affected resource name.
     */
    constructor(parent: IssueView);
    createAffectedResourcesCounter(): HTMLElement;
    createAffectedResources(): HTMLElement;
    protected abstract getResourceNameWithCount(count: number): string;
    protected updateAffectedResourceCount(count: number): void;
    isEmpty(): boolean;
    clear(): void;
    expandIfOneResource(): void;
    /**
     * This function resolves a requestId to network requests. If the requestId does not resolve, a listener is installed
     * that takes care of updating the view if the network request is added. This is useful if the issue is added before
     * the network request gets reported.
     */
    protected resolveRequestId(requestId: string): SDK.NetworkRequest.NetworkRequest[];
    private onRequestAdded;
    /**
     * This function resolves a frameId to a ResourceTreeFrame. If the frameId does not resolve, or hasn't navigated yet,
     * a listener is installed that takes care of updating the view if the frame is added. This is useful if the issue is
     * added before the frame gets reported.
     */
    private resolveFrameId;
    private onFrameChanged;
    protected createFrameCell(frameId: Protocol.Page.FrameId, issue: IssuesManager.Issue.Issue): HTMLElement;
    protected createRequestCell(request: Protocol.Audits.AffectedRequest, options?: CreateRequestCellOptions): HTMLElement;
    protected appendSourceLocation(element: HTMLElement, sourceLocation: {
        url: string;
        scriptId?: string;
        lineNumber: number;
        columnNumber?: number;
    } | undefined, target: SDK.Target.Target | null | undefined): void;
    protected appendColumnTitle(header: HTMLElement, title: string, additionalClass?: string | null): void;
    protected createIssueDetailCell(textContent: string, additionalClass?: string | null): HTMLTableDataCellElement;
    protected appendIssueDetailCell(element: HTMLElement, textContent: string, additionalClass?: string | null): HTMLTableDataCellElement;
    abstract update(): void;
}
