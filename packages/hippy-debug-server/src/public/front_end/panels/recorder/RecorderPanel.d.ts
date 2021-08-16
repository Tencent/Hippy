import * as UI from '../../ui/legacy/legacy.js';
export declare class RecorderPanel extends UI.Panel.Panel {
    private recording;
    constructor();
    static instance(opts?: {
        forceNew: boolean | null;
    }): RecorderPanel;
}
