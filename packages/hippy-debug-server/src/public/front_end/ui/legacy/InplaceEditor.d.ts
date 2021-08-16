import { ElementFocusRestorer } from './UIUtils.js';
export declare class InplaceEditor<T> {
    _focusRestorer?: ElementFocusRestorer;
    static startEditing<T>(element: Element, config?: Config<T>): Controller | null;
    editorContent(editingContext: EditingContext<T>): string;
    setUpEditor(editingContext: EditingContext<T>): void;
    closeEditor(editingContext: EditingContext<T>): void;
    cancelEditing(editingContext: EditingContext<T>): void;
    startEditing(element: Element, inputConfig?: Config<T>): Controller | null;
}
export declare type CommitHandler<T> = (arg0: Element, arg1: string, arg2: string, arg3: T, arg4: string) => void;
export declare type CancelHandler<T> = (arg0: Element, arg1: T) => void;
export declare type BlurHandler = (arg0: Element, arg1?: Event | undefined) => boolean;
export declare class Config<T = undefined> {
    commitHandler: CommitHandler<T>;
    cancelHandler: CancelHandler<T>;
    context: T;
    blurHandler: BlurHandler | undefined;
    pasteHandler: EventHandler | null;
    postKeydownFinishHandler: EventHandler | null;
    constructor(commitHandler: CommitHandler<T>, cancelHandler: CancelHandler<T>, context?: T, blurHandler?: BlurHandler);
    setPasteHandler(pasteHandler: EventHandler): void;
    setPostKeydownFinishHandler(postKeydownFinishHandler: EventHandler): void;
}
export declare type EventHandler = (event: Event) => string | undefined;
export interface Controller {
    cancel: () => void;
    commit: () => void;
}
export interface EditingContext<T> {
    element: Element;
    config: Config<T>;
    oldRole: string | null;
    oldText: string | null;
    oldTabIndex: number | null;
}
