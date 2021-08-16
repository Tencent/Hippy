import * as Common from '../../../../core/common/common.js';
import * as SDK from '../../../../core/sdk/sdk.js';
import * as Bindings from '../../../../models/bindings/bindings.js';
import * as TextUtils from '../../../../models/text_utils/text_utils.js';
import * as Workspace from '../../../../models/workspace/workspace.js';
import type * as Protocol from '../../../../generated/protocol.js';
import * as UI from '../../legacy.js';
export declare class Linkifier implements SDK.TargetManager.Observer {
    _maxLength: number;
    _anchorsByTarget: Map<SDK.Target.Target, Element[]>;
    _locationPoolByTarget: Map<SDK.Target.Target, Bindings.LiveLocation.LiveLocationPool>;
    _onLiveLocationUpdate: (() => void) | undefined;
    _useLinkDecorator: boolean;
    constructor(maxLengthForDisplayedURLs?: number, useLinkDecorator?: boolean, onLiveLocationUpdate?: (() => void));
    static setLinkDecorator(linkDecorator: LinkDecorator): void;
    _updateAllAnchorDecorations(): void;
    static _bindUILocation(anchor: Element, uiLocation: Workspace.UISourceCode.UILocation): void;
    static _unbindUILocation(anchor: Element): void;
    targetAdded(target: SDK.Target.Target): void;
    targetRemoved(target: SDK.Target.Target): void;
    maybeLinkifyScriptLocation(target: SDK.Target.Target | null, scriptId: string | null, sourceURL: string, lineNumber: number | undefined, options?: LinkifyOptions): HTMLElement | null;
    linkifyScriptLocation(target: SDK.Target.Target | null, scriptId: string | null, sourceURL: string, lineNumber: number | undefined, options?: LinkifyOptions): HTMLElement;
    linkifyRawLocation(rawLocation: SDK.DebuggerModel.Location, fallbackUrl: string, className?: string): Element;
    maybeLinkifyConsoleCallFrame(target: SDK.Target.Target | null, callFrame: Protocol.Runtime.CallFrame, options?: LinkifyOptions): HTMLElement | null;
    linkifyStackTraceTopFrame(target: SDK.Target.Target, stackTrace: Protocol.Runtime.StackTrace, classes?: string): HTMLElement;
    linkifyCSSLocation(rawLocation: SDK.CSSModel.CSSLocation, classes?: string): Element;
    reset(): void;
    dispose(): void;
    _updateAnchor(anchor: HTMLElement, liveLocation: Bindings.LiveLocation.LiveLocation): Promise<void>;
    setLiveLocationUpdateCallback(callback: () => void): void;
    static _updateLinkDecorations(anchor: Element): void;
    static linkifyURL(url: string, options?: LinkifyURLOptions): HTMLElement;
    static linkifyRevealable(revealable: Object, text: string | HTMLElement, fallbackHref?: string, title?: string, className?: string): HTMLElement;
    static _createLink(text: string | HTMLElement, className: string, options?: _CreateLinkOptions): HTMLElement;
    static _setTrimmedText(link: Element, text: string, maxLength?: number): void;
    static _appendTextWithoutHashes(link: Element, string: string): void;
    static _appendHiddenText(link: Element, string: string): void;
    static untruncatedNodeText(node: Node): string;
    static linkInfo(link: Element | null): _LinkInfo | null;
    static _handleClick(event: Event): boolean;
    static _handleClickFromNewComponentLand(linkInfo: _LinkInfo): void;
    static invokeFirstAction(linkInfo: _LinkInfo): boolean;
    static _linkHandlerSetting(): Common.Settings.Setting<string>;
    static registerLinkHandler(title: string, handler: LinkHandler): void;
    static unregisterLinkHandler(title: string): void;
    static uiLocation(link: Element): Workspace.UISourceCode.UILocation | null;
    static _linkActions(info: _LinkInfo): {
        section: string;
        title: string;
        handler: () => Promise<void> | void;
    }[];
}
export interface LinkDecorator extends Common.EventTarget.EventTarget {
    linkIcon(uiSourceCode: Workspace.UISourceCode.UISourceCode): UI.Icon.Icon | null;
}
export declare namespace LinkDecorator {
    enum Events {
        LinkIconChanged = "LinkIconChanged"
    }
}
export declare class LinkContextMenuProvider implements UI.ContextMenu.Provider {
    static instance(opts?: {
        forceNew: boolean | null;
    }): LinkContextMenuProvider;
    appendApplicableItems(event: Event, contextMenu: UI.ContextMenu.ContextMenu, target: Object): void;
}
export declare class LinkHandlerSettingUI implements UI.SettingsUI.SettingUI {
    _element: HTMLSelectElement;
    private constructor();
    static instance(opts?: {
        forceNew: boolean | null;
    }): LinkHandlerSettingUI;
    _update(): void;
    _onChange(event: Event): void;
    settingElement(): Element | null;
}
export declare class ContentProviderContextMenuProvider implements UI.ContextMenu.Provider {
    static instance(opts?: {
        forceNew: boolean | null;
    }): ContentProviderContextMenuProvider;
    appendApplicableItems(event: Event, contextMenu: UI.ContextMenu.ContextMenu, target: Object): void;
}
export interface _LinkInfo {
    icon: UI.Icon.Icon | null;
    enableDecorator: boolean;
    uiLocation: Workspace.UISourceCode.UILocation | null;
    liveLocation: Bindings.LiveLocation.LiveLocation | null;
    url: string | null;
    lineNumber: number | null;
    columnNumber: number | null;
    inlineFrameIndex: number;
    revealable: Object | null;
    fallback: Element | null;
}
export interface LinkifyURLOptions {
    text?: string;
    className?: string;
    lineNumber?: number;
    columnNumber?: number;
    inlineFrameIndex: number;
    preventClick?: boolean;
    maxLength?: number;
    tabStop?: boolean;
    bypassURLTrimming?: boolean;
}
export interface LinkifyOptions {
    className?: string;
    columnNumber?: number;
    inlineFrameIndex: number;
    tabStop?: boolean;
}
export interface _CreateLinkOptions {
    maxLength?: number;
    title?: string;
    href?: string;
    preventClick?: boolean;
    tabStop?: boolean;
    bypassURLTrimming?: boolean;
}
export declare type LinkHandler = (arg0: TextUtils.ContentProvider.ContentProvider, arg1: number) => void;
