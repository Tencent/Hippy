// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../../core/common/common.js';
import * as Host from '../../core/host/host.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Logs from '../../models/logs/logs.js';
import * as IconButton from '../../ui/components/icon_button/icon_button.js';
import * as Components from '../../ui/legacy/components/utils/utils.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as Network from '../network/network.js';
const UIStrings = {
    /**
    *@description Text in Object Properties Section
    */
    unknown: 'unknown',
    /**
    *@description Tooltip for button linking to the Elements panel
    */
    clickToRevealTheFramesDomNodeIn: 'Click to reveal the frame\'s DOM node in the Elements panel',
    /**
    *@description Title for a link to a request in the network panel
    */
    clickToShowRequestInTheNetwork: 'Click to show request in the network panel',
    /**
    *@description Title for an unavailable link a request in the network panel
    */
    requestUnavailableInTheNetwork: 'Request unavailable in the network panel, try reloading the inspected page',
};
const str_ = i18n.i18n.registerUIStrings('panels/issues/AffectedResourcesView.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export const extractShortPath = (path) => {
    // 1st regex matches everything after last '/'
    // if path ends with '/', 2nd regex returns everything between the last two '/'
    return (/[^/]+$/.exec(path) || /[^/]+\/$/.exec(path) || [''])[0];
};
/**
 * The base class for all affected resource views. It provides basic scaffolding
 * as well as machinery for resolving request and frame ids to SDK objects.
 */
