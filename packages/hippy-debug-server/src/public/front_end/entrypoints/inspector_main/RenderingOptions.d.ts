import * as Common from '../../core/common/common.js';
import * as UI from '../../ui/legacy/legacy.js';
export declare class RenderingOptionsView extends UI.Widget.VBox {
    private constructor();
    static instance(opts?: {
        forceNew: boolean | null;
    }): RenderingOptionsView;
    _createCheckbox(label: string, subtitle: string, setting: Common.Settings.Setting<boolean>): UI.UIUtils.CheckboxLabel;
    _appendCheckbox(label: string, subtitle: string, setting: Common.Settings.Setting<boolean>): UI.UIUtils.CheckboxLabel;
    _appendSelect(label: string, setting: Common.Settings.Setting<any>): void;
}
