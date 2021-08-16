import * as UI from '../../ui/legacy/legacy.js';
import type { ReleaseNote } from './HelpImpl.js';
export declare class ReleaseNoteView extends UI.Widget.VBox {
    _releaseNoteElement: Element;
    constructor();
    static instance(opts?: {
        forceNew: boolean | null;
    }): ReleaseNoteView;
    elementsToRestoreScrollPositionsFor(): Element[];
    _createReleaseNoteElement(releaseNote: ReleaseNote): Element;
}
