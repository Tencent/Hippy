// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Root from '../../../core/root/root.js';
import * as ThemeSupport from '../../legacy/theme_support/theme_support.js';
const sheetsCache = new Map();
/**
 * Helper for importing a legacy stylesheet into a component.
 *
 * Given a path to a stylesheet, it returns a CSSStyleSheet that can then be
 * adopted by your component.
 */
export function getStyleSheets(path, { enableLegacyPatching } = {
    enableLegacyPatching: false,
}) {
    const cachedResult = sheetsCache.get(path);
    if (cachedResult && cachedResult.enableLegacyPatching === enableLegacyPatching) {
        return cachedResult.sheets;
    }
    const content = Root.Runtime.cachedResources.get(path) || '';
    if (!content) {
        throw new Error(`${path} not preloaded.`);
    }
    const originalStylesheet = new CSSStyleSheet();
    originalStylesheet.replaceSync(content);
    const themeStyleSheet = ThemeSupport.ThemeSupport.instance().themeStyleSheet(path, content);
    if (!enableLegacyPatching || !themeStyleSheet) {
        sheetsCache.set(path, { enableLegacyPatching, sheets: [originalStylesheet] });
        return [originalStylesheet];
    }
    const patchedStyleSheet = new CSSStyleSheet();
    patchedStyleSheet.replaceSync(themeStyleSheet + '\n' + Root.Runtime.Runtime.resolveSourceURL(path + '.theme'));
    sheetsCache.set(path, { enableLegacyPatching, sheets: [originalStylesheet, patchedStyleSheet] });
    return [originalStylesheet, patchedStyleSheet];
}
/*
 * The getStylesheet helper in components reads styles out of the runtime cache.
 * In a proper build this is populated but in test runs because we don't load
 * all of DevTools it's not. Therefore we fetch all the CSS files and populate
 * the cache before any tests are run.
 *
 * The out/Release/gen/front_end URL is prepended so within the Karma config we can proxy
 * them through to the right place, respecting Karma's ROOT_DIRECTORY setting.
 */
export const CSS_RESOURCES_TO_LOAD_INTO_RUNTIME = [
    'ui/legacy/checkboxTextLabel.css',
    'ui/legacy/closeButton.css',
    'ui/legacy/confirmDialog.css',
    'ui/legacy/dialog.css',
    'ui/legacy/dropTarget.css',
    'ui/legacy/emptyWidget.css',
    'ui/legacy/filter.css',
    'ui/legacy/glassPane.css',
    'ui/legacy/infobar.css',
    'ui/legacy/inlineButton.css',
    'ui/legacy/inspectorCommon.css',
    'ui/legacy/inspectorScrollbars.css',
    'ui/legacy/themeColors.css',
    'ui/legacy/inspectorSyntaxHighlight.css',
    'ui/legacy/inspectorSyntaxHighlightDark.css',
    'ui/legacy/inspectorViewTabbedPane.css',
    'ui/legacy/listWidget.css',
    'ui/legacy/popover.css',
    'ui/legacy/progressIndicator.css',
    'ui/legacy/radioButton.css',
    'ui/legacy/remoteDebuggingTerminatedScreen.css',
    'ui/legacy/reportView.css',
    'ui/legacy/rootView.css',
    'ui/legacy/searchableView.css',
    'ui/legacy/slider.css',
    'ui/legacy/smallBubble.css',
    'ui/legacy/softContextMenu.css',
    'ui/legacy/softDropDown.css',
    'ui/legacy/softDropDownButton.css',
    'ui/legacy/splitWidget.css',
    'ui/legacy/toolbar.css',
    'ui/legacy/suggestBox.css',
    'ui/legacy/tabbedPane.css',
    'ui/legacy/targetCrashedScreen.css',
    'ui/legacy/textButton.css',
    'ui/legacy/textPrompt.css',
    'ui/legacy/tooltip.css',
    'ui/legacy/treeoutline.css',
    'ui/legacy/viewContainers.css',
    'panels/elements/layoutPane.css',
    'ui/legacy/components/utils/imagePreview.css',
    'ui/legacy/components/utils/jsUtils.css',
    'models/persistence/editFileSystemView.css',
    'models/persistence/workspaceSettingsTab.css',
    'panels/mobile_throttling/throttlingSettingsTab.css',
    'panels/emulation/deviceModeToolbar.css',
    'panels/emulation/deviceModeView.css',
    'panels/emulation/devicesSettingsTab.css',
    'panels/emulation/inspectedPagePlaceholder.css',
    'panels/emulation/locationsSettingsTab.css',
    'panels/emulation/mediaQueryInspector.css',
    'panels/emulation/sensors.css',
    'ui/legacy/components/inline_editor/colorSwatch.css',
    'entrypoints/inspector_main/nodeIcon.css',
    'entrypoints/inspector_main/renderingOptions.css',
    'ui/legacy/components/data_grid/dataGrid.css',
    'panels/help/releaseNote.css',
    'ui/legacy/components/object_ui/customPreviewComponent.css',
    'ui/legacy/components/object_ui/objectPopover.css',
    'ui/legacy/components/object_ui/objectPropertiesSection.css',
    'ui/legacy/components/object_ui/objectValue.css',
    'panels/console/consoleContextSelector.css',
    'panels/console/consolePinPane.css',
    'panels/console/consolePrompt.css',
    'panels/console/consoleSidebar.css',
    'panels/console/consoleView.css',
    'third_party/codemirror/codemirror.css',
    'ui/legacy/components/text_editor/autocompleteTooltip.css',
    'ui/legacy/components/text_editor/cmdevtools.css',
    'ui/legacy/components/text_editor/cmdevtools.darkmode.css',
    'panels/application/serviceWorkerUpdateCycleView.css',
];
//# sourceMappingURL=get-stylesheet.js.map