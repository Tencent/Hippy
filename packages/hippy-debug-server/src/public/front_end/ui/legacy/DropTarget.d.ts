export declare class DropTarget {
    _element: Element;
    _transferTypes: {
        kind: string;
        type: RegExp;
    }[];
    _messageText: string;
    _handleDrop: (arg0: DataTransfer) => void;
    _enabled: boolean;
    _dragMaskElement: Element | null;
    constructor(element: Element, transferTypes: {
        kind: string;
        type: RegExp;
    }[], messageText: string, handleDrop: (arg0: DataTransfer) => void);
    setEnabled(enabled: boolean): void;
    _onDragEnter(event: Event): void;
    _hasMatchingType(ev: Event): boolean;
    _onDragOver(ev: Event): void;
    _onDrop(ev: Event): void;
    _onDragLeave(event: Event): void;
    _removeMask(): void;
}
export declare const Type: {
    URI: {
        kind: string;
        type: RegExp;
    };
    Folder: {
        kind: string;
        type: RegExp;
    };
    File: {
        kind: string;
        type: RegExp;
    };
    WebFile: {
        kind: string;
        type: RegExp;
    };
    ImageFile: {
        kind: string;
        type: RegExp;
    };
};
