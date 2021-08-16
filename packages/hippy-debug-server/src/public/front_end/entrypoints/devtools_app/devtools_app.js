Root.allDescriptors.push(
  ...[
    {
      dependencies: ["ui/legacy/components/utils", "ui/legacy", "panels/mobile_throttling"],
      name: "panels/emulation",
    },
    {
      dependencies: ["ui/legacy/components/utils", "panels/mobile_throttling"],
      name: "entrypoints/inspector_main",
    },
    { dependencies: ["ui/legacy"], name: "panels/mobile_throttling" },
    { name: "panels/accessibility", modules: ["accessibility_module.js"] },
    { name: "panels/animation", modules: ["animation_module.js"] },
    {
      dependencies: [
        "ui/legacy/components/utils",
        "panels/emulation",
        "panels/timeline",
        "entrypoints/inspector_main",
        "ui/legacy",
      ],
      name: "panels/lighthouse",
      modules: ["lighthouse_module.js"],
    },
    {
      dependencies: ["panels/elements", "panels/sources", "panels/console"],
      name: "panels/browser_debugger",
      modules: ["browser_debugger_module.js"],
    },
    {
      dependencies: ["ui/legacy/components/data_grid"],
      name: "panels/css_overview",
      modules: ["css_overview_module.js"],
    },
    {
      dependencies: ["ui/legacy", "ui/legacy/components/data_grid"],
      name: "ui/legacy/components/cookie_table",
      modules: ["cookie_table_module.js"],
    },
    {
      dependencies: [
        "ui/legacy/components/utils",
        "models/extensions",
        "ui/legacy/components/inline_editor",
        "ui/legacy/components/color_picker",
        "panels/event_listeners",
        "ui/legacy/components/text_editor",
      ],
      name: "panels/elements",
      modules: ["elements_module.js"],
    },
    { dependencies: ["panels/emulation"], resources: [], name: "emulated_devices" },
    {
      dependencies: ["ui/legacy/components/utils", "panels/network", "ui/legacy"],
      name: "panels/issues",
      modules: ["issues_module.js"],
    },
    {
      dependencies: ["ui/legacy", "ui/legacy/components/data_grid"],
      name: "panels/developer_resources",
      modules: ["developer_resources_module.js"],
    },
    { dependencies: ["ui/legacy"], name: "panels/help", modules: ["help_module.js"] },
    { dependencies: ["panels/layer_viewer"], name: "panels/layers" },
    {
      dependencies: ["ui/legacy/components/utils", "ui/legacy", "ui/legacy/components/perf_ui"],
      name: "panels/layer_viewer",
      modules: ["layer_viewer_module.js"],
    },
    {
      dependencies: [
        "ui/legacy/components/utils",
        "ui/legacy/components/cookie_table",
        "ui/legacy/components/data_grid",
        "panels/mobile_throttling",
        "ui/legacy/components/object_ui",
        "ui/legacy/components/perf_ui",
        "models/persistence",
        "panels/search",
        "ui/legacy/components/source_frame",
        "ui/legacy",
      ],
      name: "panels/network",
      modules: ["network_module.js"],
    },
    {
      dependencies: ["ui/legacy"],
      name: "panels/performance_monitor",
      modules: ["performance_monitor_module.js"],
    },
    {
      dependencies: [
        "ui/legacy/components/source_frame",
        "ui/legacy/components/cookie_table",
        "ui/legacy/components/inline_editor",
        "ui/legacy/components/data_grid",
        "ui/legacy/components/utils",
        "ui/legacy/components/object_ui",
        "ui/legacy/components/perf_ui",
        "panels/mobile_throttling",
        "panels/network",
        "panels/sources",
      ],
      name: "panels/application",
      modules: ["application_module.js"],
    },
    { dependencies: ["panels/network"], name: "panels/security", modules: ["security_module.js"] },
    {
      dependencies: [
        "ui/legacy/components/utils",
        "panels/coverage",
        "panels/layer_viewer",
        "ui/legacy/components/perf_ui",
        "models/extensions",
        "ui/legacy/components/data_grid",
        "panels/profiler",
        "panels/mobile_throttling",
      ],
      name: "panels/timeline",
      modules: ["timeline_module.js"],
    },
    {
      dependencies: ["ui/legacy/components/utils", "ui/legacy"],
      name: "panels/web_audio",
      modules: ["web_audio_module.js"],
    },
    {
      dependencies: ["ui/legacy/components/data_grid", "ui/legacy"],
      name: "panels/webauthn",
      modules: ["webauthn_module.js"],
    },
    {
      dependencies: [
        "ui/legacy/components/utils",
        "ui/legacy",
        "ui/legacy/components/data_grid",
        "ui/legacy/components/source_frame",
        "ui/legacy/components/perf_ui",
      ],
      name: "panels/media",
      modules: ["media_module.js"],
    },
    { dependencies: ["ui/legacy"], name: "panels/recorder", modules: ["recorder_module.js"] },
  ]
);
Root.applicationDescriptor.modules.push(
  ...[
    { name: "panels/emulation", type: "autostart" },
    { name: "entrypoints/inspector_main", type: "autostart" },
    { name: "panels/mobile_throttling", type: "autostart" },
    { name: "panels/accessibility" },
    { name: "panels/animation" },
    { name: "panels/lighthouse" },
    { name: "panels/browser_debugger" },
    { name: "panels/css_overview" },
    { name: "ui/legacy/components/cookie_table" },
    { name: "panels/elements" },
    { name: "emulated_devices" },
    { name: "panels/issues" },
    { name: "panels/developer_resources" },
    { name: "panels/help" },
    { name: "panels/layers" },
    { name: "panels/layer_viewer" },
    { name: "panels/network" },
    { name: "panels/performance_monitor" },
    { name: "panels/application" },
    { name: "panels/security" },
    { name: "panels/timeline" },
    { name: "panels/web_audio" },
    { name: "panels/webauthn" },
    { name: "panels/media" },
    { name: "panels/recorder" },
  ]
);
import * as RootModule from "../../core/root/root.js";
RootModule.Runtime.cachedResources.set(
  "panels/mobile_throttling/throttlingSettingsTab.css",
  "/*\n * Copyright 2015 The Chromium Authors. All rights reserved.\n * Use of this source code is governed by a BSD-style license that can be\n * found in the LICENSE file.\n */\n\n:host {\n  overflow: hidden;\n}\n\n.header {\n  padding: 0 0 6px;\n  border-bottom: 1px solid var(--color-details-hairline);\n  font-size: 18px;\n  font-weight: normal;\n  flex: none;\n}\n\n.add-conditions-button {\n  flex: none;\n  margin: 10px 2px;\n  min-width: 140px;\n  align-self: flex-start;\n}\n\n.conditions-list {\n  max-width: 500px;\n  min-width: 340px;\n  flex: auto;\n}\n\n.conditions-list-item {\n  padding: 3px 5px 3px 5px;\n  height: 30px;\n  display: flex;\n  align-items: center;\n  position: relative;\n  flex: auto 1 1;\n}\n\n.conditions-list-text {\n  white-space: nowrap;\n  text-overflow: ellipsis;\n  flex: 0 0 70px;\n  user-select: none;\n  color: var(--color-text-primary);\n  text-align: end;\n  position: relative;\n}\n\n.conditions-list-title {\n  text-align: start;\n  display: flex;\n  flex: auto;\n  align-items: flex-start;\n}\n\n.conditions-list-title-text {\n  overflow: hidden;\n  flex: auto;\n  white-space: nowrap;\n  text-overflow: ellipsis;\n}\n\n.conditions-list-separator {\n  flex: 0 0 1px;\n  background-color: var(--color-background-elevation-2);\n  height: 30px;\n  margin: 0 4px;\n}\n\n.conditions-list-separator-invisible {\n  visibility: hidden;\n  height: 100% !important; /* stylelint-disable-line declaration-no-important */\n}\n\n.conditions-edit-row {\n  flex: none;\n  display: flex;\n  flex-direction: row;\n  margin: 6px 5px;\n}\n\n.conditions-edit-row input {\n  width: 100%;\n  text-align: inherit;\n}\n\n.conditions-edit-optional {\n  position: absolute;\n  bottom: -20px;\n  right: 0;\n  color: var(--color-text-disabled);\n}\n\n/*# sourceURL=panels/mobile_throttling/throttlingSettingsTab.css */"
);
RootModule.Runtime.cachedResources.set(
  "panels/emulation/deviceModeToolbar.css",
  "/*\n * Copyright 2015 The Chromium Authors. All rights reserved.\n * Use of this source code is governed by a BSD-style license that can be\n * found in the LICENSE file.\n */\n\n.device-mode-size-input {\n  width: 41px;\n  max-height: 18px;\n  margin: 0 2px;\n  text-align: center;\n}\n\n.device-mode-size-input:disabled {\n  background: transparent;\n  user-select: none;\n  opacity: 60%;\n}\n\n.device-mode-size-input:focus::-webkit-input-placeholder {\n  color: transparent;\n}\n\n.device-mode-x {\n  margin: 0 1px;\n  font-size: 16px;\n}\n\n.device-mode-empty-toolbar-element {\n  width: 0;\n}\n\n/*# sourceURL=panels/emulation/deviceModeToolbar.css */"
);
RootModule.Runtime.cachedResources.set(
  "panels/emulation/deviceModeView.css",
  "/*\n * Copyright 2015 The Chromium Authors. All rights reserved.\n * Use of this source code is governed by a BSD-style license that can be\n * found in the LICENSE file.\n */\n\n:host {\n  overflow: hidden;\n  align-items: stretch;\n  flex: auto;\n  background-color: var(--color-background-elevation-0);\n}\n\n.device-mode-toolbar {\n  flex: none;\n  background-color: var(--color-background-elevation-0);\n  border-bottom: 1px solid var(--color-details-hairline);\n  display: flex;\n  flex-direction: row;\n  align-items: stretch;\n}\n\n.device-mode-toolbar .toolbar {\n  overflow: hidden;\n  flex: 0 100000 auto;\n  padding: 0 5px;\n}\n\n.device-mode-toolbar .toolbar.device-mode-toolbar-fixed-size {\n  flex: 0 1 auto;\n}\n\n.device-mode-toolbar-options.toolbar {\n  position: sticky;\n  right: 0;\n  flex: none;\n}\n\n.device-mode-toolbar-spacer {\n  flex: 1 1 0;\n  display: flex;\n  flex-direction: row;\n  overflow: hidden;\n}\n\n.device-mode-content-clip {\n  overflow: hidden;\n  flex: auto;\n}\n\n.device-mode-media-container {\n  flex: none;\n  overflow: hidden;\n  box-shadow: inset 0 -1px var(--color-details-hairline);\n}\n\n.device-mode-content-clip:not(.device-mode-outline-visible) .device-mode-media-container {\n  margin-bottom: 20px;\n}\n\n.device-mode-presets-container {\n  flex: 0 0 20px;\n  display: flex;\n}\n\n.device-mode-presets-container-inner {\n  flex: auto;\n  justify-content: center;\n  position: relative;\n  background-color: var(--color-background-elevation-2);\n  border: 2px solid var(--color-background-elevation-0);\n  border-bottom: 2px solid var(--color-background-elevation-0);\n}\n\n.device-mode-presets-container:hover {\n  transition: opacity 0.1s;\n  transition-delay: 50ms;\n  opacity: 100%;\n}\n\n.device-mode-preset-bar-outer {\n  pointer-events: none;\n  display: flex;\n  justify-content: center;\n}\n\n.device-mode-preset-bar {\n  border-left: 2px solid var(--color-background-elevation-0);\n  border-right: 2px solid var(--color-background-elevation-0);\n  pointer-events: auto;\n  text-align: center;\n  flex: none;\n  cursor: pointer;\n  color: var(--color-text-primary);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  white-space: nowrap;\n  margin-bottom: 1px;\n}\n\n.device-mode-preset-bar:hover {\n  transition: background-color 0.1s;\n  transition-delay: 50ms;\n  background-color: var(--color-background-highlight);\n}\n\n.device-mode-preset-bar > span {\n  visibility: hidden;\n}\n\n.device-mode-preset-bar:hover > span {\n  transition: visibility 0.1s;\n  transition-delay: 50ms;\n  visibility: visible;\n}\n\n.device-mode-content-area {\n  flex: auto;\n  position: relative;\n  margin: 0;\n}\n\n.device-mode-screen-area {\n  position: absolute;\n  left: 0;\n  right: 0;\n  width: 0;\n  height: 0;\n  background-color: var(--color-background-inverted);\n}\n\n.device-mode-content-clip:not(.device-mode-outline-visible) .device-mode-screen-area {\n  --override-screen-area-box-shadow: hsl(240deg 3% 84%) 0 0 0 0.5px, hsl(0deg 0% 80% / 40%) 0 0 20px;\n\n  box-shadow: var(--override-screen-area-box-shadow);\n}\n\n.-theme-with-dark-background .device-mode-content-clip:not(.device-mode-outline-visible) .device-mode-screen-area,\n:host-context(.-theme-with-dark-background) .device-mode-content-clip:not(.device-mode-outline-visible) .device-mode-screen-area {\n  --override-screen-area-box-shadow: rgb(40 40 42) 0 0 0 0.5px, rgb(51 51 51 / 40%) 0 0 20px;\n}\n\n.device-mode-screen-image {\n  position: absolute;\n  left: 0;\n  top: 0;\n  width: 100%;\n  height: 100%;\n}\n\n.device-mode-resizer {\n  position: absolute;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  overflow: hidden;\n  transition: background-color 0.1s ease, opacity 0.1s ease;\n}\n\n.device-mode-resizer:hover {\n  background-color: var(--color-background-elevation-2);\n  opacity: 100%;\n}\n\n.device-mode-resizer > div {\n  pointer-events: none;\n}\n\n.device-mode-right-resizer {\n  top: 0;\n  bottom: -1px;\n  right: -20px;\n  width: 20px;\n}\n\n.device-mode-left-resizer {\n  top: 0;\n  bottom: -1px;\n  left: -20px;\n  width: 20px;\n  opacity: 0%;\n}\n\n.device-mode-bottom-resizer {\n  left: 0;\n  right: -1px;\n  bottom: -20px;\n  height: 20px;\n}\n\n.device-mode-bottom-right-resizer {\n  left: 0;\n  top: 0;\n  right: -20px;\n  bottom: -20px;\n  background-color: var(--color-background-elevation-1);\n}\n\n.device-mode-bottom-left-resizer {\n  left: -20px;\n  top: 0;\n  right: 0;\n  bottom: -20px;\n  opacity: 0%;\n}\n\n.device-mode-right-resizer > div {\n  content: var(--image-file-resizeHorizontal);\n  width: 6px;\n  height: 26px;\n}\n\n.device-mode-left-resizer > div {\n  content: var(--image-file-resizeHorizontal);\n  width: 6px;\n  height: 26px;\n}\n\n.device-mode-bottom-resizer > div {\n  content: var(--image-file-resizeVertical);\n  margin-bottom: -2px;\n  width: 26px;\n  height: 6px;\n}\n\n.device-mode-bottom-right-resizer > div {\n  position: absolute;\n  bottom: 3px;\n  right: 3px;\n  width: 13px;\n  height: 13px;\n  content: var(--image-file-resizeDiagonal);\n}\n\n.device-mode-bottom-left-resizer > div {\n  position: absolute;\n  bottom: 3px;\n  left: 3px;\n  width: 13px;\n  height: 13px;\n  content: var(--image-file-resizeDiagonal);\n  transform: rotate(90deg);\n}\n\n.device-mode-page-area {\n  position: absolute;\n  left: 0;\n  right: 0;\n  width: 0;\n  height: 0;\n  display: flex;\n  background-color: var(--color-background-elevation-0);\n}\n\n.device-mode-ruler {\n  position: absolute;\n  overflow: visible;\n}\n\n.device-mode-ruler-top {\n  height: 20px;\n  right: 0;\n}\n\n.device-mode-ruler-left {\n  width: 20px;\n  bottom: 0;\n}\n\n.device-mode-ruler-content {\n  pointer-events: none;\n  position: absolute;\n  left: -20px;\n  top: -20px;\n\n  --override-device-ruler-border-color: hsl(0deg 0% 50%);\n}\n\n.device-mode-ruler-top .device-mode-ruler-content {\n  border-top: 1px solid transparent;\n  right: 0;\n  bottom: 20px;\n  background-color: var(--color-background-opacity-80);\n}\n\n.device-mode-ruler-left .device-mode-ruler-content {\n  border-left: 1px solid transparent;\n  border-top: 1px solid transparent;\n  right: 20px;\n  bottom: 0;\n}\n\n.-theme-with-dark-background .device-mode-ruler-content,\n:host-context(.-theme-with-dark-background) .device-mode-ruler-content {\n  --override-device-ruler-border-color: rgb(127 127 127);\n}\n\n.device-mode-content-clip.device-mode-outline-visible .device-mode-ruler-top .device-mode-ruler-content {\n  border-top: 1px solid var(--override-device-ruler-border-color);\n}\n\n.device-mode-content-clip.device-mode-outline-visible .device-mode-ruler-left .device-mode-ruler-content {\n  border-left: 1px solid var(--override-device-ruler-border-color);\n  border-top: 1px solid var(--override-device-ruler-border-color);\n}\n\n.device-mode-ruler-inner {\n  position: absolute;\n}\n\n.device-mode-ruler-top .device-mode-ruler-inner {\n  top: 0;\n  bottom: 0;\n  left: 20px;\n  right: 0;\n  border-bottom: 1px solid var(--override-device-ruler-border-color);\n}\n\n.device-mode-ruler-left .device-mode-ruler-inner {\n  left: 0;\n  right: 0;\n  top: 19px;\n  bottom: 0;\n  border-right: 1px solid var(--override-device-ruler-border-color);\n  background-color: var(--color-background-opacity-80);\n}\n\n.device-mode-ruler-marker {\n  position: absolute;\n}\n\n.device-mode-ruler-top .device-mode-ruler-marker {\n  width: 0;\n  height: 5px;\n  bottom: 0;\n  border-right: 1px solid var(--override-device-ruler-border-color);\n  margin-right: -1px;\n}\n\n.device-mode-ruler-top .device-mode-ruler-marker.device-mode-ruler-marker-medium {\n  height: 10px;\n}\n\n.device-mode-ruler-top .device-mode-ruler-marker.device-mode-ruler-marker-large {\n  height: 15px;\n}\n\n.device-mode-ruler-left .device-mode-ruler-marker {\n  height: 0;\n  width: 5px;\n  right: 0;\n  border-bottom: 1px solid var(--override-device-ruler-border-color);\n  margin-bottom: -1px;\n}\n\n.device-mode-ruler-left .device-mode-ruler-marker.device-mode-ruler-marker-medium {\n  width: 10px;\n}\n\n.device-mode-ruler-left .device-mode-ruler-marker.device-mode-ruler-marker-large {\n  width: 15px;\n}\n\n.device-mode-ruler-text {\n  color: var(--color-text-secondary);\n  position: relative;\n  pointer-events: auto;\n}\n\n.device-mode-ruler-text:hover {\n  color: var(--color-text-primary);\n}\n\n.device-mode-ruler-top .device-mode-ruler-text {\n  left: 2px;\n  top: -2px;\n}\n\n.device-mode-ruler-left .device-mode-ruler-text {\n  left: -4px;\n  top: -15px;\n  transform: rotate(270deg);\n}\n\n/*# sourceURL=panels/emulation/deviceModeView.css */"
);
RootModule.Runtime.cachedResources.set(
  "panels/emulation/devicesSettingsTab.css",
  "/*\n * Copyright 2015 The Chromium Authors. All rights reserved.\n * Use of this source code is governed by a BSD-style license that can be\n * found in the LICENSE file.\n */\n\n.devices-settings-tab .settings-tab.settings-content {\n  display: flex;\n  flex-direction: column;\n  align-items: flex-start;\n  height: 100%;\n  margin: 0;\n}\n\n.devices-settings-tab .devices-button-row {\n  flex: none;\n  display: flex;\n}\n\n.devices-settings-tab .devices-button-row button {\n  margin-right: 10px;\n  min-width: 120px;\n  flex: none;\n}\n\n.devices-settings-tab .devices-list {\n  width: 350px;\n  margin-top: 10px;\n}\n\n.devices-list-item {\n  padding: 3px 5px 3px 5px;\n  height: 30px;\n  display: flex;\n  align-items: center;\n  flex: auto 1 1;\n  cursor: pointer;\n  overflow: hidden;\n  color: var(--color-text-primary);\n  user-select: none;\n  white-space: nowrap;\n  text-overflow: ellipsis;\n}\n\n.devices-list-checkbox {\n  height: 12px;\n  width: 12px;\n  margin: 2px 5px 2px 2px;\n  flex: none;\n  pointer-events: none;\n}\n\n.devices-list-checkbox:focus {\n  outline: auto 5px -webkit-focus-ring-color;\n}\n\n.device-name {\n  white-space: nowrap;\n  text-overflow: ellipsis;\n  overflow: hidden;\n}\n\n.devices-edit-fields {\n  flex: auto;\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  padding-left: 4px;\n  margin-bottom: 5px;\n}\n\n.devices-edit-fields b {\n  margin-top: 8px;\n  margin-bottom: 0;\n}\n\n.devices-edit-client-hints-heading {\n  display: flex;\n  flex-direction: row;\n  align-items: center;\n  margin-bottom: 5px;\n}\n/* Don't want the bottom margin in the specific case of the folding one;\n * it messes with alignment with the arrow (which is a ::before) and  it's\n * spaced reasonably without it anyway\n */\nli .devices-edit-client-hints-heading {\n  margin-bottom: 0;\n}\n\n.devices-edit-client-hints-heading b {\n  margin-inline-end: 2px;\n}\n\n.devices-edit-client-hints-heading .help-icon {\n  margin-left: 2px;\n  margin-right: 2px;\n  vertical-align: middle;\n}\n\n.devices-edit-client-hints-heading a:focus {\n  box-shadow: var(--legacy-focus-ring-active-shadow);\n}\n\n.devices-edit-fields input {\n  flex: auto;\n  margin: 8px 5px 0 5px;\n}\n\nli.devices-edit-client-hints-field {\n  /* Cancel out padding from treeview's .tree-outline ol */\n  left: -12px;\n}\n\n.devices-edit-client-hints-field input {\n  flex: auto;\n  margin: 8px 5px 0 5px;\n}\n\n.devices-edit-fields .device-edit-fixed {\n  flex: 0 0 140px;\n}\n\n.devices-edit-fields select {\n  margin: 8px 5px 0 5px;\n}\n\n/*# sourceURL=panels/emulation/devicesSettingsTab.css */"
);
RootModule.Runtime.cachedResources.set(
  "panels/emulation/inspectedPagePlaceholder.css",
  "/*\n * Copyright 2016 The Chromium Authors. All rights reserved.\n * Use of this source code is governed by a BSD-style license that can be\n * found in the LICENSE file.\n */\n\n:host {\n  background-color: var(--color-background);\n}\n\n/*# sourceURL=panels/emulation/inspectedPagePlaceholder.css */"
);
RootModule.Runtime.cachedResources.set(
  "panels/emulation/locationsSettingsTab.css",
  "/*\n * Copyright 2018 The Chromium Authors. All rights reserved.\n * Use of this source code is governed by a BSD-style license that can be\n * found in the LICENSE file.\n */\n\n:host {\n  overflow: hidden;\n}\n\n.header {\n  padding: 0 0 6px;\n  border-bottom: 1px solid var(--color-details-hairline);\n  font-size: 18px;\n  font-weight: normal;\n  flex: none;\n}\n\n.add-locations-button {\n  flex: none;\n  margin: 10px 2px;\n  min-width: 140px;\n  align-self: flex-start;\n}\n\n.locations-list {\n  max-width: 600px;\n  min-width: 340px;\n  flex: auto;\n}\n\n.locations-list-item {\n  padding: 3px 6px;\n  height: 30px;\n  display: flex;\n  align-items: center;\n  position: relative;\n  flex: auto 1 1;\n}\n\n.locations-list-text {\n  white-space: nowrap;\n  text-overflow: ellipsis;\n  flex-basis: 170px;\n  user-select: none;\n  color: var(--color-text-primary);\n  position: relative;\n  overflow: hidden;\n}\n\n.locations-list-title {\n  text-align: start;\n}\n\n.locations-list-title-text {\n  overflow: hidden;\n  flex: auto;\n  white-space: nowrap;\n  text-overflow: ellipsis;\n}\n\n.locations-list-separator {\n  flex: 0 0 1px;\n  background-color: var(--color-details-hairline);\n  height: 30px;\n  margin: 0 4px;\n}\n\n.locations-list-separator-invisible {\n  visibility: hidden;\n  height: 100% !important; /* stylelint-disable-line declaration-no-important */\n}\n\n.locations-edit-row {\n  display: flex;\n  flex-direction: row;\n  margin: 6px 5px;\n}\n\n.locations-edit-row input {\n  width: 100%;\n  text-align: inherit;\n}\n\n.locations-input-container {\n  padding: 1px;\n}\n\n/*# sourceURL=panels/emulation/locationsSettingsTab.css */"
);
RootModule.Runtime.cachedResources.set(
  "panels/emulation/mediaQueryInspector.css",
  "/*\n * Copyright 2015 The Chromium Authors. All rights reserved.\n * Use of this source code is governed by a BSD-style license that can be\n * found in the LICENSE file.\n */\n/* Media query bars */\n\n.media-inspector-view {\n  height: 50px;\n  /* (min-width: 50px) */\n  --override-min-width-media-query-selector-background-color: rgb(255 204 128);\n  --override-min-width-media-query-selector-background-color-inactive: rgb(255 243 224);\n  --override-min-width-media-query-selector-marker-color: rgb(245 122 0);\n  /* (min-width: 50px) and (max-width: 50px) */\n  --override-min-and-max-width-media-query-selector-background-color: rgb(196 224 163);\n  --override-min-and-max-width-media-query-selector-background-color-inactive: rgb(234 246 235);\n  --override-min-and-max-width-media-query-selector-marker-color: rgb(104 159 56);\n  /* (max-width: 50px) */\n  --override-max-width-media-query-selector-background-color: rgb(144 202 249);\n  --override-max-width-media-query-selector-background-color-inactive: rgb(225 245 254);\n  --override-max-width-media-query-selector-marker-color: rgb(66 165 245);\n}\n\n.-theme-with-dark-background .media-inspector-view,\n:host-context(.-theme-with-dark-background) .media-inspector-view {\n  /* (min-width: 50px) */\n  --override-min-width-media-query-selector-background-color: rgb(127 76 0);\n  --override-min-width-media-query-selector-background-color-inactive: rgb(31 19 0);\n  --override-min-width-media-query-selector-marker-color: rgb(255 132 10);\n  /* (min-width: 50px) and (max-width: 50px) */\n  --override-min-and-max-width-media-query-selector-background-color: rgb(64 92 31);\n  --override-min-and-max-width-media-query-selector-background-color-inactive: rgb(9 21 10);\n  --override-min-and-max-width-media-query-selector-marker-color: rgb(144 199 96);\n  /* (max-width: 50px) */\n  --override-max-width-media-query-selector-background-color: rgb(6 64 111);\n  --override-max-width-media-query-selector-background-color-inactive: rgb(1 21 30);\n  --override-max-width-media-query-selector-marker-color: rgb(10 109 189);\n}\n\n.media-inspector-marker-container {\n  height: 14px;\n  margin: 2px 0;\n  position: relative;\n}\n\n.media-inspector-bar {\n  display: flex;\n  flex-direction: row;\n  align-items: stretch;\n  pointer-events: none;\n  position: absolute;\n  left: 0;\n  right: 0;\n  top: 0;\n  bottom: 0;\n}\n\n.media-inspector-marker {\n  flex: none;\n  pointer-events: auto;\n  margin: 1px 0;\n  white-space: nowrap;\n  z-index: auto;\n  position: relative;\n}\n\n.media-inspector-marker-spacer {\n  flex: auto;\n}\n\n.media-inspector-marker:hover {\n  margin: -1px 0;\n  opacity: 100%;\n}\n\n.media-inspector-marker-min-width {\n  flex: auto;\n  background-color: var(--override-min-width-media-query-selector-background-color);\n  border-right: 2px solid var(--override-min-width-media-query-selector-marker-color);\n  border-left: 2px solid var(--override-min-width-media-query-selector-marker-color);\n}\n\n.media-inspector-marker-min-width-right {\n  border-left: 2px solid var(--override-min-width-media-query-selector-marker-color);\n}\n\n.media-inspector-marker-min-width-left {\n  border-right: 2px solid var(--override-min-width-media-query-selector-marker-color);\n}\n\n.media-inspector-marker-min-max-width {\n  background-color: var(--override-min-and-max-width-media-query-selector-background-color);\n  border-left: 2px solid var(--override-min-and-max-width-media-query-selector-marker-color);\n  border-right: 2px solid var(--override-min-and-max-width-media-query-selector-marker-color);\n}\n\n.media-inspector-marker-min-max-width:hover {\n  z-index: 1;\n}\n\n.media-inspector-marker-max-width {\n  background-color: var(--override-max-width-media-query-selector-background-color);\n  border-right: 2px solid var(--override-max-width-media-query-selector-marker-color);\n  border-left: 2px solid var(--override-max-width-media-query-selector-marker-color);\n}\n\n/* Clear background colors when query is not active and not hovering */\n\n.media-inspector-marker-inactive .media-inspector-marker-min-width:not(:hover) {\n  background-color: var(--override-min-width-media-query-selector-background-color-inactive);\n}\n\n.media-inspector-marker-inactive .media-inspector-marker-min-max-width:not(:hover) {\n  background-color: var(--override-min-and-max-width-media-query-selector-background-color-inactive);\n}\n\n.media-inspector-marker-inactive .media-inspector-marker-max-width:not(:hover) {\n  background-color: var(--override-max-width-media-query-selector-background-color-inactive);\n}\n\n/* Media query labels */\n\n.media-inspector-marker-label-container {\n  position: absolute;\n  z-index: 1;\n}\n\n.media-inspector-marker:not(:hover) .media-inspector-marker-label-container {\n  display: none;\n}\n\n.media-inspector-marker-label-container-left {\n  left: -2px;\n}\n\n.media-inspector-marker-label-container-right {\n  right: -2px;\n}\n\n.media-inspector-marker-label {\n  color: var(--color-text-primary);\n  position: absolute;\n  top: 1px;\n  bottom: 0;\n  font-size: 12px;\n  pointer-events: none;\n}\n\n.media-inspector-label-right {\n  right: 4px;\n}\n\n.media-inspector-label-left {\n  left: 4px;\n}\n\n/*# sourceURL=panels/emulation/mediaQueryInspector.css */"
);
RootModule.Runtime.cachedResources.set(
  "panels/emulation/sensors.css",
  "/*\n * Copyright (c) 2015 The Chromium Authors. All rights reserved.\n * Use of this source code is governed by a BSD-style license that can be\n * found in the LICENSE file.\n */\n\n.sensors-view {\n  padding: 12px;\n  display: block;\n}\n\n.sensors-view input {\n  width: 100%;\n  max-width: 120px;\n  margin: -5px 10px 0 0;\n  text-align: end;\n}\n\n.sensors-view input[readonly] {\n  background-color: var(--color-background-elevation-1);\n}\n\n.sensors-view fieldset {\n  border: none;\n  padding: 10px 0;\n  flex: 0 0 auto;\n  margin: 0;\n}\n\n.sensors-view fieldset[disabled] {\n  opacity: 50%;\n}\n\n.orientation-axis-input-container input {\n  max-width: 120px;\n}\n\n.sensors-view input:focus::-webkit-input-placeholder {\n  color: transparent !important; /* stylelint-disable-line declaration-no-important */\n}\n\n.sensors-view .chrome-select {\n  width: 200px;\n}\n\n.sensors-group-title {\n  width: 80px;\n  line-height: 24px;\n}\n\n.sensors-group {\n  display: flex;\n  flex-wrap: wrap;\n  margin-bottom: 10px;\n}\n\n.geo-fields {\n  flex: 2 0 200px;\n}\n\n.latlong-group {\n  display: flex;\n  margin-bottom: 10px;\n}\n\n.latlong-title {\n  width: 70px;\n}\n\n.timezone-error {\n  margin-left: 10px;\n  color: var(--legacy-input-validation-error);\n}\n/* Device Orientation */\n\n.orientation-content {\n  display: flex;\n  flex-wrap: wrap;\n}\n\n.orientation-fields {\n  margin-right: 10px;\n}\n\n.orientation-stage {\n  --override-gradient-color-1: #e1f5fe;\n  --override-gradient-color-2: #b0ebf3;\n  --override-gradient-color-3: #def6f9;\n\n  perspective: 700px;\n  perspective-origin: 50% 50%;\n  width: 160px;\n  height: 150px;\n  background: linear-gradient(var(--override-gradient-color-1) 0%, var(--override-gradient-color-1) 64%, var(--override-gradient-color-2) 64%, var(--override-gradient-color-3) 100%);\n  transition: 0.2s ease opacity, 0.2s ease filter;\n  overflow: hidden;\n  margin-bottom: 10px;\n}\n\n.-theme-with-dark-background .orientation-stage,\n:host-context(.-theme-with-dark-background) .orientation-stage {\n  --override-gradient-color-1: rgb(1 21 30);\n  --override-gradient-color-2: rgb(12 71 79);\n  --override-gradient-color-3: rgb(6 30 33);\n}\n\n.orientation-stage.disabled {\n  filter: grayscale();\n  opacity: 50%;\n  cursor: default !important; /* stylelint-disable-line declaration-no-important */\n}\n\n.orientation-element,\n.orientation-element::before,\n.orientation-element::after {\n  position: absolute;\n  box-sizing: border-box;\n  transform-style: preserve-3d;\n  background: no-repeat;\n  background-size: cover;\n  backface-visibility: hidden;\n}\n\n.orientation-box {\n  width: 62px;\n  height: 122px;\n  left: 0;\n  right: 0;\n  top: 0;\n  bottom: 0;\n  margin: auto;\n  transform: rotate3d(1, 0, 0, 90deg);\n}\n\n.orientation-layer {\n  width: 100%;\n  height: 100%;\n  transform-style: preserve-3d;\n}\n\n.orientation-box.is-animating,\n.is-animating .orientation-layer {\n  transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;\n}\n\n.orientation-front,\n.orientation-back {\n  width: 62px;\n  height: 122px;\n  border-radius: 8px;\n}\n\n.orientation-front {\n  background-image: var(--image-file-accelerometer-front);\n}\n\n.orientation-back {\n  transform: rotateY(180deg) translateZ(8px);\n  background-image: var(--image-file-accelerometer-back);\n}\n\n.orientation-left,\n.orientation-right {\n  width: 8px;\n  height: 106px;\n  top: 8px;\n  background-position: center center;\n}\n\n.orientation-left {\n  left: -8px;\n  transform-origin: right center;\n  transform: rotateY(-90deg);\n  background-image: var(--image-file-accelerometer-left);\n}\n\n.orientation-right {\n  right: -8px;\n  transform-origin: left center;\n  transform: rotateY(90deg);\n  background-image: var(--image-file-accelerometer-right);\n}\n\n.orientation-left::before,\n.orientation-left::after,\n.orientation-right::before,\n.orientation-right::after {\n  content: '';\n  width: 8px;\n  height: 6px;\n}\n\n.orientation-left::before,\n.orientation-left::after {\n  background-image: var(--image-file-accelerometer-left);\n}\n\n.orientation-right::before,\n.orientation-right::after {\n  background-image: var(--image-file-accelerometer-right);\n}\n\n.orientation-left::before,\n.orientation-right::before {\n  top: -6px;\n  transform-origin: center bottom;\n  transform: rotateX(26deg);\n  background-position: center top;\n}\n\n.orientation-left::after,\n.orientation-right::after {\n  bottom: -6px;\n  transform-origin: center top;\n  transform: rotateX(-25deg);\n  background-position: center bottom;\n}\n\n.orientation-top,\n.orientation-bottom {\n  width: 50px;\n  height: 8px;\n  left: 8px;\n  background-position: center center;\n}\n\n.orientation-top {\n  top: -8px;\n  transform-origin: center bottom;\n  transform: rotateX(90deg);\n  background-image: var(--image-file-accelerometer-top);\n}\n\n.orientation-bottom {\n  bottom: -8px;\n  transform-origin: center top;\n  transform: rotateX(-90deg);\n  background-image: var(--image-file-accelerometer-bottom);\n}\n\n.orientation-top::before,\n.orientation-top::after,\n.orientation-bottom::before,\n.orientation-bottom::after {\n  content: '';\n  width: 8px;\n  height: 8px;\n}\n\n.orientation-top::before,\n.orientation-top::after {\n  background-image: var(--image-file-accelerometer-top);\n}\n\n.orientation-bottom::before,\n.orientation-bottom::after {\n  background-image: var(--image-file-accelerometer-bottom);\n}\n\n.orientation-top::before,\n.orientation-bottom::before {\n  left: -6px;\n  transform-origin: right center;\n  transform: rotateY(-26deg);\n  background-position: left center;\n}\n\n.orientation-top::after,\n.orientation-bottom::after {\n  right: -6px;\n  transform-origin: left center;\n  transform: rotateY(26deg);\n  background-position: right center;\n}\n\n.orientation-axis-input-container {\n  margin-bottom: 10px;\n}\n\n.orientation-reset-button {\n  min-width: 80px;\n}\n\nfieldset.device-orientation-override-section {\n  margin: 0;\n  display: flex;\n}\n\n.panel-section-separator {\n  height: 2px;\n  margin-bottom: 8px;\n  background: var(--color-background-elevation-2);\n}\n\nbutton.text-button {\n  margin: 0 10px;\n}\n\n@media (forced-colors: active) {\n  .sensors-view fieldset[disabled] {\n    opacity: 100%;\n  }\n}\n\n.chrome-select-label {\n  margin-bottom: 16px;\n}\n\n/*# sourceURL=panels/emulation/sensors.css */"
);
RootModule.Runtime.cachedResources.set(
  "entrypoints/inspector_main/nodeIcon.css",
  "/*\n * Copyright 2017 The Chromium Authors. All rights reserved.\n * Use of this source code is governed by a BSD-style license that can be\n * found in the LICENSE file.\n */\n\n.node-icon {\n  width: 28px;\n  height: 26px;\n  background-image: var(--image-file-nodeIcon);\n  background-size: 17px 17px;\n  background-repeat: no-repeat;\n  background-position: center;\n  opacity: 80%;\n  cursor: auto;\n}\n\n.node-icon:hover {\n  opacity: 100%;\n}\n\n.node-icon.inactive {\n  filter: grayscale(100%);\n}\n\n/*# sourceURL=entrypoints/inspector_main/nodeIcon.css */"
);
RootModule.Runtime.cachedResources.set(
  "entrypoints/inspector_main/renderingOptions.css",
  "/*\n * Copyright (c) 2015 The Chromium Authors. All rights reserved.\n * Use of this source code is governed by a BSD-style license that can be\n * found in the LICENSE file.\n */\n\n:host {\n  padding: 12px;\n}\n\n[is=dt-checkbox] {\n  margin: 0 0 10px 0;\n  flex: none;\n}\n\n.panel-section-separator {\n  height: 1px;\n  margin-bottom: 10px;\n  background: var(--color-details-hairline);\n  flex: none;\n}\n\n.panel-section-separator:last-child {\n  background: transparent;\n}\n\n.chrome-select-label {\n  margin-bottom: 16px;\n}\n\n/*# sourceURL=entrypoints/inspector_main/renderingOptions.css */"
);
import "../shell/shell.js";
import "./devtools_app-meta-files.js";
import * as Startup from "../startup/startup.js";
Startup.RuntimeInstantiator.startApplication("devtools_app");
