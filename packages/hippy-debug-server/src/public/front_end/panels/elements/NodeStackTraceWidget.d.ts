import * as Components from '../../ui/legacy/components/utils/utils.js';
import * as UI from '../../ui/legacy/legacy.js';
export declare class NodeStackTraceWidget extends UI.ThrottledWidget.ThrottledWidget {
    _noStackTraceElement: HTMLElement;
    _creationStackTraceElement: HTMLElement;
    _linkifier: Components.Linkifier.Linkifier;
    constructor();
    static instance(opts?: {
        forceNew: boolean | null;
    } | undefined): NodeStackTraceWidget;
    wasShown(): void;
    willHide(): void;
    doUpdate(): Promise<void>;
}
export declare const MaxLengthForLinks = 40;
