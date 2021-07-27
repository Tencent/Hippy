import * as Common from '../../core/common/common.js';
import * as Platform from '../../core/platform/platform.js';
import * as TextUtils from '../text_utils/text_utils.js';
import type { Project } from './WorkspaceImpl.js';
export declare class UISourceCode extends Common.ObjectWrapper.ObjectWrapper implements TextUtils.ContentProvider.ContentProvider {
    _project: Project;
    _url: string;
    _origin: string;
    _parentURL: string;
    _name: string;
    _contentType: Common.ResourceType.ResourceType;
    _requestContentPromise: Promise<TextUtils.ContentProvider.DeferredContent> | null;
    _decorations: Platform.MapUtilities.Multimap<string, LineMarker> | null;
    _hasCommits: boolean;
    _messages: Set<Message> | null;
    _contentLoaded: boolean;
    _content: TextUtils.ContentProvider.DeferredContent | null;
    _forceLoadOnCheckContent: boolean;
    _checkingContent: boolean;
    _lastAcceptedContent: string | null;
    _workingCopy: string | null;
    _workingCopyGetter: (() => string) | null;
    _disableEdit: boolean;
    _contentEncoded?: boolean;
    constructor(project: Project, url: string, contentType: Common.ResourceType.ResourceType);
    requestMetadata(): Promise<UISourceCodeMetadata | null>;
    name(): string;
    mimeType(): string;
    url(): string;
    parentURL(): string;
    origin(): string;
    fullDisplayName(): string;
    displayName(skipTrim?: boolean): string;
    canRename(): boolean;
    rename(newName: string): Promise<boolean>;
    remove(): void;
    _updateName(name: string, url: string, contentType?: Common.ResourceType.ResourceType): void;
    contentURL(): string;
    contentType(): Common.ResourceType.ResourceType;
    contentEncoded(): Promise<boolean>;
    project(): Project;
    requestContent(): Promise<TextUtils.ContentProvider.DeferredContent>;
    _requestContentImpl(): Promise<TextUtils.ContentProvider.DeferredContent>;
    checkContentUpdated(): Promise<void>;
    forceLoadOnCheckContent(): void;
    _commitContent(content: string): void;
    _contentCommitted(content: string, committedByUser: boolean): void;
    addRevision(content: string): void;
    hasCommits(): boolean;
    workingCopy(): string;
    resetWorkingCopy(): void;
    _innerResetWorkingCopy(): void;
    setWorkingCopy(newWorkingCopy: string): void;
    setContent(content: string, isBase64: boolean): void;
    setWorkingCopyGetter(workingCopyGetter: () => string): void;
    _workingCopyChanged(): void;
    removeWorkingCopyGetter(): void;
    commitWorkingCopy(): void;
    isDirty(): boolean;
    extension(): string;
    content(): string;
    loadError(): string | null;
    searchInContent(query: string, caseSensitive: boolean, isRegex: boolean): Promise<TextUtils.ContentProvider.SearchMatch[]>;
    contentLoaded(): boolean;
    uiLocation(lineNumber: number, columnNumber?: number): UILocation;
    messages(): Set<Message>;
    addLineMessage(level: Message.Level, text: string, lineNumber: number, columnNumber?: number, clickHandler?: (() => void)): Message;
    addMessage(message: Message): void;
    removeMessage(message: Message): void;
    _removeAllMessages(): void;
    addLineDecoration(lineNumber: number, type: string, data: any): void;
    addDecoration(range: TextUtils.TextRange.TextRange, type: string, data: any): void;
    removeDecorationsForType(type: string): void;
    allDecorations(): LineMarker[];
    removeAllDecorations(): void;
    decorationsForType(type: string): Set<LineMarker> | null;
    disableEdit(): void;
    editDisabled(): boolean;
}
export declare enum Events {
    WorkingCopyChanged = "WorkingCopyChanged",
    WorkingCopyCommitted = "WorkingCopyCommitted",
    TitleChanged = "TitleChanged",
    MessageAdded = "MessageAdded",
    MessageRemoved = "MessageRemoved",
    LineDecorationAdded = "LineDecorationAdded",
    LineDecorationRemoved = "LineDecorationRemoved"
}
export declare class UILocation {
    uiSourceCode: UISourceCode;
    lineNumber: number;
    columnNumber: number | undefined;
    constructor(uiSourceCode: UISourceCode, lineNumber: number, columnNumber?: number);
    linkText(skipTrim?: boolean): string;
    id(): string;
    lineId(): string;
    toUIString(): string;
    static comparator(location1: UILocation, location2: UILocation): number;
    compareTo(other: UILocation): number;
}
/**
 * A message associated with a range in a `UISourceCode`. The range will be
 * underlined starting at the range's start and ending at the line end (the
 * end of the range is currently disregarded).
 * An icon is going to appear at the end of the line according to the
 * `level` of the Message. This is only the model; displaying is handled
 * where UISourceCode displaying is handled.
 */
export declare class Message {
    _level: Message.Level;
    _text: string;
    _range: TextUtils.TextRange.TextRange;
    _clickHandler?: (() => void);
    constructor(level: Message.Level, text: string, clickHandler?: (() => void), range?: TextUtils.TextRange.TextRange);
    level(): Message.Level;
    text(): string;
    clickHandler(): (() => void) | undefined;
    lineNumber(): number;
    columnNumber(): number | undefined;
    isEqual(another: Message): boolean;
}
export declare namespace Message {
    enum Level {
        Error = "Error",
        Issue = "Issue",
        Warning = "Warning"
    }
}
export declare class LineMarker {
    _range: TextUtils.TextRange.TextRange;
    _type: string;
    _data: any;
    constructor(range: TextUtils.TextRange.TextRange, type: string, data: any);
    range(): TextUtils.TextRange.TextRange;
    type(): string;
    data(): any;
}
export declare class UISourceCodeMetadata {
    modificationTime: Date | null;
    contentSize: number | null;
    constructor(modificationTime: Date | null, contentSize: number | null);
}
