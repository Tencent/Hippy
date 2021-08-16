import type * as Common from '../../core/common/common.js';
import type { Widget } from './Widget.js';
export declare class Infobar {
    element: HTMLElement;
    _shadowRoot: ShadowRoot;
    _contentElement: HTMLDivElement;
    _mainRow: HTMLElement;
    _detailsRows: HTMLElement;
    _hasDetails: boolean;
    _detailsMessage: string;
    _infoContainer: HTMLElement;
    _infoMessage: HTMLElement;
    _infoText: HTMLElement;
    _actionContainer: HTMLElement;
    _disableSetting: Common.Settings.Setting<any> | null;
    _closeContainer: HTMLElement;
    _toggleElement: HTMLButtonElement;
    _closeButton: HTMLElement;
    _closeCallback: (() => any) | null;
    _parentView?: Widget;
    constructor(type: Type, text: string, actions?: InfobarAction[], disableSetting?: Common.Settings.Setting<any>);
    static create(type: Type, text: string, actions?: InfobarAction[], disableSetting?: Common.Settings.Setting<any>): Infobar | null;
    dispose(): void;
    setText(text: string): void;
    setCloseCallback(callback: (() => any) | null): void;
    setParentView(parentView: Widget): void;
    _actionCallbackFactory(action: InfobarAction): () => void;
    _onResize(): void;
    _onDisable(): void;
    _onToggleDetails(): void;
    createDetailsRowMessage(message?: string): Element;
}
export interface InfobarAction {
    text: string;
    highlight: boolean;
    delegate: (() => void) | null;
    dismiss: boolean;
}
export declare enum Type {
    Warning = "warning",
    Info = "info",
    Issue = "issue"
}
