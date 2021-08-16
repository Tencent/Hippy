import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as ElementsComponents from './components/components.js';
export declare class LayoutSidebarPane extends UI.ThrottledWidget.ThrottledWidget {
    _layoutPane: ElementsComponents.LayoutPane.LayoutPane;
    _settings: string[];
    _uaShadowDOMSetting: Common.Settings.Setting<boolean>;
    _boundOnSettingChanged: (event: any) => void;
    _domModels: SDK.DOMModel.DOMModel[];
    constructor();
    static instance(opts?: {
        forceNew: boolean | null;
    } | undefined): LayoutSidebarPane;
    modelAdded(domModel: SDK.DOMModel.DOMModel): void;
    modelRemoved(domModel: SDK.DOMModel.DOMModel): void;
    _fetchNodesByStyle(style: {
        name: string;
        value: string;
    }[]): Promise<SDK.DOMModel.DOMNode[]>;
    _fetchGridNodes(): Promise<SDK.DOMModel.DOMNode[]>;
    _fetchFlexContainerNodes(): Promise<SDK.DOMModel.DOMNode[]>;
    _mapSettings(): ElementsComponents.LayoutPaneUtils.Setting[];
    doUpdate(): Promise<void>;
    onSettingChanged(event: any): void;
    wasShown(): void;
    willHide(): void;
}
