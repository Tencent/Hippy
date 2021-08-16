import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Protocol from '../../generated/protocol.js';
import * as Bindings from '../../models/bindings/bindings.js';
import * as DataGrid from '../../ui/legacy/components/data_grid/data_grid.js';
import * as ObjectUI from '../../ui/legacy/components/object_ui/object_ui.js';
import * as Components from '../../ui/legacy/components/utils/utils.js';
import * as UI from '../../ui/legacy/legacy.js';
import type { ConsoleViewportElement } from './ConsoleViewport.js';
export declare const getMessageForElement: (element: Element) => ConsoleViewMessage | undefined;
export declare class ConsoleViewMessage implements ConsoleViewportElement {
    _message: SDK.ConsoleModel.ConsoleMessage;
    _linkifier: Components.Linkifier.Linkifier;
    _repeatCount: number;
    _closeGroupDecorationCount: number;
    _nestingLevel: number;
    _selectableChildren: {
        element: HTMLElement;
        forceSelect: () => void;
    }[];
    _messageResized: (arg0: Common.EventTarget.EventTargetEvent) => void;
    _element: HTMLElement | null;
    _previewFormatter: ObjectUI.RemoteObjectPreviewFormatter.RemoteObjectPreviewFormatter;
    _searchRegex: RegExp | null;
    _messageLevelIcon: UI.Icon.Icon | null;
    _traceExpanded: boolean;
    _expandTrace: ((arg0: boolean) => void) | null;
    _anchorElement: HTMLElement | null;
    _contentElement: HTMLElement | null;
    _nestingLevelMarkers: HTMLElement[] | null;
    _searchHighlightNodes: Element[];
    _searchHighlightNodeChanges: UI.UIUtils.HighlightChange[];
    _isVisible: boolean;
    _cachedHeight: number;
    _messagePrefix: string;
    _timestampElement: HTMLElement | null;
    _inSimilarGroup: boolean;
    _similarGroupMarker: HTMLElement | null;
    _lastInSimilarGroup: boolean;
    _groupKey: string;
    _repeatCountElement: UI.UIUtils.DevToolsSmallBubble | null;
    constructor(consoleMessage: SDK.ConsoleModel.ConsoleMessage, linkifier: Components.Linkifier.Linkifier, nestingLevel: number, onResize: (arg0: Common.EventTarget.EventTargetEvent) => void);
    element(): HTMLElement;
    wasShown(): void;
    onResize(): void;
    willHide(): void;
    isVisible(): boolean;
    fastHeight(): number;
    approximateFastHeight(): number;
    consoleMessage(): SDK.ConsoleModel.ConsoleMessage;
    _buildMessage(): HTMLElement;
    _formatAsNetworkRequest(): HTMLElement | null;
    _buildMessageAnchor(): HTMLElement | null;
    _buildMessageWithStackTrace(runtimeModel: SDK.RuntimeModel.RuntimeModel): HTMLElement;
    _linkifyLocation(url: string, lineNumber: number, columnNumber: number): HTMLElement | null;
    _linkifyStackTraceTopFrame(stackTrace: Protocol.Runtime.StackTrace): HTMLElement | null;
    _linkifyScriptId(scriptId: string, url: string, lineNumber: number, columnNumber: number): HTMLElement | null;
    _format(rawParameters: (string | SDK.RemoteObject.RemoteObject | Protocol.Runtime.RemoteObject | undefined)[]): HTMLElement;
    _formatParameter(output: SDK.RemoteObject.RemoteObject, forceObjectFormat?: boolean, includePreview?: boolean): HTMLElement;
    _formatParameterAsValue(obj: SDK.RemoteObject.RemoteObject): HTMLElement;
    _formatParameterAsTrustedType(obj: SDK.RemoteObject.RemoteObject): HTMLElement;
    _formatParameterAsObject(obj: SDK.RemoteObject.RemoteObject, includePreview?: boolean): HTMLElement;
    _formatParameterAsFunction(func: SDK.RemoteObject.RemoteObject, includePreview?: boolean): HTMLElement;
    _formattedParameterAsFunctionForTest(): void;
    _contextMenuEventFired(obj: SDK.RemoteObject.RemoteObject, event: Event): void;
    _renderPropertyPreviewOrAccessor(object: SDK.RemoteObject.RemoteObject | null, property: Protocol.Runtime.PropertyPreview, propertyPath: {
        name: (string | symbol);
    }[]): HTMLElement;
    _formatParameterAsNode(remoteObject: SDK.RemoteObject.RemoteObject): HTMLElement;
    _formattedParameterAsNodeForTest(): void;
    _formatParameterAsString(output: SDK.RemoteObject.RemoteObject): HTMLElement;
    _formatParameterAsError(output: SDK.RemoteObject.RemoteObject): HTMLElement;
    _formatAsArrayEntry(output: SDK.RemoteObject.RemoteObject): HTMLElement;
    _formatAsAccessorProperty(object: SDK.RemoteObject.RemoteObject | null, propertyPath: string[], isArrayEntry: boolean): HTMLElement;
    _formatWithSubstitutionString(format: string, parameters: SDK.RemoteObject.RemoteObject[], formattedResult: HTMLElement): {
        formattedResult: Element;
        unusedSubstitutions: ArrayLike<SDK.RemoteObject.RemoteObject> | null;
    };
    _applyForcedVisibleStyle(element: HTMLElement): void;
    matchesFilterRegex(regexObject: RegExp): boolean;
    matchesFilterText(filter: string): boolean;
    updateTimestamp(): void;
    nestingLevel(): number;
    setInSimilarGroup(inSimilarGroup: boolean, isLast?: boolean): void;
    isLastInSimilarGroup(): boolean;
    resetCloseGroupDecorationCount(): void;
    incrementCloseGroupDecorationCount(): void;
    _updateCloseGroupDecorations(): void;
    _focusedChildIndex(): number;
    _onKeyDown(event: KeyboardEvent): void;
    maybeHandleOnKeyDown(event: KeyboardEvent): boolean;
    _selectNearestVisibleChild(fromIndex: number, backwards?: boolean): boolean;
    _nearestVisibleChild(fromIndex: number, backwards?: boolean): {
        element: Element;
        forceSelect: () => void;
    } | null;
    focusLastChildOrSelf(): void;
    setContentElement(element: HTMLElement): void;
    getContentElement(): HTMLElement | null;
    contentElement(): HTMLElement;
    toMessageElement(): HTMLElement;
    updateMessageElement(): void;
    _shouldRenderAsWarning(): boolean;
    _updateMessageLevelIcon(): void;
    repeatCount(): number;
    resetIncrementRepeatCount(): void;
    incrementRepeatCount(): void;
    setRepeatCount(repeatCount: number): void;
    _showRepeatCountElement(): void;
    get text(): string;
    toExportString(): string;
    setSearchRegex(regex: RegExp | null): void;
    searchRegex(): RegExp | null;
    searchCount(): number;
    searchHighlightNode(index: number): Element;
    _getInlineFrames(debuggerModel: SDK.DebuggerModel.DebuggerModel, url: string, lineNumber: number | undefined, columnNumber: number | undefined): Promise<{
        frames: Bindings.DebuggerLanguagePlugins.FunctionInfo[];
    }>;
    _expandInlineStackFrames(debuggerModel: SDK.DebuggerModel.DebuggerModel, prefix: string, suffix: string, url: string, lineNumber: number | undefined, columnNumber: number | undefined, stackTrace: HTMLElement, insertBefore: HTMLElement): Promise<boolean>;
    _tryFormatAsError(string: string): HTMLElement | null;
    _linkifyWithCustomLinkifier(string: string, linkifier: (arg0: string, arg1: string, arg2?: number, arg3?: number) => Node): DocumentFragment;
    _linkifyStringAsFragment(string: string): DocumentFragment;
    static _tokenizeMessageText(string: string): {
        type?: string;
        text: string;
    }[];
    groupKey(): string;
    groupTitle(): string;
}
export declare class ConsoleGroupViewMessage extends ConsoleViewMessage {
    _collapsed: boolean;
    _expandGroupIcon: UI.Icon.Icon | null;
    _onToggle: () => void;
    constructor(consoleMessage: SDK.ConsoleModel.ConsoleMessage, linkifier: Components.Linkifier.Linkifier, nestingLevel: number, onToggle: () => void, onResize: (arg0: Common.EventTarget.EventTargetEvent) => void);
    _setCollapsed(collapsed: boolean): void;
    collapsed(): boolean;
    maybeHandleOnKeyDown(event: KeyboardEvent): boolean;
    toMessageElement(): HTMLElement;
    _showRepeatCountElement(): void;
}
export declare class ConsoleCommand extends ConsoleViewMessage {
    _formattedCommand: HTMLElement | null;
    constructor(consoleMessage: SDK.ConsoleModel.ConsoleMessage, linkifier: Components.Linkifier.Linkifier, nestingLevel: number, onResize: (arg0: Common.EventTarget.EventTargetEvent) => void);
    contentElement(): HTMLElement;
    _updateSearch(): void;
}
export declare class ConsoleCommandResult extends ConsoleViewMessage {
    contentElement(): HTMLElement;
}
export declare class ConsoleTableMessageView extends ConsoleViewMessage {
    _dataGrid: DataGrid.SortableDataGrid.SortableDataGrid<unknown> | null;
    constructor(consoleMessage: SDK.ConsoleModel.ConsoleMessage, linkifier: Components.Linkifier.Linkifier, nestingLevel: number, onResize: (arg0: Common.EventTarget.EventTargetEvent) => void);
    wasShown(): void;
    onResize(): void;
    contentElement(): HTMLElement;
    _buildTableMessage(): HTMLElement;
    approximateFastHeight(): number;
}
/**
 * @const
 */
export declare const MaxLengthForLinks: number;
export declare const getMaxTokenizableStringLength: () => number;
export declare const setMaxTokenizableStringLength: (length: number) => void;
export declare const getLongStringVisibleLength: () => number;
export declare const setLongStringVisibleLength: (length: number) => void;
