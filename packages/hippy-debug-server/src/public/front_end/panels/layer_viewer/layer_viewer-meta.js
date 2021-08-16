// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../../core/i18n/i18n.js';
import * as UI from '../../ui/legacy/legacy.js';
const UIStrings = {
    /**
    *@description Text in the Shortcuts page to explain a keyboard shortcut (reset view in Layers Panel)
    */
    resetView: 'Reset view',
    /**
   *@description Text in the Shortcuts page to explain a keyboard shortcut (switch to pan in Layers Panel)
   */
    switchToPanMode: 'Switch to pan mode',
    /**
   *@description Text in the Shortcuts page to explain a keyboard shortcut (switch to rotate mode in Layers Panel)
   */
    switchToRotateMode: 'Switch to rotate mode',
    /**
   *@description Text in the Shortcuts page to explain a keyboard shortcut (zoom in)
   */
    zoomIn: 'Zoom in',
    /**
   *@description Text in the Shortcuts page to explain a keyboard shortcut (zoom out)
   */
    zoomOut: 'Zoom out',
    /**
   *@description Description of a shortcut that pans or rotates the layer viewer up
   */
    panOrRotateUp: 'Pan or rotate up',
    /**
   *@description Description of a shortcut that pans or rotates the layer viewer down
   */
    panOrRotateDown: 'Pan or rotate down',
    /**
   *@description Description of a shortcut that pans or rotates the layer viewer left
   */
    panOrRotateLeft: 'Pan or rotate left',
    /**
   *@description Description of a shortcut that pans or rotates the layer viewer right
   */
    panOrRotateRight: 'Pan or rotate right',
};
const str_ = i18n.i18n.registerUIStrings('panels/layer_viewer/layer_viewer-meta.ts', UIStrings);
const i18nLazyString = i18n.i18n.getLazilyComputedLocalizedString.bind(undefined, str_);
UI.ActionRegistration.registerActionExtension({
    actionId: 'layers.reset-view',
    category: UI.ActionRegistration.ActionCategory.LAYERS,
    title: i18nLazyString(UIStrings.resetView),
    bindings: [
        {
            shortcut: '0',
        },
    ],
});
UI.ActionRegistration.registerActionExtension({
    actionId: 'layers.pan-mode',
    category: UI.ActionRegistration.ActionCategory.LAYERS,
    title: i18nLazyString(UIStrings.switchToPanMode),
    bindings: [
        {
            shortcut: 'x',
        },
    ],
});
UI.ActionRegistration.registerActionExtension({
    actionId: 'layers.rotate-mode',
    category: UI.ActionRegistration.ActionCategory.LAYERS,
    title: i18nLazyString(UIStrings.switchToRotateMode),
    bindings: [
        {
            shortcut: 'v',
        },
    ],
});
UI.ActionRegistration.registerActionExtension({
    actionId: 'layers.zoom-in',
    category: UI.ActionRegistration.ActionCategory.LAYERS,
    title: i18nLazyString(UIStrings.zoomIn),
    bindings: [
        {
            shortcut: 'Shift+Plus',
        },
        {
            shortcut: 'NumpadPlus',
        },
    ],
});
UI.ActionRegistration.registerActionExtension({
    actionId: 'layers.zoom-out',
    category: UI.ActionRegistration.ActionCategory.LAYERS,
    title: i18nLazyString(UIStrings.zoomOut),
    bindings: [
        {
            shortcut: 'Shift+Minus',
        },
        {
            shortcut: 'NumpadMinus',
        },
    ],
});
UI.ActionRegistration.registerActionExtension({
    actionId: 'layers.up',
    category: UI.ActionRegistration.ActionCategory.LAYERS,
    title: i18nLazyString(UIStrings.panOrRotateUp),
    bindings: [
        {
            shortcut: 'Up',
        },
        {
            shortcut: 'w',
        },
    ],
});
UI.ActionRegistration.registerActionExtension({
    actionId: 'layers.down',
    category: UI.ActionRegistration.ActionCategory.LAYERS,
    title: i18nLazyString(UIStrings.panOrRotateDown),
    bindings: [
        {
            shortcut: 'Down',
        },
        {
            shortcut: 's',
        },
    ],
});
UI.ActionRegistration.registerActionExtension({
    actionId: 'layers.left',
    category: UI.ActionRegistration.ActionCategory.LAYERS,
    title: i18nLazyString(UIStrings.panOrRotateLeft),
    bindings: [
        {
            shortcut: 'Left',
        },
        {
            shortcut: 'a',
        },
    ],
});
UI.ActionRegistration.registerActionExtension({
    actionId: 'layers.right',
    category: UI.ActionRegistration.ActionCategory.LAYERS,
    title: i18nLazyString(UIStrings.panOrRotateRight),
    bindings: [
        {
            shortcut: 'Right',
        },
        {
            shortcut: 'd',
        },
    ],
});
//# sourceMappingURL=layer_viewer-meta.js.map