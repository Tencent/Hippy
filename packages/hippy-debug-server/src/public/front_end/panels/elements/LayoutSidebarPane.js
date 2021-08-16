// Copyright (c) 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as ElementsComponents from './components/components.js';
import { ElementsPanel } from './ElementsPanel.js';
const nodeToLayoutElement = (node) => {
    const className = node.getAttribute('class');
    const nodeId = node.id;
    return {
        id: nodeId,
        color: '#000',
        name: node.localName(),
        domId: node.getAttribute('id'),
        domClasses: className ? className.split(/\s+/).filter(s => Boolean(s)) : undefined,
        enabled: false,
        reveal: () => {
            ElementsPanel.instance().revealAndSelectNode(node, true, true);
            node.scrollIntoView();
        },
        highlight: () => {
            node.highlight();
        },
        hideHighlight: () => {
            SDK.OverlayModel.OverlayModel.hideDOMNodeHighlight();
        },
        toggle: (_value) => {
            throw new Error('Not implemented');
        },
        setColor(_value) {
            throw new Error('Not implemented');
        },
    };
};
const gridNodesToElements = (nodes) => {
    return nodes.map(node => {
        const layoutElement = nodeToLayoutElement(node);
        const nodeId = node.id;
        return {
            ...layoutElement,
            color: node.domModel().overlayModel().colorOfGridInPersistentOverlay(nodeId) || '#000',
            enabled: node.domModel().overlayModel().isHighlightedGridInPersistentOverlay(nodeId),
            toggle: (value) => {
                if (value) {
                    node.domModel().overlayModel().highlightGridInPersistentOverlay(nodeId);
                }
                else {
                    node.domModel().overlayModel().hideGridInPersistentOverlay(nodeId);
                }
            },
            setColor(value) {
                this.color = value;
                node.domModel().overlayModel().setColorOfGridInPersistentOverlay(nodeId, value);
            },
        };
    });
};
let layoutSidebarPaneInstance;
const flexContainerNodesToElements = (nodes) => {
    return nodes.map(node => {
        const layoutElement = nodeToLayoutElement(node);
        const nodeId = node.id;
        return {
            ...layoutElement,
            color: node.domModel().overlayModel().colorOfFlexInPersistentOverlay(nodeId) || '#000',
            enabled: node.domModel().overlayModel().isHighlightedFlexContainerInPersistentOverlay(nodeId),
            toggle: (value) => {
                if (value) {
                    node.domModel().overlayModel().highlightFlexContainerInPersistentOverlay(nodeId);
                }
                else {
                    node.domModel().overlayModel().hideFlexContainerInPersistentOverlay(nodeId);
                }
            },
            setColor(value) {
                this.color = value;
                node.domModel().overlayModel().setColorOfFlexInPersistentOverlay(nodeId, value);
            },
        };
    });
};
export class LayoutSidebarPane extends UI.ThrottledWidget.ThrottledWidget {
    _layoutPane;
    _settings;
    _uaShadowDOMSetting;
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _boundOnSettingChanged;
    _domModels;
    constructor() {
        super(true /* isWebComponent */);
        this._layoutPane = new ElementsComponents.LayoutPane.LayoutPane();
        this.contentElement.appendChild(this._layoutPane);
        this._settings = ['showGridLineLabels', 'showGridTrackSizes', 'showGridAreas', 'extendGridLines'];
        this._uaShadowDOMSetting = Common.Settings.Settings.instance().moduleSetting('showUAShadowDOM');
        this._boundOnSettingChanged = this.onSettingChanged.bind(this);
        this._domModels = [];
    }
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!layoutSidebarPaneInstance || forceNew) {
            layoutSidebarPaneInstance = new LayoutSidebarPane();
        }
        return layoutSidebarPaneInstance;
    }
    modelAdded(domModel) {
        const overlayModel = domModel.overlayModel();
        overlayModel.addEventListener(SDK.OverlayModel.Events.PersistentGridOverlayStateChanged, this.update, this);
        overlayModel.addEventListener(SDK.OverlayModel.Events.PersistentFlexContainerOverlayStateChanged, this.update, this);
        this._domModels.push(domModel);
    }
    modelRemoved(domModel) {
        const overlayModel = domModel.overlayModel();
        overlayModel.removeEventListener(SDK.OverlayModel.Events.PersistentGridOverlayStateChanged, this.update, this);
        overlayModel.removeEventListener(SDK.OverlayModel.Events.PersistentFlexContainerOverlayStateChanged, this.update, this);
        this._domModels = this._domModels.filter(model => model !== domModel);
    }
    async _fetchNodesByStyle(style) {
        const showUAShadowDOM = this._uaShadowDOMSetting.get();
        const nodes = [];
        for (const domModel of this._domModels) {
            try {
                const nodeIds = await domModel.getNodesByStyle(style, true /* pierce */);
                for (const nodeId of nodeIds) {
                    const node = domModel.nodeForId(nodeId);
                    if (node !== null && (showUAShadowDOM || !node.ancestorUserAgentShadowRoot())) {
                        nodes.push(node);
                    }
                }
            }
            catch (error) {
                // TODO(crbug.com/1167706): Sometimes in E2E tests the layout panel is updated after a DOM node
                // has been removed. This causes an error that a node has not been found.
                // We can skip nodes that resulted in an error.
                console.warn(error);
            }
        }
        return nodes;
    }
    async _fetchGridNodes() {
        return await this._fetchNodesByStyle([{ name: 'display', value: 'grid' }, { name: 'display', value: 'inline-grid' }]);
    }
    async _fetchFlexContainerNodes() {
        return await this._fetchNodesByStyle([{ name: 'display', value: 'flex' }, { name: 'display', value: 'inline-flex' }]);
    }
    _mapSettings() {
        const settings = [];
        for (const settingName of this._settings) {
            const setting = Common.Settings.Settings.instance().moduleSetting(settingName);
            const settingValue = setting.get();
            const settingType = setting.type();
            if (!settingType) {
                throw new Error('A setting provided to LayoutSidebarPane does not have a setting type');
            }
            if (settingType !== Common.Settings.SettingType.BOOLEAN && settingType !== Common.Settings.SettingType.ENUM) {
                throw new Error('A setting provided to LayoutSidebarPane does not have a supported setting type');
            }
            const mappedSetting = {
                type: settingType,
                name: setting.name,
                title: setting.title(),
            };
            if (typeof settingValue === 'boolean') {
                settings.push({
                    ...mappedSetting,
                    value: settingValue,
                    options: setting.options().map(opt => ({
                        ...opt,
                        value: opt.value,
                    })),
                });
            }
            else if (typeof settingValue === 'string') {
                settings.push({
                    ...mappedSetting,
                    value: settingValue,
                    options: setting.options().map(opt => ({
                        ...opt,
                        value: opt.value,
                    })),
                });
            }
        }
        return settings;
    }
    async doUpdate() {
        this._layoutPane.data = {
            gridElements: gridNodesToElements(await this._fetchGridNodes()),
            flexContainerElements: flexContainerNodesToElements(await this._fetchFlexContainerNodes()),
            settings: this._mapSettings(),
        };
    }
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSettingChanged(event) {
        Common.Settings.Settings.instance().moduleSetting(event.data.setting).set(event.data.value);
    }
    wasShown() {
        for (const setting of this._settings) {
            Common.Settings.Settings.instance().moduleSetting(setting).addChangeListener(this.update, this);
        }
        this._layoutPane.addEventListener('settingchanged', this._boundOnSettingChanged);
        for (const domModel of this._domModels) {
            this.modelRemoved(domModel);
        }
        this._domModels = [];
        SDK.TargetManager.TargetManager.instance().observeModels(SDK.DOMModel.DOMModel, this);
        UI.Context.Context.instance().addFlavorChangeListener(SDK.DOMModel.DOMNode, this.update, this);
        this._uaShadowDOMSetting.addChangeListener(this.update, this);
        this.update();
    }
    willHide() {
        for (const setting of this._settings) {
            Common.Settings.Settings.instance().moduleSetting(setting).removeChangeListener(this.update, this);
        }
        this._layoutPane.removeEventListener('settingchanged', this._boundOnSettingChanged);
        SDK.TargetManager.TargetManager.instance().unobserveModels(SDK.DOMModel.DOMModel, this);
        UI.Context.Context.instance().removeFlavorChangeListener(SDK.DOMModel.DOMNode, this.update, this);
        this._uaShadowDOMSetting.removeChangeListener(this.update, this);
    }
}
//# sourceMappingURL=LayoutSidebarPane.js.map