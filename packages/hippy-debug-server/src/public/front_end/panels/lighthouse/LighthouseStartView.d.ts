import * as UI from '../../ui/legacy/legacy.js';
import type { LighthouseController } from './LighthouseController.js';
export declare class StartView extends UI.Widget.Widget {
    _controller: LighthouseController;
    _settingsToolbar: UI.Toolbar.Toolbar;
    _startButton: HTMLButtonElement;
    _helpText?: Element;
    _warningText?: Element;
    _shouldConfirm?: boolean;
    constructor(controller: LighthouseController);
    settingsToolbar(): UI.Toolbar.Toolbar;
    _populateRuntimeSettingAsRadio(settingName: string, label: string, parentElement: Element): void;
    _populateRuntimeSettingAsToolbarCheckbox(settingName: string, toolbar: UI.Toolbar.Toolbar): void;
    _populateFormControls(fragment: UI.Fragment.Fragment): void;
    _render(): void;
    onResize(): void;
    focusStartButton(): void;
    setStartButtonEnabled(isEnabled: boolean): void;
    setUnauditableExplanation(text: string | null): void;
    setWarningText(text: string | null): void;
}