export class AffectedResourcesView extends UI.TreeOutline.TreeElement {
    parentView;
    affectedResourcesCountElement;
    affectedResources;
    affectedResourcesCount;
    networkListener;
    frameListeners;
    unresolvedRequestIds;
    unresolvedFrameIds;
    /**
     * @param resourceName - Singular and plural of the affected resource name.
     */
    constructor(parent) {
        super();
        this.toggleOnClick = true;
        this.parentView = parent;
        this.affectedResourcesCountElement = this.createAffectedResourcesCounter();
        this.affectedResources = this.createAffectedResources();
        this.affectedResourcesCount = 0;
        this.networkListener = null;
        this.frameListeners = [];
        this.unresolvedRequestIds = new Set();
        this.unresolvedFrameIds = new Set();
    }
    createAffectedResourcesCounter() {
        const counterLabel = document.createElement('div');
        counterLabel.classList.add('affected-resource-label');
        this.listItemElement.appendChild(counterLabel);
        return counterLabel;
    }
    createAffectedResources() {
        const body = new UI.TreeOutline.TreeElement();
        const affectedResources = document.createElement('table');
        affectedResources.classList.add('affected-resource-list');
        body.listItemElement.appendChild(affectedResources);
        this.appendChild(body);
        return affectedResources;
    }
    updateAffectedResourceCount(count) {
        this.affectedResourcesCount = count;
        this.affectedResourcesCountElement.textContent = this.getResourceNameWithCount(count);
        this.hidden = this.affectedResourcesCount === 0;
        this.parentView.updateAffectedResourceVisibility();
    }
    isEmpty() {
        return this.affectedResourcesCount === 0;
    }
    clear() {
        this.affectedResources.textContent = '';
    }
    expandIfOneResource() {
        if (this.affectedResourcesCount === 1) {
            this.expand();
        }
    }
    /**
     * This function resolves a requestId to network requests. If the requestId does not resolve, a listener is installed
     * that takes care of updating the view if the network request is added. This is useful if the issue is added before
     * the network request gets reported.
     */
    resolveRequestId(requestId) {
        const requests = Logs.NetworkLog.NetworkLog.instance().requestsForId(requestId);
        if (!requests.length) {
            this.unresolvedRequestIds.add(requestId);
            if (!this.networkListener) {
                this.networkListener = Logs.NetworkLog.NetworkLog.instance().addEventListener(Logs.NetworkLog.Events.RequestAdded, this.onRequestAdded, this);
            }
        }
        return requests;
    }
    onRequestAdded(event) {
        const request = event.data;
        const requestWasUnresolved = this.unresolvedRequestIds.delete(request.requestId());
        if (this.unresolvedRequestIds.size === 0 && this.networkListener) {
            // Stop listening once all requests are resolved.
            Common.EventTarget.EventTarget.removeEventListeners([this.networkListener]);
            this.networkListener = null;
        }
        if (requestWasUnresolved) {
            this.update();
        }
    }
    /**
     * This function resolves a frameId to a ResourceTreeFrame. If the frameId does not resolve, or hasn't navigated yet,
     * a listener is installed that takes care of updating the view if the frame is added. This is useful if the issue is
     * added before the frame gets reported.
     */
    resolveFrameId(frameId) {
        const frame = SDK.FrameManager.FrameManager.instance().getFrame(frameId);
        if (!frame || !frame.url) {
            this.unresolvedFrameIds.add(frameId);
            if (!this.frameListeners.length) {
                const addListener = SDK.FrameManager.FrameManager.instance().addEventListener(SDK.FrameManager.Events.FrameAddedToTarget, this.onFrameChanged, this);
                const navigateListener = SDK.FrameManager.FrameManager.instance().addEventListener(SDK.FrameManager.Events.FrameNavigated, this.onFrameChanged, this);
                this.frameListeners = [addListener, navigateListener];
            }
        }
        return frame;
    }
    onFrameChanged(event) {
        const frame = event.data.frame;
        if (!frame.url) {
            return;
        }
        const frameWasUnresolved = this.unresolvedFrameIds.delete(frame.id);
        if (this.unresolvedFrameIds.size === 0 && this.frameListeners.length) {
            // Stop listening once all requests are resolved.
            Common.EventTarget.EventTarget.removeEventListeners(this.frameListeners);
            this.frameListeners = [];
        }
        if (frameWasUnresolved) {
            this.update();
        }
    }
    createFrameCell(frameId, issue) {
        const frame = this.resolveFrameId(frameId);
        const url = frame && (frame.unreachableUrl() || frame.url) || i18nString(UIStrings.unknown);
        const frameCell = document.createElement('td');
        frameCell.classList.add('affected-resource-cell');
        if (frame) {
            const icon = new IconButton.Icon.Icon();
            icon.data = { iconName: 'elements_panel_icon', color: 'var(--color-link)', width: '16px', height: '16px' };
            icon.classList.add('link', 'elements-panel');
            icon.onclick = async () => {
                Host.userMetrics.issuesPanelResourceOpened(issue.getCategory(), "Element" /* Element */);
                const frame = SDK.FrameManager.FrameManager.instance().getFrame(frameId);
                if (frame) {
                    const ownerNode = await frame.getOwnerDOMNodeOrDocument();
                    if (ownerNode) {
                        Common.Revealer.reveal(ownerNode);
                    }
                }
            };
            UI.Tooltip.Tooltip.install(icon, i18nString(UIStrings.clickToRevealTheFramesDomNodeIn));
            frameCell.appendChild(icon);
        }
        frameCell.appendChild(document.createTextNode(url));
        frameCell.onmouseenter = () => {
            const frame = SDK.FrameManager.FrameManager.instance().getFrame(frameId);
            if (frame) {
                frame.highlight();
            }
        };
        frameCell.onmouseleave = () => SDK.OverlayModel.OverlayModel.hideDOMNodeHighlight();
        return frameCell;
    }
    createRequestCell(request, options = {}) {
        let url = request.url;
        let filename = url ? extractShortPath(url) : '';
        const requestCell = document.createElement('td');
        requestCell.classList.add('affected-resource-cell');
        const icon = new IconButton.Icon.Icon();
        icon.data = { iconName: 'network_panel_icon', color: 'var(--color-link)', width: '16px', height: '16px' };
        icon.classList.add('network-panel');
        requestCell.appendChild(icon);
        const requests = this.resolveRequestId(request.requestId);
        if (requests.length) {
            const linkToPreflight = options.linkToPreflight ?? false;
            const request = requests[0];
            requestCell.onclick = () => {
                const linkedRequest = linkToPreflight ? request.preflightRequest() : request;
                if (!linkedRequest) {
                    return;
                }
                if (options.highlightHeader) {
                    const requestLocation = Network.NetworkSearchScope.UIRequestLocation.header(linkedRequest, options.highlightHeader.section, options.highlightHeader.name);
                    Network.NetworkPanel.RequestLocationRevealer.instance().reveal(requestLocation);
                }
                else {
                    Network.NetworkPanel.NetworkPanel.selectAndShowRequest(linkedRequest, Network.NetworkItemView.Tabs.Headers);
                }
            };
            requestCell.classList.add('link');
            url = request.url();
            filename = extractShortPath(url);
            UI.Tooltip.Tooltip.install(icon, i18nString(UIStrings.clickToShowRequestInTheNetwork));
        }
        else {
            UI.Tooltip.Tooltip.install(icon, i18nString(UIStrings.requestUnavailableInTheNetwork));
            icon.data = { ...icon.data, color: 'var(--issue-color-yellow)' };
        }
        if (url) {
            UI.Tooltip.Tooltip.install(requestCell, url);
        }
        requestCell.appendChild(document.createTextNode(filename));
        return requestCell;
    }
    appendSourceLocation(element, sourceLocation, target) {
        const sourceCodeLocation = document.createElement('td');
        sourceCodeLocation.classList.add('affected-source-location');
        if (sourceLocation) {
            const maxLengthForDisplayedURLs = 40; // Same as console messages.
            // TODO(crbug.com/1108503): Add some mechanism to be able to add telemetry to this element.
            const linkifier = new Components.Linkifier.Linkifier(maxLengthForDisplayedURLs);
            const sourceAnchor = linkifier.linkifyScriptLocation(target || null, sourceLocation.scriptId || null, sourceLocation.url, sourceLocation.lineNumber, { columnNumber: sourceLocation.columnNumber, inlineFrameIndex: 0, className: undefined, tabStop: undefined });
            sourceCodeLocation.appendChild(sourceAnchor);
        }
        element.appendChild(sourceCodeLocation);
    }
    appendColumnTitle(header, title, additionalClass = null) {
        const info = document.createElement('td');
        info.classList.add('affected-resource-header');
        if (additionalClass) {
            info.classList.add(additionalClass);
        }
        info.textContent = title;
        header.appendChild(info);
    }
    createIssueDetailCell(textContent, additionalClass = null) {
        const cell = document.createElement('td');
        cell.textContent = textContent;
        if (additionalClass) {
            cell.classList.add(additionalClass);
        }
        return cell;
    }
    appendIssueDetailCell(element, textContent, additionalClass = null) {
        const cell = this.createIssueDetailCell(textContent, additionalClass);
        element.appendChild(cell);
        return cell;
    }
}
//# sourceMappingURL=AffectedResourcesView.js.map