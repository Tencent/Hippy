import * as Common from '../../core/common/common.js';
interface SaveCallbackParam {
    fileSystemPath?: string;
}
export declare class FileManager extends Common.ObjectWrapper.ObjectWrapper {
    _saveCallbacks: Map<string, (arg0: SaveCallbackParam | null) => void>;
    private constructor();
    static instance(opts?: {
        forceNew: boolean | null;
    }): FileManager;
    save(url: string, content: string, forceSaveAs: boolean): Promise<SaveCallbackParam | null>;
    _savedURL(event: Common.EventTarget.EventTargetEvent): void;
    _canceledSavedURL(event: Common.EventTarget.EventTargetEvent): void;
    append(url: string, content: string): void;
    close(url: string): void;
    _appendedToURL(event: Common.EventTarget.EventTargetEvent): void;
}
export declare enum Events {
    AppendedToURL = "AppendedToURL"
}
export {};
